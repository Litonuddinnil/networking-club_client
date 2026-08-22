 import React, { useEffect, useRef } from "react";
import * as THREE from "three";

export type ParticleThemePreset = "cyber" | "aurora" | "sunset" | "emerald" | "matrix" | "custom";

interface ParticleFieldProps {
  className?: string;
  /** Particle density multiplier (1 = ~2000 particles). Defaults to 1. */
  density?: number;
  /** Theme presets */
  preset?: ParticleThemePreset;
  /** Primary accent color override (hex string, e.g. "#06b6d4"). */
  primaryColor?: string;
  /** Secondary gradient color override (hex string, e.g. "#8b5cf6"). */
  secondaryColor?: string;
  /** Base particle size in pixels. Defaults to 2.8. */
  particleSize?: number;
  /** Speed multiplier. Defaults to 1. */
  speed?: number;
  /** Enable mouse repulsion & click shockwave. Defaults to true. */
  interactive?: boolean;
}

const PRESET_PALETTES: Record<ParticleThemePreset, { primary: string; secondary: string }> = {
  cyber:   { primary: "#06b6d4", secondary: "#8b5cf6" },
  aurora:  { primary: "#10b981", secondary: "#38bdf8" },
  sunset:  { primary: "#ff6b00", secondary: "#ec4899" },
  emerald: { primary: "#059669", secondary: "#34d399" },
  matrix:  { primary: "#22c55e", secondary: "#10b981" },
  custom:  { primary: "#06b6d4", secondary: "#ec4899" },
};

export default function ParticleField({
  className = "",
  density = 1,
  preset = "cyber",
  primaryColor,
  secondaryColor,
  particleSize = 2.8,
  speed = 1,
  interactive = true,
}: ParticleFieldProps) {
  const mountRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Palette Resolution
    const basePalette = PRESET_PALETTES[preset] || PRESET_PALETTES.cyber;
    const c1 = new THREE.Color(primaryColor || basePalette.primary);
    const c2 = new THREE.Color(secondaryColor || basePalette.secondary);

    // Prefers-reduced-motion
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // 1. Renderer Setup
    const renderer = new THREE.WebGLRenderer({
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setClearColor(0x000000, 0);

    const w = Math.max(1, mount.clientWidth || window.innerWidth);
    const h = Math.max(1, mount.clientHeight || window.innerHeight);
    renderer.setSize(w, h, false);
    mount.appendChild(renderer.domElement);
    renderer.domElement.classList.add("three-canvas");

    // 2. Scene & Camera
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, w / h, 0.1, 100);
    camera.position.z = 7.5;

    // 3. High-Density Particle Buffers
    const count = Math.floor(2200 * density);
    const positions = new Float32Array(count * 3);
    const seeds = new Float32Array(count);
    const sizes = new Float32Array(count);
    const colorMix = new Float32Array(count);

    for (let i = 0; i < count; i++) {
      positions[i * 3 + 0] = (Math.random() - 0.5) * 22;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 13;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 16;
      seeds[i] = Math.random() * 100.0;
      sizes[i] = 0.5 + Math.random() * 1.5;
      colorMix[i] = Math.random();
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute("aSeed", new THREE.BufferAttribute(seeds, 1));
    geometry.setAttribute("aSize", new THREE.BufferAttribute(sizes, 1));
    geometry.setAttribute("aColorMix", new THREE.BufferAttribute(colorMix, 1));

    // 4. Custom GPU GLSL Shaders (Curl Noise & Elastic Mouse Interaction)
    const material = new THREE.ShaderMaterial({
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      uniforms: {
        uTime: { value: 0 },
        uSpeed: { value: speed },
        uMouse: { value: new THREE.Vector2(0, 0) },
        uColor1: { value: c1 },
        uColor2: { value: c2 },
        uBaseSize: { value: particleSize },
        uPixelRatio: { value: renderer.getPixelRatio() },
        uRippleProgress: { value: 1.0 },
        uRipplePos: { value: new THREE.Vector2(0, 0) },
      },
      vertexShader: /* glsl */ `
        attribute float aSeed;
        attribute float aSize;
        attribute float aColorMix;

        uniform float uTime;
        uniform float uSpeed;
        uniform float uPixelRatio;
        uniform float uBaseSize;
        uniform vec2 uMouse;
        uniform float uRippleProgress;
        uniform vec2 uRipplePos;

        varying float vAlpha;
        varying float vMix;
        varying float vTwinkle;

        // Pseudo 3D Turbulence Curl
        vec3 computeTurbulence(vec3 p, float t) {
          float x = sin(p.y * 0.8 + t * 0.4 + aSeed) * cos(p.z * 0.6 + t * 0.3);
          float y = cos(p.x * 0.7 + t * 0.3 + aSeed * 1.3) * sin(p.z * 0.8 + t * 0.4);
          float z = sin(p.x * 0.6 + t * 0.4) * cos(p.y * 0.7 + t * 0.3 + aSeed);
          return vec3(x, y, z) * 0.45;
        }

        void main() {
          vec3 pos = position;
          float t = uTime * uSpeed;

          // Apply organic cosmic turbulence
          pos += computeTurbulence(pos, t);

          // Mouse Parallax and Elastic Repulsion
          vec2 mouseWorld = uMouse * vec2(10.0, 6.0);
          vec2 toMouse = pos.xy - mouseWorld;
          float distToMouse = length(toMouse);

          if (distToMouse < 3.2) {
            float repulse = (1.0 - distToMouse / 3.2);
            pos.xy += normalize(toMouse) * repulse * 0.85;
            pos.z += repulse * 0.6;
          }

          // Interactive Click Shockwave Ripple
          if (uRippleProgress < 1.0) {
            float ripDist = length(pos.xy - uRipplePos);
            float ripFront = uRippleProgress * 14.0;
            float ripDelta = abs(ripDist - ripFront);
            if (ripDelta < 2.0) {
              float wave = sin((2.0 - ripDelta) * 1.57) * (1.0 - uRippleProgress);
              pos.z += wave * 1.2;
              pos.xy += normalize(pos.xy - uRipplePos + 0.001) * wave * 0.4;
            }
          }

          vec4 mvPosition = modelViewMatrix * vec4(pos, 1.0);
          gl_Position = projectionMatrix * mvPosition;

          // Twinkle Animation
          float twinkle = sin(t * 2.0 + aSeed * 5.0) * 0.5 + 0.5;
          vTwinkle = twinkle;

          // Dynamic Point Size with Distance Attenuation
          float finalSize = uBaseSize * aSize * (1.0 + twinkle * 0.4);
          gl_PointSize = finalSize * uPixelRatio * (320.0 / -mvPosition.z);

          // Distance-based Smooth Alpha Fade
          vAlpha = clamp(1.0 - (-mvPosition.z) / 22.0, 0.1, 0.85);
          vMix = aColorMix;
        }
      `,
      fragmentShader: /* glsl */ `
        uniform vec3 uColor1;
        uniform vec3 uColor2;

        varying float vAlpha;
        varying float vMix;
        varying float vTwinkle;

        void main() {
          vec2 coord = gl_PointCoord - 0.5;
          float dist = length(coord);

          if (dist > 0.5) discard;

          // Smooth Radial Soft Core
          float core = smoothstep(0.5, 0.0, dist);
          float glow = pow(core, 2.2);

          // Color Blending between Primary and Secondary
          vec3 finalColor = mix(uColor1, uColor2, vMix);
          // Highlight sparkling centers with subtle white brightness
          finalColor += vec3(0.25) * glow * vTwinkle;

          gl_FragColor = vec4(finalColor, glow * vAlpha);
        }
      `,
    });

    const points = new THREE.Points(geometry, material);
    scene.add(points);

    // 5. Mouse & Scroll State Tracking
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };

    const onMouseMove = (e: MouseEvent) => {
      const r = mount.getBoundingClientRect();
      mouse.targetX = ((e.clientX - r.left) / r.width) * 2 - 1;
      mouse.targetY = -((e.clientY - r.top) / r.height) * 2 + 1;
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // Click Shockwave Trigger
    const onClick = (e: MouseEvent) => {
      if (!interactive) return;
      const r = mount.getBoundingClientRect();
      const nx = ((e.clientX - r.left) / r.width) * 2 - 1;
      const ny = -((e.clientY - r.top) / r.height) * 2 + 1;

      material.uniforms.uRipplePos.value.set(nx * 10.0, ny * 6.0);
      material.uniforms.uRippleProgress.value = 0.0;
    };
    window.addEventListener("click", onClick, { passive: true });

    let scrollY = 0;
    const onScroll = () => {
      scrollY = window.scrollY || window.pageYOffset || 0;
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    // 6. Resize & Visibility Observers
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

    let visible = true;
    const io = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(mount);

    // 7. Render Loop
    const clock = new THREE.Clock();
    let rafId = 0;

    const tick = () => {
      rafId = requestAnimationFrame(tick);
      if (!visible) return;

      const t = clock.getElapsedTime();

      // Smooth Mouse Parallax Easing
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;

      material.uniforms.uTime.value = t;
      material.uniforms.uMouse.value.set(mouse.x, mouse.y);

      // Advance Shockwave Ripple
      if (material.uniforms.uRippleProgress.value < 1.0) {
        material.uniforms.uRippleProgress.value += 0.02 * speed;
      }

      // Scroll Rotation
      points.rotation.x = scrollY * 0.00025;
      points.rotation.y = scrollY * 0.0004 + t * 0.015 * speed;

      renderer.render(scene, camera);
    };

    if (reduced) {
      renderer.render(scene, camera);
    } else {
      tick();
    }

    // 8. Cleanup
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("click", onClick);
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
  }, [density, preset, primaryColor, secondaryColor, particleSize, speed, interactive]);

  return (
    <div
      ref={mountRef}
      className={`pointer-events-none fixed inset-0 -z-10 transition-opacity duration-1000 ${className}`}
      aria-hidden="true"
    />
  );
}