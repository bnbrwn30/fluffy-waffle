"""
Models a green coffee bean and exports it as glTF for the hero scene.

    blender -b -P blender/scripts/bean.py -- --preview
    blender -b -P blender/scripts/bean.py -- --export

Why this is not a squashed sphere
---------------------------------
An arabica bean is a hemisphere-ish dome on the back, a genuinely FLAT face on
the front, a fairly sharp rim where the two meet, and a deep narrow fissure
running down the flat face in a shallow S-curve. Miss any of those four and it
reads as a pebble. The earlier procedural attempt had a straight groove cut
into an ellipsoid, which is why it looked like a ball.
"""

import argparse
import math
import os
import sys

import bpy

# Long axis (tip to tip), short axis (across), and depth. Real arabica runs
# roughly 10 x 7 x 5 mm, so these ratios are taken from that.
LEN_Y = 1.32
WID_X = 0.95
DEPTH = 0.76

# How far the flat face sits forward of centre. Small = flatter bean.
FLAT_Z = 0.22
# Fissure geometry.
FISSURE_DEPTH = 0.34
FISSURE_WIDTH = 0.018  # gaussian sigma-squared; smaller = a cut, not a smudge
FISSURE_WAVE = 0.115   # amplitude of the S-curve down the face


def clear():
    bpy.ops.wm.read_factory_settings(use_empty=True)


def build_bean():
    bpy.ops.mesh.primitive_uv_sphere_add(radius=1.0, segments=192, ring_count=128)
    obj = bpy.context.object
    obj.name = "CoffeeBean"

    mesh = obj.data
    for v in mesh.vertices:
        x, y, z = v.co.x, v.co.y, v.co.z

        # Where this vertex sits along the long axis, -1..1, before scaling.
        ny = y

        # Ends taper: a bean is slightly pointed, not a perfect ellipse.
        taper_xz = 1.0 - 0.12 * (ny ** 4)

        x *= WID_X * taper_xz
        y *= LEN_Y
        z *= DEPTH * taper_xz

        if z > 0:
            # --- The flat face -------------------------------------------
            # Compress the whole front hemisphere down onto a near-plane.
            # This is the single biggest difference from an ellipsoid: the
            # front of a bean is flat, so light across it is even and the
            # fissure gets to be the only shadow.
            t = z / (DEPTH * taper_xz)          # 0 at rim, 1 at pole
            z = FLAT_Z * (t ** 0.28)            # low exponent = flatter face

            # --- The fissure ---------------------------------------------
            # Its centreline wanders — a real fissure is never straight.
            centre = math.sin(ny * 2.4) * FISSURE_WAVE
            d = x - centre

            # Narrow gaussian valley, running the length of the face and
            # easing out just short of each tip.
            run = 1.0 - abs(ny) ** 3.0
            cut = math.exp(-(d * d) / FISSURE_WIDTH) * max(run, 0.0)
            z -= cut * FISSURE_DEPTH

            # Lips: the face swells slightly either side of the fissure,
            # which is what catches the light and sells the shape.
            lip = math.exp(-((abs(d) - 0.17) ** 2) / 0.007) * max(run, 0.0)
            z += lip * 0.075
        else:
            # --- The domed back ------------------------------------------
            # Fuller than an ellipsoid, so the rim reads as an edge.
            t = -z / (DEPTH * taper_xz)
            z = -DEPTH * taper_xz * (t ** 0.78)

        # Micro-relief. Real beans are not injection-moulded: a little
        # low-amplitude noise breaks the specular up and stops the surface
        # reading as plastic. Amplitude is tiny — enough to catch light,
        # not enough to disturb the silhouette.
        n = (
            math.sin(x * 17.0) * math.cos(y * 13.0) * 0.0045
            + math.sin(y * 31.0 + x * 7.0) * 0.0022
            + math.cos(x * 41.0 + y * 23.0) * 0.0009
        )
        scale = 1.0 + n
        v.co = (x * scale, y * scale, z * scale)

    # Smooth shading with a subdivision pass. The rim stays crisp because the
    # front and back surfaces genuinely meet at an angle there.
    bpy.ops.object.shade_smooth()
    mod = obj.modifiers.new("Subdivision", "SUBSURF")
    mod.levels = 1
    mod.render_levels = 1
    bpy.ops.object.modifier_apply(modifier=mod.name)

    # Budget for the web. Decimate after subdividing so the crease survives.
    dec = obj.modifiers.new("Decimate", "DECIMATE")
    dec.ratio = 0.10
    bpy.ops.object.modifier_apply(modifier=dec.name)

    print(f"[bean] {len(obj.data.polygons)} faces")
    return obj


def paint_vertex_colours(obj):
    """
    Per-vertex colour: mottling, a pale silverskin line in the fissure, and a
    slight darkening at the rim.

    This is the piece that was missing. Geometry alone, rendered in one flat
    colour, reads as plastic no matter how correct the shape is — real beans
    vary in tone across the face and carry a chalky pale line down the crease.
    """
    mesh = obj.data
    layer = mesh.color_attributes.new(
        name="Col", type="FLOAT_COLOR", domain="POINT",
    )

    # Sage base, with the two extremes it varies between.
    base = (0.33, 0.37, 0.20)
    warm = (0.42, 0.42, 0.24)   # sun-bleached patches
    cool = (0.24, 0.30, 0.17)   # shaded mottling
    silver = (0.72, 0.72, 0.60)  # silverskin left in the crease

    for i, v in enumerate(mesh.vertices):
        x, y, z = v.co

        # Multi-octave mottling. Irregular frequencies so the pattern never
        # visibly tiles around the bean.
        m = (
            math.sin(x * 5.3 + y * 3.1) * 0.5
            + math.sin(y * 8.7 - x * 4.2) * 0.3
            + math.sin(x * 14.1 + y * 11.3) * 0.2
        )
        m = max(-1.0, min(1.0, m))

        if m >= 0:
            col = [base[k] + (warm[k] - base[k]) * m for k in range(3)]
        else:
            col = [base[k] + (cool[k] - base[k]) * -m for k in range(3)]

        # Silverskin: the papery membrane that stays in the fissure after
        # hulling. Keyed off proximity to the crease centreline, and only on
        # the front face.
        if z > 0:
            centre = math.sin((y / LEN_Y) * 2.4) * FISSURE_WAVE
            d = abs(x - centre)
            sk = math.exp(-(d * d) / 0.006)
            col = [col[k] + (silver[k] - col[k]) * sk * 0.85 for k in range(3)]

        # Rim falls off slightly darker, which reads as thickness.
        rim = min(1.0, (x * x + (y / LEN_Y) ** 2) ** 0.5)
        shade = 1.0 - 0.18 * max(0.0, rim - 0.72) / 0.28
        col = [c * shade for c in col]

        layer.data[i].color = (*col, 1.0)

    print("[bean] vertex colours painted")


def add_material(obj):
    mat = bpy.data.materials.new("GreenCoffee")
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    # Unroasted arabica is a chalky pale sage, not olive and not glossy.
    nt = mat.node_tree
    attr = nt.nodes.new("ShaderNodeVertexColor")
    attr.layer_name = "Col"
    nt.links.new(attr.outputs["Color"], bsdf.inputs["Base Color"])
    bsdf.inputs["Roughness"].default_value = 0.78
    bsdf.inputs["Metallic"].default_value = 0.0
    obj.data.materials.append(mat)
    return mat


def preview(out_dir):
    """Three quick renders so the shape can actually be looked at."""
    scene = bpy.context.scene
    engines = scene.render.bl_rna.properties["engine"].enum_items.keys()
    scene.render.engine = (
        "BLENDER_EEVEE_NEXT" if "BLENDER_EEVEE_NEXT" in engines else "BLENDER_EEVEE"
    )
    if hasattr(scene.eevee, "taa_render_samples"):
        scene.eevee.taa_render_samples = 32

    scene.render.resolution_x = 640
    scene.render.resolution_y = 640
    scene.render.film_transparent = False
    scene.view_settings.view_transform = "AgX"

    world = bpy.data.worlds.new("W")
    scene.world = world
    world.use_nodes = True
    world.node_tree.nodes["Background"].inputs["Color"].default_value = (
        0.85, 0.82, 0.76, 1.0,
    )

    key = bpy.data.lights.new("key", type="AREA")
    key.energy = 220
    key.size = 4
    key_obj = bpy.data.objects.new("key", key)
    key_obj.location = (2.6, -2.2, 3.0)
    key_obj.rotation_euler = (math.radians(38), 0, math.radians(40))
    bpy.context.collection.objects.link(key_obj)

    cam_data = bpy.data.cameras.new("cam")
    cam_data.lens = 85
    cam = bpy.data.objects.new("cam", cam_data)
    bpy.context.collection.objects.link(cam)
    scene.camera = cam

    # Face on, three-quarter, and edge on — the three angles that expose a
    # bad bean instantly.
    # The flat face is on +Z and the long axis is Y, so "face on" means looking
    # straight down -Z. Getting this wrong shows the bean end-on and tells you
    # nothing about the fissure.
    angles = {
        "front": ((0, 0, 6.6), (0, 0, 0)),
        "three-quarter": ((3.2, -3.2, 3.2), (math.radians(57), 0, math.radians(45))),
        "edge": ((5.2, 0, 0), (math.radians(90), 0, math.radians(90))),
    }
    os.makedirs(out_dir, exist_ok=True)
    for name, (loc, rot) in angles.items():
        cam.location = loc
        cam.rotation_euler = rot
        scene.render.filepath = os.path.join(out_dir, f"bean-{name}")
        scene.render.image_settings.file_format = "PNG"
        bpy.ops.render.render(write_still=True)
        print(f"[bean] preview {name}")


def export(path):
    os.makedirs(os.path.dirname(path), exist_ok=True)
    bpy.ops.object.select_all(action="DESELECT")
    obj = bpy.data.objects["CoffeeBean"]
    obj.select_set(True)
    bpy.context.view_layer.objects.active = obj
    bpy.ops.export_scene.gltf(
        filepath=path,
        export_format="GLB",
        use_selection=True,
        export_apply=True,
        export_normals=True,
        export_vertex_color="MATERIAL",
        export_draco_mesh_compression_enable=False,  # keep the loader simple
    )
    size = os.path.getsize(path) / 1024
    print(f"[bean] exported {path} ({size:.0f} KB)")


def main():
    argv = sys.argv[sys.argv.index("--") + 1:] if "--" in sys.argv else []
    ap = argparse.ArgumentParser()
    ap.add_argument("--preview", action="store_true")
    ap.add_argument("--export", action="store_true")
    ap.add_argument("--preview-dir", default="blender/preview")
    ap.add_argument("--out", default="public/models/bean.glb")
    args = ap.parse_args(argv)

    clear()
    obj = build_bean()
    paint_vertex_colours(obj)
    add_material(obj)

    if args.preview:
        preview(os.path.abspath(args.preview_dir))
    if args.export:
        export(os.path.abspath(args.out))


if __name__ == "__main__":
    main()
