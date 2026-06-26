"use client";

import { useEffect, useRef } from "react";

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  threat: boolean;
  pulse: number;
}

export function HeroVisual() {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let raf = 0;
    let w = 0;
    let h = 0;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener("resize", resize);

    const nodes: Node[] = Array.from({ length: 34 }, () => ({
      x: Math.random() * w,
      y: Math.random() * h,
      vx: (Math.random() - 0.5) * 0.25,
      vy: (Math.random() - 0.5) * 0.25,
      r: Math.random() * 2 + 1.5,
      threat: Math.random() < 0.18,
      pulse: Math.random() * Math.PI * 2,
    }));

    let scanY = 0;

    const draw = () => {
      ctx.clearRect(0, 0, w, h);

      // scanning beam
      scanY = (scanY + 0.9) % (h + 80);
      const grad = ctx.createLinearGradient(0, scanY - 60, 0, scanY + 60);
      grad.addColorStop(0, "rgba(47,129,247,0)");
      grad.addColorStop(0.5, "rgba(47,129,247,0.10)");
      grad.addColorStop(1, "rgba(47,129,247,0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, scanY - 60, w, 120);

      // edges
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const dx = a.x - b.x;
          const dy = a.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 130) {
            const threat = a.threat || b.threat;
            ctx.strokeStyle = threat
              ? `rgba(255,77,79,${0.25 * (1 - dist / 130)})`
              : `rgba(88,166,255,${0.18 * (1 - dist / 130)})`;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }

      // nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        n.pulse += 0.05;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
        const color = n.threat ? "255,77,79" : "88,166,255";
        const glow = n.threat ? 5 + Math.sin(n.pulse) * 3 : 2;
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r + glow, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},0.12)`;
        ctx.fill();
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${color},0.95)`;
        ctx.fill();
      }

      raf = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="relative h-full w-full">
      <canvas ref={ref} className="h-full w-full" />
      <div className="pointer-events-none absolute left-4 top-4 flex items-center gap-2 rounded-lg border border-[rgba(255,77,79,0.3)] bg-[rgba(255,45,85,0.08)] px-3 py-1.5 text-xs text-[#ff8a8b] backdrop-blur">
        <span className="live-dot h-2 w-2 rounded-full bg-danger text-danger" />
        Threat intercepted · 0x4f…a91c
      </div>
      <div className="pointer-events-none absolute bottom-4 right-4 rounded-lg border border-border bg-surface/70 px-3 py-1.5 text-xs text-ink-muted backdrop-blur">
        Scanning 4 chains · 12,402 wallets/min
      </div>
    </div>
  );
}
