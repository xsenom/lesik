"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8000";

type Answers = {
  name: string;
  email: string;
  client_type: string;
  niche: string;
  platform: string;
  primary_platform: string;
  monthly_goal: string;
  blocker: string;
};

type ProfileDetails = {
  email: string;
  notify_email: boolean;
  notify_telegram: boolean;
  platforms: string[];
  audience_analysis: string;
  social_links: { telegram: string; instagram: string; youtube: string; vk: string; tiktok: string; site: string; other: string; };
  social_analysis: string;
  product_status: string;
  product_name: string;
  product_description: string;
  why_buy: string;
  why_not_buy: string;
  product_ideas_request: string;
  tariff_plan: string;
  pro_paid_until: string;
  channel: string;
  price: number;
  price_currency: string;
  keyword: string;
  cta_text: string;
  lead_magnet_title: string;
  lead_magnet_file: string;
  bot_description_short: string;
  privacy_policy_url: string;
  offer_url: string;
  entry_keyword_or_link: string;
  entry_button_label: string;
};

const emptyAnswers: Answers = {
  name: "",
  email: "",
  client_type: "",
  niche: "",
  platform: "",
  primary_platform: "",
  monthly_goal: "",
  blocker: "",
};

function cleanAnalysis(text: string): string {
  return (text || "")
    .replace(/^#{1,6}\s*/gm, "")
    .replace(/\*\*(.*?)\*\*/g, "$1")
    .replace(/\*/g, "")
    .replace(/^\s*[-•]\s+/gm, "• ")
    .trim();
}

const emptyDetails: ProfileDetails = {
  email: "",
  notify_email: true,
  notify_telegram: false,
  platforms: [],
  audience_analysis: "",
  social_links: { telegram: "", instagram: "", youtube: "", vk: "", tiktok: "", site: "", other: "" },
  social_analysis: "",
  product_status: "",
  product_name: "",
  product_description: "",
  why_buy: "",
  why_not_buy: "",
  product_ideas_request: "",
  tariff_plan: "free",
  pro_paid_until: "",
  channel: "",
  price: 0,
  price_currency: "RUB",
  keyword: "",
  cta_text: "",
  lead_magnet_title: "",
  lead_magnet_file: "",
  bot_description_short: "",
  privacy_policy_url: "",
  offer_url: "",
  entry_keyword_or_link: "",
  entry_button_label: "",
};

function extractAudienceSection(text: string, sectionLabel: string): string {
  if (!text) return "";
  const lines = text.split("\n");
  let capturing = false;
  const collected: string[] = [];
  for (const line of lines) {
    const isHeading = /^#{1,3}\s*\d+[.)]/.test(line.trim());
    if (isHeading) {
      if (capturing) break;
      if (line.toLowerCase().includes(sectionLabel.toLowerCase())) {
        capturing = true;
      }
      continue;
    }
    if (capturing && line.trim()) {
      collected.push(line.trim().replace(/^[-•]\s*/, ""));
    }
  }
  return collected.join(" ").trim();
}

const basicQuestions = [
  { key: "name", title: "Как вас зовут?", placeholder: "Например: Катерина" },
  { key: "email", title: "Ваш email?", placeholder: "Например: name@email.com" },
  { key: "client_type", title: "Кто вы?", placeholder: "Эксперт, блогер, школа, предприниматель..." },
  { key: "niche", title: "Ваша ниша?", placeholder: "Например: чат-боты, психология, английский..." },
  { key: "platform", title: "Где уже есть аудитория?", placeholder: "Telegram, Instagram, сайт..." },
  { key: "monthly_goal", title: "Главная цель на месяц?", placeholder: "Например: 50 заявок, запуск продукта..." },
  { key: "blocker", title: "Что сейчас мешает?", placeholder: "Мало заявок, нет системы, не покупают..." },
] as const;

export default function ProfilePage() {

  // LESIK_PROFILE_PAGE_LOAD_TEST_RESULT
  


useEffect(() => {
    const loadProfileTestResult = () => {
      try {
        const raw = window.localStorage.getItem("lesik_test_result");
        if (!raw) {
          setProfileTestResult(null);
          return;
        }

        const parsed = JSON.parse(raw);
        setProfileTestResult(parsed?.label ? parsed : null);
      } catch {
        setProfileTestResult(null);
      }
    };

    loadProfileTestResult();

    window.addEventListener("focus", loadProfileTestResult);
    window.addEventListener("storage", loadProfileTestResult);

  
  const normalizeNicheForPositioning = (value: string) => {
    const raw = (value || "").trim();
    const lower = raw.toLowerCase();

    if (!raw) return "чат-ботам";
    if (lower.includes("чат") && lower.includes("бот")) return "чат-ботам";

    return lower;
  };

  const positioningText = `${answers.client_type || "Эксперт"} по ${normalizeNicheForPositioning(answers.niche || "чат-боты")}`;

  return () => {
      window.removeEventListener("focus", loadProfileTestResult);
      window.removeEventListener("storage", loadProfileTestResult);
    };
  }, []);

  const [step, setStep] = useState(0);
  const [profileTestResult, setProfileTestResult] = useState<any>(null);
  const [introAccepted, setIntroAccepted] = useState(false);
  const [privacyChecked, setPrivacyChecked] = useState(false);
  const [showPrimaryPlatform, setShowPrimaryPlatform] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [basicDone, setBasicDone] = useState(false);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [productOpen, setProductOpen] = useState(false);
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [serviceAccessPaid, setServiceAccessPaid] = useState(false);
  const [serviceAccessUntilText, setServiceAccessUntilText] = useState("");
  const [socialOpen, setSocialOpen] = useState(false);
  const [socialAnalysisLoading, setSocialAnalysisLoading] = useState(false);
  const [socialAnalysisProgress, setSocialAnalysisProgress] = useState(0);
  const [audienceUploading, setAudienceUploading] = useState(false);
  const [audienceAiOpen, setAudienceAiOpen] = useState(false);
  const [audienceAiLoading, setAudienceAiLoading] = useState(false);
  const [audienceAiQuestion, setAudienceAiQuestion] = useState("");
  const [audienceAiAnswer, setAudienceAiAnswer] = useState("");
  const [audienceAiAnswers, setAudienceAiAnswers] = useState<{ question: string; answer: string }[]>([]);
  const [audienceAiDraft, setAudienceAiDraft] = useState("");
  const [audienceStep, setAudienceStep] = useState(0);
  const [toastMsg, setToastMsg] = useState("");
  const audienceQuestions = [
    "Кому вы помогаете? Опишите своего клиента — кто это, чем занимается, в какой ситуации находится",
    "Какую главную проблему или боль решает ваш продукт/экспертиза?",
    "Какой конкретный результат получает клиент после работы с вами?",
    "Почему клиенты выбирают именно вас, а не конкурентов?",
    "Что чаще всего мешает клиенту купить или начать работу с вами?",
  ];
  const [answers, setAnswers] = useState<Answers>(emptyAnswers);

  useEffect(() => {
    const serviceEmail = (
      answers.email ||
      (typeof window !== "undefined" ? window.localStorage.getItem("lesik_email") : "") ||
      ""
    ).trim().toLowerCase();

    if (!serviceEmail) {
      setServiceAccessPaid(false);
      setServiceAccessUntilText("");
      return;
    }

    let alive = true;

    fetch(`/api/service-access/check?email=${encodeURIComponent(serviceEmail)}`, {
      cache: "no-store",
    })
      .then((res) => res.json())
      .then((data) => {
        if (!alive) return;

        setServiceAccessPaid(data?.paid === true);
        setServiceAccessUntilText(data?.accessUntilText || "");
      })
      .catch(() => {
        if (!alive) return;

        setServiceAccessPaid(false);
        setServiceAccessUntilText("");
      });

    return () => {
      alive = false;
    };
  }, [answers.email]);
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
        const profileRes = await fetch(`${API_BASE}/profiles/by-email?email=${encodeURIComponent(email)}`);
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
            primary_platform: profileData.profile.primary_platform || "",
          });

          setBasicDone(true);
          setIntroAccepted(true);
        }

        const detailsRes = await fetch(`${API_BASE}/profile-details/by-email?email=${encodeURIComponent(email)}`);
        const detailsData = await detailsRes.json();

        if (detailsData.details) {
          const loadedDetails = detailsData.details;
          // social_links может прийти как строка из JSON
          let social_links = emptyDetails.social_links;
          if (loadedDetails.social_links) {
            if (typeof loadedDetails.social_links === "string") {
              try { social_links = JSON.parse(loadedDetails.social_links); } catch {}
            } else {
              social_links = { ...emptyDetails.social_links, ...loadedDetails.social_links };
            }
          }
          setDetails({
            ...emptyDetails,
            ...loadedDetails,
            social_links,
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

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const isEmailStep = current.key === "email";
  const isEmailValid = emailRegex.test(currentValue.trim().toLowerCase());
  const PLATFORMS = ["Telegram", "Instagram", "YouTube", "ВКонтакте", "TikTok", "Facebook", "Сайт", "Email-рассылка"];
  const platformLinkMap: Record<string, keyof typeof details.social_links> = { "Telegram": "telegram", "Instagram": "instagram", "YouTube": "youtube", "ВКонтакте": "vk", "TikTok": "tiktok", "Facebook": "other", "Сайт": "site", "Email-рассылка": "other" };
  const selectedPlatforms = current.key === "platform" ? currentValue.split(",").map(s => s.trim()).filter(p => PLATFORMS.includes(p)) : [];
  const allLinksfilled = selectedPlatforms.every(p => (details.social_links[platformLinkMap[p]] || "").trim().length > 3);
  const canGoNext = isEmailStep ? isEmailValid : current.key === "platform" ? Boolean(currentValue.trim()) && allLinksfilled : current.key === "monthly_goal" || current.key === "blocker" ? currentValue.trim().length >= 20 : Boolean(currentValue.trim());

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
    const normalizedEmail = answers.email.trim().toLowerCase();

    if (!normalizedEmail || !normalizedEmail.includes("@")) {
      alert("Введите корректный email. Он нужен, чтобы сохранить профиль");
      const emailStep = basicQuestions.findIndex((item) => item.key === "email");
      if (emailStep >= 0) {
        setStep(emailStep);
      }
      return;
    }

    localStorage.setItem("lesik_email", normalizedEmail);

    setSaving(true);

    try {
      const payload = {
        ...answers,
        email: normalizedEmail,
      };

      const res = await fetch(`${API_BASE}/profiles`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(await res.text());
      // Сохраняем social_links если они есть
      const hasLinks = Object.values(details.social_links).some(v => v.trim().length > 3);
      if (hasLinks) {
        const detailsPayload = {
          ...details,
          email: normalizedEmail,
          social_links: JSON.stringify(details.social_links),
        };
        await fetch(`${API_BASE}/profile-details`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(detailsPayload),
        });
      }
      if (!res.ok) throw new Error(await res.text());

      setBasicDone(true);
      setDetailsOpen(true);
    } catch (e) {
      console.error(e);
      alert("Не удалось сохранить профиль. Проверь backend");
    } finally {
      setSaving(false);
    }
  };
  const nextBasic = () => {
    if (!canGoNext) {
      if (current.key === "email") {
        alert("Введите корректный email, например name@email.com");
      }
      return;
    }
    if (editMode) { saveBasic(); setEditMode(false); return; }
    if (current.key === "platform") {
      const selected = answers.platform.split(",").map(s => s.trim()).filter(Boolean);
      if (selected.length >= 2) {
        setShowPrimaryPlatform(true);
        return;
      }
      if (selected.length === 1) {
        setAnswers(prev => ({ ...prev, primary_platform: selected[0] }));
      }
    }
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
      alert("Сначала укажите корректный email");
      return;
    }

    setAudienceUploading(true);

    try {
      const form = new FormData();
      form.append("email", email);
      form.append("file", file);

      const res = await fetch(`${API_BASE}/audience-analysis/upload`, {
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
      alert("Не удалось разобрать файл. Проверьте backend и OPENAI_API_KEY");
    } finally {
      setAudienceUploading(false);
    }
  };


  const runAudienceAiAnalysis = async (nextAnswers?: { question: string; answer: string }[]) => {
    const email = answers.email || localStorage.getItem("lesik_email") || "";
    if (!email) {
      alert("Сначала укажите корректный email");
      return;
    }

    const chain = nextAnswers || audienceAiAnswers;

    setAudienceAiLoading(true);

    try {
      const res = await fetch(`${API_BASE}/audience-analysis/analyze`, {
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
      alert("Не удалось запустить ИИ-анализ аудитории");
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

  const saveAudienceAiDraft = async () => {
    if (!audienceAiDraft.trim()) return;

    const updatedDetails = {
      ...details,
      audience_analysis: audienceAiDraft,
      email: answers.email || localStorage.getItem("lesik_email") || "",
    };

    setDetails(updatedDetails);
    setSaving(true);

    try {
      const payload = {
        ...updatedDetails,
        social_links: typeof updatedDetails.social_links === "object" ? JSON.stringify(updatedDetails.social_links) : updatedDetails.social_links,
      };

      const res = await fetch(`${API_BASE}/profile-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error(await res.text());

      setAudienceAiOpen(false);
    } catch (e) {
      console.error(e);
      alert("Не удалось сохранить анализ аудитории. Попробуйте ещё раз.");
    } finally {
      setSaving(false);
    }
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
        social_links: typeof details.social_links === "object" ? JSON.stringify(details.social_links) : details.social_links,
      };

      const res = await fetch(`${API_BASE}/profile-details`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      setDetails({ ...details, email: answers.email || localStorage.getItem("lesik_email") || "" });

      if (closeDetails) {
        setDetailsOpen(false);
      }
      if (closeProduct) {
        setProductOpen(false);
      }
      return true;
    } catch (e) {
      console.error(e);
      alert("Не удалось сохранить расширенный профиль");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveProductWithTelegramCheck = async () => {
    const ok = await saveDetails({ closeDetails: false, closeProduct: true });
    if (!ok) return;

    if (details.channel === "Telegram") {
      try {
        const email = answers.email || localStorage.getItem("lesik_email") || "";
        const res = await fetch(`${API_BASE}/profile-details/telegram`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            bot_description_short: details.bot_description_short,
            privacy_policy_url: details.privacy_policy_url,
            offer_url: details.offer_url,
            entry_keyword_or_link: details.entry_keyword_or_link,
            entry_button_label: details.entry_button_label,
          }),
        });
        if (!res.ok) {
          const errData = await res.json().catch(() => ({}));
          alert(
            "Профиль сохранён. Но для запуска Telegram-бота нужно доделать: " +
            (errData.detail || "проверьте поля блока Telegram")
          );
        }
      } catch (e) {
        console.error(e);
      }
    }
  };
  useEffect(() => {
    if (!socialAnalysisLoading) {
      setSocialAnalysisProgress(0);
      return;
    }

    setSocialAnalysisProgress(5);

    const timer = window.setInterval(() => {
      setSocialAnalysisProgress((value) => {
        if (value >= 95) return 95;
        if (value < 35) return Math.min(95, value + 7);
        if (value < 70) return Math.min(95, value + 4);
        return Math.min(95, value + 2);
      });
    }, 900);

    return () => window.clearInterval(timer);
  }, [socialAnalysisLoading]);

const runSocialLinksAnalysis = async () => {
    const email = answers.email || localStorage.getItem("lesik_email") || "";

    if (!email) {
      alert("Сначала укажите email в профиле");
      return;
    }

    const hasLinks = Object.values(details.social_links).some((value) => value.trim().length > 5);

    if (!hasLinks) {
      alert("Сначала добавьте хотя бы одну ссылку на соцсеть");
      setSocialOpen(true);
      return;
    }

    setSocialAnalysisProgress(5);
    setSocialAnalysisLoading(true);

    try {
      await saveDetails({ closeDetails: false });

      const res = await fetch(`${API_BASE}/social-analysis/generate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      const analysis = data.analysis || "";

      setDetails((prev) => ({
        ...prev,
        social_analysis: analysis,
      }));

      setSocialOpen(true);
    } catch (e) {
      console.error(e);
      alert("Не удалось проанализировать соцсети. Проверь backend и OPENAI_API_KEY");
    } finally {
      setSocialAnalysisLoading(false);
    }
  };

  const saveNotify = async () => {
    await saveDetails({ closeDetails: false });
    setNotifyOpen(false);
  };

  const socialHasLinks = Object.values(details.social_links).some((value) => value.trim().length > 5);
  const socialAnalysisReady = Boolean((details.social_analysis || "").trim().length > 20);
  const audienceReady = details.audience_analysis.trim().length > 20;
  const suggestedWhyBuy = extractAudienceSection(details.audience_analysis, "Желания");
  const suggestedWhyNotBuy = extractAudienceSection(details.audience_analysis, "Возражения");

  const isValidHttpUrl = (url: string) => /^https?:\/\/.+/i.test(url.trim());
  const assembledTelegramDescription =
    details.channel === "Telegram"
      ? `${details.bot_description_short} Политика: ${details.privacy_policy_url} · Оферта: ${details.offer_url} Войти: ${details.entry_keyword_or_link}`.trim()
      : "";
  const telegramDescLength = assembledTelegramDescription.length;
  const telegramDescOverLimit = telegramDescLength > 120;
  const telegramBlockValid =
    details.channel !== "Telegram" ||
    (
      details.bot_description_short.trim().length > 0 &&
      isValidHttpUrl(details.privacy_policy_url) &&
      isValidHttpUrl(details.offer_url) &&
      details.entry_keyword_or_link.trim().length > 0 &&
      !telegramDescOverLimit
    );
  const platformsReady = details.platforms.length > 0 || Boolean(answers.platform.trim());
  const productReady = Boolean(details.product_name.trim() && details.product_description.trim());
  const openBasicQuestion = (questionIndex: number) => {
    setStep(questionIndex);
    setBasicDone(false);
    setEditMode(true);
  };

  if (!introAccepted && !basicDone) {
    return (
      <section className="profile-page profile-center">
        <div className="profile-question-card profile-intro-card">
          <h1>Профиль нужен, чтобы ЛЕС<span className="brand-ik">ik</span> думал точнее</h1>
          <p>
            Мы соберём базу: кто вы, какая ниша, цель, препятствие и где вы ведёте контент.
            После этого можно будет перейти к аудитории, продукту и карте контента
          </p>
          <div className="privacy-check">
            <input
              type="checkbox"
              id="privacy-cb"
              checked={privacyChecked}
              onChange={(e) => setPrivacyChecked(e.target.checked)}
            />
            <label htmlFor="privacy-cb">
              <span>Соглашаюсь с политикой конфиденциальности и обработкой данных</span>
            </label>
          </div>
          <button type="button" disabled={!privacyChecked} onClick={() => setIntroAccepted(true)}>
            Начать заполнение
          </button>
        </div>
      </section>
    );
  }

  if (showPrimaryPlatform) {
    const selectedList = answers.platform.split(",").map(s => s.trim()).filter(Boolean);
    return (
      <section className="profile-page profile-center">
        <div className="profile-question-card">
          <div className="profile-progress">
            <span>Уточнение</span>
            <b>⭐</b>
          </div>
          <h1>Какая площадка главная?</h1>
          <div className="platform-grid">
            {selectedList.map((pl) => (
              <label key={pl} className="platform-pill">
                <input
                  type="radio"
                  name="primary_platform"
                  checked={answers.primary_platform === pl}
                  onChange={() => setAnswers(prev => ({ ...prev, primary_platform: pl }))}
                />
                <span>{pl}</span>
              </label>
            ))}
          </div>
          <button type="button" disabled={!answers.primary_platform} onClick={() => { setShowPrimaryPlatform(false); setStep(step + 1); }}>
            Дальше
          </button>
          <button className="back-button" type="button" onClick={() => setShowPrimaryPlatform(false)}>
            Назад
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

          {current.key === "client_type" ? (
            <div className="platform-grid">
              {["Эксперт", "Блогер", "Онлайн-школа", "Предприниматель", "Фрилансер"].map((ct) => (
                <label key={ct} className="platform-pill">
                  <input
                    type="checkbox"
                    checked={currentValue === ct}
                    onChange={() =>
                      setAnswers((prev) => ({ ...prev, client_type: ct }))
                    }
                  />
                  <span>{ct}</span>
                </label>
              ))}
              <input
                type="text"
                placeholder="Другое..."
                value={!["Эксперт", "Блогер", "Онлайн-школа", "Предприниматель", "Фрилансер"].includes(currentValue) ? currentValue : ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, client_type: e.target.value }))
                }
              />
            </div>
          ) : current.key === "niche" ? (
            <div className="platform-grid">
              {["Психология", "Английский язык", "Чат-боты", "Фитнес / здоровье", "Маркетинг", "Бизнес / финансы", "Красота / стиль"].map((n) => (
                <label key={n} className="platform-pill">
                  <input
                    type="checkbox"
                    checked={currentValue === n}
                    onChange={() =>
                      setAnswers((prev) => ({ ...prev, niche: n }))
                    }
                  />
                  <span>{n}</span>
                </label>
              ))}
              <input
                type="text"
                placeholder="Другое..."
                value={!["Психология", "Английский язык", "Чат-боты", "Фитнес / здоровье", "Маркетинг", "Бизнес / финансы", "Красота / стиль"].includes(currentValue) ? currentValue : ""}
                onChange={(e) =>
                  setAnswers((prev) => ({ ...prev, niche: e.target.value }))
                }
              />
            </div>
          ) : current.key === "platform" ? (
            <div className="platform-grid">
              {["Telegram", "Instagram", "YouTube", "ВКонтакте", "TikTok", "Facebook", "Сайт", "Email-рассылка"].map((pl) => {
                const PLATFORMS = ["Telegram", "Instagram", "YouTube", "ВКонтакте", "TikTok", "Facebook", "Сайт", "Email-рассылка"];
                const selected = currentValue.split(",").map(s => s.trim()).filter(Boolean);
                const isChecked = selected.includes(pl);
                const linkKey = pl.toLowerCase().replace("вконтакте", "vk").replace("сайт", "site").replace("email-рассылка", "other") as keyof typeof details.social_links;
                return (
                  <div key={pl}>
                    <label className="platform-pill">
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={(e) => {
                          const current_list = selected.filter(p => PLATFORMS.includes(p));
                          const updated = e.target.checked ? [...current_list, pl] : current_list.filter(p => p !== pl);
                          const custom = selected.filter(p => !PLATFORMS.includes(p)).join(", ");
                          setAnswers((prev) => ({ ...prev, platform: [...updated, ...(custom ? [custom] : [])].join(", ") }));
                        }}
                      />
                      <span>{pl}</span>
                    </label>
                    {isChecked && (
                      <input
                        type="url"
                        className="platform-link-input"
                        placeholder={`Ссылка на ${pl}...`}
                        value={details.social_links[linkKey] || ""}
                        onChange={(e) => setDetails((prev) => ({ ...prev, social_links: { ...prev.social_links, [linkKey]: e.target.value } }))}
                      />
                    )}
                  </div>
                );
              })}
              <input
                type="text"
                placeholder="Другое..."
                value={currentValue.split(",").map(s => s.trim()).filter(p => !["Telegram", "Instagram", "YouTube", "ВКонтакте", "TikTok", "Facebook", "Сайт", "Email-рассылка"].includes(p)).join(", ")}
                onChange={(e) => {
                  const selected = currentValue.split(",").map(s => s.trim()).filter(p => ["Telegram", "Instagram", "YouTube", "ВКонтакте", "TikTok", "Facebook", "Сайт", "Email-рассылка"].includes(p));
                  const updated = e.target.value.trim() ? [...selected, e.target.value] : selected;
                  setAnswers((prev) => ({ ...prev, platform: updated.join(", ") }));
                }}
              />
            </div>
          ) : (
            <input
              autoFocus
              type={current.key === "email" ? "email" : "text"}
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
          )}

          {current.key === "email" && currentValue.trim() && !isEmailValid && (
            <p className="profile-email-error">
              Введите email в формате name@email.com
            </p>
          )}

          <button type="button" onClick={nextBasic} disabled={!canGoNext || saving}>
            {step === basicQuestions.length - 1 ? saving ? "Сохраняю..." : "Сохранить" : "Дальше"}
          </button>

          {step > 0 && (
            <button className="back-button" type="button" onClick={() => { if (editMode) { setBasicDone(true); setEditMode(false); } else { setStep(step - 1); } }}>
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
        <div className="tg-profile-header">
          <button type="button" className="tg-profile-edit-btn" onClick={() => openBasicQuestion(0)}>✎</button>
          <label className="tg-avatar uploadable-avatar">
            {avatar
              ? <img src={avatar} alt="" />
              : <span>{answers.name ? answers.name[0].toUpperCase() : "?"}</span>
            }
            <input type="file" accept="image/*" onChange={(e) => uploadAvatar(e.target.files?.[0])} />
          </label>
          <h1 className="tg-profile-name">{answers.name}</h1>
          <p className="tg-profile-email">{answers.email}</p>
          <div className="tg-profile-tags">
            {answers.client_type && <span className="tg-profile-tag">{answers.client_type}</span>}
            {answers.niche && <span className="tg-profile-tag">{answers.niche}</span>}
            {answers.platform && answers.platform.split(",").map(p => p.trim()).filter(Boolean).map(p => <span key={p} className="tg-profile-tag">{p}</span>)}
          </div>
        </div>

        <div className="client-status-grid">
          <div className="client-status client-status-positioning">
              <span>Позиционирование</span>
              <b>
                {`${answers.client_type || "Эксперт"} по ${(() => {
                  const raw = (answers.niche || "чат-боты").trim();
                  const lower = raw.toLowerCase();

                  if (!raw) return "чат-ботам";
                  if (lower.includes("чат") && lower.includes("бот")) return "чат-ботам";

                  return lower;
                })()}`}
              </b>

              <div className="client-status-actions">
                <button
                  type="button"
                  className="status-help"
                  data-tooltip="Это объединённое позиционирование: кто вы + в какой нише работаете"
                  aria-label="Как заполнить позиционирование"
                >
                  ?
                </button>
                <button type="button" className="status-edit" onClick={() => openBasicQuestion(2)} aria-label="Редактировать позиционирование">
                  ✎
                </button>
              </div>
            </div>

          <div className="client-status">
            <div className="client-status-actions">
              <button
                type="button"
                className="status-help"
                data-tooltip="Площадки показывают, где уже есть трафик. Укажите текущие каналы в базовых ответах: Telegram, Instagram, сайт и т.д"
                aria-label="Как заполнить поле площадки сейчас"
              >
                ?
              </button>
              <button type="button" className="status-edit" onClick={() => openBasicQuestion(4)} aria-label="Редактировать площадки сейчас">
                ✎
              </button>
            </div>
            <span>Площадки сейчас</span>
            <b>{answers.platform}</b>
            {answers.primary_platform && <span style={{fontSize:"12px",color:"#1a7a3a",display:"block",marginTop:"4px"}}>⭐ Главная: {answers.primary_platform}</span>}
          </div>

          <div className="client-status">
            <div className="client-status-actions">
              <button type="button" className="status-help" data-tooltip="Выберите куда направлять уведомления" aria-label="Про уведомления">?</button>
              <button type="button" className="status-edit" onClick={() => setNotifyOpen(true)} aria-label="Редактировать уведомления">✎</button>
            </div>
            <span>Уведомления</span>
            <b>
              {[
                details.notify_email ? "Email" : "",
                details.notify_telegram ? "Telegram" : "",
              ].filter(Boolean).join(", ") || "Не выбрано"}
            </b>
          </div>
          {/* LESIK_PROFILE_PAGE_TEST_RESULT_CARD - standalone */}
          <div className="client-status profile-test-result-profile-card">
            <div className="client-status-actions">
              <button type="button" className="status-help" aria-label="Как работает результат теста">
                ?
              </button>
            </div>
            <span>Результат теста</span>
            {profileTestResult ? (
              <>
                <strong>{profileTestResult.label}</strong>
                <p className="profile-test-result-profile-desc">
                  {profileTestResult.desc}
                </p>
                <div className="profile-test-result-profile-tags">
                  {(profileTestResult.focus || []).map((item: string) => (
                    <em key={item}>{item}</em>
                  ))}
                </div>
                <small>
                  Счёт: {profileTestResult.score || 0} из {profileTestResult.maxScore || 50} · прогрев: {profileTestResult.days || "—"}
                </small>
              </>
            ) : (
              <>
                <strong>Тест ещё не пройден</strong>
                <p className="profile-test-result-profile-desc">
                  После прохождения теста здесь появятся акценты для карты контента.
                </p>
              </>
            )}
          </div>
          <div className="client-status">
            <div className="client-status-actions">
              <button
                type="button"
                className="status-help"
                data-tooltip="Тариф влияет на доступные функции"
                aria-label="Как заполнить тариф"
              >
                ?
              </button>
              <button type="button" className="status-edit" onClick={() => setDetailsOpen(true)} aria-label="Редактировать тариф">
                ✎
              </button>
            </div>
            <span>Тариф</span>
            <b>
              {serviceAccessPaid
                ? `FULL${serviceAccessUntilText ? ` до ${serviceAccessUntilText}` : ""}`
                : details.tariff_plan === "pro"
                  ? `PRO${details.pro_paid_until ? ` до ${details.pro_paid_until}` : ""}`
                  : "FREE"}
            </b>
          </div>
        </div>

        <div className="profile-readiness-grid">
          <article className={audienceReady ? "readiness-card done" : "readiness-card danger"}>
            <div className="readiness-card-actions">
              <button
                type="button"
                className="readiness-help"
                data-tooltip="Заполните анализ аудитории или загрузите файл"
                aria-label="Как заполнить анализ аудитории"
              >
                ?
              </button>
              <button
                type="button"
                className="readiness-edit"
                onClick={() => setDetailsOpen(true)}
                aria-label="Редактировать анализ аудитории"
              >
                ✎
              </button>
            </div>
            <div className="readiness-card-header"><span>1</span><h2>Анализ аудитории</h2></div>
            <p>
              {audienceReady
                ? "Анализ аудитории заполнен — можно подключать анализ"
                : "Обязательно заполните анализ аудитории или вставьте распаковку клиента"}
            </p>
            <button type="button" className="audience-ai-start-button" style={{marginTop:"10px",fontSize:"13px",minHeight:"36px"}} onClick={() => { alert("😈 Потратьте время\n\nЕрунда здесь = ерунда в воронке\nЕрунда в воронке = нет продаж"); setAudienceAiOpen(true); }}>
              {audienceReady ? "Обновить анализ" : "Пройти интервью"}
            </button>
          </article>

          <article className={productReady ? "readiness-card done" : "readiness-card danger"}>
            <div className="readiness-card-actions">
              <button
                type="button"
                className="readiness-help"
                data-tooltip="Укажите статус и описание вашего продукта"
                aria-label="Как заполнить продукт"
              >
                ?
              </button>
              <button
                type="button"
                className="readiness-edit"
                onClick={() => setProductOpen(true)}
                aria-label="Редактировать продукт"
              >
                ✎
              </button>
            </div>
            <div className="readiness-card-header"><span>2</span><h2>Продукт</h2></div>
            <p>
              {productReady
                ? details.product_name
                : "Заполните название и описание продукта или услуги"}
            </p>
            {!productReady && (
              <button type="button" className="audience-ai-start-button" style={{marginTop:"10px",fontSize:"13px",minHeight:"36px"}} onClick={() => setProductOpen(true)}>
                Заполнить продукт
              </button>
            )}
          </article>

          <article className={Object.values(details.social_links).some(v => v.trim().length > 5) ? "readiness-card done" : "readiness-card danger"}>
            <div className="readiness-card-actions">
              <button type="button" className="readiness-help" data-tooltip="Добавьте ссылки на активные каналы" aria-label="Как заполнить соцсети">?</button>
              <button type="button" className="readiness-edit" onClick={() => setSocialOpen(true)} aria-label="Редактировать соцсети">✎</button>
            </div>
            <div className="readiness-card-header"><span>3</span><h2>Соцсети</h2></div>
            <p>
              {Object.values(details.social_links).some(v => v.trim().length > 5)
                ? Object.entries(details.social_links).filter(([,v]) => v.trim()).map(([k]) => k).join(", ")
                : "Добавьте ссылки на ваши активные каналы"}
            </p>
            {socialHasLinks && (
              <button
                type="button"
                className="audience-ai-start-button"
                style={{marginTop:"10px",fontSize:"13px",minHeight:"36px"}}
                onClick={runSocialLinksAnalysis}
                disabled={socialAnalysisLoading}
              >
                {socialAnalysisLoading ? `Анализирую... ${socialAnalysisProgress}%` : socialAnalysisReady ? "Обновить анализ соцсетей" : "Проанализировать соцсети"}
              </button>
            )}

            {socialAnalysisLoading && (
              <div className="social-analysis-progress-wrap">
                <div className="social-analysis-progress-bar">
                  <span style={{ width: `${socialAnalysisProgress}%` }} />
                </div>
              </div>
            )}

            {socialAnalysisReady && !socialAnalysisLoading && (
              <small className="social-analysis-ready">Анализ соцсетей готов и будет учитываться в карте контента</small>
            )}

            {!Object.values(details.social_links).some(v => v.trim().length > 5) && (
              <button type="button" className="audience-ai-start-button" style={{marginTop:"10px",fontSize:"13px",minHeight:"36px"}} onClick={() => setSocialOpen(true)}>
                Добавить ссылки
              </button>
            )}
          </article>

          <article className={(details.notify_email || details.notify_telegram) ? "readiness-card done" : "readiness-card danger"}>
            <div className="readiness-card-actions">
              <button type="button" className="readiness-help" data-tooltip="Выберите куда направлять уведомления" aria-label="Как заполнить уведомления">?</button>
              <button type="button" className="readiness-edit" onClick={() => setNotifyOpen(true)} aria-label="Редактировать уведомления">✎</button>
            </div>
            <div className="readiness-card-header"><span>4</span><h2>Уведомления</h2></div>
            <p>
              {[
                details.notify_email ? "Email" : "",
                details.notify_telegram ? "Telegram" : "",
              ].filter(Boolean).join(", ") || "Выберите, куда присылать уведомления"}
            </p>
            {!(details.notify_email || details.notify_telegram) && (
              <button type="button" className="audience-ai-start-button" style={{marginTop:"10px",fontSize:"13px",minHeight:"36px"}} onClick={() => setNotifyOpen(true)}>
                Настроить уведомления
              </button>
            )}
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
                упаковщик, стратег, критик и модератор идей</p>
            </div>
          </article>
        </div>

        <div className="client-actions profile-actions">
          <button type="button" className={audienceReady ? "secondary" : ""} onClick={() => { alert("😈 Потратьте время\n\nЕрунда здесь = ерунда в воронке\nЕрунда в воронке = нет продаж"); setDetailsOpen(true); }}>
            {audienceReady ? "Обновить анализ аудитории" : "Заполнить анализ аудитории"}
          </button>

          <button type="button" className={productReady ? "secondary" : ""} onClick={() => setProductOpen(true)}>
            {productReady ? "Обновить вопросы по продукту" : "Вопросы по продукту"}
          </button>

          <button type="button" className="secondary" onClick={() => setSocialOpen(true)}>
            Ссылки на соцсети
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
        </div>
      </div>

      {socialOpen && (
        <div className="profile-modal-backdrop" onClick={() => setSocialOpen(false)}>
          <div className="profile-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-head">
              <div>
                
                <h2>Ссылки на ваши каналы</h2>
              </div>
              <button type="button" onClick={() => setSocialOpen(false)}>×</button>
            </div>
            <p className="profile-modal-text">Вставьте ссылки на ваши активные каналы. ЛЕС<span className="brand-ik">ik</span> будет использовать их для анализа</p>
            <div className="social-links-grid">
              {([
                { key: "telegram", label: "Telegram", placeholder: "https://t.me/username", icon: "✈️" },
                { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/username", icon: "📸" },
                { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/@channel", icon: "▶️" },
                { key: "vk", label: "ВКонтакте", placeholder: "https://vk.com/username", icon: "🔵" },
                { key: "tiktok", label: "TikTok", placeholder: "https://tiktok.com/@username", icon: "🎵" },
                { key: "site", label: "Сайт", placeholder: "https://yoursite.ru", icon: "🌐" },
                { key: "other", label: "Другое", placeholder: "https://...", icon: "🔗" },
              ] as { key: keyof typeof details.social_links; label: string; placeholder: string; icon: string }[]).map(({ key, label, placeholder, icon }) => (
                <div key={key} className="social-link-row">
                  <span className="social-link-icon">{icon}</span>
                  <div className="social-link-field">
                    <span className="social-link-label">{label}</span>
                    <input
                      type="url"
                      value={details.social_links[key]}
                      placeholder={placeholder}
                      onChange={(e) => setDetails((prev) => ({ ...prev, social_links: { ...prev.social_links, [key]: e.target.value } }))}
                    />
                  </div>
                </div>
              ))}
            </div>
            {details.social_analysis && (
              <div className="social-analysis-result">
                <h3>Анализ соцсетей</h3>
                <p>{details.social_analysis}</p>
              </div>
            )}

            <div className="social-analysis-actions">
              <button type="button" className="modal-save-button secondary" onClick={() => { void saveDetails({ closeDetails: false }); setSocialOpen(false); }} disabled={saving}>
                {saving ? "Сохраняю..." : "Сохранить ссылки"}
              </button>

              <button type="button" className="modal-save-button" onClick={runSocialLinksAnalysis} disabled={saving || socialAnalysisLoading}>
                {socialAnalysisLoading ? `Анализирую... ${socialAnalysisProgress}%` : details.social_analysis ? "Обновить анализ" : "Проанализировать соцсети"}
              </button>
            </div>
          </div>
        </div>
      )}
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
              Выберите, где вы будете получать уведомления</p>

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
                  <p>Перейдите в бота и нажмите Start. После подключения ЛЕС<span className="brand-ik">ik</span> сможет присылать напоминания</p>
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


      {detailsOpen && (
        <div className="profile-modal-backdrop" onClick={() => setDetailsOpen(false)}>
          <div className="profile-modal profile-modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-head">
              <div>
                
                <h2>Аудитория и площадки</h2>
              </div>
              <button type="button" onClick={() => setDetailsOpen(false)}>×</button>
            </div>

            <div className="profile-form-block">
              <h3><span className="readiness-card-header"><span>1</span>Тариф</span></h3>
              <p>Тариф изменяется только после оплаты</p>
              <div className="tariff-display">
                <span className={(serviceAccessPaid || details.tariff_plan === "pro") ? "tariff-badge pro" : "tariff-badge free"}>
                  {serviceAccessPaid
                    ? `FULL${serviceAccessUntilText ? ` до ${serviceAccessUntilText}` : ""}`
                    : details.tariff_plan === "pro"
                      ? `PRO${details.pro_paid_until ? ` до ${details.pro_paid_until}` : ""}`
                      : "FREE"}
                </span>
              </div>
            </div>

            <div className="profile-form-block">
              <h3><span className="readiness-card-header"><span>2</span>Анализ аудитории</span></h3>
              <p>
                Вставьте сюда распаковку аудитории: кто эти люди, что болит,
                чего хотят, почему подписываются, почему покупают или сомневаются</p>
              {details.audience_analysis && (
                <textarea
                  value={cleanAnalysis(details.audience_analysis)}
                  placeholder="Например: аудитория — эксперты и онлайн-школы, хотят системно получать заявки..."
                  onChange={(e) => setDetails((prev) => ({ ...prev, audience_analysis: e.target.value }))}
                />
              )}
              
              <div className="audience-upload-box">
                <div>
                  <h4>Или загрузите файл для разбора</h4>
                  <p>Подойдут скриншоты, PDF, DOCX, TXT, аудио</p>
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
                }}
              >
                Запустить интервью по аудитории
              </button>
            </div>
            <button type="button" className="modal-save-button" onClick={() => void saveDetails()} disabled={saving}>
              {saving ? "Сохраняю..." : "Сохранить глубокий профиль"}
            </button>
          </div>
        </div>
      )}

      {audienceAiOpen && (
        <div className="profile-modal-backdrop" onClick={() => setAudienceAiOpen(false)}>
          <div className="profile-modal profile-modal-large audience-ai-modal" onClick={(e) => e.stopPropagation()}>
            <div className="profile-modal-head">
              <div>
                
                <h2>Интервью по аудитории</h2>
              </div>
              <button type="button" onClick={() => setAudienceAiOpen(false)}>×</button>
            </div>

            <div className="profile-progress">
              <span>Вопрос {audienceStep + 1} из {audienceQuestions.length}</span>
              <b>{Math.round(((audienceStep + 1) / audienceQuestions.length) * 100)}%</b>
            </div>
            <div className="profile-progress-line">
              <div style={{ width: `${Math.round(((audienceStep + 1) / audienceQuestions.length) * 100)}%` }} />
            </div>

            {toastMsg && (
              <div className="audience-toast">{toastMsg}</div>
            )}
            {!audienceAiDraft ? (
              <div className="audience-ai-question-box">
                <h3>{audienceQuestions[audienceStep]}</h3>
                <textarea
                  value={audienceAiAnswers[audienceStep]?.answer || audienceAiAnswer}
                  placeholder="Введите ответ..."
                  onChange={(e) => {
                    setAudienceAiAnswer(e.target.value);
                    const updated = [...audienceAiAnswers];
                    updated[audienceStep] = { question: audienceQuestions[audienceStep], answer: e.target.value };
                    setAudienceAiAnswers(updated);
                  }}
                />
                <button
                  type="button"
                  className="modal-save-button"
                  disabled={audienceAiLoading || ((audienceAiAnswers[audienceStep]?.answer || audienceAiAnswer).trim().length < 25)}
                  style={(!audienceAiLoading && ((audienceAiAnswers[audienceStep]?.answer || audienceAiAnswer).trim().length < 25)) ? {
                    opacity: 0.42,
                    filter: "grayscale(0.35) saturate(0.65)",
                    cursor: "not-allowed",
                    boxShadow: "none",
                    transform: "none",
                  } : undefined}
                  onClick={async () => {
                    const val = (audienceAiAnswers[audienceStep]?.answer || audienceAiAnswer).trim();
                    if (val.length < 25) {
                      setToastMsg("Упс — слишком мало информации о любимом клиенте 😊 Расскажите подробнее!");
      setTimeout(() => setToastMsg(""), 3000);
                      return;
                    }
                    const current = audienceAiAnswers[audienceStep]?.answer || audienceAiAnswer;
                    const updated = [...audienceAiAnswers];
                    updated[audienceStep] = { question: audienceQuestions[audienceStep], answer: current.trim() };
                    setAudienceAiAnswers(updated);
                    setAudienceAiAnswer("");
                    if (audienceStep < audienceQuestions.length - 1) {
                      setAudienceStep(audienceStep + 1);
                    } else {
                      setAudienceAiLoading(true);
                      await runAudienceAiAnalysis(updated);
                      setAudienceAiLoading(false);
                    }
                  }}
                >
                  {audienceAiLoading ? `Анализирую... ${socialAnalysisProgress}%` : audienceStep < audienceQuestions.length - 1 ? "Дальше" : "Получить анализ"}
                </button>
                {audienceAiLoading && (
                  <div className="analyzing-loader">
                    <div className="fir-emoji-grow">🌲</div>
                    <p>Анализирую ваши ответы — обычно 10–20 секунд</p>
                  </div>
                )}
                {audienceStep > 0 && (
                  <button type="button" className="back-button" onClick={() => { setAudienceStep(audienceStep - 1); setAudienceAiAnswer(audienceAiAnswers[audienceStep - 1]?.answer || ""); }}>
                    Назад
                  </button>
                )}
              </div>
            ) : (
              <div className="audience-ai-result-box">
                <h3>Анализ аудитории готов</h3>
                <textarea
                  value={cleanAnalysis(audienceAiDraft)}
                  onChange={(e) => setAudienceAiDraft(e.target.value)}
                />
                <div className="audience-ai-actions">
                  <button type="button" className="modal-save-button" onClick={saveAudienceAiDraft} disabled={saving}>
                    {saving ? "Сохраняю..." : "Сохранить в профиль"}
                  </button>
                  <button type="button" className="modal-secondary-button" onClick={() => {
                    setAudienceAiDraft("");
                    setAudienceAiAnswers([]);
                    setAudienceAiAnswer("");
                    setAudienceStep(0);
                  }}>
                    Начать заново
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

            <button type="button" className="modal-save-button" onClick={() => void saveDetails()} disabled={saving}>
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

            <button type="button" className="modal-save-button" onClick={() => void saveDetails()} disabled={saving}>
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

            <button type="button" className="modal-save-button" onClick={() => void saveDetails()} disabled={saving}>
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

            <button type="button" className="modal-save-button" onClick={() => void saveDetails()} disabled={saving}>
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
              <h3>Основная площадка воронки</h3>
              <div className="product-status-row">
                {["Telegram", "Instagram", "YouTube", "VK"].map((ch) => (
                  <button
                    key={ch}
                    type="button"
                    className={details.channel === ch ? "selected" : ""}
                    onClick={() => setDetails((prev) => ({ ...prev, channel: ch }))}
                  >
                    {ch}
                  </button>
                ))}
              </div>
            </div>

            {details.channel === "Telegram" && (
              <div className="profile-form-block telegram-block">
                <h3>Описание Telegram-бота</h3>
                <p className="form-hint">Обязательные документы и точка входа в воронку для description бота</p>

                <div className="profile-form-block">
                  <h4>Короткое описание</h4>
                  <textarea
                    value={details.bot_description_short}
                    placeholder="О чём бот в двух словах..."
                    onChange={(e) => setDetails((prev) => ({ ...prev, bot_description_short: e.target.value }))}
                  />
                </div>

                <div className="profile-form-block two-cols">
                  <div>
                    <h4>Ссылка на политику конфиденциальности</h4>
                    <input
                      value={details.privacy_policy_url}
                      placeholder="https://..."
                      onChange={(e) => setDetails((prev) => ({ ...prev, privacy_policy_url: e.target.value }))}
                    />
                    {details.privacy_policy_url.trim() && !isValidHttpUrl(details.privacy_policy_url) && (
                      <p className="form-hint telegram-error">Ссылка должна начинаться с http:// или https://</p>
                    )}
                  </div>
                  <div>
                    <h4>Ссылка на оферту</h4>
                    <input
                      value={details.offer_url}
                      placeholder="https://..."
                      onChange={(e) => setDetails((prev) => ({ ...prev, offer_url: e.target.value }))}
                    />
                    {details.offer_url.trim() && !isValidHttpUrl(details.offer_url) && (
                      <p className="form-hint telegram-error">Ссылка должна начинаться с http:// или https://</p>
                    )}
                  </div>
                </div>

                <div className="profile-form-block two-cols">
                  <div>
                    <h4>Точка входа в воронку</h4>
                    <input
                      value={details.entry_keyword_or_link}
                      placeholder="Кодовое слово или deep-link t.me/bot?start=..."
                      onChange={(e) => setDetails((prev) => ({ ...prev, entry_keyword_or_link: e.target.value }))}
                    />
                    {!details.entry_keyword_or_link.trim() && details.keyword.trim() && (
                      <p className="form-hint lead-magnet-suggestion">
                        Подсказка: «{details.keyword}»{" "}
                        <button
                          type="button"
                          className="suggestion-apply-button"
                          onClick={() => setDetails((prev) => ({ ...prev, entry_keyword_or_link: details.keyword }))}
                        >
                          Подставить
                        </button>
                      </p>
                    )}
                  </div>
                  <div>
                    <h4>Подпись кнопки входа</h4>
                    <input
                      value={details.entry_button_label}
                      placeholder="Начать"
                      maxLength={30}
                      onChange={(e) => setDetails((prev) => ({ ...prev, entry_button_label: e.target.value }))}
                    />
                  </div>
                </div>

                <div className="telegram-preview-box">
                  <p className="form-hint telegram-preview-label">Превью description бота</p>
                  <p className={telegramDescOverLimit ? "telegram-preview-text telegram-error" : "telegram-preview-text"}>
                    {assembledTelegramDescription || "Заполните поля выше"}
                  </p>
                  <p className={telegramDescOverLimit ? "telegram-char-counter telegram-error" : "telegram-char-counter"}>
                    {telegramDescLength}/120{telegramDescOverLimit ? " — превышен лимит, сократите текст" : ""}
                  </p>

                  <p className="form-hint telegram-preview-label" style={{ marginTop: 14 }}>Превью кнопки входа</p>
                  <div className="telegram-entry-button-preview">
                    {details.entry_button_label.trim() || "Начать"}
                  </div>
                </div>
              </div>
            )}

            <>
                <div className="profile-form-block">
                  <h3>Название продукта</h3>
                  <input
                    value={details.product_name}
                    placeholder="Например: настройка Salebot под ключ"
                    maxLength={60}
                    onChange={(e) => setDetails((prev) => ({ ...prev, product_name: e.target.value }))}
                  />
                  <p className="form-hint">{details.product_name.length}/60</p>
                </div>

                <div className="profile-form-block">
                  <h3>Что даёт продукт?</h3>
                  <textarea
                    value={details.product_description}
                    placeholder="Опишите результат, формат, стоимость, кому подходит..."
                    maxLength={300}
                    onChange={(e) => setDetails((prev) => ({ ...prev, product_description: e.target.value }))}
                  />
                  <p className="form-hint">{details.product_description.length}/300</p>
                </div>

                <div className="profile-form-block two-cols">
                  <div>
                    <h3>Цена</h3>
                    <input
                      type="number"
                      value={details.price || ""}
                      placeholder="Например: 15000"
                      onChange={(e) => setDetails((prev) => ({ ...prev, price: Number(e.target.value) || 0 }))}
                    />
                  </div>

                  <div>
                    <h3>Валюта</h3>
                    <select
                      value={details.price_currency}
                      onChange={(e) => setDetails((prev) => ({ ...prev, price_currency: e.target.value }))}
                    >
                      <option value="RUB">RUB ₽</option>
                      <option value="USD">USD $</option>
                      <option value="EUR">EUR €</option>
                      <option value="KZT">KZT ₸</option>
                    </select>
                  </div>
                </div>

                <div className="profile-form-block">
                  <h3>Кодовое слово</h3>
                  <input
                    value={details.keyword}
                    placeholder="Например: бот"
                    maxLength={20}
                    onChange={(e) => setDetails((prev) => ({ ...prev, keyword: e.target.value.replace(/\s+/g, "") }))}
                  />
                  <p className="form-hint">Одно слово, до 20 символов — клиент напишет его в директ</p>
                  {!details.keyword.trim() && (
                    <p className="form-hint lead-magnet-suggestion">
                      Подсказка: «бот»{" "}
                      <button
                        type="button"
                        className="suggestion-apply-button"
                        onClick={() => setDetails((prev) => ({ ...prev, keyword: "бот" }))}
                      >
                        Подставить
                      </button>
                    </p>
                  )}
                </div>

                <div className="profile-form-block two-cols">
                  <div>
                    <h3>Название бесплатного подарка</h3>
                    <input
                      value={details.lead_magnet_title}
                      placeholder="Если пусто — подберём автоматически"
                      onChange={(e) => setDetails((prev) => ({ ...prev, lead_magnet_title: e.target.value }))}
                    />
                    {!details.lead_magnet_title.trim() && answers.niche.trim() && (
                      <p className="form-hint lead-magnet-suggestion">
                        Подсказка: «Чек-лист по теме {answers.niche}»{" "}
                        <button
                          type="button"
                          className="suggestion-apply-button"
                          onClick={() => setDetails((prev) => ({ ...prev, lead_magnet_title: `Чек-лист по теме ${answers.niche}` }))}
                        >
                          Подставить
                        </button>
                      </p>
                    )}
                  </div>

                  <div>
                    <h3>Файл или ссылка на подарок</h3>
                    <input
                      value={details.lead_magnet_file}
                      placeholder="Ссылка на PDF, гайд, чек-лист..."
                      onChange={(e) => setDetails((prev) => ({ ...prev, lead_magnet_file: e.target.value }))}
                    />
                    {!details.lead_magnet_file.trim() && (
                      <p className="form-hint lead-magnet-suggestion">
                        Подсказка: «Без файла — текстом в боте»{" "}
                        <button
                          type="button"
                          className="suggestion-apply-button"
                          onClick={() => setDetails((prev) => ({ ...prev, lead_magnet_file: "Без файла — текстом в боте" }))}
                        >
                          Подставить
                        </button>
                      </p>
                    )}
                  </div>
                </div>

                <div className="profile-form-block">
                  <h3>Текст на кнопке для клиента</h3>
                  <input
                    value={details.cta_text}
                    placeholder="Хочу разобрать свою ситуацию"
                    maxLength={80}
                    onChange={(e) => setDetails((prev) => ({ ...prev, cta_text: e.target.value }))}
                  />
                  <p className="form-hint">
                    Например: «Хочу узнать больше» или «Хочу разобрать свою ситуацию» — то, что нажмёт клиент, чтобы перейти к покупке
                  </p>
                  {!details.cta_text.trim() && (
                    <p className="form-hint lead-magnet-suggestion">
                      Подсказка: «Хочу разобрать свою ситуацию»{" "}
                      <button
                        type="button"
                        className="suggestion-apply-button"
                        onClick={() => setDetails((prev) => ({ ...prev, cta_text: "Хочу разобрать свою ситуацию" }))}
                      >
                        Подставить
                      </button>
                    </p>
                  )}
                </div>

                <div className="profile-form-block two-cols">
                  <div>
                    <h3>Почему покупают?</h3>
                    <textarea
                      value={details.why_buy}
                      placeholder="Какие причины покупки, какие триггеры, что важно клиенту..."
                      onChange={(e) => setDetails((prev) => ({ ...prev, why_buy: e.target.value }))}
                    />
                    {!details.why_buy.trim() && suggestedWhyBuy && (
                      <p className="form-hint lead-magnet-suggestion">
                        Из анализа аудитории: «{suggestedWhyBuy.slice(0, 120)}{suggestedWhyBuy.length > 120 ? "…" : ""}»{" "}
                        <button
                          type="button"
                          className="suggestion-apply-button"
                          onClick={() => setDetails((prev) => ({ ...prev, why_buy: suggestedWhyBuy }))}
                        >
                          Подставить
                        </button>
                      </p>
                    )}
                  </div>

                  <div>
                    <h3>Почему не покупают?</h3>
                    <textarea
                      value={details.why_not_buy}
                      placeholder="Какие страхи, возражения, сомнения, барьеры..."
                      onChange={(e) => setDetails((prev) => ({ ...prev, why_not_buy: e.target.value }))}
                    />
                    {!details.why_not_buy.trim() && suggestedWhyNotBuy && (
                      <p className="form-hint lead-magnet-suggestion">
                        Из анализа аудитории: «{suggestedWhyNotBuy.slice(0, 120)}{suggestedWhyNotBuy.length > 120 ? "…" : ""}»{" "}
                        <button
                          type="button"
                          className="suggestion-apply-button"
                          onClick={() => setDetails((prev) => ({ ...prev, why_not_buy: suggestedWhyNotBuy }))}
                        >
                          Подставить
                        </button>
                      </p>
                    )}
                  </div>
                </div>
              </>

            {!telegramBlockValid && (
              <p className="form-hint telegram-error" style={{ marginTop: 10 }}>
                Заполните корректно блок Telegram: короткое описание, рабочие ссылки на политику и оферту, точку входа — и не превышайте 120 символов в итоговом description.
              </p>
            )}
            <button
              type="button"
              className="modal-save-button"
              onClick={() => void saveProductWithTelegramCheck()}
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
