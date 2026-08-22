 import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion, useIsMounted } from "@/hooks/use-reduced-motion";

export type NetworkTheme = "cyan" | "emerald" | "purple" | "orange" | "custom";

interface NetworkGraph3DProps {
  className?: string;
  /** Number of nodes in the cluster. Defaults to 70. */
  nodeCount?: number;
  /** Number of curved dynamic arcs. Defaults to 16. */
  arcCount?: number;
  /** Optional theme preset */
  theme?: NetworkTheme;
  /** Optional custom primary accent color override (hex). Defaults to brand orange/cyan. */
  color?: number;
  /** Show central quantum core with gyro rings. Defaults to true. */
  showCore?: boolean;
  /** Drift speed multiplier. Defaults to 1. */
  speed?: number;
}

const THEME_PALETTES: Record<NetworkTheme, { primary: number; secondary: number; core: number }> = {
  cyan:    { primary: 0x06b6d4, secondary: 0x3b82f6, core: 0x67e8f9 },
  emerald: { primary: 0x10b981, secondary: 0x14b8a6, core: 0x6ee7b7 },
  purple:  { primary: 0x8b5cf6, secondary: 0xec4899, core: 0xc4b5fd },
  orange:  { primary: 0xff6b00, secondary: 0x1cd8d2, core: 0xf6d365 },
  custom:  { primary: 0x06b6d4, secondary: 0x8b5cf6, core: 0x67e8f9 },
};

// Procedural Smooth Radial Glow Texture Generator
function createGlowSpriteTexture(hexColor: number): THREE.CanvasTexture {
  const canvas = document.createElement("canvas");
  canvas.width = 64;
  canvas.height = 64;
  const ctx = canvas.getContext("2d")!;

  const colorStr = "#" + hexColor.toString(16).padStart(6, "0");
  const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  grad.addColorStop(0, "#ffffff");
  grad.addColorStop(0.25, colorStr);
  grad.addColorStop(0.6, colorStr + "66");
  grad.addColorStop(1, "rgba(0,0,0,0)");

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 64, 64);

  const texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;
  return texture;
}

export default function NetworkGraph3D({
  className,
  nodeCount = 70,
  arcCount = 16,
  theme = "cyan",
  color,
  showCore = true,
  speed = 1,
}: NetworkGraph3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const mounted = useIsMounted();

  useEffect(() => {
    if (!mounted) return;
    const mount = mountRef.current;
    if (!mount) return;

    // Palette Resolution
    const basePalette = THEME_PALETTES[theme] || THEME_PALETTES.cyan;
    const PRIMARY_COLOR = color ?? basePalette.primary;
    const SECONDARY_COLOR = basePalette.secondary;
    const CORE_COLOR = basePalette.core;

    const width = Math.max(1, mount.clientWidth || window.innerWidth);
    const height = Math.max(1, mount.clientHeight || window.innerHeight);

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x060614, 0.045);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 9.5);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.classList.add("three-canvas");

    // 2. Nodes Setup
    const BOUND = 4.8;
    const nodes: THREE.Vector3[] = [];
    const nodeVelocities: THREE.Vector3[] = [];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * BOUND * 2,
          (Math.random() - 0.5) * BOUND * 1.8,
          (Math.random() - 0.5) * BOUND * 1.6
        )
      );
      nodeVelocities.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.012 * speed,
          (Math.random() - 0.5) * 0.012 * speed,
          (Math.random() - 0.5) * 0.012 * speed
        )
      );
    }

    const nodeGlowTex = createGlowSpriteTexture(PRIMARY_COLOR);
    const nodeGeom = new THREE.BufferGeometry();
    const nodePosArray = new Float32Array(nodes.length * 3);
    nodes.forEach((n, i) => {
      nodePosArray[i * 3] = n.x;
      nodePosArray[i * 3 + 1] = n.y;
      nodePosArray[i * 3 + 2] = n.z;
    });
    nodeGeom.setAttribute("position", new THREE.BufferAttribute(nodePosArray, 3));

    const nodeMat = new THREE.PointsMaterial({
      color: PRIMARY_COLOR,
      map: nodeGlowTex,
      size: 0.35,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const nodePoints = new THREE.Points(nodeGeom, nodeMat);
    scene.add(nodePoints);

    // 3. Major Hub Nodes with Secondary Neon Glow
    const hubCount = 6;
    const hubIndices: number[] = [];
    for (let i = 0; i < hubCount; i++) {
      hubIndices.push(Math.floor((i / hubCount) * nodeCount));
    }

    const hubGlowTex = createGlowSpriteTexture(SECONDARY_COLOR);
    const hubGeom = new THREE.BufferGeometry();
    const hubPosArray = new Float32Array(hubCount * 3);
    hubGeom.setAttribute("position", new THREE.BufferAttribute(hubPosArray, 3));

    const hubMat = new THREE.PointsMaterial({
      color: SECONDARY_COLOR,
      map: hubGlowTex,
      size: 0.65,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.95,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const hubPoints = new THREE.Points(hubGeom, hubMat);
    scene.add(hubPoints);

    // 4. Central Quantum Core with Gyro Rings
    const coreGroup = new THREE.Group();
    if (showCore) {
      // Inner glowing core sphere
      const coreSphereGeom = new THREE.SphereGeometry(0.22, 24, 24);
      const coreSphereMat = new THREE.MeshBasicMaterial({
        color: CORE_COLOR,
        transparent: true,
        opacity: 0.85,
        blending: THREE.AdditiveBlending,
      });
      const coreSphere = new THREE.Mesh(coreSphereGeom, coreSphereMat);
      coreGroup.add(coreSphere);

      // Gyro Ring 1
      const ringGeom1 = new THREE.TorusGeometry(0.48, 0.015, 12, 48);
      const ringMat1 = new THREE.MeshBasicMaterial({
        color: PRIMARY_COLOR,
        transparent: true,
        opacity: 0.6,
        blending: THREE.AdditiveBlending,
      });
      const ring1 = new THREE.Mesh(ringGeom1, ringMat1);
      coreGroup.add(ring1);

      // Gyro Ring 2
      const ringGeom2 = new THREE.TorusGeometry(0.65, 0.012, 12, 48);
      const ringMat2 = new THREE.MeshBasicMaterial({
        color: SECONDARY_COLOR,
        transparent: true,
        opacity: 0.45,
        blending: THREE.AdditiveBlending,
      });
      const ring2 = new THREE.Mesh(ringGeom2, ringMat2);
      ring2.rotation.x = Math.PI / 3;
      coreGroup.add(ring2);

      scene.add(coreGroup);
    }

    // 5. Proximity Connection Web (Real-Time Mesh)
    const MAX_PROX_LINES = 40;
    const MAX_PROX_DIST = 2.4;
    const proxPosArray = new Float32Array(MAX_PROX_LINES * 2 * 3);
    const proxGeom = new THREE.BufferGeometry();
    proxGeom.setAttribute("position", new THREE.BufferAttribute(proxPosArray, 3));

    const proxMat = new THREE.LineBasicMaterial({
      color: PRIMARY_COLOR,
      transparent: true,
      opacity: 0.22,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const proxLines = new THREE.LineSegments(proxGeom, proxMat);
    scene.add(proxLines);

    // 6. Dynamic Flowing Bezier Arcs
    interface ArcEntity {
      geom: THREE.BufferGeometry;
      mat: THREE.LineBasicMaterial;
      line: THREE.Line;
      life: number;
      maxLife: number;
      sourceIdx: number;
      targetIdx: number;
    }

    const arcs: ArcEntity[] = [];
    for (let i = 0; i < arcCount; i++) {
      const idxA = Math.floor(Math.random() * nodes.length);
      let idxB = Math.floor(Math.random() * nodes.length);
      if (idxA === idxB) idxB = (idxB + 1) % nodes.length;

      const geom = new THREE.BufferGeometry();
      const isAlt = i % 2 === 0;
      const mat = new THREE.LineBasicMaterial({
        color: isAlt ? PRIMARY_COLOR : SECONDARY_COLOR,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });

      const line = new THREE.Line(geom, mat);
      scene.add(line);

      arcs.push({
        geom,
        mat,
        line,
        life: Math.random() * 2,
        maxLife: 2.2 + Math.random() * 2,
        sourceIdx: idxA,
        targetIdx: idxB,
      });
    }

    // 7. Mouse Parallax & Interaction
    const mouse = { x: 0, y: 0, targetX: 0, targetY: 0 };
    const onPointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      mouse.targetX = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      mouse.targetY = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    window.addEventListener("pointermove", onPointerMove, { passive: true });

    // 8. Observers & Resize
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    let visible = true;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (visible = e.isIntersecting)),
      { threshold: 0.05 }
    );
    io.observe(mount);

    // 9. Animation Loop
    let raf = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!visible) return;

      const dt = Math.min(clock.getDelta(), 0.05);
      const elapsed = clock.getElapsedTime();

      // Smooth Camera Parallax Lerp
      mouse.x += (mouse.targetX - mouse.x) * 0.04;
      mouse.y += (mouse.targetY - mouse.y) * 0.04;
      camera.position.x = mouse.x * 2.0;
      camera.position.y = -mouse.y * 2.0;
      camera.lookAt(0, 0, 0);

      if (!reduced) {
        // Drift Nodes
        const posArray = nodeGeom.attributes.position.array as Float32Array;

        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          const v = nodeVelocities[i];

          n.add(v);

          // Bounding Box Bounce
          if (Math.abs(n.x) > BOUND) v.x *= -1;
          if (Math.abs(n.y) > BOUND * 0.9) v.y *= -1;
          if (Math.abs(n.z) > BOUND * 0.8) v.z *= -1;

          posArray[i * 3] = n.x;
          posArray[i * 3 + 1] = n.y;
          posArray[i * 3 + 2] = n.z;
        }
        nodeGeom.attributes.position.needsUpdate = true;

        // Update Hub Nodes Coordinates
        const hubArray = hubGeom.attributes.position.array as Float32Array;
        for (let i = 0; i < hubCount; i++) {
          const nodeIdx = hubIndices[i];
          const n = nodes[nodeIdx];
          hubArray[i * 3] = n.x;
          hubArray[i * 3 + 1] = n.y;
          hubArray[i * 3 + 2] = n.z;
        }
        hubGeom.attributes.position.needsUpdate = true;

        // Update Proximity Connections Mesh
        let proxCount = 0;
        const pArr = proxGeom.attributes.position.array as Float32Array;

        for (let i = 0; i < nodes.length && proxCount < MAX_PROX_LINES; i++) {
          for (let j = i + 1; j < nodes.length && proxCount < MAX_PROX_LINES; j++) {
            const dist = nodes[i].distanceTo(nodes[j]);
            if (dist < MAX_PROX_DIST) {
              const idx = proxCount * 6;
              pArr[idx] = nodes[i].x;
              pArr[idx + 1] = nodes[i].y;
              pArr[idx + 2] = nodes[i].z;
              pArr[idx + 3] = nodes[j].x;
              pArr[idx + 4] = nodes[j].y;
              pArr[idx + 5] = nodes[j].z;
              proxCount++;
            }
          }
        }
        for (let i = proxCount * 6; i < MAX_PROX_LINES * 6; i++) {
          pArr[i] = 0;
        }
        proxGeom.attributes.position.needsUpdate = true;

        // Update Flowing Bezier Arcs
        for (const arc of arcs) {
          arc.life += dt;

          if (arc.life > arc.maxLife) {
            arc.life = 0;
            arc.sourceIdx = Math.floor(Math.random() * nodes.length);
            arc.targetIdx = Math.floor(Math.random() * nodes.length);
            if (arc.sourceIdx === arc.targetIdx) {
              arc.targetIdx = (arc.targetIdx + 1) % nodes.length;
            }
          }

          const nodeA = nodes[arc.sourceIdx];
          const nodeB = nodes[arc.targetIdx];
          const mid = nodeA.clone().add(nodeB).multiplyScalar(0.5);
          const dist = nodeA.distanceTo(nodeB);
          mid.normalize().multiplyScalar(dist * 0.75);

          const curve = new THREE.QuadraticBezierCurve3(nodeA, mid, nodeB);
          const pts = curve.getPoints(32);
          arc.geom.setFromPoints(pts);

          // Smooth pulse fade in and out
          const t = arc.life / arc.maxLife;
          arc.mat.opacity = Math.sin(t * Math.PI) * 0.65;
        }

        // Rotate Cluster Points and Core
        nodePoints.rotation.y += dt * 0.04 * speed;
        nodePoints.rotation.x += dt * 0.015 * speed;
        proxLines.rotation.copy(nodePoints.rotation);

        if (showCore) {
          coreGroup.rotation.y += dt * 0.5 * speed;
          coreGroup.rotation.x += dt * 0.3 * speed;
          const pulse = 1 + Math.sin(elapsed * 2.5) * 0.12;
          coreGroup.scale.set(pulse, pulse, pulse);
        }
      }

      renderer.render(scene, camera);
    };

    if (reduced) {
      renderer.render(scene, camera);
    } else {
      animate();
    }

    // 10. Clean Disposal
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("pointermove", onPointerMove);
      ro.disconnect();
      io.disconnect();

      nodeGeom.dispose();
      nodeMat.dispose();
      nodeGlowTex.dispose();

      hubGeom.dispose();
      hubMat.dispose();
      hubGlowTex.dispose();

      proxGeom.dispose();
      proxMat.dispose();

      arcs.forEach((a) => {
        a.geom.dispose();
        a.mat.dispose();
      });

      if (showCore) {
        coreGroup.traverse((obj) => {
          if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
          if ((obj as THREE.Mesh).material) {
            const m = (obj as THREE.Mesh).material;
            if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
            else (m as THREE.Material).dispose();
          }
        });
      }

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [mounted, nodeCount, arcCount, theme, color, showCore, speed, reduced]);

  return (
    <div
      ref={mountRef}
      className={className}
      aria-hidden="true"
    />
  );
}