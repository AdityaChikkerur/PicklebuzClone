import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const assetsDir = path.join(rootDir, "assets");
const iconSvg = path.join(rootDir, "public", "icons", "icon.svg");
const iconPng = path.join(assetsDir, "icon.png");
const splashPng = path.join(assetsDir, "splash.png");

await mkdir(assetsDir, { recursive: true });

const iconBuffer = await sharp(iconSvg).resize(1024, 1024).png().toBuffer();
await writeFile(iconPng, iconBuffer);

const splashBuffer = await sharp({
  create: {
    width: 2732,
    height: 2732,
    channels: 4,
    background: { r: 15, g: 23, b: 42, alpha: 1 },
  },
})
  .composite([{ input: iconBuffer, gravity: "center" }])
  .png()
  .toBuffer();

await writeFile(splashPng, splashBuffer);

console.log("Generated Android asset sources in assets/");
