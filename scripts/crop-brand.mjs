import sharp from "sharp";
import path from "path";
const ext = "C:/Projects/osool-altamaioz-store/public/brand/logo/_extracted";
const out = "C:/Projects/osool-altamaioz-store/public/brand/logo";
const crops = [
  { src: "preview-6.png", name: "osool-mark-dark.png", left: 8, top: 8, width: 95, height: 95 },
  { src: "preview-3.png", name: "osool-logo-ar-dark.png", left: 520, top: 55, width: 250, height: 320 },
  { src: "preview-3.png", name: "osool-wordmark-ar-dark.png", left: 545, top: 200, width: 200, height: 90 },
  { src: "preview-6.png", name: "osool-wordmark-ar-header.png", left: 520, top: 18, width: 260, height: 55 },
];
for (const c of crops) {
  await sharp(path.join(ext, c.src)).extract({ left: c.left, top: c.top, width: c.width, height: c.height }).png().toFile(path.join(out, c.name));
  console.log("wrote", c.name);
}
