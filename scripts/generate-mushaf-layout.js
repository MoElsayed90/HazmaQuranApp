/**
 * Generates stub layout JSON files (page-001.json … page-604.json) for mushaf overlay.
 * Uses normalized coordinates (0..1). Run with the app server up:
 *   npm run dev
 *   node scripts/generate-mushaf-layout.js
 * Or: BASE_URL=https://your-app.vercel.app node scripts/generate-mushaf-layout.js
 */
const fs = require("fs");
const path = require("path");

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";
const OUT_DIR = path.join(__dirname, "..", "data", "mushaf-layout");

function pad(n) {
  return String(n).padStart(3, "0");
}

async function fetchPage(pageNum) {
  const res = await fetch(`${BASE_URL}/api/mushaf/pages/${pageNum}`);
  if (!res.ok) throw new Error(`Page ${pageNum}: ${res.status}`);
  return res.json();
}

function versesToBoxes(verses) {
  if (!verses || verses.length === 0) return [];
  const count = verses.length;
  const marginY = 0.04;
  const marginX = 0.05;
  const h = (1 - 2 * marginY) / count;
  const w = 1 - 2 * marginX;
  return verses.map((v, i) => ({
    verseKey: v.verseKey,
    x: marginX,
    y: marginY + (i / count) * (1 - 2 * marginY),
    w,
    h,
  }));
}

async function main() {
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
  }
  console.log("Generating layout files in", OUT_DIR, "using", BASE_URL);
  for (let page = 1; page <= 604; page++) {
    try {
      const data = await fetchPage(page);
      const boxes = versesToBoxes(data.verses || []);
      const filePath = path.join(OUT_DIR, `page-${pad(page)}.json`);
      fs.writeFileSync(filePath, JSON.stringify(boxes, null, 0), "utf8");
      if (page % 100 === 0) console.log("Written page", page);
    } catch (e) {
      console.error("Page", page, e.message);
    }
  }
  console.log("Done.");
}

main();
