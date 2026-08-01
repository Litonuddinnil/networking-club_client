import React, { useEffect, useRef } from "react";

/**
 * NetworkBackground — fullscreen interactive canvas with:
 * - cyber grid
 * - drifting nodes
 * - proximity connections
 * - mouse-driven cyan "wires"
 * - scanning horizontal beam
 * - cursor "force field"
 */
export default function NetworkBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const nodeCount = Math.min(85, Math.floor((width * height) / 18000));
    const nodes: Array<{
      x: number; y: number; vx: number; vy: number;
      radius: number; color: string; pulse: number; pulseSpeed: number;
    }> = [];

    for (let i = 0; i < nodeCount; i++) {
      const palette = [
        "rgba(255,107,0,0.55)",
        "rgba(28,216,210,0.45)",
        "rgba(246,211,101,0.5)",
        "rgba(168,85,247,0.45)",
      ];
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.35,
        vy: (Math.random() - 0.5) * 0.35,
        radius: Math.random() * 1.8 + 0.8,
        color: palette[Math.floor(Math.random() * palette.length)],
        pulse: Math.random() * Math.PI,
        pulseSpeed: 0.012 + Math.random() * 0.022,
      });
    }

    const mouse = { x: -1000, y: -1000, active: false };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
      mouse.active = true;
    };
    const handleMouseLeave = () => {
      mouse.x = -1000;
      mouse.y = -1000;
      mouse.active = false;
    };
    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    const handleTouch = (e: TouchEvent) => {
      const t = e.touches[0];
      if (t) {
        mouse.x = t.clientX;
        mouse.y = t.clientY;
        mouse.active = true;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchmove", handleTouch);
    window.addEventListener("resize", handleResize);

    let beamY = 0;
    let frame = 0;

    const draw = () => {
      frame++;
      ctx.clearRect(0, 0, width, height);

      // Cyber grid
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1;
      const grid = 80;
      for (let x = 0; x < width; x += grid) {
        ctx.beginPath();
        ctx.moveTo(x, 0); ctx.lineTo(x, height); ctx.stroke();
      }
      for (let y = 0; y < height; y += grid) {
        ctx.beginPath();
        ctx.moveTo(0, y); ctx.lineTo(width, y); ctx.stroke();
      }

      // Scanning beam
      beamY = (beamY + 0.4) % height;
      const beamGrad = ctx.createLinearGradient(0, beamY - 60, 0, beamY + 60);
      beamGrad.addColorStop(0, "rgba(255,107,0,0)");
      beamGrad.addColorStop(0.5, "rgba(255,107,0,0.07)");
      beamGrad.addColorStop(1, "rgba(255,107,0,0)");
      ctx.fillStyle = beamGrad;
      ctx.fillRect(0, beamY - 60, width, 120);
      ctx.strokeStyle = "rgba(255,107,0,0.18)";
      ctx.beginPath();
      ctx.moveTo(0, beamY); ctx.lineTo(width, beamY); ctx.stroke();

      // Update + draw nodes
      nodes.forEach((node) => {
        node.x += node.vx;
        node.y += node.vy;
        node.pulse += node.pulseSpeed;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        // Cursor attraction
        if (mouse.active) {
          const dx = mouse.x - node.x;
          const dy = mouse.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 220) {
            const force = (220 - dist) / 220;
            node.x += (dx / dist) * force * 0.6;
            node.y += (dy / dist) * force * 0.6;
          }
        }

        const r = node.radius + Math.sin(node.pulse) * 0.5;

        // glow
        ctx.beginPath();
        ctx.arc(node.x, node.y, r + 6, 0, Math.PI * 2);
        ctx.fillStyle = node.color.replace(/[\d.]+\)$/, "0.04)");
        ctx.fill();
        // core
        ctx.beginPath();
        ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
        ctx.fillStyle = node.color;
        ctx.fill();
      });

      // Node-node connections
      ctx.lineWidth = 0.6;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const n1 = nodes[i];
          const n2 = nodes[j];
          const dx = n1.x - n2.x;
          const dy = n1.y - n2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            const alpha = (140 - dist) / 140 * 0.22;
            ctx.strokeStyle = `rgba(255,107,0,${alpha})`;
            ctx.beginPath();
            ctx.moveTo(n1.x, n1.y);
            ctx.lineTo(n2.x, n2.y);
            ctx.stroke();
          }
        }

        if (mouse.active) {
          const n = nodes[i];
          const dx = mouse.x - n.x;
          const dy = mouse.y - n.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 200) {
            const alpha = (200 - dist) / 200 * 0.5;
            ctx.strokeStyle = `rgba(28,216,210,${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(mouse.x, mouse.y);
            ctx.stroke();

            // animated packet along the line
            const t = (frame * 0.02) % 1;
            const px = n.x + (mouse.x - n.x) * t;
            const py = n.y + (mouse.y - n.y) * t;
            ctx.beginPath();
            ctx.arc(px, py, 1.6, 0, Math.PI * 2);
            ctx.fillStyle = "rgba(28,216,210,0.95)";
            ctx.fill();
          }
        }
      }

      // Cursor halo
      if (mouse.active) {
        const halo = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, 120
        );
        halo.addColorStop(0, "rgba(28,216,210,0.18)");
        halo.addColorStop(1, "rgba(28,216,210,0)");
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 120, 0, Math.PI * 2);
        ctx.fill();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchmove", handleTouch);
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none z-0"
    />
  );
}
