import sharp from "sharp";
import path from "path";
import fs from "fs";

const ext = "C:/Projects/osool-altamaioz-store/public/brand/logo/_extracted";
const t = "C:/Projects/osool-altamaioz-store/public/brand/logo/_tests";
fs.mkdirSync(t, { recursive: true });

for (const c of [
  { l: 595, t: 120, w: 160, h: 110, n: "logo-d" },
  { l: 505, t: 295, w: 180, h: 115, n: "logo-h" },
  { l: 520, t: 305, w: 150, h: 100, n: "logo-h2" },
]) {
  await sharp(path.join(ext, "preview-3.png"))
    .extract({ left: c.l, top: c.t, width: c.w, height: c.h })
    .trim({ threshold: 12 })
    .png()
    .toFile(path.join(t, `${c.n}.png`));
}
