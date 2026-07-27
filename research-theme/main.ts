import './site.css';
import { siteContent, manifest, programDescriptors, getContent } from '../src/content';
import { marked } from 'marked';
import type { ContentItem } from '../src/types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function el(id: string): HTMLElement | null {
  return document.getElementById(id);
}

function setText(id: string, text: string): void {
  const e = el(id); if (e) e.textContent = text;
}

function setHtml(id: string, html: string): void {
  const e = el(id); if (e) e.innerHTML = html;
}

const MONTHS: Record<string, number> = {
  Jan:1, Feb:2, Mar:3, Apr:4, May:5, Jun:6,
  Jul:7, Aug:8, Sep:9, Oct:10, Nov:11, Dec:12,
};
function dateOrdinal(date = ''): number {
  const parts = date.trim().split(' ');
  const year  = parseInt(parts.find(p => /^\d{4}$/.test(p)) ?? '0', 10);
  const month = MONTHS[parts.find(p => p in MONTHS) ?? ''] ?? 0;
  return year * 100 + month;
}

// ── Populate home ─────────────────────────────────────────────────────────────

const sc = siteContent;

setText('masthead-title', sc.about.role);

// Publications — sorted newest first, show up to 5
const articles = [...manifest.publications.articles].sort(
  (a, b) => dateOrdinal(b.date) - dateOrdinal(a.date),
);
setHtml('pub-list', articles.slice(0, 5).map(art => `
  <a href="#publications/articles/${esc(art.file)}" class="pub-item" data-content-link>
    <span class="pub-date">${esc(art.date ?? '')}</span>
    <span class="pub-body">
      ${art.tags?.length ? `<span class="pub-tags">${art.tags.map(esc).join(' · ')}</span>` : ''}
      <span class="pub-title">${esc(art.title)}</span>
      ${art.desc ? `<span class="pub-desc">${esc(art.desc)}</span>` : ''}
    </span>
  </a>`).join(''));

// Research programs
setText('research-intro', sc.research.section_intro);
setHtml('research-list', programDescriptors.map(prog => `
  <a href="${esc(prog.href)}" class="research-item" data-content-link>
    <span class="research-body">
      <span class="research-title">${esc(prog.title)}</span>
      <span class="research-desc">${esc(prog.desc)}</span>
    </span>
    <span class="research-arrow">→</span>
  </a>`).join(''));

// About
setHtml('about-paragraphs', sc.about.paragraphs.map(p => `<p>${esc(p)}</p>`).join(''));
setHtml('about-tags', sc.about.tags.map(t => `<span class="tag">${esc(t)}</span>`).join(''));
setHtml('sidebar-tags', sc.about.tags.map(t => `<div class="sidebar-tag">${esc(t)}</div>`).join(''));

// Contact
setText('contact-intro', sc.contact.section_intro);
setHtml('contact-list', sc.contact.cards.map(c => `
  <div class="contact-item">
    <div class="contact-label">${esc(c.label)}</div>
    <div class="contact-purpose">${esc(c.purpose)}</div>
    <div class="contact-email"><a href="mailto:${esc(c.email)}">${esc(c.email)}</a></div>
  </div>`).join(''));

// Contact sidebar (first card email)
if (sc.contact.cards.length) {
  const first = sc.contact.cards[0];
  setHtml('contact-email-sidebar', `<div class="sidebar-email"><a href="mailto:${esc(first.email)}">${esc(first.email)}</a></div>`);
}

// Footer
setText('footer-copy', sc.footer.copy);

// ── Content viewer / router ───────────────────────────────────────────────────

function toTitle(slug: string): string {
  return slug.replace(/-/g, ' ').replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function showView(): void {
  el('content-view')?.classList.add('active');
}
function hideView(): void {
  el('content-view')?.classList.remove('active');
}

function renderMd(mdText: string, backHash: string): void {
  const html = marked.parse(mdText) as string;
  setHtml('content-body', `<div class="cv-prose">${html}</div>`);
  el('back-btn')?.setAttribute('href', backHash || '#');
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
  setHtml('content-body', `
    <div class="cv-prose">
      <h1>${title}</h1>
      <div class="cv-list">${inner}</div>
    </div>`);
  el('back-btn')?.setAttribute('href', backHash || '#');
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
  setHtml('content-body', `
    <div class="cv-prose">
      <h1>${title}</h1>
      <div class="cv-tile-grid">${tileHtml}</div>
    </div>`);
  el('back-btn')?.setAttribute('href', backHash || '#');
  showView();
  window.scrollTo(0, 0);
}

function showError(msg: string): void {
  setHtml('content-body', `<div class="cv-prose"><p class="cv-empty">${msg}</p></div>`);
  showView();
}

function routePublications(parts: string[]): void {
  const [, sub, slug] = parts;
  if (slug) {
    const content = getContent(`publications/${sub}/${slug}`);
    if (!content) { showError(`Content not found: ${slug}`); return; }
    renderMd(content, `#publications/${sub}`);
  } else if (sub) {
    const items = (manifest.publications as Record<string, ContentItem[]>)[sub] ?? [];
    const labels: Record<string, string> = { articles: 'Articles', blog: 'Blog', ebooks: 'eBooks' };
    renderList(labels[sub] ?? toTitle(sub), items, `publications/${sub}`, '#publications');
  } else {
    renderLanding('Publications', [
      { href: '#publications/articles', title: 'Articles', desc: 'Long-form research and analysis.' },
      { href: '#publications/blog',     title: 'Blog',     desc: 'Shorter observations and notes.' },
      { href: '#publications/ebooks',   title: 'eBooks',   desc: 'Digital books and extended guides.' },
      { href: '#publications/courses',  title: 'Courses',  desc: 'Structured learning sequences.' },
    ], '');
  }
}

function routeCourses(parts: string[]): void {
  const [,, course, slug] = parts;
  if (slug) {
    const content = getContent(`publications/courses/${course}/${slug}`);
    if (!content) { showError(`Content not found: ${slug}`); return; }
    renderMd(content, `#publications/courses/${course}`);
  } else if (course) {
    const items = manifest.course_items?.[course];
    if (items) {
      const labels: Record<string, string> = { ss101: 'Systems Science 101' };
      renderList(labels[course] ?? toTitle(course), items, `publications/courses/${course}`, '#publications/courses');
    } else {
      const content = getContent(`publications/courses/${course}/overview`);
      if (!content) { showError('Overview not found.'); return; }
      renderMd(content, '#publications/courses');
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
  const [, subdir, slug] = parts;
  const subdirLabels: Record<string, string> = {
    systems_science_update:      'Systems Science Update',
    reader_first_writing_system: 'Reader-First Writing System',
    complex_diseases:            'Complex Diseases',
    human_spiritual_systems:     'Human Spiritual Systems',
    evolutionary_futurism:       'Evolutionary Futurism',
  };
  if (slug) {
    const content = getContent(`research/${subdir}/${slug}`);
    if (!content) { showError(`Content not found: ${slug}`); return; }
    renderMd(content, `#research/${subdir}`);
  } else if (subdir) {
    const items = (manifest.research as Record<string, ContentItem[]>)[subdir] ?? [];
    renderList(
      subdirLabels[subdir] ?? toTitle(subdir),
      items, `research/${subdir}`, '#research',
      'Research documents will be added as work develops.',
    );
  } else {
    renderLanding('Research', [
      { href: '#research/systems_science_update',      title: 'Systems Science Update',
        desc: 'Frameworks, foundations, and ongoing theoretical development.' },
      { href: '#research/reader_first_writing_system', title: 'Reader-First Writing System',
        desc: 'The cognitive and systems basis for reader-centered instructional writing.' },
      { href: '#research/complex_diseases',            title: 'Complex Diseases',
        desc: 'Systems modeling of chronic illness — ME/CFS, long COVID, and related conditions.' },
      { href: '#research/human_spiritual_systems',     title: 'Human Spiritual Systems',
        desc: 'Complex systems science applied to spiritual practice and meaning-making.' },
      { href: '#research/evolutionary_futurism',       title: 'Evolutionary Futurism',
        desc: 'Mapping the attractor landscape of human civilization.' },
    ], '');
  }
}

const ON_PAGE = new Set(['', 'about', 'contact', 'publications', 'research']);

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
    else if (top === 'publications') routePublications(parts);
    else if (top === 'research')     routeResearch(parts);
    else                             hideView();
  } catch (err) {
    showError((err as Error).message);
  }
}

window.addEventListener('hashchange', route);
route();

// ── Mobile nav ────────────────────────────────────────────────────────────────
const navEl = document.getElementById('nav')!;
document.getElementById('nav-toggle')?.addEventListener('click', function () {
  const open = navEl.classList.toggle('open');
  this.setAttribute('aria-expanded', String(open));
});
navEl.querySelectorAll('.nav-links a').forEach(a => {
  a.addEventListener('click', () => navEl.classList.remove('open'));
});
