import hashlib
import os
from datetime import datetime, timezone

from dotenv import load_dotenv
from psycopg import connect
from psycopg.rows import dict_row

load_dotenv()
load_dotenv("web/.env.local", override=False)

AUTO_DRAFT_TAGS = "auto-draft,veille,emploi,maroc"


def get_content_database_url():
    return os.getenv("DATABASE_URL", "").strip()


def has_content_database_url():
    return bool(get_content_database_url())


def _normalize_text(value):
    return str(value or "").strip()


def _build_auto_draft_slug(publish_date, jobs):
    urls = sorted(
        {
            _normalize_text(job.get("post_url") or job.get("url") or job.get("source_url"))
            for job in jobs
            if _normalize_text(job.get("post_url") or job.get("url") or job.get("source_url"))
        }
    )
    digest_source = "|".join(urls) or publish_date
    digest = hashlib.sha1(digest_source.encode("utf-8")).hexdigest()[:8]
    return f"veille-emploi-{publish_date}-{digest}"


def _ensure_blog_posts_table(conn):
    with conn.cursor() as cursor:
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS blog_posts (
              id BIGSERIAL PRIMARY KEY,
              slug TEXT NOT NULL UNIQUE,
              date DATE NOT NULL,
              tags TEXT NOT NULL DEFAULT '',
              title_ar TEXT NOT NULL,
              title_fr TEXT NOT NULL,
              excerpt_ar TEXT NOT NULL,
              excerpt_fr TEXT NOT NULL,
              content_ar TEXT NOT NULL,
              content_fr TEXT NOT NULL,
              is_published BOOLEAN NOT NULL DEFAULT TRUE,
              created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
              updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
            )
            """
        )
    conn.commit()


def save_auto_blog_draft(draft_data, jobs):
    if not draft_data:
        print("[*] Auto blog draft skipped: no draft payload generated.")
        return None

    database_url = get_content_database_url()
    if not database_url:
        print("[*] Auto blog draft skipped: DATABASE_URL is missing.")
        return {"status": "skipped", "reason": "missing_database_url"}

    publish_date = _normalize_text(draft_data.get("date")) or datetime.now(
        timezone.utc
    ).date().isoformat()
    slug = _normalize_text(draft_data.get("slug")) or _build_auto_draft_slug(
        publish_date,
        jobs,
    )
    now = datetime.now(timezone.utc).isoformat()
    tags = _normalize_text(draft_data.get("tags")) or AUTO_DRAFT_TAGS

    payload = {
        "slug": slug,
        "date": publish_date,
        "tags": tags,
        "title_ar": _normalize_text(draft_data.get("title_ar")),
        "title_fr": _normalize_text(draft_data.get("title_fr")),
        "excerpt_ar": _normalize_text(draft_data.get("excerpt_ar")),
        "excerpt_fr": _normalize_text(draft_data.get("excerpt_fr")),
        "content_ar": _normalize_text(draft_data.get("content_ar")),
        "content_fr": _normalize_text(draft_data.get("content_fr")),
    }

    required_fields = [
        "title_ar",
        "title_fr",
        "excerpt_ar",
        "excerpt_fr",
        "content_ar",
        "content_fr",
    ]
    if any(not payload[field] for field in required_fields):
        print("[!] Auto blog draft skipped: payload is missing required fields.")
        return {"status": "skipped", "reason": "invalid_payload"}

    with connect(database_url, row_factory=dict_row) as conn:
        _ensure_blog_posts_table(conn)

        with conn.cursor() as cursor:
            cursor.execute(
                """
                SELECT id, is_published
                FROM blog_posts
                WHERE slug = %s
                LIMIT 1
                """,
                (slug,),
            )
            existing = cursor.fetchone()

            if existing and existing["is_published"]:
                print(
                    f"[*] Auto blog draft skipped: published article already exists for slug '{slug}'."
                )
                return {
                    "status": "skipped",
                    "reason": "published_exists",
                    "slug": slug,
                }

            if existing:
                cursor.execute(
                    """
                    UPDATE blog_posts
                    SET date = %s,
                        tags = %s,
                        title_ar = %s,
                        title_fr = %s,
                        excerpt_ar = %s,
                        excerpt_fr = %s,
                        content_ar = %s,
                        content_fr = %s,
                        is_published = FALSE,
                        updated_at = %s
                    WHERE id = %s
                    """,
                    (
                        payload["date"],
                        payload["tags"],
                        payload["title_ar"],
                        payload["title_fr"],
                        payload["excerpt_ar"],
                        payload["excerpt_fr"],
                        payload["content_ar"],
                        payload["content_fr"],
                        now,
                        existing["id"],
                    ),
                )
                conn.commit()
                print(f"[+] Updated auto blog draft: {slug}")
                return {"status": "updated", "slug": slug}

            cursor.execute(
                """
                INSERT INTO blog_posts (
                  slug,
                  date,
                  tags,
                  title_ar,
                  title_fr,
                  excerpt_ar,
                  excerpt_fr,
                  content_ar,
                  content_fr,
                  is_published,
                  created_at,
                  updated_at
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, FALSE, %s, %s)
                """,
                (
                    payload["slug"],
                    payload["date"],
                    payload["tags"],
                    payload["title_ar"],
                    payload["title_fr"],
                    payload["excerpt_ar"],
                    payload["excerpt_fr"],
                    payload["content_ar"],
                    payload["content_fr"],
                    now,
                    now,
                ),
            )
            conn.commit()

    print(f"[+] Created auto blog draft: {slug}")
    return {"status": "created", "slug": slug}
