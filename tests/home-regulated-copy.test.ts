import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const files = ["app/layout.tsx", "sections/home/Hero.tsx", "sections/home/HeroArtboard.tsx", "sections/home/CTA.tsx"];
const regulated = /notari|migratori|abogad|impuest|orientación inmigrantes/i;

test("home metadata and hero never advertise regulated services", () => {
  for (const file of files) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    const keywords = source.match(/keywords:\s*\[([\s\S]*?)\]/)?.[1] ?? "";
    assert.doesNotMatch(keywords, regulated, `${file} keywords`);
    for (const line of source.split("\n").filter((l) => l.includes("text-white/70"))) {
      assert.doesNotMatch(line, regulated, `${file} hero subline`);
    }
  }
});

test("hero claims an approved profile, never verified identity", () => {
  for (const file of files.slice(1)) {
    const source = readFileSync(new URL(`../${file}`, import.meta.url), "utf8");
    assert.match(source, /perfil aprobado por EVOLUSA/);
    assert.doesNotMatch(source, /identidad verificada|profesionales verificados/i);
  }
});
