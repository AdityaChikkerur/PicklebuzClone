import { mkdir, unlink, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.join(__dirname, "..");
const assetsDir = path.join(rootDir, "assets");

const BRAND_BG = { r: 10, g: 10, b: 11, alpha: 1 };

const iconSvg = path.join(rootDir, "public", "icons", "icon.svg");
const splashSvg = path.join(assetsDir, "splash-source.svg");

const logoPng = path.join(assetsDir, "logo.png");
const splashPng = path.join(assetsDir, "splash.png");

const staleAssets = [
  "icon.png",
  "icon-only.png",
  "icon-foreground.png",
  "icon-foreground.svg",
  "icon-background.png",
];

await mkdir(assetsDir, { recursive: true });

for (const file of staleAssets) {
  try {
    await unlink(path.join(assetsDir, file));
  } catch {
    // File may not exist.
  }
}

const logoBuffer = await sharp(iconSvg).resize(1024, 1024).png().toBuffer();
await writeFile(logoPng, logoBuffer);

const splashBuffer = await sharp(splashSvg)
  .resize(2732, 2732, { fit: "cover", position: "centre" })
  .png()
  .toBuffer();
await writeFile(splashPng, splashBuffer);

console.log("Generated premium Android assets (logo.png + splash.png)");
