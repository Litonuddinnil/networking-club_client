import { useEffect, useRef } from "react";
import * as THREE from "three";

/**
 * ParticleField — a lightweight, fullscreen Three.js backdrop.
 *
 * Performance pattern:
 *  - Single THREE.Points with a Float32 buffer; uses BufferGeometry for ~1500 particles.
 *  - Vertex displacement is computed on the GPU via a custom ShaderMaterial.
 *  - The CPU side only updates uniforms (mouse + time + scroll) per frame.
 *  - No per-frame object churn, no BoxGeometry; render cost is essentially free.
 *
 * Motion model:
 *  - Mouse parallax: target.x / target.y are eased toward real mouse coords
 *    so the field "follows" subtly with smooth easing (no snap).
 *  - Scroll: when document is scrolled the scene gently rotates around X.
 *  - Reduced-motion: the animation loop is short-circuited to a single static render.
 *  - Off-screen: when IntersectionObserver fires, the loop pauses.
 */

interface ParticleFieldProps {
  className?: string;
  density?: number; // particle count multiplier
  color?: string;
}

export default function ParticleField({
  className = "",
  density = 1,
  color = "#ff6b00",
}: ParticleFieldProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // ---- prefers-reduced-motion shortcut ----
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // ---- renderer ----
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);

    // Guard 0×0 mount (StrictMode / hidden). WebGL throws "Illegal invocation"
    // when setSize is called with NaN dimensions.
    const w = Math.max(1, mount.clientWidth || window.innerWidth);
    const h = Math.max(1, mount.clientHeight || window.innerHeight);
    renderer.setSize(w, h, false);
    mount.appendChild(renderer.domElement);
    renderer.domElement.classList.add("three-canvas");

    // ---- scene + camera ----
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(60, w / h, 0.1, 100);
    camera.position.z = 6;

    // ---- particles ----
    const count = Math.floor(1500 * density);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Distribute on a thin disc/box volume
      positions[i * 3 + 0] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 14;
      seeds[i] = Math.random() * 1000;
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));

    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uColor: { value: new THREE.Color(color) },
        uPixelRatio: { value: renderer.getPixelRatio() },
      },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        uniform float uTime;
        uniform float uPixelRatio;
        varying float vAlpha;

        // Map mouse uniforms into a small offset the points drift toward.
        uniform vec2 uMouse;

        void main() {
          vec3 pos = position;
          // Gentle vertical breathing
          pos.y += sin(uTime * 0.5 + aSeed) * 0.12;
          // Forward/back drift
          pos.z += sin(uTime * 0.3 + aSeed * 1.7) * 0.08;
          // Mouse parallax — small lateral shift
          pos.x += uMouse.x * 0.6;
          pos.y += uMouse.y * 0.4;

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // Size attenuates with distance; size in pixels
          float size = 2.0 + 1.5 * sin(uTime + aSeed);
          gl_PointSize = size * uPixelRatio * (300.0 / -mvPosition.z);

          // Fade slightly with depth so far particles look softer
          vAlpha = clamp(1.0 - (-mvPosition.z) / 20.0, 0.15, 0.9);
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor;
        varying float vAlpha;
        void main() {
          vec2 c = gl_PointCoord - 0.5;
          float d = length(c);
          // Soft circular sprite
          float alpha = smoothstep(0.5, 0.0, d);
          gl_FragColor = vec4(uColor, alpha * vAlpha);
        }
      `,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // ---- mouse + scroll state ----
    const mouse = { x: 0, y: 0, tx: 0, ty: 0 };
    const onMouseMove = (e: MouseEvent) => {
      const r = mount.getBoundingClientRect();
      mouse.tx = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.ty = -((e.clientY - r.top) / r.height) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    let scrollY = 0;
    const onScroll = () => {
      scrollY = window.scrollY || window.pageYOffset || 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // ---- resize ----
    const onResize = () => {
      const cw = mount.clientWidth;
      const ch = mount.clientHeight;
      if (cw === 0 || ch === 0) return;
      renderer.setSize(cw, ch, false);
      camera.aspect = cw / ch;
      camera.updateProjectionMatrix();
      material.uniforms.uPixelRatio.value = renderer.getPixelRatio();
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    // ---- pause when off-screen ----
    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(mount);

    // ---- animation loop ----
    const clock = new THREE.Clock();
    let rafId = 0;
    let running = !reduced;

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (!running || !visible) return;

      const t = clock.getElapsedTime();
      // Smoothly ease mouse toward target
      mouse.x += (mouse.tx - mouse.x) * 0.05;
      mouse.y += (mouse.ty - mouse.y) * 0.05;

      material.uniforms.uTime.value = t;
      material.uniforms.uMouse.value.set(mouse.x, mouse.y);

      // Subtle scroll-driven rotation
      points.rotation.x = scrollY * 0.0003;
      points.rotation.y = scrollY * 0.0005;

      renderer.render(scene, camera);
    };

    if (reduced) {
      // Single static render — no animation
      renderer.render(scene, camera);
    } else {
      tick();
    }

    // ---- cleanup ----
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("scroll", onScroll);
      ro.disconnect();
      io.disconnect();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [density, color]);

  return (
    <div
      ref={mountRef}
      className={className}
      aria-hidden="true"
    />
  );
}
