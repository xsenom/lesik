"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type CalendarPlanItem = {
  day: number;
  date_label: string;
  platform: string;
  format: string;
  topic: string;
  task: string;
  goal: string;
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

export default function ContentMapPage() {
  const [email, setEmail] = useState("");
  const [profileExists, setProfileExists] = useState<boolean | null>(null);
  const [map, setMap] = useState<ContentMap | null>(null);
  const [loading, setLoading] = useState(false);
  const [calendarAiOpen, setCalendarAiOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<CalendarPlanItem | null>(null);
  const [calendarAiQuestion, setCalendarAiQuestion] = useState("");
  const [calendarAiLoading, setCalendarAiLoading] = useState(false);
  const [calendarAiComment, setCalendarAiComment] = useState("");
  const [calendarAiDraft, setCalendarAiDraft] = useState<CalendarPlanItem | null>(null);

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

  const saveMapDraft = async (nextMap: ContentMap) => {
    try {
      await fetch("http://localhost:8000/content-map/save", {
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

  const openCalendarAi = (item: CalendarPlanItem) => {
    setSelectedItem(item);
    setCalendarAiDraft(item);
    setCalendarAiQuestion("");
    setCalendarAiComment("");
    setCalendarAiOpen(true);
  };

  const askCalendarAi = async () => {
    if (!selectedItem || !calendarAiQuestion.trim() || !email) return;

    setCalendarAiLoading(true);

    try {
      const res = await fetch("http://localhost:8000/content-map/discuss-item", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          item: selectedItem,
          question: calendarAiQuestion.trim(),
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
      alert("Не удалось обсудить пост с ИИ.");
    } finally {
      setCalendarAiLoading(false);
    }
  };

  const applyCalendarAiDraft = async () => {
    if (!map || !selectedItem || !calendarAiDraft) return;

    const nextMap: ContentMap = {
      ...map,
      calendar: map.calendar.map((item) =>
        item.day === selectedItem.day
          ? {
              ...item,
              ...calendarAiDraft,
              day: item.day,
              date_label: item.date_label,
            }
          : item
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
                <article
                  className="calendar-card calendar-card-clickable"
                  key={item.day}
                  onClick={() => openCalendarAi(item)}
                >
                  <span>{item.date_label}</span>
                  <h3>{item.topic}</h3>
                  <p><b>{item.platform}</b> · {item.format}</p>
                  <p>{item.task}</p>
                  <small>{item.goal}</small>
                  <button type="button" className="calendar-ai-inline-button">
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
                <p className="eyebrow">ИИ-редактор контента</p>
                <h2>{selectedItem.date_label}: {selectedItem.topic}</h2>
              </div>
              <button type="button" onClick={() => setCalendarAiOpen(false)}>×</button>
            </div>

            <div className="profile-form-block">
              <h3>Текущий блок</h3>
              <p><b>Площадка:</b> {selectedItem.platform} · {selectedItem.format}</p>
              <p><b>Задача:</b> {selectedItem.task}</p>
              <p><b>Цель:</b> {selectedItem.goal}</p>
            </div>

            <div className="profile-form-block">
              <h3>Ваш вопрос к ИИ</h3>
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
              >
                {calendarAiLoading ? "Думаю..." : "Обсудить с ИИ"}
              </button>
            </div>

            {calendarAiComment && (
              <div className="profile-form-block">
                <h3>Комментарий ИИ</h3>
                <p>{calendarAiComment}</p>
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
