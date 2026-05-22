// import.meta.glob with eager:true bundles all .md files at build time.
// Adding a new .md file to the content/ directories and rebuilding is all that's needed —
// no manifest update, no fetch calls at runtime.
import manifestJson from '../content/manifest.json';
import siteContentJson from '../content/site-content.json';
import type { Manifest, SiteContent, ProgramDescriptor } from './types';

const rawFiles = import.meta.glob('../content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// Normalize Vite's glob paths to the keys the router uses:
// '../content/publications/articles/foo.md' → 'publications/articles/foo'
const contentMap: Record<string, string> = {};
for (const [vitePath, raw] of Object.entries(rawFiles)) {
  const key = vitePath.replace(/^\.\.\/content\//, '').replace(/\.md$/, '');
  contentMap[key] = raw;
}

export function getContent(path: string): string | null {
  return contentMap[path] ?? null;
}

export const manifest = manifestJson as Manifest;

export const siteContent = siteContentJson as SiteContent;

// Auto-discover program.json files across all research subdirectories.
// Sorted by the `order` field so home page cards appear in a defined sequence.
const rawPrograms = import.meta.glob('../content/research/*/program.json', {
  eager: true,
  import: 'default',
}) as Record<string, ProgramDescriptor>;

export const programDescriptors: ProgramDescriptor[] = Object.values(rawPrograms)
  .sort((a, b) => (a.order ?? 99) - (b.order ?? 99));
