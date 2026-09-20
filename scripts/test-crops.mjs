import sharp from "sharp";
import path from "path";
const ext = "C:/Projects/osool-altamaioz-store/public/brand/logo/_extracted";
const out = "C:/Projects/osool-altamaioz-store/public/brand/logo/_tests";
import fs from "fs";
fs.mkdirSync(out,{recursive:true});
const crops = [
  {n:"ar-a", l:575,t:108,w:195,h:138},
  {n:"ar-b", l:585,t:115,w:175,h:125},
  {n:"ar-c", l:568,t:100,w:210,h:150},
  {n:"ar-d", l:595,t:120,w:160,h:110},
  {n:"mark-a", src:"preview-6", l:10,t:10,w:90,h:90},
  {n:"mark-b", src:"preview-6", l:15,t:15,w:75,h:75},
  {n:"mark-c", src:"preview-3", l:18,t:12,w:95,h:95},
];
for (const c of crops) {
  const src = c.src||"preview-3";
  await sharp(path.join(ext, `${src}.png`)).extract({left:c.l,top:c.t,width:c.w,height:c.h}).trim({threshold:12}).png().toFile(path.join(out, `${c.n}.png`));
}
