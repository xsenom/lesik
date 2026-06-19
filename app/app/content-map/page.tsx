"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type CalendarPlanItem = {
  day: number;
  date_label: string;
  platform: string;
  format: string;
  topic: string;
  task: string;
  goal: string;
  title?: string;
  description?: string;
  date?: string;
  tasks?: { id: string; text: string }[];
};

type ContentMap = {
  summary: string;
  nodes: {
    id: string;
    title: string;
    type: string;
    description: string;
    x: number;
    y: number;
  }[];
  edges: {
    from: string;
    to: string;
    label: string;
  }[];
  calendar: CalendarPlanItem[];
};

type DiscussSource =
  | { kind: "calendar"; day: number }
  | { kind: "node"; nodeId: string };

type AiRole = {
  key: string;
  file: string;
};



function humanizeTitle(title: string): string {
  return title
    .replace(/СТА/gi, "Призыв написать")
    .replace(/CTA/gi, "Призыв написать")
    .replace(/ЦА и боли/gi, "Кто мои клиенты")
    .replace(/ЦА/gi, "Клиенты")
    .replace(/боли/gi, "проблемы")
    .replace(/Лид-магнит/gi, "Бесплатный материал")
    .replace(/лид магнит/gi, "Бесплатный материал")
    .replace(/Контент-опоры/gi, "Темы для постов")
    .replace(/Оффер/gi, "Моя услуга")
    .replace(/Доказательства/gi, "Отзывы и кейсы")
    .replace(/Ритм публикаций/gi, "График выхода постов")
    .replace(/Система заявок/gi, "Как приходят клиенты")
    .replace(/\.+$/, "");
}


function downloadSlide(canvas: HTMLCanvasElement, idx: number) {
  canvas.toBlob((blob) => {
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `slide-${idx}.png`;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { document.body.removeChild(a); URL.revokeObjectURL(url); }, 200);
  }, "image/png");
}

function renderSlideCanvas(slideText: string, idx: number, total: number, bgImg?: string|null, gradient?: string): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = 1080;
  canvas.height = 1080;
  const ctx = canvas.getContext("2d")!;

  if (bgImg) {
    const img = new Image();
    img.src = bgImg;
    ctx.drawImage(img, 0, 0, 1080, 1080);
    // Затемнение для читаемости
    ctx.fillStyle = "rgba(0,0,0,0.45)";
    ctx.fillRect(0, 0, 1080, 1080);
  } else {
    const gradients: Record<string, [string, string]> = {
      beige: ["#f3eee4", "#e8e0d0"],
      green: ["#1a5c35", "#009b46"],
      dark: ["#111111", "#222222"],
      blue: ["#1a2a4a", "#2a4a8a"],
      pink: ["#4a1a2a", "#8a2a4a"],
    };
    const [c1, c2] = gradients[gradient || "beige"] || gradients.beige;
    const g = ctx.createLinearGradient(0, 0, 1080, 1080);
    g.addColorStop(0, c1);
    g.addColorStop(1, c2);
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 1080, 1080);
  }

  ctx.fillStyle = "#009b46";
  ctx.fillRect(0, 0, 12, 1080);

  const isDark = bgImg || ["green","dark","blue","pink"].includes(gradient || "");
  const textColor = isDark ? "#ffffff" : "#1a1a1a";
  const accentColor = isDark ? "rgba(255,255,255,0.25)" : "rgba(0,155,70,0.25)";
  const logoColor = isDark ? "rgba(255,255,255,0.7)" : "#009b46";

  ctx.fillStyle = accentColor;
  ctx.font = "bold 200px Arial";
  ctx.textAlign = "right";
  ctx.fillText(String(idx + 1), 1000, 220);
  ctx.textAlign = "left";

  ctx.fillStyle = textColor;
  const fontSize = idx === 0 ? 68 : 46;
  ctx.font = `bold ${fontSize}px Arial`;

  const words = slideText.split(" ");
  let line = "";
  let y = idx === 0 ? 460 : 180;
  const maxWidth = 900;
  const lineH = fontSize * 1.45;

  for (const word of words) {
    const test = line + word + " ";
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), 80, y);
      line = word + " ";
      y += lineH;
      if (y > 950) break;
    } else {
      line = test;
    }
  }
  if (y <= 950) ctx.fillText(line.trim(), 80, y);

  ctx.fillStyle = logoColor;
  ctx.font = "bold 32px Arial";
  ctx.fillText("ЛЕСik", 80, 1040);

  ctx.fillStyle = isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)";
  ctx.font = "28px Arial";
  ctx.textAlign = "right";
  ctx.fillText(`${idx + 1} / ${total}`, 1000, 1040);

  return canvas;
}

function renderSlide(slideText: string, idx: number, total: number, bgImg?: string|null, gradient?: string): string {
  return renderSlideCanvas(slideText, idx, total, bgImg, gradient).toDataURL("image/png");
}

function buildSlides(text: string, topic: string): string[] {
  const paragraphs = text.split(/\n+/).filter(Boolean);
  const slides: string[] = [topic];
  let current: string[] = [];

  for (const para of paragraphs) {
    current.push(para);
    if (current.length >= 2) {
      slides.push(current.join(" "));
      current = [];
    }
  }
  if (current.length) slides.push(current.join(" "));
  return slides;
}

function generateCarousel(text: string, topic: string) {
  const slides = buildSlides(text, topic);
  slides.forEach((slideText, idx) => {
    setTimeout(() => {
      const dataUrl = renderSlide(slideText, idx, slides.length);
      const link = document.createElement("a");
      link.download = `slide-${idx + 1}.png`;
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }, idx * 300);
  });
}

type MapNode = ContentMap["nodes"][number];

function wrapText(text: string, maxChars: number): string[] {
  const words = text.split(" ");
  const lines: string[] = [];
  let current = "";
  for (const word of words) {
    if ((current + " " + word).trim().length > maxChars) {
      if (current) lines.push(current.trim());
      current = word;
    } else {
      current = (current + " " + word).trim();
    }
  }
  if (current) lines.push(current.trim());
  return lines.slice(0, 3);
}

const BRANCH_COLORS = [
  "#009b46", "#009b46", "#009b46", "#009b46",
  "#009b46", "#009b46", "#009b46", "#009b46", "#009b46",
];

function MindMap({
  nodes,
  summary,
  onNodeClick,
}: {
  nodes: MapNode[];
  summary: string;
  onNodeClick: (node: MapNode) => void;
}) {
  const coreNode = nodes.find((n) => n.type === "core") || nodes[0];
  const branches = nodes.filter((n) => n !== coreNode);
  const left = branches.filter((_, i) => i % 2 === 0);
  const right = branches.filter((_, i) => i % 2 !== 0);

  const W = 1200;
  const CARD_W = 320;
  const CARD_H = 110;
  const GAP_Y = 8;
  const CX = W / 2;
  const CORE_W = 200;
  const CORE_H = 70;

  function layoutCol(items: MapNode[], totalH: number, startY: number) {
    const blockH = items.length * CARD_H + (items.length - 1) * GAP_Y;
    const sy = startY + totalH / 2 - blockH / 2;
    return items.map((node, i) => ({
      node,
      y: sy + i * (CARD_H + GAP_Y),
    }));
  }

  const colH = Math.max(left.length, right.length) * (CARD_H + GAP_Y) + 80;
  const H = Math.max(colH, 500);
  const startY = 20;
  const CY = H / 2;

  const leftItems = layoutCol(left, H - startY * 2, startY);
  const rightItems = layoutCol(right, H - startY * 2, startY);

  const LEFT_X = 20;
  const RIGHT_X = W - 40 - CARD_W;
  const coreLines = wrapText("Карта контента", 20);

  function curve(x1: number, y1: number, x2: number, y2: number) {
    const mx = (x1 + x2) / 2;
    return `M${x1},${y1} C${mx},${y1} ${mx},${y2} ${x2},${y2}`;
  }

  return (
    <div className="xmind-wrap">
      <div className="xmind-summary">
        <b>ВЫВОД</b>
        <p>{summary.replace(/[.]+$/g, "")}</p>
      </div>

      {/* SVG mind-map */}
      <div className="xmind-scroll">
        <svg viewBox={`0 0 ${W} ${H}`} width="100%" height={H} style={{ display: "block" }} overflow="visible">
          <defs>
            <filter id="coreGlow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="5" result="blur" />
              <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
            </filter>
            <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse">
              <path d="M 28 0 L 0 0 0 28" fill="none" stroke="rgba(17,17,17,0.08)" strokeWidth="0.8"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="#f3eee4" />
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Left lines */}
          {leftItems.map(({ node, y }, i) => {
            const color = BRANCH_COLORS[i * 2 % BRANCH_COLORS.length];
            const midY = y + CARD_H / 2;
            return (
              <path key={"ll" + node.id}
                d={curve(CX - CORE_W / 2, CY, LEFT_X + CARD_W, midY)}
                fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.6" strokeLinecap="round" />
            );
          })}

          {/* Right lines */}
          {rightItems.map(({ node, y }, i) => {
            const color = BRANCH_COLORS[(i * 2 + 1) % BRANCH_COLORS.length];
            const midY = y + CARD_H / 2;
            return (
              <path key={"lr" + node.id}
                d={curve(CX + CORE_W / 2, CY, RIGHT_X, midY)}
                fill="none" stroke={color} strokeWidth="2" strokeOpacity="0.6" strokeLinecap="round" />
            );
          })}

          {/* Left cards */}
          {leftItems.map(({ node, y }, i) => {
            const color = BRANCH_COLORS[i * 2 % BRANCH_COLORS.length];
            const lines = wrapText(humanizeTitle(node.title), 24);
            return (
              <g key={node.id} style={{ cursor: "pointer" }} onClick={() => onNodeClick(node)}>
                <rect x={LEFT_X} y={y} width={CARD_W} height={CARD_H} rx="12"
                  fill="#fbf8f1" stroke={color} strokeWidth="1.5" strokeOpacity="0.65" />
                <rect x={LEFT_X} y={y + 10} width="3" height={CARD_H - 20} rx="2" fill={color} />
                {lines.map((line, li) => (
                  <text key={li} x={LEFT_X + 16} y={y + 24 + li * 19}
                    fill="#1a1a1a" fontSize="16" fontWeight="800">{line}</text>
                ))}
                {wrapText(node.description.replace(/\.+$/, ""), 35).slice(0,4).map((dl, di) => (
                  <text key={"d"+di} x={LEFT_X + 16} y={y + 54 + di * 13}
                    fill="#555555" fontSize="13">{dl}</text>
                ))}

              </g>
            );
          })}

          {/* Right cards */}
          {rightItems.map(({ node, y }, i) => {
            const color = BRANCH_COLORS[(i * 2 + 1) % BRANCH_COLORS.length];
            const lines = wrapText(humanizeTitle(node.title), 24);
            return (
              <g key={node.id} style={{ cursor: "pointer" }} onClick={() => onNodeClick(node)}>
                <rect x={RIGHT_X} y={y} width={CARD_W} height={CARD_H} rx="12"
                  fill="#fbf8f1" stroke={color} strokeWidth="1.5" strokeOpacity="0.65" />
                <rect x={RIGHT_X} y={y + 10} width="3" height={CARD_H - 20} rx="2" fill={color} />
                {lines.map((line, li) => (
                  <text key={li} x={RIGHT_X + 16} y={y + 24 + li * 19}
                    fill="#1a1a1a" fontSize="16" fontWeight="800">{line}</text>
                ))}
                {wrapText(node.description.replace(/\.+$/, ""), 35).slice(0,4).map((dl, di) => (
                  <text key={"d"+di} x={RIGHT_X + 16} y={y + 54 + di * 13}
                    fill="#555555" fontSize="13">{dl}</text>
                ))}

              </g>
            );
          })}

          {/* Core */}
          {coreNode && (
            <g style={{ cursor: "pointer" }} onClick={() => onNodeClick(coreNode)}>
              <rect x={CX - CORE_W / 2} y={CY - CORE_H / 2} width={CORE_W} height={CORE_H} rx="16"
                fill="#1a5c35" stroke="#009b46" strokeWidth="2.2" />
              {coreLines.map((line, i) => (
                <text key={i} x={CX} y={CY - coreLines.length * 10 + i * 20 + 8}
                  fill="#ffffff" fontSize="16" fontWeight="900" textAnchor="middle" dominantBaseline="middle">{line}</text>
              ))}
            </g>
          )}
        </svg>
      </div>

      

      <style jsx>{`
        .xmind-wrap {
          border-radius: 24px;
          border: 1px solid rgba(17,17,17,0.1);
          background:
            linear-gradient(rgba(17,17,17,0.07) 1px, transparent 1px),
            linear-gradient(90deg, rgba(17,17,17,0.07) 1px, transparent 1px),
            #f3eee4;
          background-size: 28px 28px;
          overflow: hidden;
          margin-bottom: 24px;
        }
        .xmind-summary {
          padding: 16px 24px;
          border-bottom: 1px solid rgba(17,17,17,0.08);
          background: #fbf8f1;
        }
        .xmind-summary b {
          color: #009b46;
          font-size: 11px;
          letter-spacing: 1.5px;
        }
        .xmind-summary p {
          margin: 6px 0 0;
          color: rgba(17,17,17,0.72);
          font-size: 14px;
          line-height: 1.5;
        }
        .xmind-scroll {
          overflow-x: auto;
          padding: 8px 0;
        }
        .xmind-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
          padding: 24px;
          border-top: 1px solid rgba(17,17,17,0.08);
          background: #fbf8f1;
        }
        .xmind-card {
          padding: 18px 20px;
          border-radius: 16px;
          border: 1px solid;
          background: transparent;
          cursor: pointer;
          transition: transform 0.15s ease, box-shadow 0.15s ease;
        }
        .xmind-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 24px rgba(0,0,0,0.3);
        }
        .xmind-card-type {
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.5px;
          text-transform: uppercase;
        }
        .xmind-card-title {
          margin: 8px 0 10px;
          color: #111111;
          font-size: 17px;
          font-weight: 800;
          line-height: 1.25;
        }
        .xmind-card-desc {
          margin: 0;
          color: rgba(17,17,17,0.65);
          font-size: 13px;
          line-height: 1.5;
        }
      `}</style>
    </div>
  );
}

export default function ContentMapPage() {
  const [email, setEmail] = useState("");
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [map, setMap] = useState<ContentMap | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [calendarAiOpen, setCalendarAiOpen] = useState(false);
  const [donePosts, setDonePosts] = useState<Record<string, boolean>>(() => {
    try {
      return JSON.parse(localStorage.getItem("lesik_done_posts") || "{}");
    } catch { return {}; }
  });

  const toggleDonePost = (key: string) => {
    setDonePosts(prev => {
      const next = { ...prev, [key]: !prev[key] };
      localStorage.setItem("lesik_done_posts", JSON.stringify(next));
      return next;
    });
  };
  const [selectedItem, setSelectedItem] = useState<CalendarPlanItem | null>(null);
  const [calendarAiQuestion, setCalendarAiQuestion] = useState("");
  const [calendarAiLoading, setCalendarAiLoading] = useState(false);
  const [calendarAiComment, setCalendarAiComment] = useState("");
  const [calendarAiDraft, setCalendarAiDraft] = useState<CalendarPlanItem | null>(null);
  const [discussSource, setDiscussSource] = useState<DiscussSource | null>(null);
  const [aiRoles, setAiRoles] = useState<AiRole[]>([]);
  const [carouselSlides, setCarouselSlides] = useState<string[]>([]);
  const [slideTexts, setSlideTexts] = useState<string[]>([]);
  const [editingSlides, setEditingSlides] = useState(false);
  const [bgType, setBgType] = useState<"gradient"|"upload">("gradient");
  const [bgGradient, setBgGradient] = useState("beige");
  const [bgImage, setBgImage] = useState<string|null>(null);
  const [selectedAgent, setSelectedAgent] = useState("daily_manager");

  useEffect(() => {
    const savedEmail = localStorage.getItem("lesik_email") || "";
    setEmail(savedEmail);

    if (!savedEmail) {
      setProfileExists(false);
      return;
    }

    const load = async () => {
      const profileRes = await fetch(`${API_BASE}/profiles/by-email?email=${encodeURIComponent(savedEmail)}`);
      const profileData = await profileRes.json();

      setProfileExists(Boolean(profileData.profile));

      const mapRes = await fetch(`${API_BASE}/content-map/by-email?email=${encodeURIComponent(savedEmail)}`);
      const mapData = await mapRes.json();

      if (mapData.content_map?.map) {
        setMap(mapData.content_map.map);
      }
    };

    load();
  }, []);

  useEffect(() => {
    const loadRoles = async () => {
      try {
        const res = await fetch(`${API_BASE}/ai/roles`);
        const data = await res.json();
        setAiRoles(data.roles || []);
      } catch (e) {
        console.error(e);
      }
    };

    loadRoles();
  }, []);

  const generate = async () => {
    setLoading(true);
    setProgress(0);

    const steps = [
      { pct: 10, delay: 300 },
      { pct: 25, delay: 800 },
      { pct: 45, delay: 1500 },
      { pct: 65, delay: 2500 },
      { pct: 80, delay: 3500 },
      { pct: 90, delay: 5000 },
    ];

    let stopped = false;
    const runSteps = async () => {
      for (const step of steps) {
        if (stopped) break;
        await new Promise((r) => setTimeout(r, step.delay));
        if (!stopped) setProgress(step.pct);
      }
    };
    runSteps();

    try {
      const res = await fetch(`${API_BASE}/content-map/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();
      stopped = true;
      setProgress(100);

      if (data.map) {
        setTimeout(() => {
          setMap(data.map);
          setLoading(false);
          setProgress(0);
        }, 400);
      }
    } catch {
      stopped = true;
      setLoading(false);
      setProgress(0);
    }
  };

  const saveMapDraft = async (nextMap: ContentMap) => {
    try {
      await fetch(`${API_BASE}/content-map/save`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          map: nextMap,
        }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  const openCalendarAi = async (item: CalendarPlanItem) => {
    const enriched = {
      ...item,
      task: item.task || item.description || "",
      goal: item.goal || (item.tasks ? item.tasks.map((t: {id: string; text: string}) => t.text).join(" / ") : ""),
      topic: item.topic || item.title || "",
    };
    setSelectedItem(enriched);
    setDiscussSource({ kind: "calendar", day: item.day });
    setCalendarAiDraft(enriched);
    setCalendarAiQuestion("");
    setCalendarAiComment("");
    setCalendarAiOpen(true);

    // Автоматически генерируем пост при открытии
    if (!email) return;
    setCalendarAiLoading(true);
    try {
      const res = await fetch(`${API_BASE}/content-map/discuss-item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          item: enriched,
          question: "Напиши готовый пост для публикации на основе этой темы",
          agent: selectedAgent,
        }),
      });
      const data = await res.json();
      if (data.updated_item) {
        setCalendarAiDraft((prev) => ({
          ...(prev || enriched),
          ...data.updated_item,
          day: enriched.day,
          date_label: enriched.date_label,
        }));
      }
      setCalendarAiComment(data.comment || "");
    } catch (e) {
      console.error(e);
    } finally {
      setCalendarAiLoading(false);
    }
  };

  const openNodeAi = (node: ContentMap["nodes"][number]) => {
    setSelectedItem({
      day: 0,
      date_label: "Блок карты",
      platform: "Карта контента",
      format: "",
      topic: node.title,
      task: node.description,
      goal: "Усилить стратегию и качество контента",
    });
    setDiscussSource({ kind: "node", nodeId: node.id });
    setCalendarAiDraft({
      day: 0,
      date_label: "Блок карты",
      platform: "Карта контента",
      format: "",
      topic: node.title,
      task: node.description,
      goal: "Усилить стратегию и качество контента",
    });
    setCalendarAiQuestion("");
    setCalendarAiComment("");
    setCalendarAiOpen(true);
  };

  const askCalendarAi = async () => {
    if (!selectedItem || !calendarAiQuestion.trim() || !email) return;

    setCalendarAiLoading(true);

    try {
      const res = await fetch(`${API_BASE}/content-map/discuss-item`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          item: selectedItem,
          question: calendarAiQuestion.trim(),
          agent: selectedAgent,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      if (data.updated_item) {
        setCalendarAiDraft((prev) => ({
          ...(prev || selectedItem),
          ...data.updated_item,
          day: selectedItem.day,
          date_label: selectedItem.date_label,
        }));
      }
      setCalendarAiComment(data.comment || "Готово. Вы можете применить изменения.");
    } catch (e) {
      console.error(e);
      alert("Не удалось обсудить пост.");
    } finally {
      setCalendarAiLoading(false);
    }
  };

  const applyCalendarAiDraft = async () => {
    if (!map || !selectedItem || !calendarAiDraft || !discussSource) return;

    const nextMap: ContentMap =
      discussSource.kind === "calendar"
        ? {
            ...map,
            calendar: map.calendar.map((item) =>
              item.day === discussSource.day
                ? {
                    ...item,
                    ...calendarAiDraft,
                    day: item.day,
                    date_label: item.date_label,
                  }
                : item
            ),
          }
        : {
            ...map,
            nodes: map.nodes.map((node) =>
              node.id === discussSource.nodeId
                ? {
                    ...node,
                    title: calendarAiDraft.topic,
                    description: calendarAiDraft.task,
                    type: calendarAiDraft.format || node.type,
                  }
                : node
            ),
          };

    setMap(nextMap);
    await saveMapDraft(nextMap);
    setCalendarAiOpen(false);
  };

  if (profileExists === false) {
    return (
      <section className="map-page map-empty">
        <div className="map-empty-card">
          <p className="eyebrow">Карта контента</p>
          <h1>Сначала заполните профиль</h1>
          <p>
            ЛЕС<span className="brand-ik">ik</span> должен понять вашу нишу, цель, площадки и препятствия.
            После этого он сможет собрать карту контента и календарь публикаций.
          </p>
          <Link href="/app/profile">Перейти к заполнению</Link>
        </div>
      </section>
    );
  }

  return (
    <section className="map-page">
      <div className="map-topbar">
        <div>
          <p className="eyebrow">Карта контента</p>
          <h1>Визуальная стратегия</h1>
        </div>

        <div className="map-actions">
          <button type="button" onClick={generate} disabled={loading || !email}>
            {loading ? `Формирую магию... ${progress}%` : map ? "Пересобрать карту" : "Сформировать карту"}
          </button>

          {map && (
            <a href={`${API_BASE}/content-map/ics?email=${encodeURIComponent(email)}`}>
              Скачать .ics
            </a>
          )}
          {map && (
            <a href={`${API_BASE}/content-map/pdf?email=${encodeURIComponent(email)}`} target="_blank">
              Скачать PDF
            </a>
          )}

        </div>
      </div>

      {!map && (
        <div className="map-start">
          <h2>Профиль найден</h2>
          <p>Нажмите кнопку, и ЛЕС<span className="brand-ik">ik</span> соберёт карту и календарь.</p>
        </div>
      )}

      {map && (
        <>
          <MindMap nodes={map.nodes} summary={map.summary} onNodeClick={openNodeAi} />

          <div className="content-calendar">
            <div className="calendar-head">
              <h2>Календарь публикаций</h2>
              <p>14 дней контент-действий</p>
            </div>

            <div className="calendar-grid">
              {map.calendar.map((item) => (
                <article
                  className="calendar-card calendar-card-clickable"
                  key={item.day}
                  style={donePosts[`post-${item.day}`] ? { opacity: 0.6, borderColor: "#009b46", background: "rgba(0,155,70,0.08)" } : {}}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                    <span>День {item.day} · {item.platform || item.date_label}</span>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); toggleDonePost(`post-${item.day}`); }}
                      style={{
                        width: 28, height: 28, borderRadius: "50%", border: "2px solid #009b46",
                        background: donePosts[`post-${item.day}`] ? "#009b46" : "transparent",
                        color: "#fff", fontSize: 14, cursor: "pointer", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center"
                      }}
                    >
                      {donePosts[`post-${item.day}`] ? "✓" : ""}
                    </button>
                  </div>
                  <h3 onClick={() => openCalendarAi(item)} style={{ cursor: "pointer" }}>{humanizeTitle(item.title || item.topic || "Без темы")}</h3>
                  <p onClick={() => openCalendarAi(item)} style={{ cursor: "pointer" }}>{(item.description || item.task || "").replace(/\.+$/, "")}</p>
                  <button type="button" className="calendar-ai-inline-button" onClick={() => openCalendarAi(item)}>
                    Обсудить с ИИ
                  </button>
                </article>
              ))}
            </div>
          </div>
        </>
      )}

      {calendarAiOpen && selectedItem && (
        <div className="profile-modal-backdrop" onClick={() => setCalendarAiOpen(false)}>
          <div className="profile-modal profile-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-head">
              <div>
                <p className="eyebrow">Редактор контента</p>
                <h2>{selectedItem.title || selectedItem.topic || "Пост"}</h2>
              </div>
              <button type="button" onClick={() => { setCalendarAiOpen(false); setCarouselSlides([]); }}>×</button>
            </div>

            <div className="profile-form-block">
              <h3>Текущий блок</h3>
              <p><b>Площадка:</b> {selectedItem.platform.replace("Карта контента", "Карта контента")}</p>
              <p><b>Задача:</b> {selectedItem.task}</p>
              <p><b>Цель:</b> {selectedItem.goal}</p>
            </div>

            <div className="profile-form-block">
              <h3>Ваш вопрос к ИИ</h3>
              <p style={{fontSize:13, color:"#009b46", marginBottom:8}}>ИИ-помощник поможет улучшить, переписать или адаптировать этот пост</p>
              <textarea
                value={calendarAiQuestion}
                placeholder="Например: сделай этот пост более продающим, но без агрессии"
                onChange={(e) => setCalendarAiQuestion(e.target.value)}
              />
              <button
                type="button"
                className="modal-save-button"
                onClick={askCalendarAi}
                disabled={calendarAiLoading || !calendarAiQuestion.trim()}
              style={calendarAiLoading ? { background: "linear-gradient(90deg, #ff9800, #ffc238, #ff9800)", backgroundSize: "200%", animation: "shimmer 1.5s infinite linear" } : {}}
              >
                {calendarAiLoading ? "Пишу пост для тебя... 💚" : "Обсудить с ИИ"}
              </button>
            </div>

            {calendarAiComment && (
              <div className="profile-form-block">
                <h3>Комментарий</h3>
                <p>{calendarAiComment}</p>
                <button
                  type="button"
                  className="modal-save-button"
                  style={{ marginTop: 12, background: "#1a5c35" }}
                  onClick={() => {
                    const slides = buildSlides(calendarAiComment, selectedItem?.title || selectedItem?.topic || "Пост");
                    setSlideTexts(slides);
                    setEditingSlides(true);
                    setCarouselSlides([]);
                  }}
                >
                  Создать карусель
                </button>
                {editingSlides && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 13, fontWeight: 700, color: "#1a5c35", marginBottom: 10 }}>
                      Отредактируйте текст каждого слайда:
                    </p>
                    {slideTexts.map((text, i) => (
                      <div key={i} style={{ marginBottom: 10 }}>
                        <div style={{ fontSize: 11, color: "#009b46", fontWeight: 700, marginBottom: 4 }}>Слайд {i + 1}</div>
                        <textarea
                          value={text}
                          onChange={(e) => {
                            const next = [...slideTexts];
                            next[i] = e.target.value;
                            setSlideTexts(next);
                          }}
                          style={{ width: "100%", minHeight: 80, padding: 10, borderRadius: 10, border: "1px solid rgba(0,155,70,0.3)", fontSize: 13, lineHeight: 1.5, resize: "vertical" }}
                        />
                      </div>
                    ))}
                    <div style={{ marginBottom: 14, marginTop: 14 }}>
                      <p style={{ fontSize: 12, fontWeight: 700, color: "#1a5c35", marginBottom: 8 }}>Фон карусели:</p>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 10 }}>
                        {[
                          { key: "beige", label: "Бежевый", bg: "#f3eee4" },
                          { key: "green", label: "Зелёный", bg: "#1a5c35" },
                          { key: "dark", label: "Тёмный", bg: "#111111" },
                          { key: "blue", label: "Синий", bg: "#1a2a4a" },
                          { key: "pink", label: "Бордо", bg: "#4a1a2a" },
                        ].map(g => (
                          <button key={g.key} type="button"
                            onClick={() => { setBgGradient(g.key); setBgType("gradient"); setBgImage(null); }}
                            style={{ width: 48, height: 48, borderRadius: 10, background: g.bg, border: bgGradient === g.key && bgType === "gradient" ? "3px solid #009b46" : "2px solid rgba(0,0,0,0.15)", cursor: "pointer"}}
                          />
                        ))}
                        <label style={{ width: 48, height: 48, borderRadius: 10, border: bgType === "upload" ? "3px solid #009b46" : "2px dashed #009b46", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: 22 }}>
                          +
                          <input type="file" accept="image/*" style={{ display: "none" }}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (!file) return;
                              const reader = new FileReader();
                              reader.onload = (ev) => {
                                setBgImage(ev.target?.result as string);
                                setBgType("upload");
                              };
                              reader.readAsDataURL(file);
                            }}
                          />
                        </label>
                      </div>
                      {bgImage && <p style={{ fontSize: 11, color: "#009b46" }}>✓ Своё фото загружено</p>}
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                      <button
                        type="button"
                        style={{ flex: 1, padding: "10px 0", background: "#009b46", color: "#fff", border: "none", borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 14 }}
                        onClick={() => {
                          const rendered = slideTexts.map((s, i) => renderSlideCanvas(s, i, slideTexts.length, bgImage, bgGradient).toDataURL("image/png"));
                          setCarouselSlides(rendered);
                        }}
                      >
                        Сгенерировать PNG
                      </button>
                      <button
                        type="button"
                        style={{ padding: "10px 16px", background: "transparent", color: "#009b46", border: "1px solid #009b46", borderRadius: 12, fontWeight: 700, cursor: "pointer", fontSize: 14 }}
                        onClick={() => {
                          setSlideTexts(prev => [...prev, ""]);
                        }}
                      >
                        + Слайд
                      </button>
                    </div>
                  </div>
                )}
                {carouselSlides.length > 0 && (
                  <div style={{ marginTop: 16 }}>
                    <p style={{ fontSize: 13, color: "#009b46", marginBottom: 8, fontWeight: 700 }}>
                      Слайды готовы! На iPhone: зажмите картинку → "Сохранить". На Mac: правая кнопка → "Сохранить".
                    </p>
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                      {carouselSlides.map((src, i) => (
                        <a key={i} href={src} download={`slide-${i+1}.png`}>
                          <img src={src} alt={`Слайд ${i+1}`} style={{ width: 120, height: 120, borderRadius: 8, border: "2px solid #009b46", cursor: "pointer" }} />
                        </a>
                      ))}
                    </div>
                <button
                  type="button"
                  style={{ marginTop: 10, color: "#009b46", fontSize: 13, fontWeight: 700, background: "none", border: "none", cursor: "pointer", padding: 0 }}
                  onClick={() => {
                    carouselSlides.forEach((src, i) => {
                      setTimeout(() => {
                        const link = document.createElement("a");
                        link.href = src;
                        link.download = `slide-${i+1}.png`;
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }, i * 500);
                    });
                  }}
                >
                  Скачать все слайды
                </button>
                  </div>
                )}
              </div>
            )}

            {calendarAiDraft && (
              <div className="profile-form-block two-cols">
                <div>
                  <h3>Тема</h3>
                  <input
                    value={calendarAiDraft.topic}
                    onChange={(e) => setCalendarAiDraft((prev) => prev ? { ...prev, topic: e.target.value } : prev)}
                  />
                </div>
                <div>
                  <h3>Формат</h3>
                  <input
                    value={calendarAiDraft.format}
                    onChange={(e) => setCalendarAiDraft((prev) => prev ? { ...prev, format: e.target.value } : prev)}
                  />
                </div>
                <div>
                  <h3>Площадка</h3>
                  <input
                    value={calendarAiDraft.platform}
                    onChange={(e) => setCalendarAiDraft((prev) => prev ? { ...prev, platform: e.target.value } : prev)}
                  />
                </div>
                <div>
                  <h3>Цель</h3>
                  <input
                    value={calendarAiDraft.goal}
                    onChange={(e) => setCalendarAiDraft((prev) => prev ? { ...prev, goal: e.target.value } : prev)}
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <h3>Задача</h3>
                  <textarea
                    value={calendarAiDraft.task}
                    onChange={(e) => setCalendarAiDraft((prev) => prev ? { ...prev, task: e.target.value } : prev)}
                  />
                </div>
              </div>
            )}

            <button type="button" className="modal-save-button" onClick={applyCalendarAiDraft}>
              Применить правки в карту
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
