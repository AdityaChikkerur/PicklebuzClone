import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const resDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "android",
  "app",
  "src",
  "main",
  "res",
  "mipmap-anydpi-v26"
);

const adaptiveIconXml = `<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
    <background android:drawable="@mipmap/ic_launcher_background" />
    <foreground android:drawable="@mipmap/ic_launcher_foreground" />
</adaptive-icon>
`;

for (const file of ["ic_launcher.xml", "ic_launcher_round.xml"]) {
  await writeFile(path.join(resDir, file), adaptiveIconXml);
}

console.log("Removed adaptive icon inset for full-size launcher icons");
