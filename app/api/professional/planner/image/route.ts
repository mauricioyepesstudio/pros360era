import { randomUUID } from "node:crypto";
import { createSupabaseServiceRoleClient } from "@/lib/supabase/service";
import { socialConnectionOwner } from "@/lib/social/connections";
import { handlePlannerImageUpload, plannerImageBucket, plannerImageMaxObjects } from "@/lib/professional-planner/image-upload";

export const runtime = "nodejs";

export async function POST(request: Request) {
  return handlePlannerImageUpload(request, {
    owner: async () => (await socialConnectionOwner())?.user.id ?? null,
    store: async (ownerId, image) => {
      const service = createSupabaseServiceRoleClient();
      if (!service) return null;
      const bucket = service.storage.from(plannerImageBucket);
      const { data: existing, error: listError } = await bucket.list(ownerId, { limit: plannerImageMaxObjects });
      if (listError || !existing || existing.length >= plannerImageMaxObjects) return null;
      const path = `${ownerId}/${randomUUID()}.jpg`;
      const { error } = await bucket.upload(path, image, { contentType: "image/jpeg", upsert: false });
      return error ? null : bucket.getPublicUrl(path).data.publicUrl;
    },
  });
}
