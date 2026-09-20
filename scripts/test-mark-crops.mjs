import sharp from "sharp";
import path from "path";
import fs from "fs";

const ext = "C:/Projects/osool-altamaioz-store/public/brand/logo/_extracted";
const t = "C:/Projects/osool-altamaioz-store/public/brand/logo/_tests";
fs.mkdirSync(t, { recursive: true });

for (const c of [
  { src: "preview-3", l: 22, t: 14, w: 88, h: 88, n: "m1" },
  { src: "preview-3", l: 28, t: 18, w: 78, h: 78, n: "m2" },
  { src: "preview-6", l: 12, t: 10, w: 92, h: 92, n: "m4" },
  { src: "preview-6", l: 18, t: 16, w: 76, h: 76, n: "m5" },
]) {
  await sharp(path.join(ext, `${c.src}.png`))
    .extract({ left: c.l, top: c.t, width: c.w, height: c.h })
    .trim({ threshold: 10 })
    .png()
    .toFile(path.join(t, `${c.n}.png`));
}
