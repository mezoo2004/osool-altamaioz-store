import fs from "node:fs";
import path from "node:path";
import XLSX from "xlsx";
import { normalizeSku } from "./catalog-import.mjs";

export function resolveOfficialPriceFiles() {
  const envDir = process.env.OFFICIAL_PRICE_XLSX_DIR;
  const downloads = envDir ?? "C:/Users/admin/Downloads";
  const correct = [
    "تسعيرة_انارة_داخلية.xlsx",
    "تسعيرة_افياش_ومفاتيح_بيانو.xlsx",
    "تسعيرة_مراوح_-لمبات_-_نجف.xlsx",
    "تسعيرة_كشافات.xlsx",
    "تسعيرة_حبل_زينة.xlsx",
  ];
  return correct.map((name) => path.join(downloads, name));
}

function parsePrice(cell) {
  if (cell == null || cell === "") return null;
  const n = typeof cell === "number" ? cell : Number(String(cell).replace(/,/g, "").trim());
  if (!Number.isFinite(n) || n <= 0) return null;
  return Math.round(n * 100) / 100;
}

function detectBlockFinish(rows, headerIndex) {
  const slice = rows.slice(Math.max(0, headerIndex - 4), headerIndex);
  const hay = slice
    .flat()
    .map((c) => String(c ?? "").toLowerCase())
    .join(" ");
  if (/\bwhite\b|ابيض/.test(hay) && !/\bblack\b|اسود/.test(hay)) return "WH";
  if (/\bblack\b|اسود/.test(hay)) return "BK";
  if (/\bgray\b|\bgrey\b|رمادي/.test(hay)) return "GY";
  if (/\bgold\b|ذهب/.test(hay)) return "GD";
  if (/\bsilver\b|فض/.test(hay)) return "SL";
  return null;
}

function inferFinishHint(sectionLine, nameAr, blockFinish) {
  if (blockFinish) return blockFinish;
  const hay = `${sectionLine ?? ""} ${nameAr ?? ""}`.toLowerCase();
  if (/ابيض|white|wh\b|brush white/i.test(hay)) return "WH";
  if (/اسود|black|bk\b/i.test(hay)) return "BK";
  if (/رمادي|gray|grey|gy\b/i.test(hay)) return "GY";
  if (/ذهب|gold|gd\b/i.test(hay)) return "GD";
  if (/فض|silver|sl\b/i.test(hay)) return "SL";
  return null;
}

function inferSourceCategory(sourceFile) {
  const f = path.basename(sourceFile);
  if (f.includes("انارة_داخلية")) return "internal-lighting";
  if (f.includes("بيانو") || f.includes("افياش")) return "switches-sockets";
  if (f.includes("مراوح") || f.includes("نجف") || f.includes("لمبات")) return "fans-bulbs-chandeliers";
  if (f.includes("كشافات")) return "floodlights";
  if (f.includes("حبل")) return "decorative-rope-led";
  return "general";
}

export function parseOfficialPriceWorkbook(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing official price file: ${filePath}`);
  }
  const wb = XLSX.readFile(filePath);
  const sheetName = wb.SheetNames.find((n) => n.includes("Sheet2")) ?? wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: "" });
  const out = [];
  let sectionLine = null;
  let seriesLine = null;
  let currentBlockFinish = null;

  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].map((c) => String(c ?? "").trim());
    if (cells[0] && !cells[1] && cells[0] !== "الكود") {
      sectionLine = cells[0];
    }
    if (cells[1] && !cells[0] && cells[1].length < 40) {
      seriesLine = cells[1];
    }
    const isHeader = cells[0] === "الكود" && cells[1] === "الصنف";
    if (isHeader) {
      sectionLine = rows[i - 1]?.[0] ? String(rows[i - 1][0]).trim() : sectionLine;
      seriesLine = rows[i - 1]?.[1] ? String(rows[i - 1][1]).trim() : seriesLine;
      currentBlockFinish = detectBlockFinish(rows, i);
      continue;
    }
    if (cells[0] && cells[0] !== "الكود" && cells[1]) {
      const price = parsePrice(cells[2]);
      if (!price) continue;
      out.push({
        sku: cells[0],
        normalizedSku: normalizeSku(cells[0]),
        nameAr: cells[1],
        sellingPrice: price,
        sourceFile: path.basename(filePath),
        sourceCategory: inferSourceCategory(filePath),
        sourceRowRef: `sheet:${sheetName}:row:${i + 1}`,
        sectionLine,
        seriesLine,
        finishHint: inferFinishHint(sectionLine, cells[1], currentBlockFinish),
      });
    }
  }
  return out;
}

export function parseAllOfficialPriceFiles(filePaths) {
  const rows = [];
  for (const fp of filePaths) {
    rows.push(...parseOfficialPriceWorkbook(fp));
  }
  return rows;
}
