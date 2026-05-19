// import.meta.glob with eager:true bundles all .md files at build time.
// Adding a new .md file to the content/ directories and rebuilding is all that's needed —
// no manifest update, no fetch calls at runtime.
import manifestJson from '../content/manifest.json';
import type { Manifest } from './types';

const rawFiles = import.meta.glob('../content/**/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

// Normalize Vite's glob paths to the keys the router uses:
// '../content/writing/articles/energy-envelopes.md' → 'writing/articles/energy-envelopes'
const contentMap: Record<string, string> = {};
for (const [vitePath, raw] of Object.entries(rawFiles)) {
  const key = vitePath.replace(/^\.\.\/content\//, '').replace(/\.md$/, '');
  contentMap[key] = raw;
}

export function getContent(path: string): string | null {
  return contentMap[path] ?? null;
}

export const manifest = manifestJson as Manifest;
