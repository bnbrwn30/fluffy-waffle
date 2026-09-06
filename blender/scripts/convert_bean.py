"""
Converts a downloaded roasted-coffee PBR model into an unroasted green bean,
and optimises it for the web.

    blender -b -P blender/scripts/convert_bean.py -- \
        --in public/models/coffee_bean_-_pbr.glb \
        --out public/models/bean-green.glb --preview

What this does and why
----------------------
The source is a dark roast: its base colour map is nearly black-brown, and you
cannot simply tint that to pale sage — multiplying only darkens, and brightening
near-black amplifies compression noise into mush.

So the base colour is rebuilt rather than tinted. The original map's *luminance*
is extracted, contrast-normalised, and remapped onto a green ramp. That keeps
every bit of mottling and blotching the artist painted while replacing the hue
entirely.

The normal map is left completely untouched. It carries all the fine surface
relief, it is what actually sells realism, and it is colour-blind — which is why
a roasted model converts at all.
"""

import argparse
import math
import os
import sys

import bpy
import numpy as np

# Linear-space endpoints of the green ramp. Unroasted arabica is a chalky
# sage: desaturated, slightly yellow-green, never emerald.
DARK = np.array([0.175, 0.190, 0.145])
LIGHT = np.array([0.480, 0.500, 0.400])

# Texture budget. The source ships 2k maps totalling 4.6 MB, which is far more
# than a bean occupying ~400px of a landing page will ever resolve.
MAX_TEX = 1024


def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def find_mesh():
    for o in bpy.data.objects:
        if o.type == "MESH":
            return o
    raise SystemExit("no mesh in the imported file")


def normalise(obj):
    """
    Centre the mesh on its own bounds and scale it so the longest axis is
    exactly 1 unit.

    Downloaded assets arrive at arbitrary scale and origin — this one imported
    off-camera entirely. Baking a known size and centre in here means the web
    code can position it predictably instead of guessing.
    """
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.object.origin_set(type="ORIGIN_GEOMETRY", center="BOUNDS")
    obj.location = (0.0, 0.0, 0.0)

    longest = max(obj.dimensions)
    if longest > 0:
        obj.scale = tuple(1.0 / longest for _ in range(3))
    bpy.ops.object.transform_apply(location=True, rotation=False, scale=True)
    print(f"[convert] normalised to {tuple(round(d, 3) for d in obj.dimensions)}")


def strip_extra_uvs(obj):
    """The source carries ten UV sets; one is used. The rest is dead weight."""
    uvs = obj.data.uv_layers
    while len(uvs) > 1:
        uvs.remove(uvs[len(uvs) - 1])
    print(f"[convert] UV sets reduced to {len(uvs)}")


def recolour_base(img):
    """Rebuild a base-colour map as green, preserving the original mottling."""
    w, h = img.size
    px = np.empty(w * h * 4, dtype=np.float32)
    img.pixels.foreach_get(px)
    px = px.reshape(-1, 4)

    # Perceptual luminance of the roasted map — this is the detail we keep.
    lum = px[:, 0] * 0.2126 + px[:, 1] * 0.7152 + px[:, 2] * 0.0722

    # Normalise against the actual range present. A dark roast occupies a tiny
    # slice near zero, so without this stretch every pixel maps to the same
    # green and all the painted variation is lost.
    lo, hi = np.percentile(lum, 2.0), np.percentile(lum, 98.0)
    if hi - lo < 1e-6:
        hi = lo + 1e-6
    t = np.clip((lum - lo) / (hi - lo), 0.0, 1.0)

    # Pull the midtones up hard: the source is a dark roast and bottom-heavy,
    # so a straight linear remap lands on mossy olive. Green coffee is pale,
    # chalky and barely saturated — the ramp endpoints are close together on
    # purpose, because a wide range reads as painted rather than as a seed.
    t = t ** 0.60

    px[:, :3] = DARK + (LIGHT - DARK) * t[:, None]
    img.pixels.foreach_set(px.reshape(-1))
    img.update()
    print(f"[convert] base colour rebuilt as green ({w}x{h})")


def resize(img, limit=MAX_TEX):
    if max(img.size) > limit:
        s = limit / max(img.size)
        img.scale(int(img.size[0] * s), int(img.size[1] * s))
        print(f"[convert] {img.name} -> {img.size[0]}x{img.size[1]}")


def tune_material(obj):
    """Green coffee is chalky and matte: kill the roast's oily specular."""
    for slot in obj.material_slots:
        mat = slot.material
        if not mat or not mat.node_tree:
            continue
        for node in mat.node_tree.nodes:
            if node.type == "BSDF_PRINCIPLED":
                # Only applies where no roughness map is plugged in; where one
                # is, the map wins and this is a no-op.
                if not node.inputs["Roughness"].is_linked:
                    node.inputs["Roughness"].default_value = 0.8
                node.inputs["Metallic"].default_value = 0.0


def preview(out_dir):
    scene = bpy.context.scene
    engines = scene.render.bl_rna.properties["engine"].enum_items.keys()
    scene.render.engine = (
        "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines else "BLENDER_EEVEE"
    )
    if hasattr(scene.eevee, "taa_render_samples"):
        scene.eevee.taa_render_samples = 48
    scene.render.resolution_x = 640
    scene.render.resolution_y = 640
    scene.view_settings.view_transform = "AgX"

    world = bpy.data.worlds.new("W")
    scene.world = world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (
        0.85, 0.82, 0.76, 1.0,
    )

    key = bpy.data.lights.new("key", type="AREA")
    key.energy = 200
    key.size = 4
    ko = bpy.data.objects.new("key", key)
    ko.location = (2.6, -2.2, 3.0)
    ko.rotation_euler = (math.radians(38), 0, math.radians(40))
    bpy.context.collection.objects.link(ko)

    # Frame whatever came in, whatever scale it happens to use.
    dist = 3.0

    cam_data = bpy.data.cameras.new("cam")
    cam_data.lens = 80
    cam = bpy.data.objects.new("cam", cam_data)
    bpy.context.collection.objects.link(cam)
    scene.camera = cam
    ko.location = (dist * 0.5, -dist * 0.45, dist * 0.6)

    os.makedirs(out_dir, exist_ok=True)
    for name, (loc, rot) in {
        "green-front": ((0, -dist, 0), (math.radians(90), 0, 0)),
        "green-three-quarter": (
            (dist * 0.6, -dist * 0.6, dist * 0.5),
            (math.radians(57), 0, math.radians(45)),
        ),
    }.items():
        cam.location = loc
        cam.rotation_euler = rot
        scene.render.filepath = os.path.join(out_dir, f"bean-{name}")
        scene.render.image_settings.file_format = "PNG"
        bpy.ops.render.render(write_still=True)
        print(f"[convert] preview {name}")


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument("--in", dest="src", required=True)
    ap.add_argument("--out", dest="dst", required=True)
    ap.add_argument("--preview", action="store_true")
    ap.add_argument("--preview-dir", default="blender/preview")
    args = ap.parse_args(argv)

    clear()
    bpy.ops.import_scene.gltf(filepath=os.path.abspath(args.src))

    obj = find_mesh()
    print(f"[convert] imported {len(obj.data.polygons)} faces")
    normalise(obj)
    strip_extra_uvs(obj)
    tune_material(obj)

    # The base-colour image is the one wired into Base Color; the others
    # (normal, metallic-roughness) must NOT be recoloured — they are data,
    # not pictures.
    base_images = set()
    for slot in obj.material_slots:
        mat = slot.material
        if not mat or not mat.node_tree:
            continue
        for node in mat.node_tree.nodes:
            if node.type != "BSDF_PRINCIPLED":
                continue
            link = next(
                (l for l in mat.node_tree.links
                 if l.to_socket == node.inputs["Base Color"]), None,
            )
            if link and link.from_node.type == "TEX_IMAGE":
                base_images.add(link.from_node.image.name)

    for img in bpy.data.images:
        if img.size[0] == 0:
            continue
        if img.name in base_images:
            recolour_base(img)
        resize(img)

    if args.preview:
        preview(os.path.abspath(args.preview_dir))

    os.makedirs(os.path.dirname(os.path.abspath(args.dst)), exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.export_scene.gltf(
        filepath=os.path.abspath(args.dst),
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_image_format="WEBP",
        export_image_quality=80,
    )
    print(f"[convert] exported {args.dst} "
          f"({os.path.getsize(os.path.abspath(args.dst)) / 1024:.0f} KB)")


if __name__ == "__main__":
    main()
