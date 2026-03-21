# Part 1 — What Was Built (Mushaf View)

## 1) UI route responsible for the screenshot

- **Route:** `/mushaf/[page]` (e.g. `/mushaf/1`)
- **Page component:** `app/(main)/mushaf/[page]/page.tsx` (server) → `MushafPageClient` (client)
- **Client component:** `app/(main)/mushaf/[page]/MushafPageClient.tsx`

## 2) Data source

- **Internal endpoint:** `GET /api/mushaf/pages/[page]` (e.g. `/api/mushaf/pages/1`)
- **Provider/External API:** **Quran.Foundation** Content API v4 (OAuth2 client_credentials). No IslamHouse or AlQuran Cloud for mushaf.

## 3) Response shape (from route handler)

```json
{
  "pageNumber": 1,
  "imageUrl": "https://cdn.jsdelivr.net/gh/tarekeldeeb/madina_images@w1024/w1024_page001.png",
  "verses": [
    { "verseKey": "1:1", "text": "...", "chapterId": 1, "verseNumber": 1, "pageNumber": 1 }
  ],
  "translations": null
}
```

- `imageUrl`: full mushaf page image from CDN (Madani w1024) for pages 1–604. When CDN is disabled or unavailable, can be `null` (text fallback).
- Verses come from Quran.Foundation `GET /verses/by_page/{page}?per_page=50&fields=text_uthmani`.

## 4) What we receive from QF vs CDN

- **From QF:** verse keys, `text_uthmani`, chapter/verse/page numbers. No full-page image URL.
- **Page image:** from external CDN (tarekeldeeb/madina_images @ w1024), one image per page 1–604.

## 5) Summary (5 bullets)

- **Endpoint:** `GET /api/mushaf/pages/[page]` calls Quran.Foundation for verses and sets `imageUrl` from CDN (Madani page images).
- **Hook/fetcher:** `useMushafPage(page)` → `fetchMushafPage(page)` → `getJson('/api/mushaf/pages/' + page)`.
- **Data:** `pageNumber`, `imageUrl` (CDN URL or null), `verses[]` with `verseKey`, `text`, `chapterId`, `verseNumber`, `pageNumber`.
- **UI:** If `imageUrl` exists: main content is the page image (full width, contain); below it, optional verses list. If `imageUrl` is null: text-only layout with banner "Image not available — showing text mode".
- **RTL:** Layout and verse list use `dir="rtl"`; no fixed ScrollArea; full-page scroll.
