#!/usr/bin node
/** One-off: extract embedded raster images from official brand PDF (references/brand). */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import * as pdfjs from "pdfjs-dist/legacy/build/pdf.mjs";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const brandDir = path.join(root, "references", "brand");
const outDir = path.join(root, "public", "brand", "logo", "_extracted");

const pdfFile = fs.readdirSync(brandDir).find((f) => f.toLowerCase().endsWith(".pdf"));
if (!pdfFile) {
  console.error("No PDF in references/brand");
  process.exit(1);
}

fs.mkdirSync(outDir, { recursive: true });

const data = new Uint8Array(fs.readFileSync(path.join(brandDir, pdfFile)));
const pdf = await pdfjs.getDocument({ data, disableFontFace: true }).promise;

let index = 0;
for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
  const page = await pdf.getPage(pageNum);
  const ops = await page.getOperatorList();
  for (let i = 0; i < ops.fnArray.length; i++) {
    if (ops.fnArray[i] !== pdfjs.OPS.paintImageXObject) continue;
    const name = ops.argsArray[i][0];
    try {
      const img = await page.objs.get(name);
      if (!img?.data?.length) continue;
      const { width, height, data: rgba } = img;
      index += 1;
      const meta = { pageNum, name, width, height, bytes: rgba.length };
      fs.writeFileSync(path.join(outDir, `meta-${index}.json`), JSON.stringify(meta, null, 2));
      fs.writeFileSync(path.join(outDir, `raw-${index}.rgba`), Buffer.from(rgba));
      console.log(JSON.stringify(meta));
    } catch {
      /* skip */
    }
  }
}

console.log(`Extracted ${index} image object(s) to ${outDir}`);
