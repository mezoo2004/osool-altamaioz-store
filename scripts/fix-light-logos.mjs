import sharp from "sharp";
import path from "path";
const out = "C:/Projects/osool-altamaioz-store/public/brand/logo";
async function toLight(src, dest) {
  const { data, info } = await sharp(src).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  const buf = Buffer.from(data);
  for (let i = 0; i < buf.length; i += 4) {
    const r = buf[i], g = buf[i+1], b = buf[i+2], a = buf[i+3];
    const isOrange = r > 170 && g > 50 && g < 170 && b < 100;
    const isWhiteBg = r > 240 && g > 240 && b > 240;
    if (isWhiteBg) { buf[i+3] = 0; continue; }
    if (!isOrange) { buf[i]=255; buf[i+1]=255; buf[i+2]=255; }
  }
  await sharp(buf, { raw: { width: info.width, height: info.height, channels: 4 } }).png().toFile(dest);
}
await toLight(path.join(out, "osool-logo-ar-dark.png"), path.join(out, "osool-logo-ar-light.png"));
await toLight(path.join(out, "osool-mark-dark.png"), path.join(out, "osool-mark-light.png"));
console.log("fixed light logos");
