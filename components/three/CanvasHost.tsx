"use client";

import { Canvas } from "@react-three/fiber";
import { Environment, Lightformer } from "@react-three/drei";
import { Suspense, useEffect, useRef, useState } from "react";
import HeroBean from "./HeroBean";

/**
 * Hosts the single WebGL canvas on the page.
 *
 * Two things keep it cheap: it only ever renders while the hero is on screen
 * (an IntersectionObserver flips `frameloop` to "never" past that point, so
 * the rest of the page costs zero GPU), and it uses an image-based environment
 * instead of real lights with shadow maps.
 */
export default function CanvasHost() {
  const hostRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(true);
  const [supported, setSupported] = useState(true);

  useEffect(() => {
    // Cheap capability probe — some corporate machines ship WebGL disabled.
    try {
      const c = document.createElement("canvas");
      if (!c.getContext("webgl2") && !c.getContext("webgl")) setSupported(false);
    } catch {
      setSupported(false);
    }
  }, []);

  useEffect(() => {
    const el = hostRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([entry]) => setActive(entry.isIntersecting),
      { rootMargin: "10% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  if (!supported) return null;

  return (
    // Hidden below `sm`: at phone widths the bean sits directly behind the
    // body copy and CTAs and wrecks legibility, and there is no room to move
    // it. Dropping it also spares phones the only WebGL context on the page.
    <div ref={hostRef} className="absolute inset-0 hidden sm:block" aria-hidden>
      <Canvas
        frameloop={active ? "always" : "never"}
        dpr={[1, 1.75]}
        camera={{ position: [0, 0, 5], fov: 40 }}
        gl={{ antialias: true, alpha: true, powerPreference: "high-performance" }}
        onCreated={({ gl }) => {
          // Integrated GPUs do drop the context. Unmounting beats leaving a
          // half-dead canvas painting grey over the hero.
          gl.domElement.addEventListener("webglcontextlost", (e) => {
            e.preventDefault();
            setSupported(false);
          });
        }}
      >
        {/*
          Three explicit lights rather than drei's <Environment>: the presets
          pull a multi-megabyte HDRI off an external CDN, which is a network
          dependency, a memory spike, and — on this class of integrated GPU —
          a context loss. Key, fill and a warm rim get the same read for free.
        */}
        {/*
          Lit as a product shot on paper, not as a dramatic hero on black.
          Bright ambient keeps the shadow side from going muddy against a
          cream ground; the key is still raking so the crease reads.
        */}
        {/*
          Softer than it looks like it should be. The bean now carries real
          base-colour and normal maps, and a hard key blows the mottling out
          to a flat pale shape — the texture has to do the work, not the
          lighting. Ambient is kept deliberately low: it washes normal-map
          relief out, and the relief is the whole reason the surface reads as
          a seed rather than a smooth shape. The key does the shaping.
        */}
        {/*
          A studio environment built from light shapes rather than an HDRI.
          <Environment preset> downloads a multi-megabyte file from a CDN and
          previously cost us the WebGL context on this GPU; <Lightformer>
          children render the same idea locally into a small cube target.

          This is what fixes "flat": with no environment there is nothing for
          the material to reflect, so the bean had diffuse shading only and
          read as dead. The specular response is most of the perceived depth.
        */}
        <Environment resolution={128}>
          <Lightformer
            intensity={1.5}
            position={[0, 3, 3]}
            scale={[8, 6, 1]}
            color="#fff4e2"
          />
          <Lightformer
            intensity={0.8}
            position={[-5, 1, 2]}
            scale={[5, 5, 1]}
            color="#ffdfb8"
          />
          <Lightformer
            intensity={0.6}
            position={[4, -2, -3]}
            scale={[5, 5, 1]}
            color="#c9d6b0"
          />
        </Environment>

        {/*
          The environment supplies ambient and specular, so there is no
          <ambientLight> here at all — adding one on top double-lights the
          scene and blows the mottling straight out to white, which is exactly
          what happened on the first attempt.

          One key for shaping, one rim for separation. That is the whole rig.
        */}
        <directionalLight position={[4, 5, 4]} intensity={1.4} color="#fffaf0" />
        <directionalLight position={[-2, 2, -5]} intensity={0.9} color="#ffffff" />

        <Suspense fallback={null}>
          <HeroBean />
        </Suspense>
      </Canvas>
    </div>
  );
}
