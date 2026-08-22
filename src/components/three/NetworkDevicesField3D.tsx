 import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion, useIsMounted } from "@/hooks/use-reduced-motion";

type DeviceKind = "router" | "switch" | "pc" | "server" | "firewall" | "ap";

interface DeviceMesh {
  group: THREE.Group;
  leds: { mesh: THREE.Mesh; baseSpeed: number; phase: number }[];
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  rotationSpeed: THREE.Vector3;
  kind: DeviceKind;
  pulseMesh?: THREE.Mesh;
}

interface PacketDot {
  mesh: THREE.Mesh;
  from: DeviceMesh;
  to: DeviceMesh;
  t: number;
  speed: number;
  color: THREE.Color;
}

const DEVICE_PALETTE: Record<DeviceKind, { stroke: number; led: number; glow: number; label: string }> = {
  router:   { stroke: 0x8b5cf6, led: 0xc4b5fd, glow: 0x7c3aed, label: "Router" },
  switch:   { stroke: 0x06b6d4, led: 0xa5f3fc, glow: 0x0891b2, label: "Switch" },
  pc:       { stroke: 0x3b82f6, led: 0xbfdbfe, glow: 0x2563eb, label: "PC" },
  server:   { stroke: 0xec4899, led: 0xfbcfe8, glow: 0xdb2777, label: "Server" },
  firewall: { stroke: 0xf59e0b, led: 0xfef08a, glow: 0xd97706, label: "Firewall" },
  ap:       { stroke: 0x10b981, led: 0xa7f3d0, glow: 0x059669, label: "AP" },
};

export default function NetworkDevicesField3D() {
  const mountRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const mounted = useIsMounted();

  useEffect(() => {
    if (!mounted) return;
    const mount = mountRef.current;
    if (!mount) return;

    // ---------- 1. Scene & Camera Setup ----------
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x070b12, 0.035);

    const width = Math.max(1, mount.clientWidth || window.innerWidth);
    const height = Math.max(1, mount.clientHeight || window.innerHeight);

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 100);
    camera.position.set(0, 0, 15);

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

    // ---------- 2. Cyber Lights ----------
    scene.add(new THREE.AmbientLight(0x4f46e5, 0.65));
    
    const keyLight = new THREE.PointLight(0x8b5cf6, 1.8, 45, 1.2);
    keyLight.position.set(9, 9, 7);
    scene.add(keyLight);

    const fillLight = new THREE.PointLight(0x06b6d4, 1.4, 45, 1.2);
    fillLight.position.set(-10, -7, 6);
    scene.add(fillLight);

    const backGlow = new THREE.PointLight(0xec4899, 1.0, 40, 1.5);
    backGlow.position.set(0, 6, -9);
    scene.add(backGlow);

    // ---------- 3. Background Data-Dust Particle Field ----------
    const dustCount = 160;
    const dustPositions = new Float32Array(dustCount * 3);
    for (let i = 0; i < dustCount * 3; i += 3) {
      dustPositions[i] = (Math.random() - 0.5) * 26;
      dustPositions[i + 1] = (Math.random() - 0.5) * 18;
      dustPositions[i + 2] = (Math.random() - 0.5) * 16;
    }
    const dustGeom = new THREE.BufferGeometry();
    dustGeom.setAttribute("position", new THREE.BufferAttribute(dustPositions, 3));
    const dustMat = new THREE.PointsMaterial({
      size: 0.07,
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.4,
      blending: THREE.AdditiveBlending,
    });
    const dustParticles = new THREE.Points(dustGeom, dustMat);
    scene.add(dustParticles);

    // ---------- 4. Device Factory (Detailed Procedural Models) ----------
    function buildDevice(kind: DeviceKind): DeviceMesh {
      const group = new THREE.Group();
      const palette = DEVICE_PALETTE[kind];

      const baseMat = new THREE.MeshStandardMaterial({
        color: 0x0c111a,
        metalness: 0.8,
        roughness: 0.25,
        emissive: palette.glow,
        emissiveIntensity: 0.15,
      });

      const accentMat = new THREE.MeshStandardMaterial({
        color: palette.stroke,
        metalness: 0.5,
        roughness: 0.2,
        emissive: palette.stroke,
        emissiveIntensity: 0.7,
      });

      const leds: { mesh: THREE.Mesh; baseSpeed: number; phase: number }[] = [];
      let pulseMesh: THREE.Mesh | undefined;

      if (kind === "router") {
        // Router Chassis + Dual Antennas + Front Glow Grid
        const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.1, 0.4, 1.0), baseMat);
        group.add(chassis);
        const topStripe = new THREE.Mesh(new THREE.BoxGeometry(2.0, 0.05, 0.92), accentMat);
        topStripe.position.y = 0.2;
        group.add(topStripe);

        for (let i = 0; i < 2; i++) {
          const ant = new THREE.Mesh(new THREE.CylinderGeometry(0.02, 0.03, 0.85, 8), accentMat);
          ant.position.set(i === 0 ? -0.75 : 0.75, 0.55, -0.3);
          ant.rotation.z = i === 0 ? 0.15 : -0.15;
          group.add(ant);
        }

        for (let i = 0; i < 5; i++) {
          const ledMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.045, 8, 8),
            new THREE.MeshBasicMaterial({ color: palette.led, transparent: true })
          );
          ledMesh.position.set(-0.6 + i * 0.3, 0.02, 0.52);
          group.add(ledMesh);
          leds.push({ mesh: ledMesh, baseSpeed: 2 + i * 1.5, phase: i * 0.8 });
        }
      } else if (kind === "switch") {
        // Wide enterprise switch with 2 rows of port LEDs
        const chassis = new THREE.Mesh(new THREE.BoxGeometry(2.4, 0.42, 0.85), baseMat);
        group.add(chassis);
        const portPlate = new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.22, 0.87), accentMat);
        group.add(portPlate);

        for (let row = 0; row < 2; row++) {
          for (let col = 0; col < 6; col++) {
            const ledMesh = new THREE.Mesh(
              new THREE.SphereGeometry(0.035, 8, 8),
              new THREE.MeshBasicMaterial({ color: palette.led, transparent: true })
            );
            ledMesh.position.set(-0.8 + col * 0.32, -0.06 + row * 0.12, 0.45);
            group.add(ledMesh);
            leds.push({ mesh: ledMesh, baseSpeed: 3 + col * 2 + row, phase: col + row * 0.5 });
          }
        }
      } else if (kind === "server") {
        // Multi-blade rack server
        const rack = new THREE.Mesh(new THREE.BoxGeometry(0.85, 1.8, 0.8), baseMat);
        group.add(rack);

        for (let i = 0; i < 5; i++) {
          const slot = new THREE.Mesh(new THREE.BoxGeometry(0.78, 0.12, 0.82), accentMat);
          slot.position.y = -0.6 + i * 0.3;
          group.add(slot);

          const ledMesh = new THREE.Mesh(
            new THREE.SphereGeometry(0.04, 8, 8),
            new THREE.MeshBasicMaterial({ color: palette.led, transparent: true })
          );
          ledMesh.position.set(0.32, -0.6 + i * 0.3, 0.42);
          group.add(ledMesh);
          leds.push({ mesh: ledMesh, baseSpeed: 4 + i * 2, phase: i * 1.2 });
        }
      } else if (kind === "firewall") {
        // Shield polygon with inner glow core
        const shieldShape = new THREE.Shape();
        const w = 1.1;
        const h = 1.2;
        shieldShape.moveTo(0, -h / 2);
        shieldShape.lineTo(w / 2, -h / 4);
        shieldShape.lineTo(w / 2, h / 4);
        shieldShape.lineTo(0, h / 2);
        shieldShape.lineTo(-w / 2, h / 4);
        shieldShape.lineTo(-w / 2, -h / 4);
        shieldShape.closePath();

        const shield = new THREE.Mesh(
          new THREE.ExtrudeGeometry(shieldShape, { depth: 0.22, bevelEnabled: true, bevelSize: 0.04, bevelThickness: 0.04 }),
          baseMat
        );
        shield.position.z = -0.11;
        group.add(shield);

        const core = new THREE.Mesh(new THREE.TorusGeometry(0.24, 0.06, 12, 24), accentMat);
        core.position.z = 0.14;
        group.add(core);

        const ledMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.07, 10, 10),
          new THREE.MeshBasicMaterial({ color: palette.led, transparent: true })
        );
        ledMesh.position.set(0, 0, 0.16);
        group.add(ledMesh);
        leds.push({ mesh: ledMesh, baseSpeed: 3, phase: 0 });
      } else if (kind === "ap") {
        // Access Point with expanding Wi-Fi radar ring
        const disc = new THREE.Mesh(new THREE.CylinderGeometry(0.65, 0.65, 0.12, 32), baseMat);
        group.add(disc);

        const innerRing = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.02, 8, 32), accentMat);
        innerRing.rotation.x = Math.PI / 2;
        innerRing.position.y = 0.07;
        group.add(innerRing);

        const ledMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.06, 12, 12),
          new THREE.MeshBasicMaterial({ color: palette.led, transparent: true })
        );
        ledMesh.position.set(0, 0.08, 0);
        group.add(ledMesh);
        leds.push({ mesh: ledMesh, baseSpeed: 2.5, phase: 0 });

        // Concentric Radar Wave
        const pulseGeom = new THREE.RingGeometry(0.6, 0.65, 32);
        const pulseMat = new THREE.MeshBasicMaterial({
          color: palette.stroke,
          transparent: true,
          opacity: 0,
          side: THREE.DoubleSide,
        });
        pulseMesh = new THREE.Mesh(pulseGeom, pulseMat);
        pulseMesh.rotation.x = Math.PI / 2;
        pulseMesh.position.y = 0.08;
        group.add(pulseMesh);
      } else {
        // PC / Workstation
        const monitor = new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.85, 0.08), baseMat);
        group.add(monitor);
        const screen = new THREE.Mesh(
          new THREE.PlaneGeometry(1.05, 0.72),
          new THREE.MeshBasicMaterial({ color: palette.stroke, opacity: 0.9 })
        );
        screen.position.z = 0.046;
        group.add(screen);

        const stand = new THREE.Mesh(new THREE.BoxGeometry(0.2, 0.22, 0.08), baseMat);
        stand.position.set(0, -0.48, 0);
        group.add(stand);

        const basePlate = new THREE.Mesh(new THREE.BoxGeometry(0.55, 0.05, 0.35), baseMat);
        basePlate.position.set(0, -0.59, 0);
        group.add(basePlate);

        const ledMesh = new THREE.Mesh(
          new THREE.SphereGeometry(0.05, 8, 8),
          new THREE.MeshBasicMaterial({ color: palette.led, transparent: true })
        );
        ledMesh.position.set(0.48, -0.42, 0.06);
        group.add(ledMesh);
        leds.push({ mesh: ledMesh, baseSpeed: 2, phase: 1 });
      }

      return {
        group,
        leds,
        position: new THREE.Vector3(),
        velocity: new THREE.Vector3(),
        rotationSpeed: new THREE.Vector3(),
        kind,
        pulseMesh,
      };
    }

    // ---------- 5. Populate Devices ----------
    const kinds: DeviceKind[] = ["router", "switch", "server", "firewall", "ap", "pc"];
    const TARGET_COUNT = 12;
    const devices: DeviceMesh[] = [];
    const BOUND = 7.0;

    for (let i = 0; i < TARGET_COUNT; i++) {
      const kind = kinds[i % kinds.length];
      const d = buildDevice(kind);
      d.group.userData.kind = kind;

      d.position.set(
        (Math.random() - 0.5) * BOUND * 2.2,
        (Math.random() - 0.5) * BOUND * 1.5,
        (Math.random() - 0.5) * BOUND * 1.2
      );
      d.velocity.set(
        (Math.random() - 0.5) * 0.0035,
        (Math.random() - 0.5) * 0.0025,
        (Math.random() - 0.5) * 0.0035
      );
      d.rotationSpeed.set(
        (Math.random() - 0.5) * 0.002,
        (Math.random() - 0.5) * 0.0035,
        (Math.random() - 0.5) * 0.002
      );

      d.group.position.copy(d.position);
      d.group.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );

      scene.add(d.group);
      devices.push(d);
    }

    // ---------- 6. High-Performance Real-Time Connection Lattice ----------
    const MAX_CONNECTIONS = 35;
    const MAX_DIST = 5.2;
    const linePosArray = new Float32Array(MAX_CONNECTIONS * 2 * 3);
    const lineColArray = new Float32Array(MAX_CONNECTIONS * 2 * 3);

    const latticeGeom = new THREE.BufferGeometry();
    latticeGeom.setAttribute("position", new THREE.BufferAttribute(linePosArray, 3));
    latticeGeom.setAttribute("color", new THREE.BufferAttribute(lineColArray, 3));

    const latticeMat = new THREE.LineBasicMaterial({
      vertexColors: true,
      transparent: true,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    const latticeMesh = new THREE.LineSegments(latticeGeom, latticeMat);
    scene.add(latticeMesh);

    const activePairs: [DeviceMesh, DeviceMesh][] = [];

    // ---------- 7. High-Energy Data Packets ----------
    const packets: PacketDot[] = [];
    const PACKET_COLORS = [
      new THREE.Color(0x06b6d4),
      new THREE.Color(0xec4899),
      new THREE.Color(0xa78bfa),
      new THREE.Color(0x10b981),
      new THREE.Color(0x38bdf8),
    ];
    const packetGeom = new THREE.SphereGeometry(0.09, 10, 10);

    function spawnPacket() {
      if (activePairs.length === 0) return;
      const pair = activePairs[Math.floor(Math.random() * activePairs.length)];
      const color = PACKET_COLORS[Math.floor(Math.random() * PACKET_COLORS.length)];

      const mat = new THREE.MeshBasicMaterial({
        color,
        transparent: true,
        opacity: 1,
      });
      const mesh = new THREE.Mesh(packetGeom, mat);
      scene.add(mesh);
      packets.push({
        mesh,
        from: pair[0],
        to: pair[1],
        t: 0,
        speed: 0.007 + Math.random() * 0.008,
        color,
      });
    }

    const packetInterval = window.setInterval(spawnPacket, 650);

    // ---------- 8. Mouse Parallax ----------
    const mouseTarget = new THREE.Vector2();
    const mouseCurrent = new THREE.Vector2();

    const onMouseMove = (e: MouseEvent) => {
      const rect = mount.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      mouseTarget.set(nx, ny);
    };
    window.addEventListener("mousemove", onMouseMove, { passive: true });

    // ---------- 9. Resize & Observer ----------
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
      { threshold: 0 }
    );
    io.observe(mount);

    // ---------- 10. Animation Loop ----------
    let raf = 0;
    let prevT = performance.now();

    function tick(now: number) {
      raf = requestAnimationFrame(tick);
      if (!visible) return;

      const dt = Math.min(64, now - prevT);
      prevT = now;

      // Mouse Parallax Lerp
      mouseCurrent.lerp(mouseTarget, 0.035);
      camera.position.x = mouseCurrent.x * 2.2;
      camera.position.y = -mouseCurrent.y * 1.5;
      camera.lookAt(0, 0, 0);

      // Rotate Background Cyber Dust
      dustParticles.rotation.y = now * 0.0001;
      dustParticles.rotation.x = now * 0.00005;

      // Animate Devices
      for (const d of devices) {
        d.position.addScaledVector(d.velocity, dt);
        d.group.rotation.x += d.rotationSpeed.x * dt;
        d.group.rotation.y += d.rotationSpeed.y * dt;
        d.group.rotation.z += d.rotationSpeed.z * dt;

        // Bounding Bounce
        for (const axis of ["x", "y", "z"] as const) {
          if (d.position[axis] > BOUND || d.position[axis] < -BOUND) {
            d.velocity[axis] *= -1;
          }
        }
        d.group.position.copy(d.position);

        // LED Blinking
        const sec = now * 0.004;
        for (const led of d.leds) {
          const intensity = 0.3 + 0.7 * Math.abs(Math.sin(sec * led.baseSpeed + led.phase));
          (led.mesh.material as THREE.MeshBasicMaterial).opacity = intensity;
        }

        // AP Pulse Wave Expansion
        if (d.pulseMesh) {
          const pulseT = (now * 0.0015) % 1;
          const scale = 1 + pulseT * 2.8;
          d.pulseMesh.scale.set(scale, scale, scale);
          (d.pulseMesh.material as THREE.MeshBasicMaterial).opacity = Math.max(0, (1 - pulseT) * 0.45);
        }
      }

      // Update Real-Time Dynamic Connection Lattice
      activePairs.length = 0;
      let lineIndex = 0;
      const posAttr = latticeGeom.attributes.position as THREE.BufferAttribute;
      const colAttr = latticeGeom.attributes.color as THREE.BufferAttribute;

      for (let i = 0; i < devices.length && lineIndex < MAX_CONNECTIONS; i++) {
        for (let j = i + 1; j < devices.length && lineIndex < MAX_CONNECTIONS; j++) {
          const a = devices[i];
          const b = devices[j];
          const dist = a.position.distanceTo(b.position);

          if (dist <= MAX_DIST) {
            activePairs.push([a, b]);

            const idx = lineIndex * 6;
            // Point A
            posAttr.array[idx]     = a.position.x;
            posAttr.array[idx + 1] = a.position.y;
            posAttr.array[idx + 2] = a.position.z;
            // Point B
            posAttr.array[idx + 3] = b.position.x;
            posAttr.array[idx + 4] = b.position.y;
            posAttr.array[idx + 5] = b.position.z;

            // Color gradient with distance fade
            const alpha = Math.max(0.05, 1 - dist / MAX_DIST);
            const colorA = new THREE.Color(DEVICE_PALETTE[a.kind].stroke).multiplyScalar(alpha);
            const colorB = new THREE.Color(DEVICE_PALETTE[b.kind].stroke).multiplyScalar(alpha);

            colAttr.array[idx]     = colorA.r;
            colAttr.array[idx + 1] = colorA.g;
            colAttr.array[idx + 2] = colorA.b;
            colAttr.array[idx + 3] = colorB.r;
            colAttr.array[idx + 4] = colorB.g;
            colAttr.array[idx + 5] = colorB.b;

            lineIndex++;
          }
        }
      }

      // Zero-out unused connections in buffer
      for (let i = lineIndex * 6; i < MAX_CONNECTIONS * 6; i++) {
        posAttr.array[i] = 0;
        colAttr.array[i] = 0;
      }
      posAttr.needsUpdate = true;
      colAttr.needsUpdate = true;

      // Animate Packets
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

        // Fade in & out smoothly
        const fade = Math.sin(p.t * Math.PI);
        (p.mesh.material as THREE.MeshBasicMaterial).opacity = fade;
        const scale = 0.6 + fade * 0.6;
        p.mesh.scale.set(scale, scale, scale);
      }

      renderer.render(scene, camera);
    }

    if (reduced) {
      // Single static render for users with reduced motion preferences
      for (const d of devices) {
        d.group.position.copy(d.position);
      }
      renderer.render(scene, camera);
    } else {
      raf = requestAnimationFrame(tick);
    }

    // ---------- Cleanup ----------
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(packetInterval);
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

      for (const p of packets) {
        (p.mesh.material as THREE.Material).dispose();
      }

      dustGeom.dispose();
      dustMat.dispose();
      latticeGeom.dispose();
      latticeMat.dispose();
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
      className="pointer-events-none fixed inset-0 -z-10 opacity-70 dark:opacity-100 transition-opacity duration-1000"
    />
  );
}