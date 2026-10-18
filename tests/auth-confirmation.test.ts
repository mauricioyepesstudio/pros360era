import test from "node:test";
import assert from "node:assert/strict";
import { authEntryDestination, confirmationRequestMessage, isExistingSignup, isUnconfirmedEmail, normalizeAuthEmail, requestConfirmation, translateAuthError } from "../lib/auth/confirmation.ts";

test("confirmed/obfuscated signup copy does not claim delivery or disclose account existence", () => {
  assert.equal(isExistingSignup({ code: "user_already_exists", message: "opaque" }), true);
  assert.equal(isExistingSignup({ message: "User already registered" }), true);
  assert.match(confirmationRequestMessage, /Si hay una cuenta pendiente/);
  assert.doesNotMatch(confirmationRequestMessage, /[Tt]e enviamos|no existe|ya est[áa] registrada/);
  assert.equal(normalizeAuthEmail("  TEST@EXAMPLE.COM "), "test@example.com");
});
test("cooldown and invalid email do not make resend requests", async () => {
  let calls = 0; const client = { resend: async () => { calls++; return { error: null }; } };
  assert.equal((await requestConfirmation(client, "test@example.com", 1)).requested, false);
  assert.equal((await requestConfirmation(client, "not-email", 0)).requested, false);
  assert.equal(calls, 0);
});
test("resend uses real signup API and neutral acceptance without changing a role", async () => {
  let credentials: unknown;
  const result = await requestConfirmation({ resend: async (input) => { credentials = input; return { error: null }; } }, "  Test@Example.com ", 0);
  assert.deepEqual(credentials, { type: "signup", email: "test@example.com" });
  assert.equal(result.requested, true); assert.equal(result.message, confirmationRequestMessage);
});
test("resend rate/error/network failures never report requested success", async () => {
  const limited = await requestConfirmation({ resend: async () => ({ error: { code: "over_email_send_rate_limit", message: "limited" } }) }, "a@example.com", 0);
  assert.equal(limited.requested, false); assert.match(limited.message, /límite temporal/);
  const hidden = await requestConfirmation({ resend: async () => ({ error: { message: "User not found" } }) }, "a@example.com", 0);
  assert.equal(hidden.requested, false); assert.doesNotMatch(hidden.message, /not found|no existe/);
  const network = await requestConfirmation({ resend: async () => { throw new Error("network"); } }, "a@example.com", 0);
  assert.equal(network.requested, false);
});
test("unconfirmed login offers recovery and professional entry cannot elevate roles", () => {
  assert.equal(isUnconfirmedEmail({ code: "email_not_confirmed", message: "opaque" }), true);
  assert.equal(isUnconfirmedEmail({ message: "Invalid login credentials" }), false);
  assert.equal(authEntryDestination("/dashboard/professional", "MEMBER"), "/dashboard/professional");
  assert.equal(authEntryDestination("/dashboard/professional", "PROFESSIONAL"), "/panel-profesional");
  assert.equal(authEntryDestination("/dashboard/professional", undefined), "/dashboard/professional");
  assert.equal(authEntryDestination("https://attacker.invalid/", "PROFESSIONAL"), "/dashboard");
  assert.equal(authEntryDestination("/dashboard", "MEMBER"), "/dashboard");
});


test("admin professional entry uses the professional panel without changing default member entry", () => {
  assert.equal(authEntryDestination("/dashboard/professional", "ADMIN"), "/panel-profesional");
  assert.equal(authEntryDestination("/dashboard", "ADMIN"), "/dashboard");
});

test("structured auth codes provide actionable copy even with opaque messages", () => {
  const cases: [string, RegExp][] = [
    ["email_address_not_authorized", /administrador.*configuración de correo/],
    ["signup_disabled", /registro.*deshabilitado/],
    ["weak_password", /contraseña.*requisitos de seguridad/],
    ["email_address_invalid", /correo no parece válido/],
    ["over_email_send_rate_limit", /límite temporal de envíos/],
    ["over_request_rate_limit", /demasiados intentos/],
  ];
  for (const [code, expected] of cases) {
    assert.match(translateAuthError({ code, message: "opaque" }), expected);
  }
});

test("recognized code takes priority over contradictory legacy error wording", () => {
  const result = translateAuthError({ code: "over_request_rate_limit", message: "Email rate limit exceeded" });
  assert.match(result, /demasiados intentos/);
  assert.doesNotMatch(result, /envíos de correo/);
});

test("legacy auth translations remain supported and mail failures do not claim delivery", () => {
  assert.equal(translateAuthError("Invalid login credentials"), "Correo o contraseña incorrectos.");
  assert.match(translateAuthError("Password should be at least 6 characters"), /al menos 6 caracteres/);
  for (const message of ["Error sending confirmation email", "Error sending recovery email"]) {
    const result = translateAuthError(message);
    assert.match(result, /No se pudo enviar.*administrador/);
    assert.doesNotMatch(result, /enviado|recibirás/);
  }
});

test("unknown errors never expose provider details, codes or account existence", () => {
  const generic = "No pudimos completar la solicitud. Intenta de nuevo en unos minutos.";
  for (const message of ["User not found private@example.invalid", "User already registered private@example.invalid", "Database error saving new user: private@example.invalid", "opaque"]) {
    assert.equal(translateAuthError({ code: "unexpected_private_code", message }), generic);
  }
  assert.equal(translateAuthError({ code: "constructor", message: "opaque" }), generic);
});

test("resend preserves structured provider codes with opaque messages and no success", async () => {
  const result = await requestConfirmation({ resend: async () => ({ error: { code: "email_address_not_authorized", message: "opaque private@example.invalid" } }) }, "a@example.com", 0);
  assert.equal(result.requested, false);
  assert.match(result.message, /administrador.*configuración de correo/);
  assert.doesNotMatch(result.message, /private@example|opaque|email_address_not_authorized/);
});
