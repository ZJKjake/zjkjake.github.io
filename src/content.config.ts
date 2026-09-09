import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/** A headline figure. `note` carries the caveat that keeps the claim honest. */
const metric = z.object({
  value: z.string(),
  label: z.string(),
  note: z.string().optional(),
});

const work = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/work' }),
  schema: z.object({
    title: z.string(),
    /** Short label used in nav lists and cards. */
    shortTitle: z.string().optional(),
    org: z.string(),
    role: z.string(),
    location: z.string().optional(),
    period: z.string(),
    /** One sentence, shown on cards and in search results. */
    summary: z.string(),
    /** Two or three sentences opening the case study. */
    lede: z.string(),
    kind: z.enum(['research', 'engineering', 'product']),
    /** Sort order on the work index; lower comes first. */
    order: z.number(),
    featured: z.boolean().default(false),
    stack: z.array(z.string()).default([]),
    metrics: z.array(metric).default([]),
    links: z
      .array(
        z.object({
          label: z.string(),
          href: z.string(),
          /** Marks assets served from this site rather than an external URL. */
          local: z.boolean().default(false),
        }),
      )
      .default([]),
    /**
     * True when the page embeds Agile Robots internal media or metrics.
     * Gated on `site.showCompanyMedia` so clearance can be revoked in one edit.
     */
    companyMedia: z.boolean().default(false),
  }),
});

export const collections = { work };
