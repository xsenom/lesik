"use client";

import { useEffect, useState } from "react";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type DashboardStats = {
  registrations: { today: number; week: number; total: number };
  payments: { today: number; week: number; total: number };
  video_views: { total: number; by_video: { id: number; title: string; views: number }[] };
};

type ProfileDetails = {
  email: string;
  notify_email: boolean;
  notify_telegram: boolean;
  platforms: string[];
  audience_analysis: string;
  product_status: string;
  product_name: string;
  product_description: string;
  why_buy: string;
  why_not_buy: string;
  product_ideas_request: string;
  tariff_plan: string;
  pro_paid_until: string;
};

type AdminProfile = {
  id: number;
  name: string;
  email: string;
  client_type: string;
  niche: string;
  platform: string;
  monthly_goal: string;
  blocker: string;
  created_at: string;
  details?: Partial<ProfileDetails>;
};

type VideoItem = {
  id: number;
  title: string;
  description: string;
  url: string;
  is_active: number | boolean;
  views: number;
};

const emptyDetails: ProfileDetails = {
  email: "",
  notify_email: true,
  notify_telegram: false,
  platforms: [],
  audience_analysis: "",
  product_status: "",
  product_name: "",
  product_description: "",
  why_buy: "",
  why_not_buy: "",
  product_ideas_request: "",
  tariff_plan: "free",
  pro_paid_until: "",
};

export default function AdminPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [paymentEmail, setPaymentEmail] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("0");
  const [newVideo, setNewVideo] = useState({ title: "", description: "", url: "", is_active: true });

  const load = async () => {
    setLoading(true);
    try {
      const [statsRes, profilesRes, videosRes] = await Promise.all([
        fetch(`${API_BASE}/admin/dashboard`),
        fetch(`${API_BASE}/admin/profiles`),
        fetch(`${API_BASE}/admin/videos`),
      ]);

      const statsData = await statsRes.json();
      const profilesData = await profilesRes.json();
      const videosData = await videosRes.json();

      setStats(statsData);
      setProfiles(profilesData.profiles || []);
      setVideos(videosData.videos || []);
    } catch (e) {
      console.error(e);
      alert("Не удалось загрузить данные админки.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const saveProfileDetails = async (profile: AdminProfile, details: ProfileDetails) => {
    if (details.tariff_plan === "pro" && !details.pro_paid_until) {
      alert("Для PRO нужно указать дату оплаты.");
      return;
    }

    await fetch(`${API_BASE}/profile-details`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...emptyDetails,
        ...details,
        email: profile.email,
      }),
    });

    alert(`Профиль ${profile.email} обновлён`);
    load();
  };

  const addPayment = async () => {
    if (!paymentEmail.trim()) return;

    await fetch(`${API_BASE}/admin/payments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: paymentEmail.trim(),
        amount: Number(paymentAmount || 0),
        status: "paid",
      }),
    });

    setPaymentEmail("");
    setPaymentAmount("0");
    load();
  };

  const createVideo = async () => {
    if (!newVideo.title.trim() || !newVideo.url.trim()) return;
    await fetch(`${API_BASE}/admin/videos`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newVideo),
    });
    setNewVideo({ title: "", description: "", url: "", is_active: true });
    load();
  };

  const updateVideo = async (video: VideoItem) => {
    await fetch(`${API_BASE}/admin/videos/${video.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: video.title,
        description: video.description,
        url: video.url,
        is_active: Boolean(video.is_active),
      }),
    });
    load();
  };

  const deleteVideo = async (id: number) => {
    await fetch(`${API_BASE}/admin/videos/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <section className="map-page">
      <div className="map-topbar">
        <div>
          <p className="eyebrow">Админ-панель</p>
          <h1>Статистика и управление</h1>
        </div>
        <button type="button" onClick={load} disabled={loading}>
          {loading ? "Обновляю..." : "Обновить"}
        </button>
      </div>

      {stats && (
        <div className="calendar-grid">
          <article className="calendar-card">
            <h3>Регистрации</h3>
            <p>Сегодня: <b>{stats.registrations.today}</b></p>
            <p>Неделя: <b>{stats.registrations.week}</b></p>
            <p>Всего: <b>{stats.registrations.total}</b></p>
          </article>
          <article className="calendar-card">
            <h3>Оплаты</h3>
            <p>Сегодня: <b>{stats.payments.today}</b></p>
            <p>Неделя: <b>{stats.payments.week}</b></p>
            <p>Всего: <b>{stats.payments.total}</b></p>
          </article>
          <article className="calendar-card">
            <h3>Просмотры видео</h3>
            <p>Всего: <b>{stats.video_views.total}</b></p>
            <small>По видео ниже в таблице</small>
          </article>
        </div>
      )}

      <div className="content-calendar">
        <div className="calendar-head">
          <h2>Добавить оплату</h2>
        </div>
        <div className="profile-form-block two-cols">
          <div>
            <h3>Email клиента</h3>
            <input value={paymentEmail} onChange={(e) => setPaymentEmail(e.target.value)} />
          </div>
          <div>
            <h3>Сумма</h3>
            <input value={paymentAmount} onChange={(e) => setPaymentAmount(e.target.value)} />
          </div>
        </div>
        <button type="button" className="modal-save-button" onClick={addPayment}>Добавить оплату</button>
      </div>

      <div className="content-calendar">
        <div className="calendar-head">
          <h2>Видео на главной</h2>
        </div>
        <div className="profile-form-block two-cols">
          <div>
            <h3>Название</h3>
            <input value={newVideo.title} onChange={(e) => setNewVideo((p) => ({ ...p, title: e.target.value }))} />
          </div>
          <div>
            <h3>Ссылка</h3>
            <input value={newVideo.url} onChange={(e) => setNewVideo((p) => ({ ...p, url: e.target.value }))} />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <h3>Описание</h3>
            <textarea value={newVideo.description} onChange={(e) => setNewVideo((p) => ({ ...p, description: e.target.value }))} />
          </div>
        </div>
        <button type="button" className="modal-save-button" onClick={createVideo}>Загрузить видео</button>

        {videos.map((video) => (
          <article className="calendar-card" key={video.id}>
            <h3>{video.title}</h3>
            <p>Просмотров: <b>{video.views}</b></p>
            <input
              value={video.title}
              onChange={(e) => setVideos((prev) => prev.map((v) => v.id === video.id ? { ...v, title: e.target.value } : v))}
            />
            <textarea
              value={video.description}
              onChange={(e) => setVideos((prev) => prev.map((v) => v.id === video.id ? { ...v, description: e.target.value } : v))}
            />
            <input
              value={video.url}
              onChange={(e) => setVideos((prev) => prev.map((v) => v.id === video.id ? { ...v, url: e.target.value } : v))}
            />
            <label className="profile-check-row">
              <input
                type="checkbox"
                checked={Boolean(video.is_active)}
                onChange={(e) => setVideos((prev) => prev.map((v) => v.id === video.id ? { ...v, is_active: e.target.checked } : v))}
              />
              <span>Активно</span>
            </label>
            <div className="audience-ai-actions">
              <button type="button" className="modal-save-button" onClick={() => updateVideo(video)}>Сохранить</button>
              <button type="button" className="modal-secondary-button" onClick={() => deleteVideo(video.id)}>Удалить</button>
            </div>
          </article>
        ))}
      </div>

      <div className="content-calendar">
        <div className="calendar-head">
          <h2>Профили клиентов</h2>
          <p>Можно открыть профиль и поменять тариф, дату PRO и другие данные.</p>
        </div>
        <div className="calendar-grid">
          {profiles.map((profile) => {
            const details: ProfileDetails = {
              ...emptyDetails,
              ...(profile.details || {}),
              email: profile.email,
            };

            return (
              <article className="calendar-card" key={profile.id}>
                <h3>{profile.name || "Без имени"}</h3>
                <p>{profile.email}</p>
                <p>{profile.niche}</p>

                <label>Тариф</label>
                <select
                  value={details.tariff_plan}
                  onChange={(e) => {
                    const value = e.target.value;
                    setProfiles((prev) =>
                      prev.map((item) =>
                        item.id === profile.id
                          ? { ...item, details: { ...(item.details || {}), tariff_plan: value } }
                          : item
                      )
                    );
                  }}
                >
                  <option value="free">FREE</option>
                  <option value="pro">PRO</option>
                </select>

                {(profile.details?.tariff_plan || "free") === "pro" && (
                  <>
                    <label>Оплачено до</label>
                    <input
                      type="date"
                      value={profile.details?.pro_paid_until || ""}
                      onChange={(e) =>
                        setProfiles((prev) =>
                          prev.map((item) =>
                            item.id === profile.id
                              ? { ...item, details: { ...(item.details || {}), pro_paid_until: e.target.value } }
                              : item
                          )
                        )
                      }
                    />
                  </>
                )}

                <label>Анализ аудитории</label>
                <textarea
                  value={profile.details?.audience_analysis || ""}
                  onChange={(e) =>
                    setProfiles((prev) =>
                      prev.map((item) =>
                        item.id === profile.id
                          ? { ...item, details: { ...(item.details || {}), audience_analysis: e.target.value } }
                          : item
                      )
                    )
                  }
                />

                <button
                  type="button"
                  className="modal-save-button"
                  onClick={() =>
                    saveProfileDetails(profile, {
                      ...details,
                      ...(profile.details || {}),
                    })
                  }
                >
                  Сохранить профиль
                </button>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
