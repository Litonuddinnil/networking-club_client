import { useEffect, useRef } from "react";
import * as THREE from "three";
import { useReducedMotion, useIsMounted } from "@/hooks/use-reduced-motion";

/**
 * TopologyLab3D — interactive 3D mini-scene for the home page
 * "Live network topology" panel.
 *
 *  - 6 selectable topologies: Mesh, Hybrid, Tree, Bus, Star, Ring
 *  - 6 device nodes per topology (Router, Switch, Server, PC/Laptop,
 *    Firewall, Access Point) — every device is rendered IMMEDIATELY as
 *    a coloured emissive mesh + nameplate canvas sprite so the scene
 *    is never blank. After the assets in /src/asset decode, the device
 *    sprite material is upgraded with the real image (so we don't
 *    depend on async I/O for the first frame).
 *  - Thicker animated cables between devices with additive blending
 *    and breathing opacity.
 *  - Travelling cyan/orange packets along the cables (quadratic bezier).
 *  - Mouse parallax, ambient + accent point lights, star backdrop.
 *  - prefers-reduced-motion → static snapshot, packet stream stops.
 *  - ResizeObserver + IntersectionObserver.
 *
 * Devices pulled from the asset folder:
 *   router.webp         → Router
 *   bridge.webp         → Switch / Bridge
 *   bridge connection.png → Hub / Bus backbone
 *   Server.jpg          → Server
 *   laptop.jpeg         → PC / Laptop
 *   repeater.webp       → Firewall / Repeater
 *   favicon.svg         → Access Point (stylised radio icon)
 */

export type TopologyMode = "mesh" | "hybrid" | "tree" | "bus" | "star" | "ring";

type DeviceKind = "router" | "switch" | "pc" | "server" | "firewall" | "ap";

interface DeviceSpec {
  kind: DeviceKind;
  label: string;
  subtitle: string;
  asset: string;
  accent: number;
  /** emoji glyph used as immediate fallback while image loads */
  glyph: string;
}

const DEVICES: DeviceSpec[] = [
  { kind: "router",   label: "Router",     subtitle: "R1 · 10.0.0.1",  asset: "router.webp",   accent: 0xa78bfa, glyph: "📡" },
  { kind: "switch",   label: "Switch",     subtitle: "SW1 · 24-port",  asset: "bridge.webp",   accent: 0x67e8f9, glyph: "🔀" },
  { kind: "pc",       label: "PC",         subtitle: "Lab-Node",       asset: "laptop.jpeg",   accent: 0x93c5fd, glyph: "💻" },
  { kind: "server",   label: "Server",     subtitle: "SRV-DB-01",      asset: "Server.jpg",    accent: 0xf9a8d4, glyph: "🖥️" },
  { kind: "firewall", label: "Firewall",   subtitle: "FW-Edge",        asset: "repeater.webp", accent: 0xfcd34d, glyph: "🛡️" },
  { kind: "ap",       label: "Access Pt",  subtitle: "AP-WiFi-2.4G",   asset: "favicon.svg",   accent: 0x6ee7b7, glyph: "📶" },
];

function resolveAsset(name: string): string {
  return new URL(`../../asset/${name}`, import.meta.url).href;
}

/* ---------- topology geometry helpers ---------- */

function v(x: number, y: number, z: number) {
  return new THREE.Vector3(x, y, z);
}

/** Pre-defined 6-node layouts per topology. Tuned for the panel aspect (~16:9). */
function topologyPositions(mode: TopologyMode): THREE.Vector3[] {
  switch (mode) {
    case "mesh":
      // Tilted ring — full mesh of edges between every pair
      return [
        v( 0.0,  0.9,  0.0),
        v( 3.4,  0.5,  0.0),
        v( 2.4, -0.6,  2.3),
        v(-0.8, -0.9,  3.1),
        v(-3.4, -0.5,  0.4),
        v(-2.0,  0.6, -2.6),
      ];
    case "hybrid":
      // Router centre + 4-point star + extra pair for the mesh fragment
      return [
        v( 0.0,  0.5,  0.0),  // 0 router (centre)
        v(-3.6,  1.4,  0.4),  // 1 switch
        v(-2.4, -1.4,  1.5),  // 2 pc
        v( 3.6,  1.4, -0.4),  // 3 server
        v( 2.4, -1.4, -1.5),  // 4 firewall
        v( 0.0, -2.6,  0.4),  // 5 ap
      ];
    case "tree":
      return [
        v( 0.0,  2.6,  0.0),   // 0 router (root)
        v(-2.6,  0.8,  0.2),   // 1 switch
        v( 2.6,  0.8, -0.2),   // 2 switch
        v(-3.8, -1.2,  0.4),   // 3 pc
        v(-1.6, -1.2,  0.4),   // 4 server
        v( 1.6, -1.2,  0.4),   // 5 ap
      ];
    case "bus":
      return [
        v(-4.0,  0.3,  0.0),
        v(-2.4, -0.4,  0.0),
        v(-0.8,  0.4,  0.0),
        v( 0.8, -0.4,  0.0),
        v( 2.4,  0.3,  0.0),
        v( 4.0, -0.2,  0.0),
      ];
    case "star":
      // Switch (idx 1) at centre, every other node on the rim
      return [
        v( 0.0, -2.4,  0.0),   // 0 router  → bottom peripheral
        v( 0.0,  0.4,  0.0),   // 1 switch   → centre
        v(-3.6,  0.4,  0.0),
        v(-1.8,  1.4,  0.0),
        v( 1.8,  1.4,  0.0),
        v( 3.6,  0.4,  0.0),
      ];
    case "ring":
      // Evenly spaced ring with slight tilt
      const r = 3.4;
      return Array.from({ length: 6 }, (_, i) => {
        const a = (i / 6) * Math.PI * 2 + Math.PI / 6;
        return v(Math.cos(a) * r, Math.sin(i * 0.4) * 0.3, Math.sin(a) * r * 0.85);
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

/* ---------- glyph texture (instant fallback, no async) ---------- */

function buildGlyphTexture(label: string, sub: string, accentHex: string, glyph: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 512;
  c.height = 512;
  const g = c.getContext("2d")!;

  // Background plate — circular accent fill
  const grad = g.createRadialGradient(256, 256, 60, 256, 256, 256);
  grad.addColorStop(0, accentHex + "ff");
  grad.addColorStop(0.6, accentHex + "55");
  grad.addColorStop(1, "#060616" + "00");
  g.fillStyle = grad;
  g.beginPath();
  g.arc(256, 256, 240, 0, Math.PI * 2);
  g.fill();

  // Ring border
  g.strokeStyle = accentHex;
  g.lineWidth = 6;
  g.beginPath();
  g.arc(256, 256, 220, 0, Math.PI * 2);
  g.stroke();

  // Glyph (emoji or symbol)
  g.fillStyle = "#ffffff";
  g.textAlign = "center";
  g.textBaseline = "middle";
  g.font = "240px 'Apple Color Emoji','Segoe UI Emoji','Noto Color Emoji',sans-serif";
  g.fillText(glyph, 256, 270);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 8;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

function buildNameplateTexture(label: string, sub: string, accentHex: string): THREE.CanvasTexture {
  const c = document.createElement("canvas");
  c.width = 384;
  c.height = 112;
  const g = c.getContext("2d")!;

  // bg pill
  g.fillStyle = "rgba(6, 10, 22, 0.92)";
  const round = (g as unknown as CanvasRenderingContext2D & { roundRect?: (x:number,y:number,w:number,h:number,r:number)=>void }).roundRect;
  if (round) round(4, 4, 376, 104, 22);
  else g.rect(4, 4, 376, 104);
  g.fill();

  g.strokeStyle = accentHex;
  g.lineWidth = 3;
  g.stroke();

  // accent dot
  g.fillStyle = accentHex;
  g.beginPath();
  g.arc(32, 56, 8, 0, Math.PI * 2);
  g.fill();

  // label
  g.fillStyle = "#f8fafc";
  g.font = "bold 36px ui-monospace, SFMono-Regular, Menlo, monospace";
  g.textBaseline = "middle";
  g.fillText(label, 56, 44);

  // sub
  g.fillStyle = "#94a3b8";
  g.font = "22px ui-monospace, SFMono-Regular, Menlo, monospace";
  g.fillText(sub, 56, 80);

  const tex = new THREE.CanvasTexture(c);
  tex.anisotropy = 4;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/* ---------- device builder (synchronous, instant-visible) ---------- */

interface DeviceNode {
  group: THREE.Group;
  body: THREE.Mesh;       // coloured cube body
  halo: THREE.Sprite;     // accent halo
  icon: THREE.Sprite;     // device image / glyph
  plate: THREE.Sprite;    // nameplate
  led: THREE.Sprite;      // led dot
  position: THREE.Vector3;
  basePosition: THREE.Vector3;
  kind: DeviceKind;
  accent: number;
  spec: DeviceSpec;
}

function buildDevice(spec: DeviceSpec, position: THREE.Vector3): DeviceNode {
  const group = new THREE.Group();

  // --- Chassis (coloured cube) — instant visible regardless of image ---
  const bodyGeom = new THREE.BoxGeometry(1.1, 0.7, 0.85);
  const bodyMat = new THREE.MeshStandardMaterial({
    color: spec.accent,
    emissive: spec.accent,
    emissiveIntensity: 0.55,
    roughness: 0.45,
    metalness: 0.5,
  });
  const body = new THREE.Mesh(bodyGeom, bodyMat);
  body.position.set(0, 0, 0);
  group.add(body);

  // Accent stripe across the chassis
  const stripeGeom = new THREE.BoxGeometry(1.2, 0.08, 0.95);
  const stripeMat = new THREE.MeshBasicMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.85,
  });
  const stripe = new THREE.Mesh(stripeGeom, stripeMat);
  stripe.position.set(0, 0.39, 0);
  group.add(stripe);

  // --- Halo behind the body ---
  const accentStr = "#" + spec.accent.toString(16).padStart(6, "0");
  const haloMat = new THREE.SpriteMaterial({
    color: spec.accent,
    transparent: true,
    opacity: 0.32,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const halo = new THREE.Sprite(haloMat);
  halo.scale.set(2.4, 2.4, 1);
  halo.position.set(0, 0, -0.3);
  group.add(halo);

  // --- Icon sprite — start with the glyph fallback so it's visible instantly
  const glyphTex = buildGlyphTexture(spec.label, spec.subtitle, accentStr, spec.glyph);
  const iconMat = new THREE.SpriteMaterial({
    map: glyphTex,
    transparent: true,
    depthWrite: false,
  });
  const icon = new THREE.Sprite(iconMat);
  icon.scale.set(1.1, 1.1, 1);
  icon.position.set(0, 0.0, 0.55);
  group.add(icon);

  // --- Nameplate ---
  const plateTex = buildNameplateTexture(spec.label, spec.subtitle, accentStr);
  const plateMat = new THREE.SpriteMaterial({
    map: plateTex,
    transparent: true,
    depthWrite: false,
  });
  const plate = new THREE.Sprite(plateMat);
  plate.scale.set(2.1, 0.6, 1);
  plate.position.set(0, -1.05, 0);
  group.add(plate);

  // --- LED dot ---
  const ledMat = new THREE.SpriteMaterial({
    color: spec.accent,
    transparent: true,
    opacity: 0.9,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
  });
  const led = new THREE.Sprite(ledMat);
  led.scale.set(0.22, 0.22, 1);
  led.position.set(0, -0.7, 0);
  group.add(led);

  group.position.copy(position);
  return {
    group, body, halo, icon, plate, led,
    position: position.clone(),
    basePosition: position.clone(),
    kind: spec.kind,
    accent: spec.accent,
    spec,
  };
}

/* ---------- main component ---------- */

export interface TopologyLab3DProps {
  className?: string;
  mode?: TopologyMode;
}

export default function TopologyLab3D({
  className,
  mode = "mesh",
}: TopologyLab3DProps) {
  const mountRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const mounted = useIsMounted();
  const modeRef = useRef<TopologyMode>(mode);
  modeRef.current = mode;

  useEffect(() => {
    if (!mounted) return;
    const mount = mountRef.current;
    if (!mount) return;

    // Ensure the mount target has a size before we create the renderer.
    const initWidth = Math.max(320, mount.clientWidth || 0);
    const initHeight = Math.max(240, mount.clientHeight || 0);

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x050510, 16, 36);

    const camera = new THREE.PerspectiveCamera(
      46,
      initWidth / initHeight,
      0.1,
      100
    );
    camera.position.set(0, 2.0, 13);
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
    renderer.domElement.style.display = "block";
    renderer.domElement.style.width = "100%";
    renderer.domElement.style.height = "100%";

    // ---------- lights ----------
    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const accent1 = new THREE.PointLight(0x7c3aed, 2.5, 26, 2);
    accent1.position.set(-5, 4, 6);
    scene.add(accent1);
    const accent2 = new THREE.PointLight(0x06b6d4, 2.0, 26, 2);
    accent2.position.set(5, -3, 5);
    scene.add(accent2);

    // ---------- star backdrop ----------
    const starCount = 320;
    const starGeom = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3]     = (Math.random() - 0.5) * 36;
      starPos[i * 3 + 1] = (Math.random() - 0.5) * 22;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 26;
    }
    starGeom.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0xffffff,
      size: 0.045,
      sizeAttenuation: true,
      transparent: true,
      opacity: 0.6,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    scene.add(new THREE.Points(starGeom, starMat));

    // ---------- devices (synchronous) ----------
    const devices: DeviceNode[] = DEVICES.map((spec) =>
      buildDevice(spec, topologyPositions(modeRef.current)[DEVICES.indexOf(spec)])
    );
    devices.forEach((d) => scene.add(d.group));

    // ---------- connections ----------
    let connections: { line: THREE.Line; from: number; to: number }[] = [];

    const rebuildConnections = (activeMode: TopologyMode) => {
      connections.forEach((c) => {
        scene.remove(c.line);
        (c.line.geometry as THREE.BufferGeometry).dispose();
        (c.line.material as THREE.Material).dispose();
      });
      connections = [];

      const pos = topologyPositions(activeMode);
      const eds = topologyEdges(activeMode);

      eds.forEach(([a, b], idx) => {
        const pa = pos[a];
        const pb = pos[b];
        const geom = new THREE.BufferGeometry().setFromPoints([pa, pb]);
        const mat = new THREE.LineBasicMaterial({
          color: idx % 2 === 0 ? 0xa78bfa : 0x67e8f9,
          transparent: true,
          opacity: 0.45,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          linewidth: 2,
        });
        const line = new THREE.Line(geom, mat);
        scene.add(line);
        connections.push({ line, from: a, to: b });
      });
    };
    rebuildConnections(modeRef.current);

    // ---------- packets ----------
    const packets: {
      mesh: THREE.Mesh;
      halo: THREE.Mesh;
      from: number;
      to: number;
      t: number;
      speed: number;
    }[] = [];

    const spawnPacket = (connIdx: number) => {
      if (reduced || connections.length === 0) return;
      const conn = connections[connIdx];
      if (!conn) return;

      const isCyan = Math.random() > 0.5;
      const color = new THREE.Color(isCyan ? 0x1cd8d2 : 0xff6b00);

      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.11, 14, 14),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.95,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      const haloMesh = new THREE.Mesh(
        new THREE.SphereGeometry(0.28, 14, 14),
        new THREE.MeshBasicMaterial({
          color,
          transparent: true,
          opacity: 0.35,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        })
      );
      mesh.add(haloMesh);
      scene.add(mesh);
      packets.push({
        mesh, halo: haloMesh,
        from: conn.from,
        to: conn.to,
        t: 0,
        speed: 0.4 + Math.random() * 0.6,
      });
    };

    let packetCounter = 0;
    const scheduleInterval = window.setInterval(() => {
      if (reduced || connections.length === 0) return;
      // spawn 1–2 packets per tick so the scene feels alive
      const burst = Math.random() > 0.6 ? 2 : 1;
      for (let k = 0; k < burst; k++) {
        const idx = (packetCounter + k) % connections.length;
        spawnPacket(idx);
      }
      packetCounter += burst;
    }, 500);

    // ---------- asset upgrade (async, non-blocking) ----------
    // Once the real device image loads, swap it onto the icon sprite.
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
        () => {
          // Asset failed — keep the glyph fallback (already visible).
        }
      );
    });

    // ---------- mouse parallax ----------
    const target = { x: 0, y: 0 };
    const smooth = { x: 0, y: 0 };
    const onMouse = (e: MouseEvent) => {
      const rect = renderer.domElement.getBoundingClientRect();
      target.x = ((e.clientX - rect.left) / rect.width - 0.5) * 0.6;
      target.y = ((e.clientY - rect.top) / rect.height - 0.5) * 0.4;
    };
    mount.addEventListener("mousemove", onMouse);

    // ---------- pause off-screen ----------
    let visible = true;
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => (visible = e.isIntersecting)),
      { threshold: 0.05 }
    );
    io.observe(mount);

    // ---------- resize ----------
    const onResize = () => {
      const w = Math.max(320, mount.clientWidth);
      const h = Math.max(240, mount.clientHeight);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h, false);
    };
    const ro = new ResizeObserver(onResize);
    ro.observe(mount);
    window.addEventListener("resize", onResize);
    // immediate recheck (mount size settles after first paint)
    requestAnimationFrame(onResize);

    // ---------- animation loop ----------
    let raf = 0;
    let frame = 0;
    const clock = new THREE.Clock();

    const animate = () => {
      raf = requestAnimationFrame(animate);
      if (!visible) {
        renderer.render(scene, camera); // keep last frame visible
        return;
      }
      const dt = Math.min(clock.getDelta(), 0.05);
      frame++;

      // camera parallax
      smooth.x += (target.x - smooth.x) * 0.06;
      smooth.y += (target.y - smooth.y) * 0.06;
      camera.position.x = smooth.x * 1.8;
      camera.position.y = 1.7 - smooth.y * 1.4;
      camera.lookAt(0, 0, 0);

      // gentle drift on devices
      devices.forEach((d, i) => {
        const base = topologyPositions(modeRef.current)[i];
        if (!base) return;
        d.basePosition.copy(base);
        const t = frame * 0.012 + i * 0.8;
        d.group.position.set(
          base.x + Math.sin(t) * 0.06,
          base.y + Math.cos(t * 0.7) * 0.06,
          base.z + Math.sin(t * 0.5) * 0.06
        );
        // body rotation
        d.body.rotation.y = Math.sin(t * 0.3) * 0.15;
        d.body.rotation.x = Math.cos(t * 0.2) * 0.05;

        // LED pulse
        d.led.material.opacity = 0.5 + Math.sin(frame * 0.08 + i) * 0.45;
        // halo pulse
        d.halo.material.opacity = 0.25 + Math.sin(frame * 0.05 + i) * 0.1;
        // nameplate fade for legibility
        d.plate.material.opacity = 0.92;
      });

      // cables breathe
      connections.forEach((conn, ci) => {
        const a = devices[conn.from]?.group.position;
        const b = devices[conn.to]?.group.position;
        if (!a || !b) return;
        const arr = (conn.line.geometry as THREE.BufferGeometry)
          .attributes.position as THREE.BufferAttribute;
        const fa = arr.array as Float32Array;
        fa[0] = a.x; fa[1] = a.y; fa[2] = a.z;
        fa[3] = b.x; fa[4] = b.y; fa[5] = b.z;
        arr.needsUpdate = true;

        const o =
          0.32 +
          0.18 * Math.sin(frame * 0.05 + ci * 0.6) +
          0.1 * Math.sin(frame * 0.03 + ci);
        (conn.line.material as THREE.LineBasicMaterial).opacity = Math.max(
          0.12,
          Math.min(0.7, o)
        );
      });

      // packets travel
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
        mid.y += dist * 0.35;
        const oneMinusT = 1 - p.t;
        const x =
          oneMinusT * oneMinusT * from.x +
          2 * oneMinusT * p.t * mid.x +
          p.t * p.t * to.x;
        const y =
          oneMinusT * oneMinusT * from.y +
          2 * oneMinusT * p.t * mid.y +
          p.t * p.t * to.y;
        const z =
          oneMinusT * oneMinusT * from.z +
          2 * oneMinusT * p.t * mid.z +
          p.t * p.t * to.z;
        p.mesh.position.set(x, y, z);
        const s = 1 + Math.sin(frame * 0.3 + i) * 0.25;
        p.mesh.scale.setScalar(s);
      }

      renderer.render(scene, camera);
    };

    animate();

    // Mode watcher
    let lastSeenMode = modeRef.current;
    const modeTimer = window.setInterval(() => {
      const cur = modeRef.current;
      if (cur !== lastSeenMode) {
        lastSeenMode = cur;
        rebuildConnections(cur);
        // reset device base positions for the new topology
        const pos = topologyPositions(cur);
        devices.forEach((d, i) => d.basePosition.copy(pos[i]));
      }
    }, 120);

    // ---------- cleanup ----------
    return () => {
      cancelAnimationFrame(raf);
      clearInterval(scheduleInterval);
      clearInterval(modeTimer);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("resize", onResize);
      mount.removeEventListener("mousemove", onMouse);
      connections.forEach((c) => {
        (c.line.geometry as THREE.BufferGeometry).dispose();
        (c.line.material as THREE.Material).dispose();
      });
      packets.forEach((p) => {
        (p.mesh.geometry as THREE.BufferGeometry).dispose();
        (p.mesh.material as THREE.Material).dispose();
      });
      starGeom.dispose();
      (starMat as THREE.Material).dispose();
      devices.forEach((d) => {
        d.group.traverse((obj) => {
          if (obj instanceof THREE.Mesh) {
            (obj.geometry as THREE.BufferGeometry).dispose();
            const m = obj.material as THREE.Material | THREE.Material[];
            if (Array.isArray(m)) m.forEach((mm) => mm.dispose());
            else m.dispose();
          }
          if (obj instanceof THREE.Sprite) {
            (obj.material as THREE.SpriteMaterial).map?.dispose();
            (obj.material as THREE.SpriteMaterial).dispose();
          }
        });
        scene.remove(d.group);
      });
      renderer.dispose();
      if (renderer.domElement.parentNode === mount) {
        mount.removeChild(renderer.domElement);
      }
    };
  }, [mounted, reduced]);

  // re-sync when prop changes
  useEffect(() => {
    modeRef.current = mode;
  }, [mode]);

  return <div ref={mountRef} className={className} aria-hidden="true" />;
}
