"use client";

import { useEffect, useRef } from "react";

type NodeT = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  r: number;
  tw: number;
  kind: "dot" | "pinterest" | "telegram" | "instagram";
};

export default function NetworkCanvasBackground({ density = 64 }: { density?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);
  const mouseRef = useRef({ x: 0, y: 0, has: false });
  const nodesRef = useRef<NodeT[]>([]);

  const setup = () => {
    const canvas = ref.current;
    if (!canvas) return;

    const dpr = Math.max(1, Math.min(2.5, window.devicePixelRatio || 1));
    const w = Math.floor(window.innerWidth);
    const h = Math.floor(window.innerHeight);

    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const nodes: NodeT[] = [];
    const n = Math.max(42, Math.min(90, density));

    for (let i = 0; i < n; i++) {
      nodes.push({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.18,
        vy: (Math.random() - 0.5) * 0.18,
        r: 1.1 + Math.random() * 1.9,
        tw: Math.random() * Math.PI * 2,
        kind: "dot",
      });
    }

    const specialKinds: NodeT["kind"][] = ["pinterest", "telegram", "instagram"];
    const used = new Set<number>();

    for (const k of specialKinds) {
      for (let tries = 0; tries < 80; tries++) {
        const idx = Math.floor(Math.random() * nodes.length);
        if (used.has(idx)) continue;
        used.add(idx);
        nodes[idx].kind = k;
        nodes[idx].y = Math.random() * h * 0.32;
        nodes[idx].r = 2.4;
        break;
      }
    }

    nodesRef.current = nodes;
  };

  useEffect(() => {
    setup();

    const onResize = () => setup();
    const onMove = (e: MouseEvent) => {
      mouseRef.current = { x: e.clientX, y: e.clientY, has: true };
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("mousemove", onMove, { passive: true });

    return () => {
      window.removeEventListener("resize", onResize);
      window.removeEventListener("mousemove", onMove);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let t0 = performance.now();

    const tick = (t: number) => {
      const dt = Math.min(40, t - t0);
      t0 = t;

      const w = window.innerWidth;
      const h = window.innerHeight;

      ctx.clearRect(0, 0, w, h);

      const glow = ctx.createRadialGradient(w * 0.5, h * 0.18, 0, w * 0.5, h * 0.4, Math.max(w, h));
      glow.addColorStop(0, "rgba(98,255,84,0.105)");
      glow.addColorStop(0.42, "rgba(159,255,82,0.055)");
      glow.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, w, h);

      const m = mouseRef.current;
      const px = m.has ? (m.x / w - 0.5) * 18 : 0;
      const py = m.has ? (m.y / h - 0.5) * 18 : 0;

      const nodes = nodesRef.current;

      for (const p of nodes) {
        p.x += p.vx * (dt / 16);
        p.y += p.vy * (dt / 16);
        p.tw += 0.02 * (dt / 16);

        if (p.x < -30) p.x = w + 30;
        if (p.x > w + 30) p.x = -30;
        if (p.y < -30) p.y = h + 30;
        if (p.y > h + 30) p.y = -30;
      }

      ctx.lineWidth = 0.8;

      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i];
          const b = nodes[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d > 155) continue;

          const alpha = (1 - d / 155) * 0.13;
          ctx.strokeStyle = `rgba(185,255,91,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(a.x + px * 0.22, a.y + py * 0.22);
          ctx.lineTo(b.x + px * 0.22, b.y + py * 0.22);
          ctx.stroke();
        }
      }

      for (const p of nodes) {
        const x = p.x + px * 0.35;
        const y = p.y + py * 0.35;

        if (p.kind === "dot") {
          const tw = 0.13 + (Math.sin(p.tw) + 1) * 0.11;
          ctx.fillStyle = `rgba(205,255,91,${tw})`;
          ctx.beginPath();
          ctx.arc(x, y, p.r, 0, Math.PI * 2);
          ctx.fill();
        } else {
          drawIconNode(ctx, p.kind, x, y);
        }
      }

      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
    };
  }, []);

  return <canvas ref={ref} className="network-canvas" aria-hidden />;
}

function drawIconNode(
  ctx: CanvasRenderingContext2D,
  kind: "pinterest" | "telegram" | "instagram",
  x: number,
  y: number
) {
  const stroke = "rgba(198,255,91,0.48)";
  const fill = "rgba(123,255,78,0.08)";

  const r = 16;
  ctx.lineWidth = 1.35;
  ctx.strokeStyle = stroke;
  ctx.fillStyle = fill;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = 1.7;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";

  if (kind === "pinterest") {
    ctx.beginPath();
    ctx.moveTo(-3, 7);
    ctx.lineTo(-3, -6);
    ctx.quadraticCurveTo(-3, -11, 2, -11);
    ctx.quadraticCurveTo(8, -11, 8, -4);
    ctx.quadraticCurveTo(8, 2, 1, 2);
    ctx.quadraticCurveTo(-1, 2, -2, 1);
    ctx.stroke();
  } else if (kind === "telegram") {
    ctx.beginPath();
    ctx.moveTo(-10, -2);
    ctx.lineTo(11, -10);
    ctx.lineTo(3, 11);
    ctx.lineTo(-1, 3);
    ctx.closePath();
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(-1, 3);
    ctx.lineTo(11, -10);
    ctx.stroke();
  } else {
    roundRectPath(ctx, -7, -7, 14, 14, 4);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(0, 0, 3.4, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(4.5, -4.5, 1.3, 0, Math.PI * 2);
    ctx.stroke();
  }

  ctx.restore();
}

function roundRectPath(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + r);
  ctx.lineTo(x + w, y + h - r);
  ctx.quadraticCurveTo(x + w, y + h, x + w - r, y + h);
  ctx.lineTo(x + r, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - r);
  ctx.lineTo(x, y + r);
  ctx.quadraticCurveTo(x, y, x + r, y);
  ctx.closePath();
}
