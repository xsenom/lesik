from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Response, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, EmailStr
from pathlib import Path
from datetime import datetime, timedelta
from dotenv import load_dotenv
from openai import OpenAI
import sqlite3
import os
import json
import re
import base64
import tempfile
import mimetypes
from io import BytesIO
import uuid

BASE_DIR = Path(__file__).parent
DB_PATH = BASE_DIR / "lesik.db"
PROMPT_PATH = BASE_DIR / "prompts" / "content_map.md"
FUNNEL_PROMPT_PATH = BASE_DIR / "prompts" / "funnel.md"
AI_ROLES_DIR = BASE_DIR / "prompts" / "ai_roles"

AI_ROLE_FILES = {
    "audience_architect": "01_Архитектор_позиционирования_и_ЦА.txt",
    "social_strategy": "02_Стратег_продвижения_в_соцсетях.txt",
    "product_architect": "03_Продуктовый_архитектор.txt",
    "daily_manager": "04_Ежедневный_менеджер_продвижения.txt",
    "marketing_office": "05_Маркетинговый_офис_10_сотрудников.txt",
}

load_dotenv(BASE_DIR / ".env")

OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "").strip()
OPENAI_MODEL = os.getenv("OPENAI_MODEL", "gpt-5.4-mini").strip()

app = FastAPI(title="LESik API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
    ],
    allow_origin_regex=r"https?://(localhost|127\.0\.0\.1):3000",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProfileIn(BaseModel):
    name: str
    email: EmailStr
    client_type: str
    niche: str
    platform: str
    primary_platform: str = ""
    monthly_goal: str
    blocker: str

class EmailIn(BaseModel):
    email: EmailStr


class ContentMapSaveIn(BaseModel):
    email: EmailStr
    map: dict


class FunnelSaveIn(BaseModel):
    email: EmailStr
    funnel: dict


class ContentMapDiscussIn(BaseModel):
    email: EmailStr
    item: dict
    question: str
    agent: str = "daily_manager"


class AudienceAnalysisIn(BaseModel):
    email: EmailStr
    base_text: str = ""
    answers: list[dict] = []


class ProfileDetailsIn(BaseModel):
    email: EmailStr
    notify_email: bool = True
    notify_telegram: bool = False
    platforms: list[str] = []
    audience_analysis: str = ""
    product_status: str = ""
    product_name: str = ""
    product_description: str = ""
    why_buy: str = ""
    why_not_buy: str = ""
    product_ideas_request: str = ""
    tariff_plan: str = "free"
    pro_paid_until: str = ""
    social_links: str = "{}"
    channel: str = ""
    price: float = 0
    price_currency: str = "RUB"
    keyword: str = ""
    cta_text: str = ""
    lead_magnet_title: str = ""
    lead_magnet_file: str = ""
    funnel_dirty: bool = False
    bot_description_short: str = ""
    privacy_policy_url: str = ""
    offer_url: str = ""
    entry_keyword_or_link: str = ""
    entry_button_label: str = ""


class TelegramBlockIn(BaseModel):
    email: EmailStr
    bot_description_short: str = ""
    privacy_policy_url: str = ""
    offer_url: str = ""
    entry_keyword_or_link: str = ""
    entry_button_label: str = ""


class PaymentIn(BaseModel):
    email: EmailStr
    amount: float = 0
    status: str = "paid"


class VideoIn(BaseModel):
    title: str
    description: str = ""
    url: str
    is_active: bool = True

def db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    with db() as conn:
        conn.execute("""
        CREATE TABLE IF NOT EXISTS profiles (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT NOT NULL,
            client_type TEXT NOT NULL,
            niche TEXT NOT NULL,
            platform TEXT NOT NULL,
            monthly_goal TEXT NOT NULL,
            blocker TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """)

        conn.execute("""
        CREATE TABLE IF NOT EXISTS content_maps (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            profile_id INTEGER,
            map_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """)

        conn.execute("""
        CREATE TABLE IF NOT EXISTS funnels (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            profile_id INTEGER,
            funnel_json TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """)

        conn.execute("""
        CREATE TABLE IF NOT EXISTS profile_details (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            details_json TEXT NOT NULL,
            updated_at TEXT NOT NULL
        )
        """)

        conn.execute("""
        CREATE TABLE IF NOT EXISTS payments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL,
            amount REAL NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'paid',
            paid_at TEXT NOT NULL,
            created_at TEXT NOT NULL
        )
        """)

        conn.execute("""
        CREATE TABLE IF NOT EXISTS videos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL DEFAULT '',
            url TEXT NOT NULL,
            is_active INTEGER NOT NULL DEFAULT 1,
            created_at TEXT NOT NULL
        )
        """)

        conn.execute("""
        CREATE TABLE IF NOT EXISTS video_views (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            video_id INTEGER NOT NULL,
            email TEXT,
            viewed_at TEXT NOT NULL
        )
        """)

@app.on_event("startup")
def startup():
    init_db()
    with db() as conn:
        count = conn.execute("SELECT COUNT(*) AS c FROM videos").fetchone()["c"]
        if count == 0:
            now = datetime.utcnow().isoformat()
            conn.executemany(
                """
                INSERT INTO videos (title, description, url, is_active, created_at)
                VALUES (?, ?, ?, ?, ?)
                """,
                [
                    ("Как пользоваться ЛЕСik", "Короткое видео: как идти маленькими шагами и не терять фокус.", "https://www.youtube.com/watch?v=dQw4w9WgXcQ", 1, now),
                    ("Как продавать через контент", "Почему контент должен вести к цели, а не просто заполнять ленту.", "https://www.youtube.com/watch?v=ysz5S6PUM-U", 1, now),
                    ("Mini App в Telegram", "Кабинет, уведомления и ежедневные задачи.", "https://www.youtube.com/watch?v=jNQXAC9IVRw", 1, now),
                ],
            )

@app.get("/health")
def health():
    return {"ok": True}


def load_ai_role_prompt(agent: str) -> str:
    key = (agent or "").strip()
    filename = AI_ROLE_FILES.get(key)
    if not filename:
        return ""
    path = AI_ROLES_DIR / filename
    if not path.exists():
        return ""
    return path.read_text(encoding="utf-8").strip()


@app.get("/ai/roles")
def get_ai_roles():
    return {
        "roles": [
            {"key": key, "file": filename}
            for key, filename in AI_ROLE_FILES.items()
        ]
    }


@app.get("/videos")
def get_videos():
    with db() as conn:
        rows = conn.execute(
            """
            SELECT id, title, description, url, is_active, created_at
            FROM videos
            WHERE is_active = 1
            ORDER BY id DESC
            """
        ).fetchall()
    return {"videos": [dict(r) for r in rows]}


@app.get("/admin/videos")
def admin_get_videos():
    with db() as conn:
        rows = conn.execute(
            """
            SELECT id, title, description, url, is_active, created_at
            FROM videos
            ORDER BY id DESC
            """
        ).fetchall()
        views = conn.execute(
            """
            SELECT video_id, COUNT(*) AS views
            FROM video_views
            GROUP BY video_id
            """
        ).fetchall()

    view_map = {v["video_id"]: int(v["views"]) for v in views}
    result = []
    for row in rows:
        item = dict(row)
        item["views"] = view_map.get(item["id"], 0)
        result.append(item)
    return {"videos": result}


@app.post("/admin/videos")
def admin_create_video(data: VideoIn):
    with db() as conn:
        conn.execute(
            """
            INSERT INTO videos (title, description, url, is_active, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                data.title.strip(),
                data.description.strip(),
                data.url.strip(),
                1 if data.is_active else 0,
                datetime.utcnow().isoformat(),
            ),
        )
    return {"ok": True}


@app.put("/admin/videos/{video_id}")
def admin_update_video(video_id: int, data: VideoIn):
    with db() as conn:
        conn.execute(
            """
            UPDATE videos
            SET title = ?, description = ?, url = ?, is_active = ?
            WHERE id = ?
            """,
            (
                data.title.strip(),
                data.description.strip(),
                data.url.strip(),
                1 if data.is_active else 0,
                video_id,
            ),
        )
    return {"ok": True}


@app.delete("/admin/videos/{video_id}")
def admin_delete_video(video_id: int):
    with db() as conn:
        conn.execute("DELETE FROM videos WHERE id = ?", (video_id,))
    return {"ok": True}


@app.post("/videos/{video_id}/view")
def add_video_view(video_id: int, data: EmailIn | None = None):
    email = str(data.email).strip().lower() if data else ""
    with db() as conn:
        conn.execute(
            """
            INSERT INTO video_views (video_id, email, viewed_at)
            VALUES (?, ?, ?)
            """,
            (video_id, email, datetime.utcnow().isoformat()),
        )
    return {"ok": True}

@app.post("/profiles")
def create_profile(data: ProfileIn):
    with db() as conn:
        conn.execute(
            """
            INSERT INTO profiles (
                name, email, client_type, niche, platform, primary_platform, monthly_goal, blocker, created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """,
            (
                data.name.strip(),
                data.email.strip().lower(),
                data.client_type.strip(),
                data.niche.strip(),
                data.platform.strip(),
                data.primary_platform.strip(),
                data.monthly_goal.strip(),
                data.blocker.strip(),
                datetime.utcnow().isoformat(),
            ),
        )
    return {"ok": True}

@app.get("/profiles/by-email")
def get_profile_by_email(email: str):
    with db() as conn:
        row = conn.execute(
            """
            SELECT id, name, email, client_type, niche, platform, primary_platform, monthly_goal, blocker, created_at
            FROM profiles
            WHERE email = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (email.strip().lower(),),
        ).fetchone()

    return {"profile": dict(row) if row else None}


def _count_since(table: str, date_col: str, since: datetime | None = None) -> int:
    with db() as conn:
        if since is None:
            row = conn.execute(f"SELECT COUNT(*) AS c FROM {table}").fetchone()
        else:
            row = conn.execute(
                f"SELECT COUNT(*) AS c FROM {table} WHERE {date_col} >= ?",
                (since.isoformat(),),
            ).fetchone()
    return int(row["c"] if row else 0)


@app.get("/admin/dashboard")
def get_admin_dashboard():
    now = datetime.utcnow()
    day_start = datetime(now.year, now.month, now.day)
    week_start = day_start - timedelta(days=6)

    registrations = {
        "today": _count_since("profiles", "created_at", day_start),
        "week": _count_since("profiles", "created_at", week_start),
        "total": _count_since("profiles", "created_at"),
    }

    payments = {
        "today": _count_since("payments", "paid_at", day_start),
        "week": _count_since("payments", "paid_at", week_start),
        "total": _count_since("payments", "paid_at"),
    }

    with db() as conn:
        video_total = conn.execute("SELECT COUNT(*) AS c FROM video_views").fetchone()
        by_video = conn.execute(
            """
            SELECT v.id, v.title, COUNT(vv.id) AS views
            FROM videos v
            LEFT JOIN video_views vv ON vv.video_id = v.id
            GROUP BY v.id, v.title
            ORDER BY views DESC, v.id DESC
            """
        ).fetchall()

    return {
        "registrations": registrations,
        "payments": payments,
        "video_views": {
            "total": int(video_total["c"] if video_total else 0),
            "by_video": [dict(r) for r in by_video],
        },
    }


@app.get("/admin/profiles")
def get_admin_profiles():
    with db() as conn:
        profiles = conn.execute(
            """
            SELECT p.id, p.name, p.email, p.client_type, p.niche, p.platform, p.primary_platform, p.monthly_goal, p.blocker, p.created_at
            FROM profiles p
            ORDER BY p.id DESC
            """
        ).fetchall()
        details = conn.execute(
            """
            SELECT email, details_json, MAX(id) AS max_id
            FROM profile_details
            GROUP BY email
            """
        ).fetchall()

    details_map = {}
    for row in details:
        try:
            details_map[row["email"]] = json.loads(row["details_json"])
        except Exception:
            details_map[row["email"]] = {}

    result = []
    for p in profiles:
        item = dict(p)
        item["details"] = details_map.get(item["email"], {})
        result.append(item)
    return {"profiles": result}


@app.post("/admin/payments")
def add_payment(data: PaymentIn):
    email = str(data.email).strip().lower()
    with db() as conn:
        conn.execute(
            """
            INSERT INTO payments (email, amount, status, paid_at, created_at)
            VALUES (?, ?, ?, ?, ?)
            """,
            (
                email,
                float(data.amount or 0),
                data.status.strip() or "paid",
                datetime.utcnow().isoformat(),
                datetime.utcnow().isoformat(),
            ),
        )
    return {"ok": True}

@app.get("/content-map/by-email")
def get_content_map_by_email(email: str):
    with db() as conn:
        row = conn.execute(
            """
            SELECT id, email, profile_id, map_json, created_at
            FROM content_maps
            WHERE email = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (email.strip().lower(),),
        ).fetchone()

    if not row:
        return {"content_map": None}

    result = dict(row)
    result["map"] = json.loads(result.pop("map_json"))
    return {"content_map": result}

@app.get("/funnel/by-email")
def get_funnel_by_email(email: str):
    with db() as conn:
        row = conn.execute(
            """
            SELECT id, email, profile_id, funnel_json, created_at
            FROM funnels
            WHERE email = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (email.strip().lower(),),
        ).fetchone()

    if not row:
        return {"funnel": None}

    result = dict(row)
    result["funnel"] = json.loads(result.pop("funnel_json"))
    return {"funnel": result}


@app.post("/content-map/generate")
def generate_content_map(data: EmailIn):
    email = data.email.strip().lower()

    with db() as conn:
        profile = conn.execute(
            """
            SELECT id, name, email, client_type, niche, platform, primary_platform, monthly_goal, blocker, created_at
            FROM profiles
            WHERE email = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (email,),
        ).fetchone()

    if not profile:
        raise HTTPException(status_code=404, detail="profile_not_found")

    prompt = PROMPT_PATH.read_text(encoding="utf-8")

    profile_dict = dict(profile)

    details_dict = {}
    with db() as conn:
        details_row = conn.execute(
            """
            SELECT details_json
            FROM profile_details
            WHERE email = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (email,),
        ).fetchone()
    if details_row:
        try:
            details_dict = json.loads(details_row["details_json"])
        except Exception:
            details_dict = {}

    user_payload = {
        "profile": profile_dict,
        "audience_analysis": details_dict.get("audience_analysis", ""),
        "product_status": details_dict.get("product_status", ""),
        "product_name": details_dict.get("product_name", ""),
        "product_description": details_dict.get("product_description", ""),
        "why_buy": details_dict.get("why_buy", ""),
        "why_not_buy": details_dict.get("why_not_buy", ""),
        "social_links": details_dict.get("social_links", ""),
        "platforms": details_dict.get("platforms", []),
    }

    if OPENAI_API_KEY and not OPENAI_API_KEY.startswith("вставь"):
        client = OpenAI(api_key=OPENAI_API_KEY)

        try:
            response = client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": json.dumps(user_payload, ensure_ascii=False)}
                ],
                response_format={"type": "json_object"},
            )

            raw = response.choices[0].message.content or "{}"
            result = json.loads(raw)
        except Exception as e:
            print("OPENAI_ERROR:", repr(e))
            result = build_fallback_map(profile_dict)
    else:
        result = build_fallback_map(profile_dict)

    with db() as conn:
        conn.execute(
            """
            INSERT INTO content_maps (email, profile_id, map_json, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (
                email,
                profile_dict["id"],
                json.dumps(result, ensure_ascii=False),
                datetime.utcnow().isoformat(),
            ),
        )

    return {"ok": True, "map": result}


@app.post("/content-map/save")
def save_content_map(data: ContentMapSaveIn):
    email = str(data.email).strip().lower()

    with db() as conn:
        row = conn.execute(
            """
            SELECT profile_id
            FROM content_maps
            WHERE email = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (email,),
        ).fetchone()

        conn.execute(
            """
            INSERT INTO content_maps (email, profile_id, map_json, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (
                email,
                row["profile_id"] if row else None,
                json.dumps(data.map, ensure_ascii=False),
                datetime.utcnow().isoformat(),
            ),
        )

    return {"ok": True}


@app.post("/funnel/generate")
def generate_funnel(data: EmailIn):
    email = data.email.strip().lower()

    with db() as conn:
        profile = conn.execute(
            """
            SELECT id, name, email, client_type, niche, platform, primary_platform, monthly_goal, blocker, created_at
            FROM profiles
            WHERE email = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (email,),
        ).fetchone()

    if not profile:
        raise HTTPException(status_code=404, detail="profile_not_found")

    prompt = FUNNEL_PROMPT_PATH.read_text(encoding="utf-8")
    profile_dict = dict(profile)

    details_dict = {}
    with db() as conn:
        details_row = conn.execute(
            """
            SELECT details_json
            FROM profile_details
            WHERE email = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (email,),
        ).fetchone()
    if details_row:
        try:
            details_dict = json.loads(details_row["details_json"])
        except Exception:
            details_dict = {}

    channel = details_dict.get("channel", "")
    keyword = (details_dict.get("keyword", "") or "").strip()
    cta_text = (details_dict.get("cta_text", "") or "").strip() or "Хочу разобрать свою ситуацию"
    price = details_dict.get("price", 0) or 0
    price_currency = details_dict.get("price_currency", "RUB") or "RUB"
    lead_magnet_title = (details_dict.get("lead_magnet_title", "") or "").strip()
    lead_magnet_file = (details_dict.get("lead_magnet_file", "") or "").strip()
    product_name = details_dict.get("product_name", "")

    user_payload = {
        "profile": profile_dict,
        "audience_analysis": details_dict.get("audience_analysis", ""),
        "product_status": details_dict.get("product_status", ""),
        "product_name": product_name,
        "product_description": details_dict.get("product_description", ""),
        "why_buy": details_dict.get("why_buy", ""),
        "why_not_buy": details_dict.get("why_not_buy", ""),
        "social_links": details_dict.get("social_links", ""),
        "platforms": details_dict.get("platforms", []),
        "channel": channel,
        "keyword": keyword,
        "cta_text": cta_text,
        "price": price,
        "price_currency": price_currency,
        "lead_magnet_title": lead_magnet_title,
        "lead_magnet_file": lead_magnet_file,
    }

    if OPENAI_API_KEY and not OPENAI_API_KEY.startswith("вставь"):
        client = OpenAI(api_key=OPENAI_API_KEY)
        try:
            response = client.chat.completions.create(
                model=OPENAI_MODEL,
                messages=[
                    {"role": "system", "content": prompt},
                    {"role": "user", "content": json.dumps(user_payload, ensure_ascii=False)}
                ],
                response_format={"type": "json_object"},
            )
            raw = response.choices[0].message.content or "{}"
            result = json.loads(raw)
        except Exception as e:
            print("OPENAI_ERROR:", repr(e))
            result = build_fallback_funnel(profile_dict, details_dict)
    else:
        result = build_fallback_funnel(profile_dict, details_dict)

    # Детерминированная подстановка точных значений из карточки продукта (ТЗ п.3.1)
    for stage in result.get("stages", []):
        if stage.get("id") == "codeword":
            if keyword:
                stage["codeword"] = keyword
                stage["auto_reply_text"] = (
                    f"Напиши «{keyword}» — и я сразу пришлю короткий материал по теме."
                )
        if stage.get("id") == "lead_magnet":
            if lead_magnet_title:
                stage["lead_magnet_name"] = lead_magnet_title
            if lead_magnet_file:
                stage["lead_magnet_file"] = lead_magnet_file
        if stage.get("id") == "offer":
            stage["cta_text"] = cta_text
            if price:
                stage["price"] = price
                stage["price_currency"] = price_currency

    result["_source_snapshot"] = {
        "channel": channel,
        "product_name": product_name,
        "product_description": details_dict.get("product_description", ""),
        "price": price,
        "keyword": keyword,
        "cta_text": cta_text,
        "lead_magnet_title": lead_magnet_title,
        "lead_magnet_file": lead_magnet_file,
    }

    with db() as conn:
        conn.execute(
            """
            INSERT INTO funnels (email, profile_id, funnel_json, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (
                email,
                profile_dict["id"],
                json.dumps(result, ensure_ascii=False),
                datetime.utcnow().isoformat(),
            ),
        )

    return {"ok": True, "funnel": result}


@app.post("/funnel/save")
def save_funnel(data: FunnelSaveIn):
    email = str(data.email).strip().lower()

    with db() as conn:
        row = conn.execute(
            """
            SELECT profile_id
            FROM funnels
            WHERE email = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (email,),
        ).fetchone()

        conn.execute(
            """
            INSERT INTO funnels (email, profile_id, funnel_json, created_at)
            VALUES (?, ?, ?, ?)
            """,
            (
                email,
                row["profile_id"] if row else None,
                json.dumps(data.funnel, ensure_ascii=False),
                datetime.utcnow().isoformat(),
            ),
        )

    return {"ok": True}


@app.post("/content-map/discuss-item")
def discuss_content_map_item(data: ContentMapDiscussIn):
    item = data.item or {}
    question = (data.question or "").strip()
    email = str(data.email).strip().lower()

    if not question:
        raise HTTPException(status_code=400, detail="question_required")

    fallback = {
        "topic": str(item.get("topic", "")),
        "platform": str(item.get("platform", "")),
        "format": str(item.get("format", "")),
        "task": str(item.get("task", "")),
        "goal": str(item.get("goal", "")),
        "comment": "Добавьте конкретики в тезисы и призыв к действию, чтобы пост лучше конвертировал.",
    }

    if not OPENAI_API_KEY or OPENAI_API_KEY.startswith("вставь"):
        return {"ok": True, "email": email, "updated_item": fallback, "comment": fallback["comment"]}

    base_prompt = """
Ты — копирайтер и контент-стратег. Пользователь присылает карточку поста и вопрос или запрос.
Верни только JSON с ключами: topic, platform, format, task, goal, comment.

В поле comment напиши ГОТОВЫЙ пост для публикации в соцсети по этой структуре:
1. Цепляющий первый абзац (1-2 предложения) — чтобы остановили скролл
2. Основная мысль — конкретно, без воды, 2-3 абзаца
3. Призыв к действию в конце — написать слово в директ, задать вопрос или сохранить

Пиши живым языком, от первого лица, без канцелярита.
Объём — 150-250 слов.
topic, task, goal — обнови если нужно, сохрани смысл.
"""
    role_prompt = load_ai_role_prompt(data.agent)
    system_prompt = f"{role_prompt}\n\n{base_prompt}".strip() if role_prompt else base_prompt

    client = OpenAI(api_key=OPENAI_API_KEY.strip())
    model = os.getenv("OPENAI_MODEL", OPENAI_MODEL).strip()

    try:
        response = client.chat.completions.create(
            model=model,
            temperature=0.4,
            response_format={"type": "json_object"},
            messages=[
                {"role": "system", "content": system_prompt},
                {
                    "role": "user",
                    "content": json.dumps(
                        {"item": item, "question": question},
                        ensure_ascii=False
                    ),
                },
            ],
        )

        raw = response.choices[0].message.content or "{}"

        try:
            result = json.loads(raw)
        except Exception:
            result = fallback
    except Exception as e:
        print("DISCUSS_ITEM_ERROR:", repr(e))
        result = fallback

    updated_item = {
        "topic": str(result.get("topic", fallback["topic"])),
        "platform": str(result.get("platform", fallback["platform"])),
        "format": str(result.get("format", fallback["format"])),
        "task": str(result.get("task", fallback["task"])),
        "goal": str(result.get("goal", fallback["goal"])),
    }

    return {
        "ok": True,
        "email": email,
        "updated_item": updated_item,
        "comment": str(result.get("comment", fallback["comment"])),
    }

@app.get("/content-map/ics")
def download_ics(email: str):
    with db() as conn:
        row = conn.execute(
            """
            SELECT map_json
            FROM content_maps
            WHERE email = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (email.strip().lower(),),
        ).fetchone()

    if not row:
        raise HTTPException(status_code=404, detail="content_map_not_found")

    data = json.loads(row["map_json"])
    calendar = data.get("calendar", [])

    start = datetime.now().date()
    lines = [
        "BEGIN:VCALENDAR",
        "VERSION:2.0",
        "PRODID:-//LESik//Content Calendar//RU",
        "CALSCALE:GREGORIAN",
    ]

    for item in calendar:
        day = int(item.get("day", 1))
        date = start + timedelta(days=day - 1)
        uid = str(uuid.uuid4())
        title = f"ЛЕСik: {item.get('topic', 'Контент-задача')}"
        desc = f"Площадка: {item.get('platform','')}\nФормат: {item.get('format','')}\nЗадача: {item.get('task','')}\nЦель: {item.get('goal','')}"

        lines += [
            "BEGIN:VEVENT",
            f"UID:{uid}",
            f"DTSTAMP:{datetime.utcnow().strftime('%Y%m%dT%H%M%SZ')}",
            f"DTSTART;VALUE=DATE:{date.strftime('%Y%m%d')}",
            f"SUMMARY:{escape_ics(title)}",
            f"DESCRIPTION:{escape_ics(desc)}",
            "END:VEVENT",
        ]

    lines.append("END:VCALENDAR")

    ics = "\r\n".join(lines)
    return Response(
        content=ics,
        media_type="text/calendar; charset=utf-8",
        headers={"Content-Disposition": "attachment; filename=lesik-content-calendar.ics"}
    )

def escape_ics(value: str) -> str:
    return str(value).replace("\\", "\\\\").replace("\n", "\\n").replace(",", "\\,").replace(";", "\\;")

@app.get("/content-map/pdf")
def download_content_map_pdf(email: str):
    with db() as conn:
        row = conn.execute(
            "SELECT map_json FROM content_maps WHERE email = ? ORDER BY id DESC LIMIT 1",
            (email.strip().lower(),),
        ).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="content_map_not_found")
    
    data = json.loads(row["map_json"])
    summary = data.get("summary", "")
    nodes = data.get("nodes", [])
    calendar = data.get("calendar", [])

    node_items = [n for n in nodes if n.get("type") != "core"]
    nodes_html = '<table width="100%" cellspacing="0" cellpadding="0"><tr>'
    for i, node in enumerate(node_items):
        if i > 0 and i % 2 == 0:
            nodes_html += '</tr><tr>'
        nodes_html += f'''<td width="50%" style="padding:0 6px 10px 0; vertical-align:top;">
            <div class="node"><h3>{node.get("title","")}</h3><p>{node.get("description","")}</p></div>
        </td>'''
    if len(node_items) % 2 != 0:
        nodes_html += '<td width="50%"></td>'
    nodes_html += '</tr></table>'


    import re as _re
    calendar_html = ""
    for idx, item in enumerate(calendar, 1):
        tasks = item.get("tasks", [])
        tasks_html = ""
        day_num = item.get('day', idx)
        if not day_num and tasks:
            m = _re.search(r'day-(\d+)', tasks[0].get('id', ''))
            if m:
                day_num = m.group(1)
        platform = item.get('platform', '')
        title = item.get('title', item.get('topic', ''))
        desc = item.get('description', item.get('task', ''))
        calendar_html += f'''<div class="cal-item"><div class="cal-day">День {day_num} · {platform}</div><div class="cal-title">{title}</div><div class="cal-desc">{desc}</div><ul class="cal-tasks">{tasks_html}</ul></div>'''


    html = f"""<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<style>
  * {{ margin: 0; padding: 0; box-sizing: border-box; }}
  body {{ font-family: Arial, sans-serif; background: #fff; color: #111; padding: 32px; font-size: 13px; }}
  h1 {{ font-size: 24px; font-weight: 800; margin-bottom: 12px; color: #1a5c35; }}
  .summary {{ background: #f3eee4; border-left: 4px solid #009b46; padding: 14px 18px; margin-bottom: 28px; font-size: 14px; line-height: 1.6; }}
  h2 {{ font-size: 17px; font-weight: 800; margin-bottom: 14px; color: #1a5c35; border-bottom: 2px solid #009b46; padding-bottom: 6px; }}
  .node {{ margin-bottom: 8px; padding: 10px 14px; background: #f9f9f6; border-left: 3px solid #009b46; page-break-inside: avoid; }}
  .node h3 {{ font-size: 13px; font-weight: 700; margin-bottom: 3px; }}
  .node p {{ font-size: 12px; color: #555; line-height: 1.5; }}
  .section {{ margin-bottom: 28px; }}
  .cal-item {{ display: table; width: 100%; margin-bottom: 12px; padding: 10px 14px; background: #f9f9f6; border-left: 3px solid #009b46; }}
  .cal-day {{ font-size: 11px; color: #009b46; font-weight: 700; margin-bottom: 2px; }}
  .cal-title {{ font-size: 13px; font-weight: 700; margin-bottom: 3px; }}
  .cal-desc {{ font-size: 12px; color: #555; margin-bottom: 5px; line-height: 1.5; }}
  .cal-tasks {{ list-style: none; padding: 0; margin: 0; }}
  .cal-tasks li {{ font-size: 11px; color: #333; line-height: 1.5; padding-left: 12px; position: relative; margin-bottom: 1px; }}
  .cal-tasks li::before {{ content: "·"; position: absolute; left: 2px; color: #009b46; font-weight: 700; }}
</style>
</head>
<body>
  <h1>Карта контента</h1>
  <div class="summary">{summary}</div>
  <div class="section">
    <h2>Блоки стратегии</h2>
    {nodes_html}
  </div>
  <div class="section">
    <h2>Календарь публикаций — 14 дней</h2>
    {calendar_html}
  </div>
</body>
</html>"""

    from weasyprint import HTML
    pdf_bytes = HTML(string=html).write_pdf()
    
    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": "attachment; filename=content-map.pdf"}
    )




@app.post("/content-map/slide-download")
async def download_slide(request: Request):
    body = await request.json()
    data_url = body.get("data_url", "")
    idx = body.get("idx", 1)
    
    if not data_url.startswith("data:image/png;base64,"):
        raise HTTPException(status_code=400, detail="invalid_data")
    
    import base64
    img_data = base64.b64decode(data_url.split(",")[1])
    
    return Response(
        content=img_data,
        media_type="image/png",
        headers={"Content-Disposition": f"attachment; filename=slide-{idx}.png"}
    )


class SlideIn(BaseModel):
    text: str
    idx: int
    total: int
    gradient: str = "beige"

@app.get("/content-map/slide-png")
def generate_slide_png_get(text: str, idx: int, total: int, gradient: str = "beige"):
    from PIL import Image, ImageDraw, ImageFont
    import io, textwrap

    class _D:
        pass
    data = _D()
    data.text = text
    data.idx = idx
    data.total = total
    data.gradient = gradient
    return _generate_slide(data)

@app.post("/content-map/slide-png")
def generate_slide_png(data: SlideIn):
    return _generate_slide(data)

def _generate_slide(data):
    from PIL import Image, ImageDraw, ImageFont
    import io, textwrap

    W, H = 1080, 1080
    gradients = {
        "beige": ((243, 238, 228), (232, 224, 208)),
        "green": ((26, 92, 53), (0, 155, 70)),
        "dark": ((17, 17, 17), (34, 34, 34)),
        "blue": ((26, 42, 74), (42, 74, 138)),
        "pink": ((74, 26, 42), (138, 42, 74)),
    }
    c1, c2 = gradients.get(data.gradient, gradients["beige"])
    is_dark = data.gradient in ["green", "dark", "blue", "pink"]
    text_color = (255, 255, 255) if is_dark else (26, 26, 26)
    accent = (255, 255, 255, 60) if is_dark else (0, 155, 70, 60)
    logo_color = (255, 255, 255, 180) if is_dark else (0, 155, 70, 255)

    img = Image.new("RGB", (W, H))
    draw = ImageDraw.Draw(img, "RGBA")

    # Градиент
    for y in range(H):
        r = int(c1[0] + (c2[0] - c1[0]) * y / H)
        g = int(c1[1] + (c2[1] - c1[1]) * y / H)
        b = int(c1[2] + (c2[2] - c1[2]) * y / H)
        draw.line([(0, y), (W, y)], fill=(r, g, b))

    # Полоса слева
    draw.rectangle([0, 0, 10, H], fill=(0, 155, 70) if not is_dark else (255, 255, 255, 60))

    # Номер слайда большой
    try:
        font_big = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 180)
        font_title = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 58 if data.idx == 0 else 48)
        font_logo = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 32)
    except:
        font_big = ImageFont.load_default()
        font_title = font_big
        font_logo = font_big

    num_color = (*([255,255,255] if is_dark else [0,155,70]), 50)
    draw.text((850, 30), str(data.idx + 1), font=font_big, fill=num_color)

    # Основной текст с переносом
    lines = textwrap.wrap(data.text, width=28)
    y_start = 180 if data.idx > 0 else 420
    for line in lines[:8]:
        draw.text((80, y_start), line, font=font_title, fill=text_color)
        y_start += 65

    # Логотип
    draw.text((80, 1030), "ЛЕСik", font=font_logo, fill=(*([255,255,255] if is_dark else [0,155,70]), 200))
    draw.text((900, 1030), f"{data.idx+1}/{data.total}", font=font_logo, fill=(*([255,255,255] if is_dark else [0,0,0]), 120))

    buf = io.BytesIO()
    img.save(buf, format="PNG")
    buf.seek(0)

    return Response(
        content=buf.read(),
        media_type="application/octet-stream",
        headers={"Content-Disposition": f"attachment; filename=slide-{data.idx+1}.png"}
    )

def build_fallback_map(profile):
    name = profile.get("name", "Клиент")
    niche = profile.get("niche", "ниша")
    platform = profile.get("platform", "Telegram")
    goal = profile.get("monthly_goal", "рост")
    blocker = profile.get("blocker", "нет системы")

    nodes = [
        {"id": "core", "title": f"Контент-система {name}", "type": "core", "description": f"Цель: {goal}", "x": 0, "y": 0},
        {"id": "audience", "title": "Аудитория", "type": "analysis", "description": f"Кому нужен эксперт в нише: {niche}", "x": -320, "y": -120},
        {"id": "pain", "title": "Боли аудитории", "type": "analysis", "description": f"Главное препятствие клиента: {blocker}", "x": -320, "y": 120},
        {"id": "trust", "title": "Доверие", "type": "content", "description": "Кейсы, опыт, наблюдения, личная позиция", "x": 320, "y": -120},
        {"id": "sales", "title": "Продажи", "type": "content", "description": "Мягкие CTA, офферы, прогрев", "x": 320, "y": 120},
        {"id": "calendar", "title": "Календарь", "type": "plan", "description": "14 дней публикаций", "x": 0, "y": 260},
    ]

    edges = [
        {"from": "core", "to": "audience", "label": "понять"},
        {"from": "core", "to": "pain", "label": "снять барьеры"},
        {"from": "core", "to": "trust", "label": "усилить"},
        {"from": "core", "to": "sales", "label": "монетизировать"},
        {"from": "sales", "to": "calendar", "label": "разложить"},
    ]

    calendar = []
    formats = ["Пост", "Кейс", "Разбор", "Личный опыт", "Мини-инструкция", "CTA"]
    for i in range(1, 15):
        calendar.append({
            "day": i,
            "date_label": f"День {i}",
            "platform": platform,
            "format": formats[(i - 1) % len(formats)],
            "topic": f"Контент по цели: {goal}",
            "task": f"Опубликовать материал #{i} с одной понятной мыслью",
            "goal": "Двигать аудиторию к доверию и заявке"
        })

    return {
        "summary": f"Для ниши {niche} нужно собрать систему из доверия, пользы, кейсов и продажных касаний.",
        "nodes": nodes,
        "edges": edges,
        "calendar": calendar,
    }

def build_fallback_funnel(profile, details):
    name = profile.get("name", "Клиент")
    niche = profile.get("niche", "ниша")
    platform = profile.get("platform", "Telegram")
    product_name = details.get("product_name") or f"продукт в нише {niche}"
    product_description = details.get("product_description") or "Подробное описание появится после заполнения продукта в профиле."
    why_not_buy = details.get("why_not_buy") or "не хватает доверия и понимания результата"

    stages = [
        {
            "id": "trigger",
            "title": "Триггер в контенте",
            "description": f"Пост или сторис, который подталкивает аудиторию написать кодовое слово в директ {platform}",
            "details": f"Например: разбор частой проблемы в нише {niche} с призывом написать слово в директ"
        },
        {
            "id": "codeword",
            "title": "Кодовое слово",
            "codeword": "СТАРТ",
            "description": "Простое слово, которое легко напечатать в директе",
            "auto_reply_text": f"Привет! Спасибо за интерес 🙌 Сейчас отправлю тебе материал по теме {niche}."
        },
        {
            "id": "lead_magnet",
            "title": "Лид-магнит",
            "lead_magnet_name": f"Чек-лист по теме {niche}",
            "description": "Бесплатный материал, который закрывает первый страх клиента и показывает экспертность",
            "lead_magnet_text": f"Вот чек-лист, который поможет разобраться с {niche}. Если будут вопросы — пиши, помогу"
        },
        {
            "id": "warmup",
            "title": "Прогрев",
            "description": "1-2 касания с пользой и личным опытом перед предложением продукта",
            "details": "Истории, разборы, мини-кейсы, ответы на частые вопросы"
        },
        {
            "id": "offer",
            "title": "Продажа продукта",
            "description": f"Предложение продукта {product_name} с закрытием возражения: {why_not_buy}",
            "offer_text": f"{product_description} Если откликается — напиши мне, расскажу подробнее и отвечу на вопросы"
        }
    ]

    return {
        "summary": f"Воронка для {name}: от кодового слова в директе {platform} к лид-магниту и продаже {product_name}.",
        "stages": stages
    }






@app.get("/profile-details/by-email")
def get_profile_details_by_email(email: str):
    with db() as conn:
        row = conn.execute(
            """
            SELECT id, email, details_json, updated_at
            FROM profile_details
            WHERE email = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (email.strip().lower(),),
        ).fetchone()

    if not row:
        return {"details": None}

    result = dict(row)
    result["details"] = json.loads(result.pop("details_json"))
    return result


@app.post("/profile-details")
def save_profile_details(data: ProfileDetailsIn):
    payload = data.dict()
    payload["email"] = str(data.email).strip().lower()

    with db() as conn:
        conn.execute(
            """
            INSERT INTO profile_details (email, details_json, updated_at)
            VALUES (?, ?, ?)
            """,
            (
                payload["email"],
                json.dumps(payload, ensure_ascii=False),
                datetime.utcnow().isoformat(),
            ),
        )

    return {"ok": True, "details": payload}


@app.post("/profile-details/telegram")
def save_telegram_block(data: TelegramBlockIn):
    email = str(data.email).strip().lower()

    bot_description_short = data.bot_description_short.strip()
    privacy_policy_url = data.privacy_policy_url.strip()
    offer_url = data.offer_url.strip()
    entry_keyword_or_link = data.entry_keyword_or_link.strip()
    entry_button_label = data.entry_button_label.strip() or "Начать"

    url_pattern = re.compile(r"^https?://.+", re.IGNORECASE)
    errors = []

    if not bot_description_short:
        errors.append("Короткое описание обязательно")
    if not privacy_policy_url or not url_pattern.match(privacy_policy_url):
        errors.append("Ссылка на политику конфиденциальности обязательна и должна начинаться с http(s)://")
    if not offer_url or not url_pattern.match(offer_url):
        errors.append("Ссылка на оферту обязательна и должна начинаться с http(s)://")
    if not entry_keyword_or_link:
        errors.append("Точка входа в воронку обязательна")

    assembled = f"{bot_description_short} Политика: {privacy_policy_url} · Оферта: {offer_url} Войти: {entry_keyword_or_link}".strip()
    if len(assembled) > 120:
        errors.append(f"Итоговый description превышает лимит 120 символов (сейчас {len(assembled)})")

    if errors:
        raise HTTPException(status_code=400, detail="; ".join(errors))

    details_dict = {}
    with db() as conn:
        details_row = conn.execute(
            """
            SELECT details_json
            FROM profile_details
            WHERE email = ?
            ORDER BY id DESC
            LIMIT 1
            """,
            (email,),
        ).fetchone()
    if details_row:
        try:
            details_dict = json.loads(details_row["details_json"])
        except Exception:
            details_dict = {}

    details_dict["email"] = email
    details_dict["bot_description_short"] = bot_description_short
    details_dict["privacy_policy_url"] = privacy_policy_url
    details_dict["offer_url"] = offer_url
    details_dict["entry_keyword_or_link"] = entry_keyword_or_link
    details_dict["entry_button_label"] = entry_button_label

    with db() as conn:
        conn.execute(
            """
            INSERT INTO profile_details (email, details_json, updated_at)
            VALUES (?, ?, ?)
            """,
            (
                email,
                json.dumps(details_dict, ensure_ascii=False),
                datetime.utcnow().isoformat(),
            ),
        )

    return {"ok": True, "assembled_description": assembled, "length": len(assembled)}


def _extract_text_from_uploaded_file(filename: str, content_type: str, data: bytes) -> tuple[str, str]:
    name = (filename or "").lower()
    mime = (content_type or mimetypes.guess_type(filename or "")[0] or "").lower()

    if mime.startswith("text/") or name.endswith((".txt", ".md", ".csv", ".json")):
        return "text", data.decode("utf-8", errors="ignore")

    if name.endswith(".pdf") or mime == "application/pdf":
        try:
            from pypdf import PdfReader
            reader = PdfReader(BytesIO(data))
            parts = []
            for page in reader.pages:
                parts.append(page.extract_text() or "")
            text_value = "\n".join(parts).strip()
            if text_value:
                return "text", text_value
        except Exception as e:
            print("PDF_TEXT_ERROR:", repr(e))

        # ???? PDF ?? ?????????, ??????? ????? PyMuPDF ??????????? ?????? ???????? ??? ????????
        try:
            import fitz
            doc = fitz.open(stream=data, filetype="pdf")
            page = doc[0]
            pix = page.get_pixmap(matrix=fitz.Matrix(2, 2), alpha=False)
            image_bytes = pix.tobytes("png")
            return "image/png", base64.b64encode(image_bytes).decode("ascii")
        except Exception as e:
            print("PDF_RENDER_ERROR:", repr(e))
            return "text", ""

    if name.endswith(".docx") or "wordprocessingml" in mime:
        try:
            from docx import Document
            doc = Document(BytesIO(data))
            return "text", "\n".join(p.text for p in doc.paragraphs).strip()
        except Exception as e:
            print("DOCX_ERROR:", repr(e))
            return "text", ""

    if mime.startswith("image/") or name.endswith((".png", ".jpg", ".jpeg", ".webp")):
        return mime or "image/png", base64.b64encode(data).decode("ascii")

    if mime.startswith("audio/") or name.endswith((".mp3", ".m4a", ".wav", ".ogg", ".oga", ".webm")):
        return "audio", ""

    return "text", data.decode("utf-8", errors="ignore")


def _normalize_audience_analysis(raw_text: str) -> str:
    client = OpenAI(api_key=OPENAI_API_KEY.strip())
    model = os.getenv("OPENAI_MODEL", OPENAI_MODEL).strip()

    prompt = """
?? ???????? ????????? ??? ??????? ???ik.

?? ?????? ?????? ???? ?????? ????????????????? ?????? ?????????.
???? ??-??????, ?????????, ??? ????.

??????:
1. ??? ?????????
2. ??? ? ??? ?????
3. ???? ??? ?????
4. ?????? ?????????????
5. ?????? ????????
6. ?????? ??????????? ??? ?? ????????
7. ????? ???????? ???????????? ? ????????
8. ????? ???? ????? ??????????
9. ????? ?????/???????????? ????????? ????? ????????????
10. ???????? ????? ??? ???????-?????????
"""

    response = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": prompt},
            {"role": "user", "content": raw_text[:24000]},
        ],
    )

    return response.choices[0].message.content or ""


def _analyze_image_as_audience(filename: str, mime: str, b64: str) -> str:
    client = OpenAI(api_key=OPENAI_API_KEY.strip())
    model = os.getenv("GPT_VISION_MODEL", os.getenv("OPENAI_MODEL", OPENAI_MODEL)).strip()

    data_url = f"data:{mime};base64,{b64}"

    prompt = """
??????? ??????????? ??? ???????? ??? ??????? ?????????.
??? ????? ???? ???????? ????????????, ?????????, ??????, ???????, ??????????? ??? ??????????.

??????? ??????? ???? ?????? ????? ? ???????????.
????? ?????? ????????????????? ?????? ?????????:

1. ??? ?????????
2. ??? ? ??? ?????
3. ???? ??? ?????
4. ?????? ?????????????
5. ?????? ????????
6. ?????? ??????????? ??? ?? ????????
7. ????? ???????? ???????????? ? ????????
8. ????? ???? ????? ??????????
9. ????? ?????/???????????? ????????? ????? ????????????
10. ???????? ????? ??? ???????-?????????
"""

    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "user",
                "content": [
                    {"type": "text", "text": prompt},
                    {"type": "image_url", "image_url": {"url": data_url}},
                ],
            }
        ],
    )

    return response.choices[0].message.content or ""


def _transcribe_audio(filename: str, data: bytes) -> str:
    client = OpenAI(api_key=OPENAI_API_KEY.strip())

    suffix = Path(filename or "audio.ogg").suffix or ".ogg"
    with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp:
        tmp.write(data)
        tmp_path = tmp.name

    try:
        with open(tmp_path, "rb") as f:
            transcript = client.audio.transcriptions.create(
                model=os.getenv("OPENAI_TRANSCRIBE_MODEL", "whisper-1").strip(),
                file=f,
            )
        return getattr(transcript, "text", "") or ""
    finally:
        try:
            Path(tmp_path).unlink(missing_ok=True)
        except Exception:
            pass


@app.post("/audience-analysis/upload")
async def upload_audience_analysis(
    email: str = Form(...),
    file: UploadFile = File(...),
):
    data = await file.read()
    if not data:
        raise HTTPException(status_code=400, detail="???? ??????")

    if len(data) > 25 * 1024 * 1024:
        raise HTTPException(status_code=400, detail="???? ?????? 25 ??")

    kind, value = _extract_text_from_uploaded_file(
        filename=file.filename or "",
        content_type=file.content_type or "",
        data=data,
    )

    try:
        if kind == "audio":
            transcript = _transcribe_audio(file.filename or "audio.ogg", data)
            if not transcript.strip():
                raise HTTPException(status_code=400, detail="?? ??????? ?????????? ?????")
            analysis = _normalize_audience_analysis(transcript)

        elif kind.startswith("image/"):
            analysis = _analyze_image_as_audience(file.filename or "image.png", kind, value)

        else:
            if not value.strip():
                raise HTTPException(status_code=400, detail="?? ??????? ??????? ????? ?? ?????")
            analysis = _normalize_audience_analysis(value)

    except HTTPException:
        raise
    except Exception as e:
        print("AUDIENCE_UPLOAD_ERROR:", repr(e))
        raise HTTPException(status_code=500, detail=f"?????? ??????? ?????: {repr(e)}")

    return {
        "ok": True,
        "email": email.strip().lower(),
        "filename": file.filename,
        "analysis": analysis,
    }


@app.post("/audience-analysis/analyze")
def analyze_audience_with_ai(data: AudienceAnalysisIn):
    prompt_path = Path(__file__).parent / "prompts" / "audience_architect.md"
    legacy_prompt = prompt_path.read_text(encoding="utf-8")
    role_prompt = load_ai_role_prompt("audience_architect")
    system_prompt = f"{role_prompt}\n\n{legacy_prompt}".strip() if role_prompt else legacy_prompt

    client = OpenAI(api_key=OPENAI_API_KEY.strip())
    model = os.getenv("OPENAI_MODEL", OPENAI_MODEL).strip()

    conversation = []
    conversation.append({
        "role": "user",
        "content": "??????? ??????? ??? ??????? ?????????:\\n" + (data.base_text or "").strip()
    })

    for item in data.answers:
        q = str(item.get("question", "")).strip()
        a = str(item.get("answer", "")).strip()
        if q or a:
            conversation.append({
                "role": "user",
                "content": f"?????????? ??????: {q}\\n????? ???????: {a}"
            })

    response = client.chat.completions.create(
        model=model,
        temperature=0.4,
        response_format={"type": "json_object"},
        messages=[
            {"role": "system", "content": system_prompt},
            *conversation,
        ],
    )

    raw = response.choices[0].message.content or "{}"

    try:
        result = json.loads(raw)
    except Exception:
        result = {
            "status": "ready",
            "question": "",
            "analysis": raw,
            "summary": "",
            "known_facts": [],
            "hypotheses": [],
            "validation_questions": [],
        }

    return {
        "ok": True,
        "email": str(data.email).strip().lower(),
        "result": result,
    }
