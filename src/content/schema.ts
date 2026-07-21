/**
 * Content schema for paperViz.
 *
 * Every paper-marketing site is described by a single `papers/<slug>.json`
 * file that must validate against `PaperContentSchema`. Nothing paper-specific
 * (prose, numbers, labels) should live in component code once a page has been
 * migrated onto this schema — see CLAUDE.md.
 *
 * `.describe()` labels are attached to most leaf fields; Phase 5's generic
 * content-editor form is expected to read them, so keep them short and
 * user-facing (they may be shown directly as form labels/help text).
 */
import { z } from 'zod';

// ---------------------------------------------------------------------------
// Shared primitives
// ---------------------------------------------------------------------------

export const LinkSchema = z.object({
  label: z.string().min(1).describe('Visible link text (e.g. "Read in Nature")'),
  url: z.string().url().describe('Destination URL (DOI, SSRN, journal page, etc.)'),
});
export type Link = z.infer<typeof LinkSchema>;

export const AuthorSchema = z.object({
  name: z.string().min(1).describe('Author full name'),
  role: z.string().min(1).describe('Affiliation or role shown under the name'),
});
export type Author = z.infer<typeof AuthorSchema>;

export const QuoteSchema = z.object({
  text: z.string().min(1).describe('Pull-quote text (without surrounding quotation marks)'),
  author: z.string().min(1).describe('Quote attribution (e.g. "— Bausch et al., Nature (2024)")'),
});
export type Quote = z.infer<typeof QuoteSchema>;

// ---------------------------------------------------------------------------
// Meta
// ---------------------------------------------------------------------------

export const HERO_SCENES = ['quantum', 'abstract-network', 'none'] as const;

export const MetaSchema = z.object({
  title: z.string().min(1).describe('Paper title'),
  subtitle: z.string().min(1).describe('Subtitle shown under the title on the hero'),
  venue: z.string().min(1).describe('Journal, conference, or venue name (e.g. "Nature", "SSRN")'),
  publishDate: z.string().min(1).describe('Human-readable publish date (e.g. "Nov 2024")'),
  description: z.string().min(1).describe('Hero abstract / one-paragraph summary'),
  links: z.array(LinkSchema).min(1).describe('External links (paper, DOI, SSRN, code, etc.)'),
  heroScene: z
    .enum(HERO_SCENES)
    .default('none')
    .describe('3D hero background scene to render behind the title'),
});
export type Meta = z.infer<typeof MetaSchema>;

// ---------------------------------------------------------------------------
// Prose sections
// ---------------------------------------------------------------------------

export const ProseSectionSchema = z.object({
  id: z.string().min(1).describe('Stable anchor id (used for #hash nav and scroll-to)'),
  navLabel: z.string().min(1).optional().describe('Label shown in the nav bar for this section'),
  inNav: z.boolean().default(true).describe('Whether this section appears in the nav bar / mobile menu'),
  eyebrow: z.string().optional().describe('Small uppercase label rendered above the title'),
  title: z.string().min(1).describe('Section heading'),
  dropcap: z.boolean().default(false).describe('Render an oversized dropcap on the first letter of body[0]'),
  body: z.array(z.string().min(1)).min(1).describe('Paragraphs of body copy, rendered in order'),
  tone: z
    .enum(['default', 'inverse'])
    .default('default')
    .describe('"inverse" renders the section on a dark background for contrast'),
  layout: z
    .enum(['prose', 'figure-right', 'figure-left', 'figure-below'])
    .default('prose')
    .describe('Structural arrangement of text vs. figure within the section'),
  figureId: z.string().min(1).optional().describe('id of a figure in figures[] to render alongside this section'),
  quote: QuoteSchema.optional().describe('Optional pull-quote rendered within the section'),
});
export type ProseSection = z.infer<typeof ProseSectionSchema>;

// ---------------------------------------------------------------------------
// Figures — discriminated union on `kind`
// ---------------------------------------------------------------------------

export const INTERACTIVE_COMPONENTS = [
  'grouped-bar',
  'event-study-explorer',
  'coefficient-bar',
  'surface-code',
  'transformer-decoder',
  'quantum-computer-scene',
] as const;

/**
 * Per-component prop shapes are NOT validated here — they live in the figure
 * registry (Phase 4), keyed by `component`. This keeps the root content
 * schema decoupled from the figure component library.
 */
export const InteractiveFigureSchema = z.object({
  kind: z.literal('interactive'),
  id: z.string().min(1).describe('Unique figure id; referenced by ProseSection.figureId'),
  component: z
    .enum(INTERACTIVE_COMPONENTS)
    .describe('Which registered interactive component to render'),
  title: z.string().optional().describe('Optional heading rendered above the figure'),
  description: z.string().optional().describe('Optional guide/caption text rendered above the figure'),
  props: z.record(z.string(), z.unknown()).default({}).describe('Component-specific props'),
});
export type InteractiveFigure = z.infer<typeof InteractiveFigureSchema>;

export const StaticFigureSchema = z.object({
  kind: z.literal('static'),
  id: z.string().min(1).describe('Unique figure id; referenced by ProseSection.figureId'),
  src: z
    .string()
    .min(1)
    .refine((v) => !v.startsWith('/'), {
      message: 'src must be a path relative to public/papers/<slug>/ — no leading slash (use withBase() at render time)',
    })
    .describe('Image path relative to public/papers/<slug>/, no leading slash'),
  alt: z.string().min(1).describe('Accessible alt text'),
  caption: z.string().min(1).describe('Caption shown under the image'),
  credit: z.string().optional().describe('Optional attribution / source credit line'),
});
export type StaticFigure = z.infer<typeof StaticFigureSchema>;

export const CONCEPT_NODE_TYPES = ['driver', 'mechanism', 'outcome', 'moderator', 'neutral'] as const;
export const CONCEPT_EDGE_SIGNS = ['positive', 'negative', 'neutral'] as const;

export const ConceptNodeSchema = z.object({
  id: z.string().min(1).describe('Unique node id, referenced by edge from/to'),
  label: z.string().min(1).describe('Node label text'),
  type: z.enum(CONCEPT_NODE_TYPES).describe('Semantic role, drives node styling'),
  column: z.number().optional().describe('Optional column layout hint'),
  row: z.number().optional().describe('Optional row layout hint'),
  note: z.string().optional().describe('Optional supplementary note shown on hover/expand'),
});
export type ConceptNode = z.infer<typeof ConceptNodeSchema>;

export const ConceptEdgeSchema = z.object({
  id: z.string().min(1).describe('Unique edge id'),
  from: z.string().min(1).describe('Source node id'),
  to: z.string().min(1).describe('Target node id'),
  sign: z.enum(CONCEPT_EDGE_SIGNS).describe('Sign of the relationship, drives edge styling'),
  label: z.string().optional().describe('Optional label rendered along the edge'),
  style: z.enum(['solid', 'dashed']).default('solid').describe('Edge line style'),
  labelSide: z
    .enum(['auto', 'above', 'below'])
    .default('auto')
    .describe('Which side of the edge the label sits on (auto = collision-based placement)'),
});
export type ConceptEdge = z.infer<typeof ConceptEdgeSchema>;

export const ConceptMapSpecSchema = z.object({
  nodes: z.array(ConceptNodeSchema).min(1).describe('Concept-map nodes'),
  edges: z.array(ConceptEdgeSchema).describe('Concept-map edges'),
  layout: z
    .object({
      columns: z.number().optional().describe('Number of layout columns'),
    })
    .optional()
    .describe('Optional layout hints for the diagram renderer'),
});
export type ConceptMapSpec = z.infer<typeof ConceptMapSpecSchema>;

export const DiagramFigureSchema = z.object({
  kind: z.literal('diagram'),
  id: z.string().min(1).describe('Unique figure id; referenced by ProseSection.figureId'),
  title: z.string().optional().describe('Optional heading rendered above the diagram'),
  description: z.string().optional().describe('Optional guide/caption text rendered above the diagram'),
  spec: ConceptMapSpecSchema.describe('LLM-generated or hand-authored concept-map spec'),
});
export type DiagramFigure = z.infer<typeof DiagramFigureSchema>;

export const FigureSchema = z.discriminatedUnion('kind', [
  InteractiveFigureSchema,
  StaticFigureSchema,
  DiagramFigureSchema,
]);
export type Figure = z.infer<typeof FigureSchema>;

// ---------------------------------------------------------------------------
// Authors + footer
// ---------------------------------------------------------------------------

export const AuthorsBlockSchema = z.object({
  eyebrow: z.string().default('RESEARCH TEAM').describe('Small uppercase label above the authors heading'),
  heading: z.string().default('Key Contributors').describe('Authors section heading'),
  subheading: z.string().optional().describe('Optional one-line description under the heading'),
  list: z.array(AuthorSchema).describe('Authors to display as cards'),
  footnote: z.string().optional().describe('Optional italic footnote under the author cards'),
});
export type AuthorsBlock = z.infer<typeof AuthorsBlockSchema>;

export const FooterSchema = z.object({
  blurb: z.string().optional().describe('Footer attribution line (e.g. "Based on research published in...")'),
  tagline: z.string().optional().describe('Optional second footer line'),
});
export type Footer = z.infer<typeof FooterSchema>;

// ---------------------------------------------------------------------------
// Root schema
// ---------------------------------------------------------------------------

export const PaperContentSchema = z.object({
  meta: MetaSchema,
  sections: z.array(ProseSectionSchema).min(1).describe('Ordered prose sections making up the page body'),
  figures: z.array(FigureSchema).default([]).describe('Figures referenced by id from sections[].figureId'),
  authors: AuthorsBlockSchema,
  footer: FooterSchema.default({}),
});
export type PaperContent = z.infer<typeof PaperContentSchema>;
