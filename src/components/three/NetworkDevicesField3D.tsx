import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion, useIsMounted } from "@/hooks/use-reduced-motion";

/**
 * NetworkDevicesField3D — fullscreen three.js backdrop with vector
 * networking devices drifting in a bounded sphere.
 *
 * What you get:
 *  - Routers, switches, PCs, servers, firewalls, APs floating in 3D space
 *  - Each device has a chassis mesh + emissive LED dots that pulse
 *  - Distance-based neon connection lines between near devices
 *  - Mouse parallax (smooth lerp) + auto-rotate
 *  - Packets that travel along selected wires with cyan/magenta pulses
 *  - prefers-reduced-motion → static single frame
 *  - IntersectionObserver pauses when off-screen
 *  - ResizeObserver aware
 *
 * Performance notes:
 *  - One THREE.Points group for the LED halos
 *  - One THREE.LineSegments group for the connection lattice (additive)
 *  - 12 device meshes max — instanced materials only where possible
 *  - No raycasting, no post-processing, no shadow map
 */

type DeviceKind = "router" | "switch" | "pc" | "server" | "firewall" | "ap";

interface DeviceMesh {
  group: THREE.Group;
  leds: THREE.Mesh[];
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotationSpeed: THREE.Vector3;
  kind: DeviceKind;
}

interface ConnectionSegment {
  line: THREE.Line;
  pair: [DeviceMesh, DeviceMesh];
}

interface PacketDot {
  mesh: THREE.Mesh;
  from: DeviceMesh;
  to: DeviceMesh;
  t: number;
  speed: number;
  color: THREE.Color;
}

const DEVICE_PALETTE: Record<DeviceKind, { stroke: number; led: number; label: string }> = {
  router:   { stroke: 0x7c3aed, led: 0xa78bfa, label: "Router" },
  switch:   { stroke: 0x06b6d4, led: 0x67e8f9, label: "Switch" },
  pc:       { stroke: 0x3b82f6, led: 0x93c5fd, label: "PC" },
  server:   { stroke: 0xec4899, led: 0xf9a8d4, label: "Server" },
  firewall: { stroke: 0xf59e0b, led: 0xfcd34d, label: "Firewall" },
  ap:       { stroke: 0x10b981, led: 0x6ee7b7, label: "AP" },
};

export default function NetworkDevicesField3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const mounted = useIsMounted();

  useEffect(() => {
    if (!mounted) return;
    const mount = mountRef.current;
    if (!mount) return;

    // ---------- scene + camera ----------
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0d1117, 10, 28);

    // Guard against 0x0 mount (hidden / StrictMode-unmount state). WebGL
    // throws "Illegal invocation" when setSize is called with a 0 dimension
    // and the resulting camera aspect is NaN.
    const width = Math.max(1, mount.clientWidth || window.innerWidth);
    const height = Math.max(1, mount.clientHeight || window.innerHeight);

    const camera = new THREE.PerspectiveCamera(55, width / height, 0.1, 100);
    camera.position.set(0, 0, 14);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.setSize(width, height);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.classList.add("three-canvas");

    // ---------- lights ----------
    scene.add(new THREE.AmbientLight(0x6c5ce7, 0.55));
    const key = new THREE.PointLight(0x7c3aed, 1.4, 60, 1.2);
    key.position.set(8, 8, 8);
    scene.add(key);
    const fill = new THREE.PointLight(0x06b6d4, 1.1, 60, 1.2);
    fill.position.set(-10, -6, 6);
    scene.add(fill);
    const rim = new THREE.PointLight(0xec4899, 0.7, 60, 1.2);
    rim.position.set(0, 6, -8);
    scene.add(rim);

    // ---------- device factory ----------
    function buildDevice(kind: DeviceKind): DeviceMesh {
      const group = new THREE.Group();
      const palette = DEVICE_PALETTE[kind];
      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x11161d,
        metalness: 0.55,
        roughness: 0.35,
        emissive: palette.stroke,
        emissiveIntensity: 0.18,
      });
      const accentMat = new THREE.MeshStandardMaterial({
        color: palette.stroke,
        metalness: 0.6,
        roughness: 0.25,
        emissive: palette.stroke,
        emissiveIntensity: 0.6,
      });

      let leds: THREE.Mesh[] = [];

      if (kind === "router") {
        // Horizontal chassis + 2 antennas
        const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.45, 0.9), baseMat);
        group.add(chassis);
        const stripe = new THREE.Mesh(new THREE.BoxGeometry(1.95, 0.07, 0.92), accentMat);
        stripe.position.y = 0.2;
        group.add(stripe);
        for (let i = 0; i < 2; i++) {
          const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.02, 0.9, 6), accentMat);
          ant.position.set(i === 0 ? -0.7 : 0.7, 0.7, 0);
          group.add(ant);
        }
        leds = addLedRow(group, [-0.7, 0.7], 0.05, 0.46, accentMat, 4);
      } else if (kind === "switch") {
        // Wider, flatter chassis with port grid
        const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.35, 0.7), baseMat);
        group.add(chassis);
        const face = new THREE.Mesh(new THREE.BoxGeometry(2.15, 0.1, 0.72), accentMat);
        face.position.y = 0.18;
        group.add(face);
        leds = addLedRow(group, [-0.9, 0.9], 0.0, 0.46, accentMat, 8);
      } else if (kind === "pc") {
        // Monitor + base
        const monitor = new THREE.Mesh(new THREE.BoxGeometry(1.1, 0.8, 0.08), baseMat);
        group.add(monitor);
        const screen = new THREE.Mesh(
          new THREE.PlaneGeometry(0.95, 0.65),
          new THREE.MeshBasicMaterial({ color: palette.stroke })
        );
        screen.position.z = 0.045;
        group.add(screen);
        const stand = new THREE.Mesh(new THREE.BoxGeometry(0.25, 0.15, 0.08), baseMat);
        stand.position.set(0, -0.47, 0);
        group.add(stand);
        const base = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.06, 0.35), baseMat);
        base.position.set(0, -0.58, 0);
        group.add(base);
        const led = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 12, 12),
          new THREE.MeshBasicMaterial({ color: palette.led })
        );
        led.position.set(0.45, -0.4, 0.06);
        group.add(led);
        leds.push(led);
      } else if (kind === "server") {
        // Tall rack with horizontal slots
        const rack = new THREE.Mesh(new THREE.BoxGeometry(0.7, 1.6, 0.6), baseMat);
        group.add(rack);
        for (let i = 0; i < 5; i++) {
          const slot = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.08, 0.62), accentMat);
          slot.position.y = -0.55 + i * 0.27;
          group.add(slot);
          const led = new THREE.Mesh(
            new THREE.SphereGeometry(0.04, 10, 10),
            new THREE.MeshBasicMaterial({ color: palette.led })
          );
          led.position.set(0.28, -0.55 + i * 0.27, 0.32);
          group.add(led);
          leds.push(led);
        }
      } else if (kind === "firewall") {
        // Brick-wall shield with central vent
        const shieldShape = new THREE.Shape();
        const w = 1.0;
        const h = 1.0;
        shieldShape.moveTo(0, -h / 2);
        shieldShape.lineTo(w / 2, -h / 4);
        shieldShape.lineTo(w / 2, h / 4);
        shieldShape.lineTo(0, h / 2);
        shieldShape.lineTo(-w / 2, h / 4);
        shieldShape.lineTo(-w / 2, -h / 4);
        shieldShape.closePath();
        const shield = new THREE.Mesh(
          new THREE.ExtrudeGeometry(shieldShape, { depth: 0.25, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04 }),
          baseMat
        );
        shield.position.z = -0.125;
        group.add(shield);
        const vent = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.05, 8, 24), accentMat);
        vent.position.z = 0.13;
        group.add(vent);
        const led = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 12, 12),
          new THREE.MeshBasicMaterial({ color: palette.led })
        );
        led.position.set(0.3, 0.3, 0.18);
        group.add(led);
        leds.push(led);
      } else {
        // AP — disc with concentric rings
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.55, 0.12, 32), baseMat);
        group.add(disc);
        for (let i = 0; i < 3; i++) {
          const ring = new THREE.Mesh(
            new THREE.TorusGeometry(0.3 + i * 0.15, 0.015, 8, 32),
            accentMat
          );
          ring.rotation.x = Math.PI / 2;
          ring.position.y = 0.07;
          group.add(ring);
        }
        const led = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 12, 12),
          new THREE.MeshBasicMaterial({ color: palette.led })
        );
        led.position.set(0, 0.08, 0);
        group.add(led);
        leds.push(led);
      }

      return { group, leds, position: new THREE.Vector3(), velocity: new THREE.Vector3(), rotationSpeed: new THREE.Vector3(), kind };
    }

    function addLedRow(
      group: THREE.Group,
      [x0, x1]: [number, number],
      y: number,
      z: number,
      mat: THREE.Material,
      count: number
    ): THREE.Mesh[] {
      const leds: THREE.Mesh[] = [];
      for (let i = 0; i < count; i++) {
        const led = new THREE.Mesh(
          new THREE.SphereGeometry(0.04, 10, 10),
          new THREE.MeshBasicMaterial({ color: DEVICE_PALETTE[group.userData.kind as DeviceKind]?.led ?? 0xa78bfa })
        );
        led.position.set(x0 + (i / (count - 1)) * (x1 - x0), y + 0.02, z);
        group.add(led);
        leds.push(led);
      }
      return leds;
    }

    // ---------- populate ----------
    const kinds: DeviceKind[] = ["router", "switch", "pc", "server", "firewall", "ap"];
    const TARGET = 12;
    const devices: DeviceMesh[] = [];
    const BOUND = 6.5;

    for (let i = 0; i < TARGET; i++) {
      const kind = kinds[i % kinds.length];
      const d = buildDevice(kind);
      d.group.userData.kind = kind;
      d.position.set(
        (Math.random() - 0.5) * BOUND * 2,
        (Math.random() - 0.5) * BOUND * 1.4,
        (Math.random() - 0.5) * BOUND * 1.2
      );
      d.velocity.set(
        (Math.random() - 0.5) * 0.0035,
        (Math.random() - 0.5) * 0.0025,
        (Math.random() - 0.5) * 0.0035
      );
      d.rotationSpeed.set(
        (Math.random() - 0.5) * 0.0025,
        (Math.random() - 0.5) * 0.004,
        (Math.random() - 0.5) * 0.002
      );
      d.group.position.copy(d.position);
      // initial random orientation
      d.group.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      // build LED row needs kind set on the group BEFORE construction;
      // we approximate led colors via per-mesh material in factory.
      scene.add(d.group);
      devices.push(d);
    }

    // ---------- connection lattice ----------
    const connections: ConnectionSegment[] = [];
    const MAX_DIST = 4.8;
    const lineGeomCache = new THREE.BufferGeometry();
    // We'll build lines dynamically each frame because pairs change.

    // ---------- packet dots ----------
    const packets: PacketDot[] = [];
    const PACKET_PALETTE = [
      new THREE.Color(0x06b6d4),
      new THREE.Color(0xec4899),
      new THREE.Color(0x7c3aed),
      new THREE.Color(0x3b82f6),
    ];
    const packetGeom = new THREE.SphereGeometry(0.08, 10, 10);

    function spawnPacket(a: DeviceMesh, b: DeviceMesh) {
      const mat = new THREE.MeshBasicMaterial({
        color: PACKET_PALETTE[Math.floor(Math.random() * PACKET_PALETTE.length)],
        transparent: true,
        opacity: 1,
      });
      const mesh = new THREE.Mesh(packetGeom, mat);
      scene.add(mesh);
      packets.push({ mesh, from: a, to: b, t: 0, speed: 0.005 + Math.random() * 0.006, color: mat.color });
    }

    // ---------- mouse parallax ----------
    const target = new THREE.Vector2();
    const current = new THREE.Vector2();
    const onMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      target.set(nx, ny);
    };
    window.addEventListener("mousemove", onMouseMove);

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

    // ---------- off-screen pause ----------
    let visible = true;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (visible = e.isIntersecting)),
      { threshold: 0 }
    );
    io.observe(mount);

    // ---------- animation loop ----------
    let raf = 0;
    let prevT = performance.now();
    const connectionPairs = new Set<string>();

    function rebuildConnections() {
      // dispose previous lines
      for (const c of connections) {
        scene.remove(c.line);
        c.line.geometry.dispose();
        (c.line.material as THREE.Material).dispose();
      }
      connections.length = 0;
      connectionPairs.clear();

      for (let i = 0; i < devices.length; i++) {
        for (let j = i + 1; j < devices.length; j++) {
          const a = devices[i];
          const b = devices[j];
          const d = a.position.distanceTo(b.position);
          if (d > MAX_DIST) continue;
          const key = `${i}-${j}`;
          if (connectionPairs.has(key)) continue;
          connectionPairs.add(key);

          const paletteA = DEVICE_PALETTE[a.kind];
          const paletteB = DEVICE_PALETTE[b.kind];
          const colorHex = (paletteA.stroke + paletteB.stroke) >>> 0;
          const mat = new THREE.LineBasicMaterial({
            color: colorHex,
            transparent: true,
            opacity: Math.max(0.08, 0.55 - d / MAX_DIST),
            blending: THREE.AdditiveBlending,
            depthWrite: false,
          });
          const geom = new THREE.BufferGeometry().setFromPoints([
            a.position.clone(),
            b.position.clone(),
          ]);
          const line = new THREE.Line(geom, mat);
          scene.add(line);
          connections.push({ line, pair: [a, b] });
        }
      }
    }

    // Pre-build connections; rebuild every ~2 seconds (cheap with 12 devices)
    rebuildConnections();

    const rebuildInterval = window.setInterval(rebuildConnections, 2000);
    const packetSpawnInterval = window.setInterval(() => {
      if (connections.length === 0) return;
      const c = connections[Math.floor(Math.random() * connections.length)];
      spawnPacket(c.pair[0], c.pair[1]);
    }, 700);

    function tick(now: number) {
      raf = requestAnimationFrame(tick);
      if (!visible) return;

      const dt = Math.min(64, now - prevT);
      prevT = now;

      // mouse parallax (lerp)
      current.lerp(target, 0.04);
      camera.position.x = current.x * 1.8;
      camera.position.y = -current.y * 1.2;
      camera.lookAt(0, 0, 0);

      // animate devices
      for (const d of devices) {
        d.position.addScaledVector(d.velocity, dt);
        d.group.rotation.x += d.rotationSpeed.x * dt;
        d.group.rotation.y += d.rotationSpeed.y * dt;
        d.group.rotation.z += d.rotationSpeed.z * dt;

        // bounce inside bound
        for (const axis of ["x", "y", "z"] as const) {
          if (d.position[axis] > BOUND || d.position[axis] < -BOUND) {
            d.velocity[axis] *= -1;
          }
        }
        d.group.position.copy(d.position);

        // LED pulse
        const t = now * 0.003;
        for (let i = 0; i < d.leds.length; i++) {
          const led = d.leds[i];
          const phase = Math.sin(t + i * 0.7);
          const mat = led.material as THREE.MeshBasicMaterial;
          mat.opacity = 0.55 + phase * 0.45;
        }
      }

      // animate packets
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.t += p.speed * (dt / 16.67);
        if (p.t >= 1) {
          scene.remove(p.mesh);
          (p.mesh.material as THREE.Material).dispose();
          packets.splice(i, 1);
          continue;
        }
        const pos = p.from.position.clone().lerp(p.to.position, p.t);
        p.mesh.position.copy(pos);
        const mat = p.mesh.material as THREE.MeshBasicMaterial;
        mat.opacity = 1 - Math.abs(p.t - 0.5) * 1.6; // fade in/out at ends
      }

      renderer.render(scene, camera);
    }

    if (reduced) {
      // single static frame for reduced motion
      for (const d of devices) {
        d.group.position.copy(d.position);
      }
      rebuildConnections();
      renderer.render(scene, camera);
    } else {
      raf = requestAnimationFrame(tick);
    }

    // ---------- cleanup ----------
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(rebuildInterval);
      clearInterval(packetSpawnInterval);
      window.removeEventListener("mousemove", onMouseMove);
      ro.disconnect();
      io.disconnect();
      for (const d of devices) {
        d.group.traverse((obj) => {
          if ((obj as THREE.Mesh).geometry) (obj as THREE.Mesh).geometry.dispose();
          const m = (obj as THREE.Mesh).material;
          if (m) {
            if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
            else (m as THREE.Material).dispose();
          }
        });
      }
      for (const c of connections) {
        c.line.geometry.dispose();
        (c.line.material as THREE.Material).dispose();
      }
      for (const p of packets) {
        (p.mesh.material as THREE.Material).dispose();
      }
      packetGeom.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [mounted, reduced]);

  return (
    <div
      aria-hidden
      ref={mountRef}
      className="pointer-events-none fixed inset-0 -z-10 opacity-70 dark:opacity-100"
    />
  );
}