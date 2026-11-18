# EvolUSA — creative director integration

The authoritative agency proposal generator lives in `mauricioyepesstudio/ai-agency-control-plane` under `agency creative-propose`.

**Identity contract:** before producing an asset, resolve the real professional's identity and select its own profile id. Current registry: Laura `laura_onemigration`, Marie `marie_notary`, Miguel `miguel_finance`, Mauricio `mauricio_marketing`. Never use one generic image or message across profiles. Synthetic demos must remain labeled.

Generate a tailored creative direction:
```bash
agency creative-propose evolusa laura_onemigration "Explain administrative document preparation without offering legal advice"
agency creative-propose evolusa marie_notary "Present the process for booking a notary consultation"
agency creative-propose evolusa miguel_finance "Introduce clear financial reporting services"
agency creative-propose evolusa mauricio_marketing "Show high-end branding and automation case studies"
```

All content is DRAFT. Real images, rights, actual credentials and text must be verified before publication. Require cropped-image inspection, mobile layout, typographic QA, tone QA and owner approval. The output is a creative brief, not an actual generated image.

The professional profile gallery should render **approved media tied to that account**; otherwise show a high-quality branded placeholder rather than licensed-looking fake stock. No fictitious testimonials, legal advice or universal guarantee.
