/* eslint-disable @typescript-eslint/no-require-imports */
// scripts/build-css.js
const fs = require("fs");
const path = require("path");
const postcss = require("postcss");
const tailwind = require("@tailwindcss/postcss");

async function buildCSS() {
  const inputPath = path.join(__dirname, "../src/app/input.css");
  const outputPath = path.join(__dirname, "../src/app/globals.css");

  const inputCSS = fs.readFileSync(inputPath, "utf8");
  const result = await postcss([tailwind()]).process(inputCSS, {
    from: inputPath,
    to: outputPath,
  });

  fs.writeFileSync(outputPath, result.css);
  console.log(`[build-css] Generated ${result.css.length} bytes of compiled Tailwind CSS to globals.css`);
}

buildCSS().catch((err) => {
  console.error("[build-css] Error:", err);
  process.exit(1);
});

