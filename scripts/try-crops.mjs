import sharp from "sharp";
import path from "path";
const ext = "C:/Projects/osool-altamaioz-store/public/brand/logo/_extracted";
const out = "C:/Projects/osool-altamaioz-store/public/brand/logo";
for (const c of [
  {l:560,t:70,w:220,h:250,n:"try-a.png"},
  {l:520,t:70,w:250,h:250,n:"try-b.png"},
  {l:480,t:60,w:280,h:260,n:"try-c.png"},
]) {
  await sharp(path.join(ext,"preview-3.png")).extract({left:c.l,top:c.t,width:c.w,height:c.h}).png().toFile(path.join(out,c.n));
}
