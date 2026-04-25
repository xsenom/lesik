"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type Answers = {
  name: string;
  email: string;
  client_type: string;
  niche: string;
  platform: string;
  monthly_goal: string;
  blocker: string;
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

const emptyAnswers: Answers = {
  name: "",
  email: "",
  client_type: "",
  niche: "",
  platform: "",
  monthly_goal: "",
  blocker: "",
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

const basicQuestions = [
  { key: "name", title: "Как вас зовут?", placeholder: "Например: Илья" },
  { key: "client_type", title: "Кто вы?", placeholder: "Эксперт, блогер, школа, предприниматель..." },
  { key: "niche", title: "Ваша ниша?", placeholder: "Например: чат-боты, психология, английский..." },
  { key: "platform", title: "Где уже есть аудитория?", placeholder: "Telegram, Instagram, сайт..." },
  { key: "monthly_goal", title: "Главная цель на месяц?", placeholder: "Например: 50 заявок, запуск продукта..." },
  { key: "blocker", title: "Что сейчас мешает?", placeholder: "Мало заявок, нет системы, не покупают..." },
] as const;

export default function ProfilePage() {
  const [step, setStep] = useState(0);
  const [introAccepted, setIntroAccepted] = useState(false);
  const [basicDone, setBasicDone] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [audienceUploading, setAudienceUploading] = useState(false);
  const [audienceAiOpen, setAudienceAiOpen] = useState(false);
  const [audienceAiLoading, setAudienceAiLoading] = useState(false);
  const [audienceAiQuestion, setAudienceAiQuestion] = useState("");
  const [audienceAiAnswer, setAudienceAiAnswer] = useState("");
  const [audienceAiAnswers, setAudienceAiAnswers] = useState<{ question: string; answer: string }[]>([]);
  const [audienceAiDraft, setAudienceAiDraft] = useState("");
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);
  const [details, setDetails] = useState<ProfileDetails>(emptyDetails);
  const [avatar, setAvatar] = useState("");

  useEffect(() => {
    const email = localStorage.getItem("lesik_email") || "";
    const savedAvatar = localStorage.getItem("lesik_avatar") || "";

    setAvatar(savedAvatar);
    setAnswers((prev) => ({ ...prev, email }));
    setDetails((prev) => ({ ...prev, email }));

    if (!email) return;

    const load = async () => {
      try {
        const profileRes = await fetch(`http://localhost:8000/profiles/by-email?email=${encodeURIComponent(email)}`);
        const profileData = await profileRes.json();

        if (profileData.profile) {
          setAnswers({
            name: profileData.profile.name || "",
            email: profileData.profile.email || email,
            client_type: profileData.profile.client_type || "",
            niche: profileData.profile.niche || "",
            platform: profileData.profile.platform || "",
            monthly_goal: profileData.profile.monthly_goal || "",
            blocker: profileData.profile.blocker || "",
          });

          setBasicDone(true);
          setIntroAccepted(true);
        }

        const detailsRes = await fetch(`http://localhost:8000/profile-details/by-email?email=${encodeURIComponent(email)}`);
        const detailsData = await detailsRes.json();

        if (detailsData.details) {
          setDetails({
            ...emptyDetails,
            ...detailsData.details,
            email,
          });
        }
      } catch (e) {
        console.error(e);
      }
    };

    load();
  }, []);

  const current = basicQuestions[step];
  const currentValue = answers[current.key];
  const canGoNext = Boolean(currentValue.trim());

  const uploadAvatar = (file?: File) => {
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const value = String(reader.result || "");
      localStorage.setItem("lesik_avatar", value);
      setAvatar(value);
    };
    reader.readAsDataURL(file);
  };

  const saveBasic = async () => {
    setSaving(true);

    try {
      const payload = {
        ...answers,
        email: answers.email.trim().toLowerCase(),
      };

      const res = await fetch("http://localhost:8000/profiles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      setBasicDone(true);
      setDetailsOpen(true);
    } catch (e) {
      console.error(e);
      alert("Не удалось сохранить профиль. Проверь backend.");
    } finally {
      setSaving(false);
    }
  };

  const nextBasic = () => {
    if (!canGoNext) return;

    if (step < basicQuestions.length - 1) {
      setStep(step + 1);
      return;
    }

    saveBasic();
  };

  const uploadAudienceAnalysisFile = async (file?: File) => {
    if (!file) return;

    const email = answers.email || localStorage.getItem("lesik_email") || "";
    if (!email) {
      alert("Сначала укажите корректный email.");
      return;
    }

    setAudienceUploading(true);

    try {
      const form = new FormData();
      form.append("email", email);
      form.append("file", file);

      const res = await fetch("http://localhost:8000/audience-analysis/upload", {
        method: "POST",
        body: form,
      });

      if (!res.ok) {
        throw new Error(await res.text());
      }

      const data = await res.json();

      setDetails((prev) => ({
        ...prev,
        audience_analysis: data.analysis || prev.audience_analysis,
      }));
    } catch (e) {
      console.error(e);
      alert("Не удалось разобрать файл. Проверьте backend и OPENAI_API_KEY.");
    } finally {
      setAudienceUploading(false);
    }
  };


  const runAudienceAiAnalysis = async (nextAnswers?: { question: string; answer: string }[]) => {
    const email = answers.email || localStorage.getItem("lesik_email") || "";
    if (!email) {
      alert("Сначала укажите корректный email.");
      return;
    }

    const chain = nextAnswers || audienceAiAnswers;

    setAudienceAiLoading(true);

    try {
      const res = await fetch("http://localhost:8000/audience-analysis/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email,
          base_text: details.audience_analysis,
          answers: chain,
        }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      const result = data.result || {};

      if (result.status === "needs_question" && result.question) {
        setAudienceAiQuestion(result.question);
      } else {
        setAudienceAiQuestion("");
        setAudienceAiDraft(result.analysis || result.summary || "");
      }
    } catch (e) {
      console.error(e);
      alert("Не удалось запустить ИИ-анализ аудитории.");
    } finally {
      setAudienceAiLoading(false);
    }
  };

  const answerAudienceAiQuestion = async () => {
    if (!audienceAiQuestion || !audienceAiAnswer.trim()) return;

    const next = [
      ...audienceAiAnswers,
      {
        question: audienceAiQuestion,
        answer: audienceAiAnswer.trim(),
      },
    ];

    setAudienceAiAnswers(next);
    setAudienceAiAnswer("");
    await runAudienceAiAnalysis(next);
  };

  const saveAudienceAiDraft = () => {
    if (!audienceAiDraft.trim()) return;

    setDetails((prev) => ({
      ...prev,
      audience_analysis: audienceAiDraft,
    }));

    setAudienceAiOpen(false);
  };

  const saveDetails = async ({
    closeDetails = true,
    closeProduct = false,
  }: {
    closeDetails?: boolean;
    closeProduct?: boolean;
  } = {}) => {
    if (details.tariff_plan === "pro" && !details.pro_paid_until) {
      alert("Для тарифа PRO укажите дату оплаты (до какого числа).");
      return false;
    }

    setSaving(true);

    try {
      const payload = {
        ...details,
        email: answers.email || localStorage.getItem("lesik_email") || "",
      };

      const res = await fetch("http://localhost:8000/profile-details", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      setDetails(payload);
      if (closeDetails) {
        setDetailsOpen(false);
      }
      if (closeProduct) {
        setProductOpen(false);
      }
      return true;
    } catch (e) {
      console.error(e);
      alert("Не удалось сохранить расширенный профиль.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveNotify = async () => {
    await saveDetails({ closeDetails: false });
    setNotifyOpen(false);
  };

  const audienceReady = details.audience_analysis.trim().length > 20;
  const platformsReady = details.platforms.length > 0;
  const productReady =
    details.product_status === "Есть продукт"
      ? Boolean(details.product_name.trim() && details.product_description.trim())
      : Boolean(details.product_ideas_request.trim());

  if (!introAccepted && !basicDone) {
    return (
      <section className="profile-page profile-center">
        <div className="profile-question-card profile-intro-card">
          <p className="eyebrow">Перед стартом</p>
          <h1>Профиль нужен, чтобы ЛЕСik думал точнее</h1>
          <p>
            Мы соберём базу: кто вы, какая ниша, цель, препятствие и где вы ведёте контент.
            После этого можно будет перейти к аудитории, продукту и карте контента.
          </p>

          <label className="privacy-check">
            <input type="checkbox" onChange={(e) => setIntroAccepted(e.target.checked)} />
            <span>Я согласен с политикой конфиденциальности и обработкой данных</span>
          </label>

          <button type="button" disabled={!introAccepted}>
            Начать заполнение
          </button>
        </div>
      </section>
    );
  }

  if (!basicDone) {
    return (
      <section className="profile-page profile-center">
        <div className="profile-question-card">
          <div className="profile-progress">
            <span>Вопрос {step + 1} из {basicQuestions.length}</span>
            <b>{Math.round(((step + 1) / basicQuestions.length) * 100)}%</b>
          </div>

          <div className="profile-progress-line">
            <div style={{ width: `${Math.round(((step + 1) / basicQuestions.length) * 100)}%` }} />
          </div>

          <h1>{current.title}</h1>

          <input
            autoFocus
            value={currentValue}
            placeholder={current.placeholder}
            onChange={(e) =>
              setAnswers((prev) => ({
                ...prev,
                [current.key]: e.target.value,
              }))
            }
            onKeyDown={(e) => {
              if (e.key === "Enter") nextBasic();
            }}
          />

          <button type="button" onClick={nextBasic} disabled={!canGoNext || saving}>
            {step === basicQuestions.length - 1 ? saving ? "Сохраняю..." : "Сохранить" : "Дальше"}
          </button>

          {step > 0 && (
            <button className="back-button" type="button" onClick={() => setStep(step - 1)}>
              Назад
            </button>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="profile-page">
      <div className="client-card profile-control-card">
        <div className="client-card-top profile-card-header">
          <label className="home-avatar uploadable-avatar">
            {avatar ? <img src={avatar} alt="" /> : null}
            <input type="file" accept="image/*" onChange={(e) => uploadAvatar(e.target.files?.[0])} />
          </label>

          <div>
            <p className="eyebrow">Профиль клиента</p>
            <h1>{answers.name}</h1>
            <p className="client-email">{answers.email}</p>
          </div>
        </div>

        <div className="client-status-grid">
          <div className="client-status">
            <span>Кто клиент</span>
            <b>{answers.client_type}</b>
          </div>

          <div className="client-status">
            <span>Ниша</span>
            <b>{answers.niche}</b>
          </div>

          <div className="client-status">
            <span>Площадки сейчас</span>
            <b>{answers.platform}</b>
          </div>

          <div className="client-status">
            <span>Уведомления</span>
            <b>
              {[
                details.notify_email ? "Email" : "",
                details.notify_telegram ? "Telegram" : "",
              ].filter(Boolean).join(", ") || "Не выбрано"}
            </b>
          </div>

          <div className="client-status">
            <span>Тариф</span>
            <b>
              {details.tariff_plan === "pro"
                ? `PRO${details.pro_paid_until ? ` до ${details.pro_paid_until}` : ""}`
                : "FREE"}
            </b>
          </div>
        </div>

        <div className="profile-readiness-grid">
          <article className={audienceReady ? "readiness-card done" : "readiness-card danger"}>
            <span>01</span>
            <h2>Анализ аудитории</h2>
            <p>
              {audienceReady
                ? "Анализ аудитории заполнен. Можно подключать ИИ-анализ."
                : "Обязательно заполните анализ аудитории или вставьте распаковку клиента."}
            </p>
          </article>

          <article className={platformsReady ? "readiness-card done" : "readiness-card danger"}>
            <span>02</span>
            <h2>Площадки развития</h2>
            <p>
              {platformsReady
                ? details.platforms.join(", ")
                : "Выберите площадки, где клиент будет развиваться."}
            </p>
          </article>

          <article className={productReady ? "readiness-card done" : "readiness-card danger"}>
            <span>03</span>
            <h2>Продукт</h2>
            <p>
              {productReady
                ? details.product_status
                : "Нужно понять: продукт уже есть или его нужно собрать."}
            </p>
          </article>
        </div>

        <div className="client-main-grid">
          <article className="client-section">
            <span className="section-icon">🎯</span>
            <div>
              <h2>Цель на месяц</h2>
              <p>{answers.monthly_goal}</p>
            </div>
          </article>

          <article className="client-section danger">
            <span className="section-icon">⚡</span>
            <div>
              <h2>Главное препятствие</h2>
              <p>{answers.blocker}</p>
            </div>
          </article>

          <article className="client-section field-wide">
            <span className="section-icon">🧠</span>
            <div>
              <h2>Офис 10 агентов</h2>
              <p>
                После анализа аудитории и продукта сюда подключим агентов:
                маркетолог, аналитик, продуктолог, редактор, продажник, сценарист,
                упаковщик, стратег, критик и модератор идей.
              </p>
            </div>
          </article>
        </div>

        <div className="client-actions profile-actions">
          <button type="button" onClick={() => setDetailsOpen(true)}>
            Заполнить анализ аудитории
          </button>

          <button type="button" onClick={() => setProductOpen(true)}>
            Вопросы по продукту
          </button>

          <button type="button" className="secondary" onClick={() => setNotifyOpen(true)}>
            Куда направлять уведомления
          </button>

          <Link
            href="/app/content-map"
            className={!audienceReady || !platformsReady || !productReady ? "disabled-link" : ""}
          >
            Построить карту контента
          </Link>

          <button
            type="button"
            className="secondary"
            onClick={() => {
              setBasicDone(false);
              setStep(0);
            }}
          >
            Изменить базовые ответы
          </button>
        </div>
      </div>

      {notifyOpen && (
        <div className="profile-modal-backdrop" onClick={() => setNotifyOpen(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-head">
              <div>
                <p className="eyebrow">Уведомления</p>
                <h2>Куда направлять уведомления?</h2>
              </div>
              <button type="button" onClick={() => setNotifyOpen(false)}>×</button>
            </div>

            <p className="profile-modal-text">
              Выберите, где вы будете получать уведомления.
            </p>

            <label className="profile-check-row">
              <input
                type="checkbox"
                checked={details.notify_email}
                onChange={(e) => setDetails((prev) => ({ ...prev, notify_email: e.target.checked }))}
              />
              <span>Email</span>
            </label>

            <label className="profile-check-row">
              <input
                type="checkbox"
                checked={details.notify_telegram}
                onChange={(e) => setDetails((prev) => ({ ...prev, notify_telegram: e.target.checked }))}
              />
              <span>Telegram</span>
            </label>

            {details.notify_telegram && (
              <div className="telegram-connect-box">
                <div>
                  <strong>Подключите Telegram-бота</strong>
                  <p>Перейдите в бота и нажмите Start. После подключения ЛЕСik сможет присылать напоминания.</p>
                </div>
                <a href={process.env.NEXT_PUBLIC_TELEGRAM_BOT_URL || "https://t.me/"} target="_blank" rel="noreferrer">
                  Перейти в бота
                </a>
              </div>
            )}

            <button type="button" className="modal-save-button" onClick={saveNotify}>
              Сохранить
            </button>
          </div>
        </div>
      )}


      {audienceAiOpen && (
        <div className="profile-modal-backdrop" onClick={() => setAudienceAiOpen(false)}>
          <div className="profile-modal profile-modal-large audience-ai-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-head">
              <div>
                <p className="eyebrow">ИИ-помощник</p>
                <h2>Интервью по аудитории</h2>
              </div>
              <button type="button" onClick={() => setAudienceAiOpen(false)}>×</button>
            </div>

            <p className="profile-modal-text">
              ИИ задаст уточняющие вопросы по вашей аудитории и подготовит финальный черновик анализа.
            </p>

            {audienceAiLoading && (
              <div className="audience-ai-state">
                Формирую следующий вопрос...
              </div>
            )}

            {!audienceAiLoading && audienceAiQuestion && (
              <div className="audience-ai-question-box">
                <h3>{audienceAiQuestion}</h3>
                <textarea
                  value={audienceAiAnswer}
                  placeholder="Введите ответ на вопрос..."
                  onChange={(e) => setAudienceAiAnswer(e.target.value)}
                />
                <button type="button" className="modal-save-button" onClick={answerAudienceAiQuestion}>
                  Отправить ответ
                </button>
              </div>
            )}

            {!audienceAiLoading && audienceAiDraft && (
              <div className="audience-ai-result-box">
                <h3>Черновик анализа аудитории</h3>
                <textarea
                  value={audienceAiDraft}
                  onChange={(e) => setAudienceAiDraft(e.target.value)}
                />
                <div className="audience-ai-actions">
                  <button type="button" className="modal-save-button" onClick={saveAudienceAiDraft}>
                    Сохранить в профиль
                  </button>
                  <button type="button" className="modal-secondary-button" onClick={() => setAudienceAiOpen(false)}>
                    Закрыть
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {detailsOpen && (
        <div className="profile-modal-backdrop" onClick={() => setDetailsOpen(false)}>
          <div className="profile-modal profile-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-head">
              <div>
                <p className="eyebrow">Глубокий профиль</p>
                <h2>Аудитория и площадки</h2>
              </div>
              <button type="button" onClick={() => setDetailsOpen(false)}>×</button>
            </div>

            <div className="profile-form-block">
              <h3>1. Тариф — обязательно</h3>
              <p>Укажите текущий тариф клиента. Для PRO обязательно дата оплаченного периода.</p>
              <div className="product-status-row">
                {[
                  { key: "free", label: "FREE" },
                  { key: "pro", label: "PRO" },
                ].map((tariff) => (
                  <button
                    key={tariff.key}
                    type="button"
                    className={details.tariff_plan === tariff.key ? "selected" : ""}
                    onClick={() => setDetails((prev) => ({ ...prev, tariff_plan: tariff.key }))}
                  >
                    {tariff.label}
                  </button>
                ))}
              </div>

              {details.tariff_plan === "pro" && (
                <>
                  <h3>Оплачено до</h3>
                  <input
                    type="date"
                    value={details.pro_paid_until || ""}
                    onChange={(e) => setDetails((prev) => ({ ...prev, pro_paid_until: e.target.value }))}
                  />
                </>
              )}
            </div>

            <div className="profile-form-block">
              <h3>2. Анализ аудитории — обязательно</h3>
              <p>
                Вставьте сюда распаковку аудитории: кто эти люди, что болит,
                чего хотят, почему подписываются, почему покупают или сомневаются.
              </p>
              <textarea
                value={details.audience_analysis}
                placeholder="Например: аудитория — эксперты и онлайн-школы, хотят системно получать заявки..."
                onChange={(e) => setDetails((prev) => ({ ...prev, audience_analysis: e.target.value }))}
              />
              
              <div className="audience-upload-box">
                <div>
                  <h4>Или загрузите файл для разбора</h4>
                  <p>
                    Подойдут скриншоты, PDF, DOCX, TXT, аудио. GPT/Vision извлечёт смысл
                    и заполнит анализ аудитории.
                  </p>
                </div>

                <label className="audience-upload-button">
                  {audienceUploading ? "Разбираю..." : "Загрузить файл"}
                  <input
                    type="file"
                    disabled={audienceUploading}
                    accept="image/*,.pdf,.docx,.txt,.md,.csv,.json,audio/*,.mp3,.m4a,.wav,.ogg,.webm"
                    onChange={(e) => uploadAudienceAnalysisFile(e.target.files?.[0])}
                  />
                </label>
              </div>

              <button
                type="button"
                className="audience-ai-start-button"
                onClick={() => {
                  setAudienceAiOpen(true);
                  setAudienceAiQuestion("");
                  setAudienceAiDraft("");
                  setAudienceAiAnswers([]);
                  runAudienceAiAnalysis([]);
                }}
              >
                Запустить ИИ-интервью по аудитории
              </button>
            </div>

            <button type="button" className="modal-save-button" onClick={saveDetails} disabled={saving}>
              {saving ? "Сохраняю..." : "Сохранить глубокий профиль"}
            </button>
          </div>
        </div>
      )}

      {productOpen && (
        <div className="profile-modal-backdrop" onClick={() => setProductOpen(false)}>
          <div className="profile-modal profile-modal-large product-unpack-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-head">
              <div>
                <p className="eyebrow">Продукт</p>
                <h2>Вопросы по продукту</h2>
              </div>
              <button type="button" onClick={() => setProductOpen(false)}>×</button>
            </div>

            <button type="button" className="modal-save-button" onClick={saveDetails} disabled={saving}>
              {saving ? "Сохраняю..." : "Сохранить глубокий профиль"}
            </button>
          </div>
        </div>
      )}

      {productOpen && (
        <div className="profile-modal-backdrop" onClick={() => setProductOpen(false)}>
          <div className="profile-modal profile-modal-large product-unpack-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-head">
              <div>
                <p className="eyebrow">Продукт</p>
                <h2>Вопросы по продукту</h2>
              </div>
              <button type="button" onClick={() => setProductOpen(false)}>×</button>
            </div>

            <button type="button" className="modal-save-button" onClick={saveDetails} disabled={saving}>
              {saving ? "Сохраняю..." : "Сохранить глубокий профиль"}
            </button>
          </div>
        </div>
      )}

      {productOpen && (
        <div className="profile-modal-backdrop" onClick={() => setProductOpen(false)}>
          <div className="profile-modal profile-modal-large product-unpack-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-head">
              <div>
                <p className="eyebrow">Продукт</p>
                <h2>Вопросы по продукту</h2>
              </div>
              <button type="button" onClick={() => setProductOpen(false)}>×</button>
            </div>

            <button type="button" className="modal-save-button" onClick={saveDetails} disabled={saving}>
              {saving ? "Сохраняю..." : "Сохранить глубокий профиль"}
            </button>
          </div>
        </div>
      )}

      {productOpen && (
        <div className="profile-modal-backdrop" onClick={() => setProductOpen(false)}>
          <div className="profile-modal profile-modal-large product-unpack-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-head">
              <div>
                <p className="eyebrow">Продукт</p>
                <h2>Вопросы по продукту</h2>
              </div>
              <button type="button" onClick={() => setProductOpen(false)}>×</button>
            </div>

            <div className="profile-form-block">
              <h3>Статус продукта</h3>
              <div className="product-status-row">
                {["Есть продукт", "Продукта пока нет"].map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={details.product_status === status ? "selected" : ""}
                    onClick={() => setDetails((prev) => ({ ...prev, product_status: status }))}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {details.product_status === "Есть продукт" && (
              <>
                <div className="profile-form-block">
                  <h3>Название продукта</h3>
                  <input
                    value={details.product_name}
                    placeholder="Например: настройка Salebot под ключ"
                    onChange={(e) => setDetails((prev) => ({ ...prev, product_name: e.target.value }))}
                  />
                </div>

                <div className="profile-form-block">
                  <h3>Что даёт продукт?</h3>
                  <textarea
                    value={details.product_description}
                    placeholder="Опишите результат, формат, стоимость, кому подходит..."
                    onChange={(e) => setDetails((prev) => ({ ...prev, product_description: e.target.value }))}
                  />
                </div>

                <div className="profile-form-block two-cols">
                  <div>
                    <h3>Почему покупают?</h3>
                    <textarea
                      value={details.why_buy}
                      placeholder="Какие причины покупки, какие триггеры, что важно клиенту..."
                      onChange={(e) => setDetails((prev) => ({ ...prev, why_buy: e.target.value }))}
                    />
                  </div>

                  <div>
                    <h3>Почему не покупают?</h3>
                    <textarea
                      value={details.why_not_buy}
                      placeholder="Какие страхи, возражения, сомнения, барьеры..."
                      onChange={(e) => setDetails((prev) => ({ ...prev, why_not_buy: e.target.value }))}
                    />
                  </div>
                </div>
              </>
            )}

            {details.product_status === "Продукта пока нет" && (
              <div className="profile-form-block">
                <h3>Что хотите продавать или в чём сильны?</h3>
                <textarea
                  value={details.product_ideas_request}
                  placeholder="Опишите опыт, навыки, аудиторию, что могли бы упаковать в продукт..."
                  onChange={(e) => setDetails((prev) => ({ ...prev, product_ideas_request: e.target.value }))}
                />
                <p className="form-hint">
                  Позже офис 10 агентов предложит варианты продукта и поможет развить идеи.
                </p>
              </div>
            )}

            <button
              type="button"
              className="modal-save-button"
              onClick={() => saveDetails({ closeDetails: false, closeProduct: true })}
              disabled={saving}
            >
              {saving ? "Сохраняю..." : "Сохранить ответы по продукту"}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}
