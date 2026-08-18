/**
 * Reads product Excel workbooks and writes normalized JSON to data/import/
 * Does NOT modify source files.
 *
 * Batch traceability: set IMPORT_BATCH=batch-002 (default batch-001)
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import XLSX from "xlsx";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const productsDir = path.join(root, "references", "products");
const outDir = path.join(root, "data", "import");
const IMPORT_BATCH = process.env.IMPORT_BATCH ?? "batch-001";
const importedAt = new Date().toISOString();

const CCT_MAP = {
  "3000K": { ar: "دافئ", en: "Warm" },
  "4000K": { ar: "طبيعي", en: "Neutral" },
  "6500K": { ar: "أبيض", en: "White" },
};

function parseCode(code) {
  const parts = String(code).split("/").filter(Boolean);
  const wattage = parts.find((p) => /^\d+W$/i.test(p)) ?? null;
  const cct = parts.find((p) => /^(3000|4000|6500)K?$/i.test(p.replace("K", "") + "K") || /^\d{4}K$/i.test(p)) ?? null;
  const normalizedCct = cct?.includes("K") ? cct.toUpperCase().replace("//", "") : cct;
  const series = parts[0]?.match(/^[A-Z0-9]+$/i) ? parts[0] : null;
  const finish = parts.some((p) => p === "BK" || p.includes("BK")) ? "black" : null;
  const warrantyHint = parts.find((p) => /^\d+Y$/i.test(p)) ?? null;
  return { wattage, cct: normalizedCct, series, finish, warrantyHint, parts };
}

function extractBlocks(rows, sheetName) {
  const blocks = [];
  let current = null;

  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const cells = row.map((c) => String(c ?? "").trim());
    const isHeader = cells[0] === "الكود" && cells[1] === "الصنف";

    if (isHeader) {
      if (current?.variants.length) blocks.push(current);
      current = {
        headerRow: i,
        categoryTitle: rows[i - 2]?.[0] ? String(rows[i - 2][0]).trim() : null,
        seriesLine: rows[i - 1]?.[0] ? String(rows[i - 1][0]).trim() : null,
        variants: [],
      };
      continue;
    }

    if (current && cells[0] && cells[0] !== "الكود" && cells[1]) {
      const parsed = parseCode(cells[0]);
      current.variants.push({
        rawCode: cells[0],
        rawNameAr: cells[1],
        sku: cells[0],
        sourceRowRef: `sheet:${sheetName}:row:${i + 1}`,
        ...parsed,
        rawPrice: null,
        priceStatus: "REQUIRES_BUSINESS_CONFIRMATION",
        cctLabel: parsed.cct ? CCT_MAP[parsed.cct] ?? null : null,
      });
    }
  }

  if (current?.variants.length) blocks.push(current);
  return blocks;
}

function analyzeArabicCatalogFile(filename) {
  const wb = XLSX.readFile(path.join(productsDir, filename));
  const sheetName = wb.SheetNames.find((n) => n.includes("Sheet2")) ?? wb.SheetNames[0];
  const rows = XLSX.utils.sheet_to_json(wb.Sheets[sheetName], { header: 1, defval: "" });
  const blocks = extractBlocks(rows, sheetName);
  return {
    importBatch: IMPORT_BATCH,
    importedAt,
    sourceFile: filename,
    sheet: sheetName,
    blockCount: blocks.length,
    variantCount: blocks.reduce((n, b) => n + b.variants.length, 0),
    blocks,
  };
}

function analyzePianoFile(filename) {
  const wb = XLSX.readFile(path.join(productsDir, filename));
  const rows = XLSX.utils.sheet_to_json(wb.Sheets["Sheet1"], {
    defval: "",
    range: 1,
  });
  const variants = rows
    .filter((r) => r["Item No."] && r.description)
    .map((r, idx) => ({
      rawCode: String(r["Item No."]),
      itemNo: r["item no"],
      series: r.Series,
      color: r.Color,
      rawNameEn: r.description,
      rawNameAr: r.description,
      rawPrice: null,
      priceStatus: "REQUIRES_BUSINESS_CONFIRMATION",
      sourceRowRef: `sheet:Sheet1:row:${idx + 2}`,
      sensitiveFieldsPresent: ["Unit Price", "تكلفة MT بلس", "تكلفة التميز", "سعر الجملة"],
    }));
  return {
    importBatch: IMPORT_BATCH,
    importedAt,
    sourceFile: filename,
    sheet: "Sheet1",
    variantCount: variants.length,
    variants,
  };
}

if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

const summaries = [];
const files = fs.readdirSync(productsDir).filter((f) => f.endsWith(".xlsx"));

for (const file of files) {
  const result = file.includes("بيانو")
    ? analyzePianoFile(file)
    : analyzeArabicCatalogFile(file);

  const outPath = path.join(outDir, `${file.replace(/\.xlsx$/i, "")}.json`);
  fs.writeFileSync(outPath, JSON.stringify(result, null, 2), "utf8");
  summaries.push({
    batch: IMPORT_BATCH,
    file,
    variantCount: result.variantCount ?? result.blocks?.reduce((n, b) => n + b.variants.length, 0),
    outPath: path.relative(root, outPath),
  });
}

const batchDir = path.join(outDir, "batches", IMPORT_BATCH);
if (!fs.existsSync(batchDir)) fs.mkdirSync(batchDir, { recursive: true });
fs.writeFileSync(
  path.join(batchDir, "manifest.json"),
  JSON.stringify(
    {
      batchId: IMPORT_BATCH,
      importedAt,
      sourceFiles: files,
      variantCount: summaries.reduce((n, s) => n + (s.variantCount ?? 0), 0),
      status: "completed",
    },
    null,
    2,
  ),
  "utf8",
);

fs.writeFileSync(path.join(outDir, "_summary.json"), JSON.stringify(summaries, null, 2), "utf8");
console.log(JSON.stringify(summaries, null, 2));
