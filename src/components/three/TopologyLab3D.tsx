 import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion, useIsMounted } from "@/hooks/use-reduced-motion";

export type TopologyMode = "mesh" | "hybrid" | "tree" | "bus" | "star" | "ring";
type DeviceKind = "router" | "switch" | "pc" | "server" | "firewall" | "ap";

export interface DeviceSpec {
  kind: DeviceKind;
  label: string;
  subtitle: string;
  asset: string;
  accent: number;
  glyph: string;
}

const DEVICES: DeviceSpec[] = [
  { kind: "router",   label: "Router",     subtitle: "R1 · 10.0.0.1",  asset: "router.webp",   accent: 0xa78bfa, glyph: "📡" },
  { kind: "switch",   label: "Switch",     subtitle: "SW1 · 24-Port",  asset: "bridge.webp",   accent: 0x67e8f9, glyph: "🔀" },
  { kind: "pc",       label: "PC / Node",  subtitle: "Lab-Client-01",  asset: "laptop.jpeg",   accent: 0x93c5fd, glyph: "💻" },
  { kind: "server",   label: "Server",     subtitle: "SRV-Main-DB",    asset: "Server.jpg",    accent: 0xf9a8d4, glyph: "🖥️" },
  { kind: "firewall", label: "Firewall",   subtitle: "FW-Shield-Edge", asset: "repeater.webp", accent: 0xfcd34d, glyph: "🛡️" },
  { kind: "ap",       label: "Access Pt",  subtitle: "AP-Gigabit-WiFi",asset: "favicon.svg",   accent: 0x6ee7b7, glyph: "📶" },
];

function resolveAsset(name: string): string {
  return new URL(`../../asset/${name}`, import.meta.url).href;
}

function v(x: number, y: number, z: number) {
  return new THREE.Vector3(x, y, z);
}

// 6-Node Layout Coordinates for Topologies
function topologyPositions(mode: TopologyMode): THREE.Vector3[] {
  switch (mode) {
    case "mesh":
      return [
        v( 0.0,  1.1,  0.0),
        v( 3.6,  0.6,  0.0),
        v( 2.5, -0.6,  2.4),
        v(-0.9, -1.0,  3.2),
        v(-3.6, -0.5,  0.4),
        v(-2.1,  0.7, -2.7),
      ];
    case "hybrid":
      return [
        v( 0.0,  0.6,  0.0),  // Router center
        v(-3.7,  1.5,  0.4),  // Switch
        v(-2.5, -1.5,  1.5),  // PC
        v( 3.7,  1.5, -0.4),  // Server
        v( 2.5, -1.5, -1.5),  // Firewall
        v( 0.0, -2.7,  0.4),  // AP
      ];
    case "tree":
      return [
        v( 0.0,  2.8,  0.0),   // 0 router (root)
        v(-2.8,  0.9,  0.2),   // 1 switch
        v( 2.8,  0.9, -0.2),   // 2 firewall
        v(-4.0, -1.3,  0.4),   // 3 pc
        v(-1.6, -1.3,  0.4),   // 4 server
        v( 2.0, -1.3,  0.4),   // 5 ap
      ];
    case "bus":
      return [
        v(-4.2,  0.4,  0.0),
        v(-2.5, -0.5,  0.0),
        v(-0.8,  0.5,  0.0),
        v( 0.9, -0.5,  0.0),
        v( 2.6,  0.4,  0.0),
        v( 4.3, -0.3,  0.0),
      ];
    case "star":
      return [
        v( 0.0, -2.6,  0.0),   // router
        v( 0.0,  0.4,  0.0),   // switch (center hub)
        v(-3.8,  0.5,  0.0),
        v(-1.9,  1.6,  0.0),
        v( 1.9,  1.6,  0.0),
        v( 3.8,  0.5,  0.0),
      ];
    case "ring":
      const r = 3.6;
      return Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
        return v(Math.cos(a) * r, Math.sin(i * 0.4) * 0.35, Math.sin(a) * r * 0.85);
      });
  }
}

function topologyEdges(mode: TopologyMode): [number, number][] {
  switch (mode) {
    case "mesh":
      return DEVICES.flatMap((_, i) =>
        DEVICES.slice(i + 1).map((__, j) => [i, i + j + 1] as [number, number])
      );
    case "hybrid":
      return [
        [0, 1], [0, 2], [0, 3], [0, 4], [0, 5],
        [1, 2], [3, 4],
      ];
    case "tree":
      return [
        [0, 1], [0, 2],
        [1, 3], [1, 4],
        [2, 5],
      ];
    case "bus":
      return [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]];
    case "star":
      return [[1, 0], [1, 2], [1, 3], [1, 4], [1, 5]];
    case "ring":
      return [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0]];
  }
}

/* ---------- High-DPI Canvas Textures ---------- */

function buildGlyphTexture(accentHex: string, glyph: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d")!;

  const grad = g.createRadialGradient(256, 256, 60, 256, 256, 256);
  grad.addColorStop(0, accentHex + "ff");
  grad.addColorStop(0.6, accentHex + "55");
  grad.addColorStop(1, "#050714" + "00");
  g.fillStyle = grad;
  g.beginPath();
  g.arc(256, 256, 240, 0, Math.PI * 2);
  g.fill();

  g.strokeStyle = accentHex;
  g.lineWidth = 8;
  g.beginPath();
  g.arc(256, 256, 220, 0, Math.PI * 2);
  g.stroke();

  g.fillStyle = "#ffffff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = "240px 'Segoe UI Emoji', 'Apple Color Emoji', sans-serif";
  g.fillText(glyph, 256, 270);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function buildNameplateTexture(label: string, sub: string, accentHex: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 140;
  const g = c.getContext("2d")!;

  g.fillStyle = "rgba(8, 12, 26, 0.94)";
  const round = (g as any).roundRect;
  if (round) g.roundRect(6, 6, 500, 128, 26);
  else g.rect(6, 6, 500, 128);
  g.fill();

  g.strokeStyle = accentHex;
  g.lineWidth = 4;
  g.stroke();

  // Status Glowing Indicator
  g.fillStyle = accentHex;
  g.beginPath();
  g.arc(42, 70, 10, 0, Math.PI * 2);
  g.fill();

  // Title
  g.fillStyle = "#f8fafc";
  g.font = "bold 44px ui-monospace, SFMono-Regular, monospace";
  g.textBaseline = "middle";
  g.fillText(label, 72, 52);

  // Subtitle
  g.fillStyle = "#94a3b8";
  g.font = "28px ui-monospace, SFMono-Regular, monospace";
  g.fillText(sub, 72, 96);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/* ---------- Device Node Object ---------- */

interface DeviceNode {
  group: THREE.Group;
  body: THREE.Mesh;
  halo: THREE.Sprite;
  icon: THREE.Sprite;
  plate: THREE.Sprite;
  led: THREE.Sprite;
  pedestal: THREE.Mesh;
  currentPos: THREE.Vector3;
  targetPos: THREE.Vector3;
  spec: DeviceSpec;
  index: number;
}

function buildDeviceNode(spec: DeviceSpec, initialPos: THREE.Vector3, index: number): DeviceNode {
  const group = new THREE.Group();
  const accentStr = "#" + spec.accent.toString(16).padStart(6, "0");

  // 1. Chassis Mesh
  const bodyGeom = new THREE.BoxGeometry(1.15, 0.72, 0.88);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: 0x101624,
    emissive: spec.accent,
    emissiveIntensity: 0.6,
    roughness: 0.35,
    metalness: 0.6,
  });
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  group.add(body);

  // Accent Stripe
  const stripeGeom = new THREE.BoxGeometry(1.22, 0.08, 0.95);
  const stripeMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
  const stripe = new THREE.Mesh(stripeGeom, stripeMat);
  stripe.position.set(0, 0.38, 0);
  group.add(stripe);

  // 2. Halo Sprite
  const haloMat = new THREE.SpriteMaterial({
    color: spec.accent,
    transparent: true,
    opacity: 0.35,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const halo = new THREE.Sprite(haloMat);
  halo.scale.set(2.6, 2.6, 1);
  halo.position.set(0, 0, -0.3);
  group.add(halo);

  // 3. Icon Sprite
  const glyphTex = buildGlyphTexture(accentStr, spec.glyph);
  const iconMat = new THREE.SpriteMaterial({ map: glyphTex, transparent: true, depthWrite: false });
  const icon = new THREE.Sprite(iconMat);
  icon.scale.set(1.15, 1.15, 1);
  icon.position.set(0, 0.05, 0.58);
  group.add(icon);

  // 4. Nameplate
  const plateTex = buildNameplateTexture(spec.label, spec.subtitle, accentStr);
  const plateMat = new THREE.SpriteMaterial({ map: plateTex, transparent: true, depthWrite: false });
  const plate = new THREE.Sprite(plateMat);
  plate.scale.set(2.3, 0.65, 1);
  plate.position.set(0, -1.1, 0);
  group.add(plate);

  // 5. LED Indicator
  const ledMat = new THREE.SpriteMaterial({
    color: spec.accent,
    transparent: true,
    opacity: 0.95,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const led = new THREE.Sprite(ledMat);
  led.scale.set(0.25, 0.25, 1);
  led.position.set(0, -0.72, 0);
  group.add(led);

  // 6. Holographic Ground Pedestal Ring
  const pedestalGeom = new THREE.TorusGeometry(0.85, 0.025, 12, 36);
  const pedestalMat = new THREE.MeshBasicMaterial({
    color: spec.accent,
    transparent: true,
    opacity: 0.45,
    blending: THREE.AdditiveBlending,
  });
  const pedestal = new THREE.Mesh(pedestalGeom, pedestalMat);
  pedestal.rotation.x = Math.PI / 2;
  pedestal.position.set(0, -1.5, 0);
  group.add(pedestal);

  group.position.copy(initialPos);

  return {
    group,
    body,
    halo,
    icon,
    plate,
    led,
    pedestal,
    currentPos: initialPos.clone(),
    targetPos: initialPos.clone(),
    spec,
    index,
  };
}

export interface TopologyLab3DProps {
  className?: string;
  mode?: TopologyMode;
  onNodeClick?: (device: DeviceSpec) => void;
}

export default function TopologyLab3D({
  className,
  mode = "mesh",
  onNodeClick,
}: TopologyLab3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const mounted = useIsMounted();
  const modeRef = useRef<TopologyMode>(mode);
  modeRef.current = mode;

  const activeConnectionsRef = useRef<{ line: THREE.Line; from: number; to: number }[]>([]);
  const spawnTriggerRef = useRef<((fromIdx?: number) => void) | null>(null);

  useEffect(() => {
    if (!mounted) return;
    const mount = mountRef.current;
    if (!mount) return;

    const initWidth = Math.max(320, mount.clientWidth || 0);
    const initHeight = Math.max(240, mount.clientHeight || 0);

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x050714, 0.035);

    const camera = new THREE.PerspectiveCamera(46, initWidth / initHeight, 0.1, 100);
    camera.position.set(0, 2.0, 13.5);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(initWidth, initHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);
    renderer.domElement.classList.add("three-canvas");

    // 2. Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.7));
    const light1 = new THREE.PointLight(0xa78bfa, 2.8, 30, 2);
    light1.position.set(-6, 5, 7);
    scene.add(light1);
    const light2 = new THREE.PointLight(0x06b6d4, 2.4, 30, 2);
    light2.position.set(6, -4, 6);
    scene.add(light2);

    // 3. Cyber Star Backdrop
    const starCount = 380;
    const starGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 40;
      starPos[i + 1] = (Math.random() - 0.5) * 25;
      starPos[i + 2] = (Math.random() - 0.5) * 28;
    }
    starGeom.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x38bdf8,
      size: 0.05,
      transparent: true,
      opacity: 0.5,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(starGeom, starMat));

    // 4. Instantiate Device Nodes
    const initialPositions = topologyPositions(modeRef.current);
    const devices: DeviceNode[] = DEVICES.map((spec, i) =>
      buildDeviceNode(spec, initialPositions[i], i)
    );
    devices.forEach((d) => scene.add(d.group));

    // 5. Connections Rebuilding Function
    const rebuildConnections = (activeMode: TopologyMode) => {
      activeConnectionsRef.current.forEach((c) => {
        scene.remove(c.line);
        (c.line.geometry as THREE.BufferGeometry).dispose();
        (c.line.material as THREE.Material).dispose();
      });
      activeConnectionsRef.current = [];

      const eds = topologyEdges(activeMode);
      eds.forEach(([a, b], idx) => {
        const geom = new THREE.BufferGeometry().setFromPoints([
          devices[a].currentPos,
          devices[b].currentPos,
        ]);
        const mat = new THREE.LineBasicMaterial({
          color: idx % 2 === 0 ? 0xa78bfa : 0x67e8f9,
          transparent: true,
          opacity: 0.5,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        });
        const line = new THREE.Line(geom, mat);
        scene.add(line);
        activeConnectionsRef.current.push({ line, from: a, to: b });
      });
    };
    rebuildConnections(modeRef.current);

    // 6. Packet Traffic System
    const packets: {
      mesh: THREE.Mesh;
      from: number;
      to: number;
      t: number;
      speed: number;
    }[] = [];

    const PACKET_COLORS = [0x06b6d4, 0xff6b00, 0xa78bfa, 0x10b981];

    const spawnPacket = (fromIdx?: number) => {
      if (reduced || activeConnectionsRef.current.length === 0) return;
      
      let conn = activeConnectionsRef.current[Math.floor(Math.random() * activeConnectionsRef.current.length)];
      if (fromIdx !== undefined) {
        const matching = activeConnectionsRef.current.filter((c) => c.from === fromIdx || c.to === fromIdx);
        if (matching.length > 0) {
          conn = matching[Math.floor(Math.random() * matching.length)];
        }
      }

      if (!conn) return;
      const colorHex = PACKET_COLORS[Math.floor(Math.random() * PACKET_COLORS.length)];

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.12, 12, 12),
        new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );

      const halo = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 12, 12),
        new THREE.MeshBasicMaterial({
          color: colorHex,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      mesh.add(halo);
      scene.add(mesh);

      packets.push({
        mesh,
        from: conn.from,
        to: conn.to,
        t: 0,
        speed: 0.45 + Math.random() * 0.5,
      });
    };
    spawnTriggerRef.current = spawnPacket;

    const packetInterval = window.setInterval(() => {
      if (!reduced) spawnPacket();
    }, 450);

    // 7. Non-blocking Async Image Texture Upgrades
    DEVICES.forEach((spec, i) => {
      const device = devices[i];
      if (!device) return;
      new THREE.TextureLoader().load(
        resolveAsset(spec.asset),
        (tex) => {
          if (!tex) return;
          tex.colorSpace = THREE.SRGBColorSpace;
          tex.anisotropy = 8;
          device.icon.material.map?.dispose();
          device.icon.material.map = tex;
          device.icon.material.needsUpdate = true;
        },
        undefined,
        () => {}
      );
    });

    // 8. Mouse Parallax, Raycasting & Click Events
    const mouseTarget = { x: 0, y: 0 };
    const mouseSmooth = { x: 0, y: 0 };
    const raycaster = new THREE.Raycaster();
    const mouseNorm = new THREE.Vector2(-100, -100);

    const onMouseMove = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseTarget.x = ((e.clientX - rect.left) / rect.width - 0.5) * 0.65;
      mouseTarget.y = ((e.clientY - rect.top) / rect.height - 0.5) * 0.45;

      mouseNorm.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNorm.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;
    };
    mount.addEventListener("mousemove", onMouseMove);

    const onClick = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      mouseNorm.x = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      mouseNorm.y = -((e.clientY - rect.top) / rect.height) * 2 + 1;

      raycaster.setFromCamera(mouseNorm, camera);
      const meshes = devices.map((d) => d.body);
      const intersects = raycaster.intersectObjects(meshes);

      if (intersects.length > 0) {
        const hitBody = intersects[0].object as THREE.Mesh;
        const matched = devices.find((d) => d.body === hitBody);
        if (matched) {
          spawnPacket(matched.index);
          spawnPacket(matched.index);
          onNodeClick?.(matched.spec);
        }
      }
    };
    mount.addEventListener("click", onClick);

    // 9. Resize & Intersection Observer
    const onResize = () => {
      const w = Math.max(320, mount.clientWidth);
      const h = Math.max(240, mount.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);

    let visible = true;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (visible = e.isIntersecting)),
      { threshold: 0.05 }
    );
    io.observe(mount);

    // 10. Animation Loop (Smooth Position Lerping & Cable Tracking)
    let raf = 0;
    let frame = 0;
    const clock = new THREE.Clock();
    let currentActiveMode = modeRef.current;

    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!visible) {
        renderer.render(scene, camera);
        return;
      }

      const dt = Math.min(clock.getDelta(), 0.05);
      frame++;

      // Check for mode prop change smoothly
      if (modeRef.current !== currentActiveMode) {
        currentActiveMode = modeRef.current;
        rebuildConnections(currentActiveMode);
        const newPositions = topologyPositions(currentActiveMode);
        devices.forEach((d, i) => d.targetPos.copy(newPositions[i]));
      }

      // Smooth Camera Parallax Lerp
      mouseSmooth.x += (mouseTarget.x - mouseSmooth.x) * 0.05;
      mouseSmooth.y += (mouseTarget.y - mouseSmooth.y) * 0.05;
      camera.position.x = mouseSmooth.x * 2.0;
      camera.position.y = 1.8 - mouseSmooth.y * 1.5;
      camera.lookAt(0, 0, 0);

      // Raycast Hover Check
      raycaster.setFromCamera(mouseNorm, camera);
      const intersects = raycaster.intersectObjects(devices.map((d) => d.body));
      const hoveredBody = intersects.length > 0 ? (intersects[0].object as THREE.Mesh) : null;

      // Update Device Positions with Smooth Spring Lerping
      devices.forEach((d, i) => {
        // Morph lerp to target topology coordinates
        d.currentPos.lerp(d.targetPos, 0.08);

        // Gentle floating breath
        const t = frame * 0.015 + i * 0.85;
        d.group.position.set(
          d.currentPos.x + Math.sin(t) * 0.06,
          d.currentPos.y + Math.cos(t * 0.7) * 0.06,
          d.currentPos.z + Math.sin(t * 0.5) * 0.06
        );

        // Subtle rotation
        d.body.rotation.y = Math.sin(t * 0.3) * 0.15;
        d.body.rotation.x = Math.cos(t * 0.2) * 0.05;

        // Hover Effect Scale & Halo Intensity
        const isHovered = d.body === hoveredBody;
        const targetScale = isHovered ? 1.15 : 1.0;
        d.group.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1);

        // LED & Halo Pulse
        d.led.material.opacity = isHovered ? 1.0 : 0.5 + Math.sin(frame * 0.08 + i) * 0.45;
        d.halo.material.opacity = isHovered ? 0.6 : 0.25 + Math.sin(frame * 0.05 + i) * 0.12;
        d.pedestal.rotation.z += 0.01;
      });

      // Update Real-Time Tracking Cables
      activeConnectionsRef.current.forEach((conn, ci) => {
        const a = devices[conn.from]?.group.position;
        const b = devices[conn.to]?.group.position;
        if (!a || !b) return;

        const geom = conn.line.geometry as THREE.BufferGeometry;
        const posAttr = geom.attributes.position as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;
        arr[0] = a.x; arr[1] = a.y; arr[2] = a.z;
        arr[3] = b.x; arr[4] = b.y; arr[5] = b.z;
        posAttr.needsUpdate = true;

        const opacityWave = 0.35 + 0.2 * Math.sin(frame * 0.04 + ci * 0.7);
        (conn.line.material as THREE.LineBasicMaterial).opacity = opacityWave;
      });

      // Update Travelling Bezier Data Packets
      for (let i = packets.length - 1; i >= 0; i--) {
        const p = packets[i];
        p.t += dt * p.speed;

        if (p.t >= 1) {
          scene.remove(p.mesh);
          (p.mesh.geometry as THREE.BufferGeometry).dispose();
          (p.mesh.material as THREE.Material).dispose();
          packets.splice(i, 1);
          continue;
        }

        const from = devices[p.from]?.group.position;
        const to = devices[p.to]?.group.position;
        if (!from || !to) continue;

        const mid = from.clone().add(to).multiplyScalar(0.5);
        const dist = from.distanceTo(to);
        mid.y += dist * 0.32;

        const oneMinusT = 1 - p.t;
        const x = oneMinusT * oneMinusT * from.x + 2 * oneMinusT * p.t * mid.x + p.t * p.t * to.x;
        const y = oneMinusT * oneMinusT * from.y + 2 * oneMinusT * p.t * mid.y + p.t * p.t * to.y;
        const z = oneMinusT * oneMinusT * from.z + 2 * oneMinusT * p.t * mid.z + p.t * p.t * to.z;

        p.mesh.position.set(x, y, z);
        const s = 1 + Math.sin(frame * 0.25 + i) * 0.3;
        p.mesh.scale.setScalar(s);
      }

      renderer.render(scene, camera);
    };

    if (reduced) {
      renderer.render(scene, camera);
    } else {
      animate();
    }

    // 11. Cleanup
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(packetInterval);
      ro.disconnect();
      io.disconnect();
      mount.removeEventListener("mousemove", onMouseMove);
      mount.removeEventListener("click", onClick);

      activeConnectionsRef.current.forEach((c) => {
        (c.line.geometry as THREE.BufferGeometry).dispose();
        (c.line.material as THREE.Material).dispose();
      });

      packets.forEach((p) => {
        (p.mesh.geometry as THREE.BufferGeometry).dispose();
        (p.mesh.material as THREE.Material).dispose();
      });

      starGeom.dispose();
      starMat.dispose();

      devices.forEach((d) => {
        d.group.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            obj.geometry.dispose();
            const m = obj.material;
            if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
            else m.dispose();
          }
          if (obj instanceof THREE.Sprite) {
            obj.material.map?.dispose();
            obj.material.dispose();
          }
        });
        scene.remove(d.group);
      });

      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [mounted, reduced, onNodeClick]);

  // Direct Prop Synchronization
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  return (
    <div
      ref={mountRef}
      className={className}
      aria-hidden="true"
    />
  );
}