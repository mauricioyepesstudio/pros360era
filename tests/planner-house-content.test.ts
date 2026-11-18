import test from "node:test";
import assert from "node:assert/strict";
import { isEvolusaBrandedPost, isEvolusaHouseAccount } from "../lib/professional-planner/house-content.ts";

const base = { title: "Tu banco bajó", caption: "Consejo de finanzas personales.", imageUrl: "/professionals/kits/miguel-acosta/01-banco-baja-4x5.png", status: "READY" };

test("a professional's own content is not EVOLUSA-branded", () => {
  assert.equal(isEvolusaBrandedPost(base), false);
  assert.equal(isEvolusaBrandedPost({ ...base, imageUrl: "https://example.com/mi-video.mp4" }), false);
});

test("EVOLUSA name, links and explainer videos are caught", () => {
  assert.equal(isEvolusaBrandedPost({ ...base, title: "Reel: cómo funciona EVOLUSA" }), true);
  assert.equal(isEvolusaBrandedPost({ ...base, caption: "Más en evolusa.vercel.app" }), true);
  assert.equal(isEvolusaBrandedPost({ ...base, caption: "Somos Evol USA" }), true);
  assert.equal(isEvolusaBrandedPost({ ...base, imageUrl: "/videos/usuario-9x16.mp4" }), true);
  assert.equal(isEvolusaBrandedPost({ ...base, imageUrl: "https://evolusa.vercel.app/brand/post.png" }), true);
  assert.equal(isEvolusaBrandedPost({ ...base, status: "IDEA", title: "EVOLUSA para profesionales" }), true, "ideas count: they can become READY");
});

test("published history imported from the network is left alone", () => {
  assert.equal(isEvolusaBrandedPost({ ...base, status: "PUBLISHED", title: "Hola, somos EVOLUSA" }), false);
});

test("only EVOLUSA's own account is exempt", () => {
  assert.equal(isEvolusaHouseAccount("hola.evolusa@gmail.com"), true);
  assert.equal(isEvolusaHouseAccount(" Hola.Evolusa@gmail.com "), true);
  assert.equal(isEvolusaHouseAccount("miguel_acosta_martinez@outlook.es"), false);
  assert.equal(isEvolusaHouseAccount(null), false);
});
