import sharp from "sharp";
import fs from "fs";
import path from "path";

const dir = "public/assets";
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith(".png")) continue;
  const output = path.join(dir, f.replace(".png", ".webp"));
  await sharp(path.join(dir, f))
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 75 })
    .toFile(output);
  console.log(f, "->", Math.round(fs.statSync(output).size / 1024) + " KB");
}