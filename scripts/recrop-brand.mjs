import sharp from "sharp";
import path from "path";
import fs from "fs";
const ext = "C:/Projects/osool-altamaioz-store/public/brand/logo/_extracted";
if (!fs.existsSync(ext)) {
  console.error("run extract first");
  process.exit(1);
}
const out = "C:/Projects/osool-altamaioz-store/public/brand/logo";
await sharp(path.join(ext, "preview-3.png")).extract({ left: 286, top: 86, width: 208, height: 210 }).png().toFile(path.join(out, "osool-logo-ar-dark.png"));
await sharp(path.join(ext, "preview-6.png")).extract({ left: 8, top: 8, width: 95, height: 95 }).trim({ threshold: 14 }).png().toFile(path.join(out, "osool-mark-dark-tmp.png"));
async function toLight(src, dest) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const buf = Buffer.from(data);
  for (let i = 0; i < buf.length; i += 4) {
    const r = buf[i], g = buf[i+1], b = buf[i+2];
    const isOrange = r > 170 && g > 50 && g < 170 && b < 100;
    const isWhiteBg = r > 235 && g > 235 && b > 235;
    if (isWhiteBg) { buf[i+3]=0; continue; }
    if (!isOrange) { buf[i]=255; buf[i+1]=255; buf[i+2]=255; }
  }
  await sharp(buf, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(dest);
}
await toLight(path.join(out, "osool-logo-ar-dark.png"), path.join(out, "osool-logo-ar-light.png"));
await toLight(path.join(out, "osool-mark-dark-tmp.png"), path.join(out, "osool-mark-light.png"));
await sharp(path.join(out, "osool-mark-dark-tmp.png")).resize(512,512,{fit:"contain",background:{r:0,g:0,b:0,alpha:0}}).png().toFile(path.join(out, "osool-mark-dark.png"));
fs.unlinkSync(path.join(out, "osool-mark-dark-tmp.png"));
await sharp(path.join(out, "osool-mark-dark.png")).resize(32,32,{fit:"contain",background:{r:0,g:0,b:0,alpha:0}}).png().toFile("C:/Projects/osool-altamaioz-store/src/app/icon.png");
await sharp(path.join(out, "osool-mark-dark.png")).resize(180,180,{fit:"contain",background:{r:0,g:0,b:0,alpha:0}}).png().toFile("C:/Projects/osool-altamaioz-store/src/app/apple-icon.png");
fs.rmSync(ext, { recursive: true, force: true });
console.log("ok");
