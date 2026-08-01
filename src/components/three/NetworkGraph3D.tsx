import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion, useIsMounted } from "@/hooks/use-reduced-motion";

interface NetworkGraph3DProps {
  className?: string;
  /** Number of nodes in the cluster. Defaults to 60. */
  nodeCount?: number;
  /** Optional accent color override (hex). Defaults to brand orange. */
  color?: number;
}

/**
 * NetworkGraph3D — animated node + arc cluster.
 * Smaller and more contained than the global ParticleField; perfect for
 * the home hero side panel or the "About" section.
 *
 *  - ~60 nodes drifting slowly in a bounded sphere
 *  - dynamic arcs between random node pairs that flow colour pulse
 *  - mouse parallax (lerp 0.04)
 *  - prefers-reduced-motion → static frame
 *  - ResizeObserver aware
 *  - pauses when off-screen via IntersectionObserver
 */
export default function NetworkGraph3D({
  className,
  nodeCount = 60,
  color = 0xff6b00,
}: NetworkGraph3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const mounted = useIsMounted();

  useEffect(() => {
    if (!mounted) return;
    const mount = mountRef.current;
    if (!mount) return;

    const ACCENT = color;
    const CYAN = 0x1cd8d2;
    const GOLD = 0xf6d365;

    const width = Math.max(1, mount.clientWidth || window.innerWidth);
    const height = Math.max(1, mount.clientHeight || window.innerHeight);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x060614, 8, 22);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 0, 9);

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

    // ---------- nodes ----------
    const BOUND = 4.5;
    const nodes: THREE.Vector3[] = [];
    const nodeSpeeds: THREE.Vector3[] = [];
    for (let i = 0; i < nodeCount; i++) {
      nodes.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * BOUND * 2,
          (Math.random() - 0.5) * BOUND * 2,
          (Math.random() - 0.5) * BOUND * 2
        )
      );
      nodeSpeeds.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02,
          (Math.random() - 0.5) * 0.02
        )
      );
    }

    const nodeGeom = new THREE.BufferGeometry();
    const positions = new Float32Array(nodes.length * 3);
    nodes.forEach((n, i) => {
      positions[i * 3] = n.x;
      positions[i * 3 + 1] = n.y;
      positions[i * 3 + 2] = n.z;
    });
    nodeGeom.setAttribute("position", new THREE.BufferAttribute(positions, 3));

    const nodeMat = new THREE.PointsMaterial({
      color: ACCENT,
      size: 0.08,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const nodePoints = new THREE.Points(nodeGeom, nodeMat);
    scene.add(nodePoints);

    // halo sprites around a few "hub" nodes
    const hubCount = 4;
    const hubPositions: THREE.Vector3[] = [];
    for (let i = 0; i < hubCount; i++) {
      hubPositions.push(
        new THREE.Vector3(
          (Math.random() - 0.5) * BOUND,
          (Math.random() - 0.5) * BOUND,
          (Math.random() - 0.5) * BOUND
        )
      );
    }
    const hubGeom = new THREE.BufferGeometry();
    const hubPos = new Float32Array(hubCount * 3);
    hubPositions.forEach((p, i) => {
      hubPos[i * 3] = p.x;
      hubPos[i * 3 + 1] = p.y;
      hubPos[i * 3 + 2] = p.z;
    });
    hubGeom.setAttribute("position", new THREE.BufferAttribute(hubPos, 3));
    const hubMat = new THREE.PointsMaterial({
      color: CYAN,
      size: 0.18,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const hubPoints = new THREE.Points(hubGeom, hubMat);
    scene.add(hubPoints);

    // faint glow at origin
    const glowGeom = new THREE.SphereGeometry(0.18, 16, 16);
    const glowMat = new THREE.MeshBasicMaterial({
      color: GOLD,
      transparent: true,
      opacity: 0.5,
      depthWrite: false,
    });
    const glow = new THREE.Mesh(glowGeom, glowMat);
    scene.add(glow);

    // ---------- arcs ----------
    const ARC_COUNT = 14;
    const arcs: { geom: THREE.BufferGeometry; mat: THREE.LineBasicMaterial; line: THREE.Line; life: number; max: number }[] = [];
    for (let i = 0; i < ARC_COUNT; i++) {
      const a = nodes[Math.floor(Math.random() * nodes.length)];
      const b = nodes[Math.floor(Math.random() * nodes.length)];
      const mid = a.clone().add(b).multiplyScalar(0.5);
      const dist = a.distanceTo(b);
      mid.normalize().multiplyScalar(dist * 0.9);
      const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
      const points = curve.getPoints(40);
      const geom = new THREE.BufferGeometry().setFromPoints(points);
      const mat = new THREE.LineBasicMaterial({
        color: Math.random() > 0.5 ? ACCENT : CYAN,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      });
      const line = new THREE.Line(geom, mat);
      scene.add(line);
      arcs.push({ geom, mat, line, life: Math.random() * 2, max: 2 + Math.random() * 2 });
    }

    // ---------- mouse parallax ----------
    const pointer = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointerMove = (e: PointerEvent) => {
      const rect = mount.getBoundingClientRect();
      pointer.tx = ((e.clientX - rect.left) / rect.width - 0.5) * 2;
      pointer.ty = ((e.clientY - rect.top) / rect.height - 0.5) * 2;
    };
    mount.addEventListener("pointermove", onPointerMove);

    // ---------- resize ----------
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    // ---------- pause when off-screen ----------
    let visible = true;
    const io = new IntersectionObserver(
      (entries) => (visible = entries[0].isIntersecting),
      { threshold: 0.05 }
    );
    io.observe(mount);

    // ---------- loop ----------
    let raf = 0;
    const clock = new THREE.Clock();
    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!visible) return;
      const dt = Math.min(clock.getDelta(), 0.05);

      // mouse parallax
      pointer.x += (pointer.tx - pointer.x) * 0.04;
      pointer.y += (pointer.ty - pointer.y) * 0.04;
      camera.position.x = pointer.x * 1.6;
      camera.position.y = -pointer.y * 1.6;
      camera.lookAt(0, 0, 0);

      if (!reduced) {
        // drift nodes
        for (let i = 0; i < nodes.length; i++) {
          const n = nodes[i];
          const s = nodeSpeeds[i];
          n.add(s);
          if (Math.abs(n.x) > BOUND) s.x *= -1;
          if (Math.abs(n.y) > BOUND) s.y *= -1;
          if (Math.abs(n.z) > BOUND) s.z *= -1;
        }
        const arr = nodeGeom.attributes.position.array as Float32Array;
        for (let i = 0; i < nodes.length; i++) {
          arr[i * 3] = nodes[i].x;
          arr[i * 3 + 1] = nodes[i].y;
          arr[i * 3 + 2] = nodes[i].z;
        }
        nodeGeom.attributes.position.needsUpdate = true;

        // pulse arcs
        for (const arc of arcs) {
          arc.life += dt;
          if (arc.life > arc.max) {
            arc.life = 0;
            const a = nodes[Math.floor(Math.random() * nodes.length)];
            const b = nodes[Math.floor(Math.random() * nodes.length)];
            const mid = a.clone().add(b).multiplyScalar(0.5);
            const dist = a.distanceTo(b);
            mid.normalize().multiplyScalar(dist * 0.9);
            const curve = new THREE.QuadraticBezierCurve3(a, mid, b);
            const pts = curve.getPoints(40);
            arc.geom.setFromPoints(pts);
            arc.mat.color.setHex(Math.random() > 0.5 ? ACCENT : CYAN);
          }
          const t = arc.life / arc.max;
          arc.mat.opacity = Math.sin(t * Math.PI) * 0.6;

          // wash nodes along arc —use dot colour grow
          // (keeps the line shimmering)
        }

        nodePoints.rotation.y += dt * 0.05;
        nodePoints.rotation.x += dt * 0.02;
        hubPoints.rotation.y -= dt * 0.08;
        glow.scale.setScalar(1 + Math.sin(clock.elapsedTime * 2) * 0.15);
      }

      renderer.render(scene, camera);
    };
    animate();

    return () => {
      cancelAnimationFrame(raf);
      mount.removeEventListener("pointermove", onPointerMove);
      ro.disconnect();
      io.disconnect();
      nodeGeom.dispose();
      nodeMat.dispose();
      hubGeom.dispose();
      hubMat.dispose();
      glowGeom.dispose();
      glowMat.dispose();
      arcs.forEach((a) => {
        a.geom.dispose();
        a.mat.dispose();
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [mounted, nodeCount, color, reduced]);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}
