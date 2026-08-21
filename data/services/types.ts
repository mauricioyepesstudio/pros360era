import type { FulfillmentType, ServiceCategory } from "../compliance/claims";
import type { StageId } from "../journey/types";

export type ServiceCta = { label: string; href: string };
export type ServiceSeo = { title: string; description: string };

export type EvolusaService = {
  id: string;
  slug: string;
  name: string;
  shortName: string;
  category: ServiceCategory;
  stageIds: readonly StageId[];
  summary: string;
  description: string;
  fulfillmentType: FulfillmentType;
  requiresVerification: boolean;
  enabled: boolean;
  featured: boolean;
  cta: ServiceCta;
  leadFormType: string;
  whatsappMessage: string;
  seo: ServiceSeo;
  relatedServiceIds: readonly string[];
  relatedResourceIds: readonly string[];
};
