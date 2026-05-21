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

function routePublicationsSection(parts: string[]): void {
  // #publications/articles, #publications/blog, #publications/ebooks
  // #publications/articles/some-slug
  const [, sub, slug] = parts;
  if (slug) {
    renderMd(loadMd(`publications/${sub}/${slug}`), `#publications/${sub}`);
  } else if (sub) {
    const items = (manifest.publications as Record<string, ContentItem[]>)[sub] ?? [];
    const labels: Record<string, string> = {
      articles: 'Articles',
      blog: 'Blog',
      ebooks: 'eBooks',
    };
    renderList(labels[sub] ?? toTitle(sub), items, `publications/${sub}`, '#publications');
  } else {
    renderLanding('Publications', [
      { href: '#publications/articles', title: 'Articles',
        desc: 'Long-form research and analysis across systems science and applied domains.' },
      { href: '#publications/blog', title: 'Blog',
        desc: 'Shorter observations, notes, and work-in-progress thinking.' },
      { href: '#publications/ebooks', title: 'eBooks',
        desc: 'Digital books and extended guides.' },
      { href: '#publications/courses', title: 'Courses',
        desc: 'Structured learning sequences across systems science disciplines.' },
    ], '');
  }
}

function routeCourses(parts: string[]): void {
  // #publications/courses, #publications/courses/ss101, #publications/courses/ss101/feedback-loops
  const [,, course, slug] = parts;   // parts[0]='publications', parts[1]='courses'
  if (slug) {
    renderMd(loadMd(`publications/courses/${course}/${slug}`), `#publications/courses/${course}`);
  } else if (course) {
    const items = manifest.course_items?.[course];
    if (items) {
      const labels: Record<string, string> = { ss101: 'Systems Science 101' };
      renderList(labels[course] ?? toTitle(course), items, `publications/courses/${course}`, '#publications/courses');
    } else {
      renderMd(loadMd(`publications/courses/${course}/overview`), '#publications/courses');
    }
  } else {
    const tiles = Object.entries(manifest.courses ?? {}).map(([s, desc]) => ({
      href: '#publications/courses/' + s,
      title: s === 'ss101' ? 'Systems Science 101' : toTitle(s),
      desc: typeof desc === 'string' ? desc : '',
    }));
    renderLanding('Courses', tiles, '#publications');
  }
}

function routeResearch(parts: string[]): void {
  // #research                          → landing with three tiles
  // #research/systems_science_update   → list of items in that subdir
  // #research/systems_science_update/isrd-framework → render md
  const [, subdir, slug] = parts;

  const subdirLabels: Record<string, string> = {
    systems_science_update:      'Systems Science Update',
    reader_first_writing_system: 'Reader-First Writing System',
    complex_diseases:            'Complex Diseases',
    human_spiritual_systems:     'Human Spiritual Systems',
    evolutionary_futurism:       'Evolutionary Futurism',
  };

  if (slug) {
    renderMd(loadMd(`research/${subdir}/${slug}`), `#research/${subdir}`);
  } else if (subdir) {
    const items = (manifest.research as Record<string, ContentItem[]>)[subdir] ?? [];
    renderList(
      subdirLabels[subdir] ?? toTitle(subdir),
      items,
      `research/${subdir}`,
      '#research',
      'Research documents will be added here as work develops.',
    );
  } else {
    renderLanding('Research', [
      { href: '#research/systems_science_update',      title: 'Systems Science Update',
        desc: 'Frameworks, foundations, and ongoing theoretical development.' },
      { href: '#research/reader_first_writing_system', title: 'Reader-First Writing System',
        desc: 'The cognitive and systems basis for reader-centered instructional writing.' },
      { href: '#research/complex_diseases',            title: 'Complex Diseases',
        desc: 'Systems modeling of chronic illness — ME/CFS, long COVID, and related conditions.' },
    ], '');
  }
}

// ── Main router ───────────────────────────────────────────────────────────────

// Hashes that correspond to sections on the main page (scroll, don't route).
// Sub-paths like #publications/articles still route even though #publications scrolls.
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
    if      (top === 'publications' && parts[1] === 'courses') routeCourses(parts);
    else if (top === 'publications') routePublicationsSection(parts);
    else if (top === 'research')     routeResearch(parts);
    else                             hideView();
  } catch (err) {
    showError((err as Error).message);
  }
}

export function initRouter(): void {
  window.addEventListener('hashchange', route);
  route();
}
