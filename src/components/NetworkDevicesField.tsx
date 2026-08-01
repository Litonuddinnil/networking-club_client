import React, { useEffect, useRef } from "react";

/**
 * NetworkDevicesField — fullscreen animated canvas filled with floating
 * vector networking devices (router, switch, PC, server, firewall, cloud,
 * access-point, hub). Each device has its own LED ring and slow drift, and
 * nearby devices are wired together with thin neon lines.
 *
 * Mouse / touch movement draws a soft cyan "signal" cursor field.
 */
type DeviceKind =
  | "router"
  | "switch"
  | "pc"
  | "server"
  | "firewall"
  | "cloud"
  | "ap"
  | "hub";

interface FloatingDevice {
  kind: DeviceKind;
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  rotation: number;
  spinSpeed: number;
  led: number; // 0..1 LED brightness flicker
  ledSpeed: number;
  ledColor: string;
}

const DEVICES: DeviceKind[] = ["router", "switch", "pc", "server", "firewall", "cloud", "ap", "hub"];

const LED_PALETTE = [
  "rgba(124,58,237,", // purple
  "rgba(59,130,246,", // blue
  "rgba(6,182,212,", // cyan
  "rgba(236,72,153,", // pink
  "rgba(57,255,136,", // green
];

/**
 * Draw a vector device icon centered at (cx, cy) of size `s` px.
 * Returns nothing — pure canvas drawing.
 */
function drawDevice(
  ctx: CanvasRenderingContext2D,
  kind: DeviceKind,
  cx: number,
  cy: number,
  s: number,
  rotation: number,
  led: number,
  ledColor: string
) {
  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(rotation);
  ctx.lineWidth = Math.max(1, s * 0.04);
  ctx.strokeStyle = "rgba(255,255,255,0.75)";
  ctx.fillStyle = "rgba(13,17,23,0.55)";
  ctx.shadowColor = ledColor + "0.8)";
  ctx.shadowBlur = 14 * led;

  const half = s * 0.5;

  // Body shape per device kind
  if (kind === "router") {
    // Rectangular chassis with antennas
    const w = s * 1.6, h = s * 0.7;
    ctx.beginPath();
    ctx.rect(-w / 2, -h / 2, w, h);
    ctx.fill();
    ctx.stroke();
    // Antennas
    ctx.beginPath();
    ctx.moveTo(-w / 2 + w * 0.2, -h / 2);
    ctx.lineTo(-w / 2 + w * 0.2, -h / 2 - h * 0.7);
    ctx.moveTo(w / 2 - w * 0.2, -h / 2);
    ctx.lineTo(w / 2 - w * 0.2, -h / 2 - h * 0.7);
    ctx.stroke();
    // Port grid
    for (let i = 0; i < 5; i++) {
      const px = -w / 2 + w * (0.25 + i * 0.1);
      ctx.beginPath();
      ctx.rect(px, h * 0.05, w * 0.05, h * 0.3);
      ctx.stroke();
    }
  } else if (kind === "switch") {
    // Wider, flatter — "switch chassis"
    const w = s * 1.8, h = s * 0.55;
    ctx.beginPath();
    ctx.rect(-w / 2, -h / 2, w, h);
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < 8; i++) {
      const px = -w / 2 + w * (0.1 + i * 0.1);
      ctx.beginPath();
      ctx.rect(px, -h * 0.05, w * 0.04, h * 0.5);
      ctx.stroke();
    }
  } else if (kind === "pc") {
    // Monitor + base
    const w = s * 1.0, h = s * 0.7;
    ctx.beginPath();
    ctx.rect(-w / 2, -h / 2, w, h);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-w * 0.2, h / 2);
    ctx.lineTo(w * 0.2, h / 2);
    ctx.lineTo(w * 0.1, h / 2 + h * 0.25);
    ctx.lineTo(-w * 0.1, h / 2 + h * 0.25);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (kind === "server") {
    // Tall rack unit with horizontal slots
    const w = s * 0.7, h = s * 1.4;
    ctx.beginPath();
    ctx.rect(-w / 2, -h / 2, w, h);
    ctx.fill();
    ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const sy = -h / 2 + (h / 5) * i + h * 0.05;
      ctx.beginPath();
      ctx.rect(-w / 2 + w * 0.1, sy, w * 0.8, h / 12);
      ctx.stroke();
    }
  } else if (kind === "firewall") {
    // Brick wall shield
    const w = s * 1.0, h = s * 1.0;
    ctx.beginPath();
    ctx.moveTo(0, -h / 2);
    ctx.lineTo(w / 2, -h / 4);
    ctx.lineTo(w / 2, h / 4);
    ctx.lineTo(0, h / 2);
    ctx.lineTo(-w / 2, h / 4);
    ctx.lineTo(-w / 2, -h / 4);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.18, 0, Math.PI * 2);
    ctx.stroke();
  } else if (kind === "cloud") {
    // Stylized cloud — arcs
    ctx.beginPath();
    ctx.arc(-s * 0.3, 0, s * 0.35, Math.PI, 0, false);
    ctx.arc(s * 0.3, 0, s * 0.35, Math.PI, 0, false);
    ctx.arc(0, -s * 0.15, s * 0.4, Math.PI, Math.PI * 2, false);
    ctx.lineTo(s * 0.7, s * 0.15);
    ctx.lineTo(-s * 0.7, s * 0.15);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else if (kind === "ap") {
    // Disc-shaped access point with concentric rings
    ctx.beginPath();
    ctx.ellipse(0, 0, s * 0.55, s * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.35, s * 0.7, s * 0.07, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.beginPath();
    ctx.ellipse(0, -s * 0.5, s * 0.5, s * 0.05, 0, 0, Math.PI * 2);
    ctx.stroke();
  } else if (kind === "hub") {
    // Hexagonal hub
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const a = (i / 6) * Math.PI * 2;
      const px = Math.cos(a) * s * 0.45;
      const py = Math.sin(a) * s * 0.45;
      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(0, 0, s * 0.18, 0, Math.PI * 2);
    ctx.stroke();
  }

  // LED dot
  ctx.beginPath();
  ctx.arc(half * 0.7, -half * 0.4, Math.max(1.2, s * 0.05), 0, Math.PI * 2);
  ctx.fillStyle = ledColor + (0.55 + led * 0.45).toFixed(2) + ")";
  ctx.shadowBlur = 16 * led;
  ctx.fill();

  ctx.restore();
}

export default function NetworkDevicesField() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const devicesRef = useRef<FloatingDevice[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const spawnDevices = () => {
      const count = Math.min(28, Math.max(14, Math.floor((width * height) / 55000)));
      const list: FloatingDevice[] = [];
      for (let i = 0; i < count; i++) {
        const kind = DEVICES[Math.floor(Math.random() * DEVICES.length)];
        const size = 26 + Math.random() * 38;
        list.push({
          kind,
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.18,
          vy: (Math.random() - 0.5) * 0.18,
          size,
          rotation: (Math.random() - 0.5) * 0.3,
          spinSpeed: (Math.random() - 0.5) * 0.0015,
          led: Math.random(),
          ledSpeed: 0.006 + Math.random() * 0.02,
          ledColor: LED_PALETTE[Math.floor(Math.random() * LED_PALETTE.length)],
        });
      }
      devicesRef.current = list;
    };

    spawnDevices();

    const mouse = { x: -1000, y: -1000, active: false };

    const onMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const onMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.active = false;
    };
    const onTouchMove = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) {
        mouse.x = t.clientX;
        mouse.y = t.clientY;
        mouse.active = true;
      }
    };
    const onResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
      spawnDevices();
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("resize", onResize);

    let frame = 0;
    const loop = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Soft grid wash
      ctx.fillStyle = "rgba(13,17,23,1)";
      ctx.fillRect(0, 0, width, height);

      // Draw proximity connections between devices
      const devs = devicesRef.current;
      for (let i = 0; i < devs.length; i++) {
        for (let j = i + 1; j < devs.length; j++) {
          const a = devs[i];
          const b = devs[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          const max = 260;
          if (dist < max) {
            const alpha = (1 - dist / max) * 0.25;
            ctx.strokeStyle = `rgba(124, 58, 237, ${alpha.toFixed(3)})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // Move + draw devices
      for (const d of devs) {
        d.x += d.vx;
        d.y += d.vy;
        d.rotation += d.spinSpeed;
        d.led = (Math.sin(frame * d.ledSpeed) + 1) / 2;

        // Bounce on edges
        if (d.x < 30 || d.x > width - 30) d.vx *= -1;
        if (d.y < 30 || d.y > height - 30) d.vy *= -1;

        // Subtle mouse repulsion
        if (mouse.active) {
          const dx = d.x - mouse.x;
          const dy = d.y - mouse.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 160 && dist > 0) {
            const force = (160 - dist) / 160;
            d.x += (dx / dist) * force * 0.5;
            d.y += (dy / dist) * force * 0.5;
          }
        }

        drawDevice(ctx, d.kind, d.x, d.y, d.size, d.rotation, d.led, d.ledColor);
      }

      // Cursor signal field
      if (mouse.active) {
        const r = 140;
        const grad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, r);
        grad.addColorStop(0, "rgba(6, 182, 212, 0.20)");
        grad.addColorStop(1, "rgba(6, 182, 212, 0)");
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, r, 0, Math.PI * 2);
        ctx.fill();
      }

      // Slow scanning beam
      const beamY = (frame * 0.4) % (height + 200) - 100;
      const beamGrad = ctx.createLinearGradient(0, beamY - 80, 0, beamY + 80);
      beamGrad.addColorStop(0, "rgba(124, 58, 237, 0)");
      beamGrad.addColorStop(0.5, "rgba(124, 58, 237, 0.05)");
      beamGrad.addColorStop(1, "rgba(124, 58, 237, 0)");
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, beamY - 80, width, 160);

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{ width: "100%", height: "100%" }}
    />
  );
}