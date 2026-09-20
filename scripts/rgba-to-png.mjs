import fs from "node:fs";
import path from "node:path";
import sharp from "sharp";
const dir = process.argv[2];
const files = fs.readdirSync(dir).filter((f) => f.startsWith("raw-") && f.endsWith(".rgba"));
for (const file of files) {
  const idx = file.match(/raw-(\d+)/)?.[1];
  const meta = JSON.parse(fs.readFileSync(path.join(dir, `meta-${idx}.json`), "utf8"));
  const raw = fs.readFileSync(path.join(dir, file));
  const pixels = meta.width * meta.height;
  const channels = raw.length / pixels;
  const out = path.join(dir, `preview-${idx}.png`);
  await sharp(raw, { raw: { width: meta.width, height: meta.height, channels } }).png().toFile(out);
  console.log(out, meta.width, meta.height, "ch", channels);
}
