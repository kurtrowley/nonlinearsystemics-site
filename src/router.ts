import { marked } from 'marked';
import { getContent, manifest } from './content';
import type { ContentItem } from './types';

// ── Helpers ──────────────────────────────────────────────────────────────────

function toTitle(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function el(id: string): HTMLElement {
  return document.getElementById(id)!;
}

function loadMd(path: string): string {
  const content = getContent(path);
  if (!content) throw new Error(`Content not found: ${path}`);
  return content;
}

// ── View control ─────────────────────────────────────────────────────────────

function showView(): void {
  el('content-view').classList.add('active');
  el('nav').classList.add('scrolled');
}

function hideView(): void {
  el('content-view').classList.remove('active');
  if (window.scrollY <= 60) el('nav').classList.remove('scrolled');
}

function showError(msg: string): void {
  el('content-body').innerHTML =
    `<div class="cv-prose"><p class="cv-empty">${msg}</p></div>`;
  showView();
}

// ── Renderers ────────────────────────────────────────────────────────────────

function renderMd(mdText: string, backHash: string): void {
  const html = marked.parse(mdText) as string;
  el('content-body').innerHTML = `<div class="cv-prose">${html}</div>`;
  el('back-btn').setAttribute('href', backHash || '#');
  showView();
  window.scrollTo(0, 0);
}

function renderList(
  title: string,
  items: ContentItem[],
  baseHash: string,
  backHash: string,
  emptyMsg?: string,
): void {
  let inner: string;
  if (!items.length) {
    inner = `<p class="cv-empty">${emptyMsg ?? 'Content coming soon.'}</p>`;
  } else {
    inner = items.map(item => `
      <a href="#${baseHash}/${item.file.replace('.md', '')}" class="cv-list-item">
        <span class="cv-date">${item.date ?? ''}</span>
        <span class="cv-item-body">
          ${item.tags ? `<span class="cv-tags">${item.tags.join(' · ')}</span>` : ''}
          <span class="cv-item-title">${item.title}</span>
          ${item.desc ? `<span class="cv-item-desc">${item.desc}</span>` : ''}
        </span>
      </a>`).join('');
  }
  el('content-body').innerHTML = `
    <div class="cv-prose">
      <h1>${title}</h1>
      <div class="cv-list">${inner}</div>
    </div>`;
  el('back-btn').setAttribute('href', backHash || '#');
  showView();
  window.scrollTo(0, 0);
}

function renderLanding(
  title: string,
  tiles: Array<{ href: string; title: string; desc: string }>,
  backHash: string,
): void {
  const tileHtml = tiles.map(t => `
    <a href="${t.href}" class="cv-tile">
      <strong>${t.title}</strong>
      ${t.desc ? `<span>${t.desc}</span>` : ''}
    </a>`).join('');
  el('content-body').innerHTML = `
    <div class="cv-prose">
      <h1>${title}</h1>
      <div class="cv-tile-grid">${tileHtml}</div>
    </div>`;
  el('back-btn').setAttribute('href', backHash || '#');
  showView();
  window.scrollTo(0, 0);
}

// ── Section routers ───────────────────────────────────────────────────────────

function routeWriting(parts: string[]): void {
  const [, sub, slug] = parts;
  if (slug) {
    renderMd(loadMd(`writing/${sub}/${slug}`), `#writing/${sub}`);
  } else if (sub) {
    const items = (manifest.writing as Record<string, ContentItem[]>)[sub] ?? [];
    const labels: Record<string, string> = {
      analyses: 'Analyses & Essays',
      articles: 'Articles',
      blog: 'Blog Posts',
    };
    renderList(labels[sub] ?? toTitle(sub), items, `writing/${sub}`, '#publications');
  } else {
    renderLanding('Publications', [
      { href: '#writing/analyses', title: 'Analyses & Essays',
        desc: 'Think tank essays and analyses on systems science and civilizational dynamics.' },
      { href: '#writing/articles', title: 'Articles',
        desc: 'Long-form research and analysis across systems science and applied domains.' },
      { href: '#writing/blog', title: 'Blog Posts',
        desc: 'Shorter observations, notes, and work-in-progress thinking.' },
    ], '');
  }
}

function routeCourses(parts: string[]): void {
  const [, course, slug] = parts;
  if (slug) {
    renderMd(loadMd(`courses/${course}/${slug}`), `#courses/${course}`);
  } else if (course) {
    const items = manifest.course_items?.[course];
    if (items) {
      const labels: Record<string, string> = { ss101: 'Systems Science 101' };
      renderList(labels[course] ?? toTitle(course), items, `courses/${course}`, '#courses');
    } else {
      renderMd(loadMd(`courses/${course}/overview`), '#courses');
    }
  } else {
    const tiles = Object.entries(manifest.courses ?? {}).map(([s, desc]) => ({
      href: '#courses/' + s,
      title: s === 'ss101' ? 'Systems Science 101' : toTitle(s),
      desc: typeof desc === 'string' ? desc : '',
    }));
    renderLanding('Courses', tiles, '');
  }
}

function routePublications(parts: string[]): void {
  const [, sub] = parts;
  const cats = ['workbooks', 'ebooks', 'tools', 'papers'];
  if (sub) {
    const items = (manifest.publications as Record<string, ContentItem[]>)[sub] ?? [];
    renderList(toTitle(sub), items, `publications/${sub}`, '#publications');
  } else {
    renderLanding('Publications', cats.map(c => ({
      href: '#publications/' + c, title: toTitle(c), desc: '',
    })), '');
  }
}

function routeResearch(parts: string[]): void {
  const [, slug] = parts;
  if (slug) {
    renderMd(loadMd(`research/${slug}`), '#research');
  } else {
    renderList('Research', manifest.research ?? [], 'research', '#',
      'Research project documents will be added here as work develops.');
  }
}

function routeVideos(parts: string[]): void {
  const [, slug] = parts;
  if (slug) {
    renderMd(loadMd(`videos/${slug}`), '#videos');
  } else {
    renderList('Videos', manifest.videos ?? [], 'videos', '#',
      'Video essays and demonstrations will appear here as they are produced.');
  }
}

function routeSoftware(parts: string[]): void {
  const [, slug] = parts;
  if (slug) {
    renderMd(loadMd(`software/${slug}`), '#software');
  } else {
    renderList('Software', manifest.software ?? [], 'software', '#',
      'Software documentation will be listed here as tools are released.');
  }
}

// ── Main router ───────────────────────────────────────────────────────────────

// Hashes that correspond to sections on the main page (scroll, don't route).
// Sub-paths like #writing/articles still route even though #writing scrolls.
const ON_PAGE = new Set([
  '', 'about', 'contact', 'publications', 'research',
]);

function route(): void {
  const hash = location.hash.slice(1);
  const parts = hash.split('/').filter(Boolean);
  const top = parts[0] ?? '';

  if (!hash || ON_PAGE.has(hash)) {
    hideView();
    if (hash) {
      requestAnimationFrame(() => {
        document.getElementById(hash)?.scrollIntoView({ behavior: 'smooth' });
      });
    }
    return;
  }

  try {
    if      (top === 'writing')      routeWriting(parts);
    else if (top === 'courses')      routeCourses(parts);
    else if (top === 'publications') routePublications(parts);
    else if (top === 'research')     routeResearch(parts);
    else if (top === 'videos')       routeVideos(parts);
    else if (top === 'software')     routeSoftware(parts);
    else                             hideView();
  } catch (err) {
    showError((err as Error).message);
  }
}

export function initRouter(): void {
  window.addEventListener('hashchange', route);
  route();
}
