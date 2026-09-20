import sharp from "sharp";
import path from "path";
import fs from "fs";
const ext = "C:/Projects/osool-altamaioz-store/public/brand/logo/_extracted";
const out = "C:/Projects/osool-altamaioz-store/public/brand/logo";
await sharp(path.join(ext, "preview-3.png")).extract({ left: 292, top: 92, width: 215, height: 248 }).png().toFile(path.join(out, "osool-logo-ar-dark.png"));
const markSrc = path.join(out, "osool-mark-dark-trim.png");
if (!fs.existsSync(markSrc)) {
  await sharp(path.join(out, "osool-mark-dark.png")).trim({ threshold: 12 }).png().toFile(markSrc);
}
const mark = markSrc;
const { data, info } = await sharp(mark).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const outBuf = Buffer.from(data);
for (let i = 0; i < outBuf.length; i += 4) {
  const r = outBuf[i], g = outBuf[i+1], b = outBuf[i+2], a = outBuf[i+3];
  if (a < 20) continue;
  const isOrange = r > 180 && g > 60 && g < 160 && b < 80;
  if (!isOrange) { outBuf[i]=255; outBuf[i+1]=255; outBuf[i+2]=255; }
}
await sharp(outBuf, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(path.join(out, "osool-mark-light-tmp.png"));
const logoDark = path.join(out, "osool-logo-ar-dark.png");
const ld = await sharp(logoDark).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const lb = Buffer.from(ld.data);
for (let i = 0; i < lb.length; i += 4) {
  const r = lb[i], g = lb[i+1], b = lb[i+2], a = lb[i+3];
  if (a < 20) continue;
  const isOrange = r > 180 && g > 60 && g < 160 && b < 80;
  if (!isOrange) { lb[i]=255; lb[i+1]=255; lb[i+2]=255; }
}
await sharp(lb, { raw: { width: ld.info.width, height: ld.info.height, channels: 4 } }).png().toFile(path.join(out, "osool-logo-ar-light.png"));
await sharp(mark).resize(512,512,{ fit:"contain", background:{r:0,g:0,b:0,alpha:0} }).png().toFile(path.join(out, "osool-mark-dark.png"));
await sharp(path.join(out, "osool-mark-light-tmp.png")).resize(512,512,{ fit:"contain", background:{r:0,g:0,b:0,alpha:0} }).png().toFile(path.join(out, "osool-mark-light.png"));
for (const size of [16,32,48,180]) {
  await sharp(path.join(out, "osool-mark-dark.png")).resize(size,size,{ fit:"contain", background:{r:0,g:0,b:0,alpha:0} }).png().toFile(path.join(out, `favicon-${size}.png`));
}
await sharp(path.join(out, "favicon-32.png")).toFile("C:/Projects/osool-altamaioz-store/src/app/icon.png");
await sharp(path.join(out, "favicon-32.png")).toFile("C:/Projects/osool-altamaioz-store/src/app/apple-icon.png");
fs.rmSync(path.join(out, "_extracted"), { recursive: true, force: true });
fs.unlinkSync(path.join(out, "osool-mark-dark-trim.png"));
fs.unlinkSync(path.join(out, "osool-mark-light-tmp.png"));
fs.unlinkSync(path.join(out, "osool-wordmark-ar-dark.png"));
console.log("done");
