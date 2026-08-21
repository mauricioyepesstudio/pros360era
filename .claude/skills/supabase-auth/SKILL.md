---
name: supabase-auth
description: How EVOLUSA wires Supabase email/password auth across server and client — session handling, protected routes, and the public-first funnel. Use when implementing or reviewing signup/login/logout/session-restoration code.
---

# EVOLUSA Supabase Auth procedure

## Preconditions

Do not wire real auth calls until `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` exist in `.env.local` for an EVOLUSA-specific Supabase project (never the BELONG project). Check with `lib/auth/config.ts`'s `getAuthReadiness()`. If not configured, keep the UI in the honest "pending configuration" state already established in `components/account/AuthFoundation.tsx` — never fabricate a working session.

## Required flows

Sign up, login, logout, session restoration (on page load / server render), protected account routes, server-aware auth (server components/actions read the session, not the client), auth error states (invalid credentials, existing account, weak password, rate limit) — each with a clear, non-technical Spanish-first error message.

## Server/client split

- **Browser client** (`lib/supabase/client.ts`): created with `createBrowserClient` from `@supabase/ssr`, using only the public URL/anon key. Used only in client components for interactive auth actions (submitting the login/signup form) and any live client-side subscriptions.
- **Server client** (`lib/supabase/server.ts`): created with `createServerClient` from `@supabase/ssr`, reading/writing the auth cookie via Next's `cookies()`. Used in Server Components, route handlers, and server actions for session checks and any authorized data read/write.
- **Proxy** (`proxy.ts` — Next.js 16 renamed `middleware.ts` to `proxy.ts`; check `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/proxy.md` before touching this file, the exported function is named `proxy` not `middleware`): refreshes the session cookie on every request and redirects unauthenticated requests away from protected routes (`/dashboard`, `/roadmap`, `/assistant`, `/profile`) to `/login`. This is the actual authorization gate — a client-side redirect alone is not sufficient and must never be the only check.

## Public-first funnel (do not force signup early)

`PUBLIC EVOLUSA → preliminary onboarding → useful preliminary roadmap/result → account creation (save progress) → personalized dashboard`. `/onboarding` and a first roadmap result must work without an account; only saving/continuing progress requires signup.

## Verification before calling this done

Run through `qa-engineer`'s auth-state checklist: every protected route redirects when signed out, shows only the signed-in user's own data when signed in, and no route half-renders private content before the redirect fires (check this server-side, not just via a client `useEffect`).
