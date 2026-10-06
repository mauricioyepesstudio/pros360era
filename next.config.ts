import type { NextConfig } from "next";

// Demo pages for 1MIGRATION/Laura promise follower/lead/income figures and
// target immigration (a regulated category). Kept in the repo but not served
// until the copy passes compliance-reviewer and the owner confirms with the
// advisor. Temporary redirects so they can be restored.
const PAUSED_DEMO_ROUTES: { source: string; destination: string }[] = [
  { source: "/professional-demo", destination: "/aplicar-profesional" },
  { source: "/professional-demo-tutorial", destination: "/aplicar-profesional" },
  { source: "/professional-invite", destination: "/aplicar-profesional" },
  { source: "/growth-automation/demo", destination: "/growth-automation" },
];

const nextConfig: NextConfig = {
  async redirects() {
    return PAUSED_DEMO_ROUTES.map((route) => ({ ...route, permanent: false }));
  },
};

export default nextConfig;
