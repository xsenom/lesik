"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

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
  calendar: {
    day: number;
    date_label: string;
    platform: string;
    format: string;
    topic: string;
    task: string;
    goal: string;
  }[];
};

export default function ContentMapPage() {
  const [email, setEmail] = useState("");
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [map, setMap] = useState<ContentMap | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedEmail = localStorage.getItem("lesik_email") || "";
    setEmail(savedEmail);

    if (!savedEmail) {
      setProfileExists(false);
      return;
    }

    const load = async () => {
      const profileRes = await fetch(`http://localhost:8000/profiles/by-email?email=${encodeURIComponent(savedEmail)}`);
      const profileData = await profileRes.json();

      setProfileExists(Boolean(profileData.profile));

      const mapRes = await fetch(`http://localhost:8000/content-map/by-email?email=${encodeURIComponent(savedEmail)}`);
      const mapData = await mapRes.json();

      if (mapData.content_map?.map) {
        setMap(mapData.content_map.map);
      }
    };

    load();
  }, []);

  const generate = async () => {
    setLoading(true);

    try {
      const res = await fetch("http://localhost:8000/content-map/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.map) {
        setMap(data.map);
      }
    } finally {
      setLoading(false);
    }
  };

  if (profileExists === false) {
    return (
      <section className="map-page map-empty">
        <div className="map-empty-card">
          <p className="eyebrow">Карта контента</p>
          <h1>Сначала заполните профиль</h1>
          <p>
            ЛЕСik должен понять вашу нишу, цель, площадки и препятствия.
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
            {loading ? "Формирую магию..." : map ? "Пересобрать карту" : "Сформировать карту"}
          </button>

          {map && (
            <a href={`http://localhost:8000/content-map/ics?email=${encodeURIComponent(email)}`}>
              Скачать .ics
            </a>
          )}
        </div>
      </div>

      {!map && (
        <div className="map-start">
          <h2>Профиль найден</h2>
          <p>Нажмите кнопку, и ЛЕСik отправит данные в GPT, соберёт карту и календарь.</p>
        </div>
      )}

      {map && (
        <>
          <div className="miro-board">
            <div className="miro-summary">
              <b>Вывод</b>
              <p>{map.summary}</p>
            </div>

            {map.nodes.map((node) => (
              <article
                key={node.id}
                className={`miro-node node-${node.type}`}
                style={{
                  left: `calc(50% + ${node.x}px)`,
                  top: `calc(42% + ${node.y}px)`,
                }}
              >
                <span>{node.type}</span>
                <h2>{node.title}</h2>
                <p>{node.description}</p>
              </article>
            ))}
          </div>

          <div className="content-calendar">
            <div className="calendar-head">
              <h2>Календарь публикаций</h2>
              <p>14 дней контент-действий</p>
            </div>

            <div className="calendar-grid">
              {map.calendar.map((item) => (
                <article className="calendar-card" key={item.day}>
                  <span>{item.date_label}</span>
                  <h3>{item.topic}</h3>
                  <p><b>{item.platform}</b> · {item.format}</p>
                  <p>{item.task}</p>
                  <small>{item.goal}</small>
                </article>
              ))}
            </div>
          </div>
        </>
      )}
    </section>
  );
}
