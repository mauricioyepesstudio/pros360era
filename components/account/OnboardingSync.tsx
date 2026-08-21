"use client";
import { useEffect } from "react";
import { syncOnboardingAction } from "@/app/(account)/actions";
import { ONBOARDING_STORAGE_KEY } from "@/components/account/OnboardingFlow";

/**
 * Mounted once in AccountShell so every account page checks, on first
 * render after a real sign-in, whether the public OnboardingFlow left a
 * pending answer set in sessionStorage. If so, persists it via the server
 * action and clears it — a one-time handoff from the anonymous onboarding
 * experience to the signed-in account, matching the public-first funnel
 * (no account required to see a preliminary result; only saving it does).
 */
export default function OnboardingSync() {
  useEffect(() => {
    const raw = sessionStorage.getItem(ONBOARDING_STORAGE_KEY);
    if (!raw) return;

    let pending: {
      answers: Record<string, unknown>;
      selectedNeeds: string[];
      profileUpdates: Record<string, string | undefined>;
    };
    try {
      pending = JSON.parse(raw);
    } catch {
      sessionStorage.removeItem(ONBOARDING_STORAGE_KEY);
      return;
    }

    sessionStorage.removeItem(ONBOARDING_STORAGE_KEY);
    syncOnboardingAction(
      pending.answers,
      pending.selectedNeeds as never,
      pending.profileUpdates as never,
    ).catch(() => {
      // Best-effort sync — if it fails, the user's profile just stays at
      // its defaults rather than blocking any part of the account UI.
    });
  }, []);

  return null;
}
