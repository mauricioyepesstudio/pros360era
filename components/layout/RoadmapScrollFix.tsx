"use client";

import { useEffect } from "react";

/**
 * "#roadmap" only resolves to a real target on mobile/tablet — the
 * ProductReveal section that carries that id is `lg:hidden`, so the desktop
 * layout has no visible element for the browser to land on and every
 * `href="#roadmap"` link (nav, StageSelector, StageServices, CTA, Footer)
 * silently no-ops on desktop. The compact "Tu plan EVOLUSA" panel already
 * lives inside HeroArtboard at `id="roadmap-desktop"` — this intercepts
 * `#roadmap` clicks only when the mobile target isn't actually visible and
 * redirects the scroll there instead of touching every call site.
 */
export default function RoadmapScrollFix() {
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const anchor = (event.target as HTMLElement | null)?.closest<HTMLAnchorElement>('a[href="#roadmap"]');
      if (!anchor) return;

      const mobileTarget = document.getElementById("roadmap");
      if (mobileTarget && mobileTarget.offsetParent !== null) return;

      const desktopTarget = document.getElementById("roadmap-desktop");
      if (!desktopTarget) return;

      event.preventDefault();
      desktopTarget.scrollIntoView({ behavior: "smooth", block: "start" });
      history.replaceState(null, "", "#roadmap-desktop");
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return null;
}
