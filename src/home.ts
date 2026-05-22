// Populates the index page from site-content.json and program descriptors.
// All text and card content is driven by editable JSON files — no HTML edits needed
// for copy changes. Called once on module load (scripts are deferred via type="module").
import { manifest } from './content';
import type { SiteContent, ProgramDescriptor } from './types';

// ── Helpers ───────────────────────────────────────────────────────────────────

function setText(id: string, text: string): void {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

function setHtml(id: string, html: string): void {
  const el = document.getElementById(id);
  if (el) el.innerHTML = html;
}

function setAttr(id: string, attr: string, value: string): void {
  const el = document.getElementById(id);
  if (el) el.setAttribute(attr, value);
}

function esc(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// Parse date strings like "May 2026", "Apr 2026", "2026" into a sortable number.
// Used to order articles most-recent-first.
const MONTHS: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};

function dateOrdinal(date: string = ''): number {
  const parts = date.trim().split(' ');
  const year  = parseInt(parts.find(p => /^\d{4}$/.test(p)) ?? '0', 10);
  const month = MONTHS[parts.find(p => p in MONTHS) ?? ''] ?? 0;
  return year * 100 + month;
}

// ── Render functions ──────────────────────────────────────────────────────────

function renderFeaturedCard(sc: SiteContent): void {
  const articles = [...manifest.publications.articles].sort(
    (a, b) => dateOrdinal(b.date) - dateOrdinal(a.date),
  );
  const featured = articles.find(a => a.file === sc.publications.featured_article) ?? articles[0];
  if (!featured) return;

  const el = document.getElementById('pub-featured');
  if (!el) return;

  el.innerHTML = `
    <a href="#publications/articles/${esc(featured.file)}"
       class="featured-essay" data-content-link>
      <div class="essay-meta">
        <span class="essay-tag">${esc(sc.publications.section_label)} / Articles</span>
        <span class="essay-date">${esc(featured.date ?? '')}</span>
      </div>
      <h3 class="essay-title">${esc(featured.title)}</h3>
      <p class="essay-sub">${esc(featured.desc ?? '')}</p>
      <p class="essay-body">${sc.publications.featured_excerpt}</p>
      <span class="essay-link">${esc(sc.publications.featured_link_label)}</span>
    </a>`;
}

function renderSecondaryCards(sc: SiteContent): void {
  const articles = [...manifest.publications.articles].sort(
    (a, b) => dateOrdinal(b.date) - dateOrdinal(a.date),
  );
  const secondary = articles
    .filter(a => a.file !== sc.publications.featured_article)
    .slice(0, 3);

  const el = document.getElementById('pub-cards');
  if (!el) return;

  el.innerHTML = secondary.map(art => `
    <a href="#publications/articles/${esc(art.file)}" class="card" data-content-link>
      <div class="card-tag">${esc(sc.publications.section_label)} / Articles</div>
      <h3>${esc(art.title)}</h3>
      <p>${esc(art.desc ?? '')}</p>
      <span class="card-link">${esc(sc.publications.card_link_label)}</span>
    </a>`).join('');
}

function renderResearchCards(programs: ProgramDescriptor[]): void {
  const el = document.getElementById('research-cards');
  if (!el || !programs.length) return;

  el.innerHTML = programs.map(prog => `
    <a href="${esc(prog.href)}" class="card" data-content-link>
      <div class="card-tag">Research / ${esc(prog.title)}</div>
      <h3>${esc(prog.title)}</h3>
      <p>${esc(prog.desc)}</p>
      <span class="card-link">${esc(prog.card_link_label)}</span>
    </a>`).join('');
}

function renderContactCards(sc: SiteContent): void {
  const el = document.getElementById('contact-grid');
  if (!el) return;

  el.innerHTML = sc.contact.cards.map(c => `
    <div class="contact-card">
      <div class="contact-card-label">${esc(c.label)}</div>
      <div class="contact-card-purpose">${esc(c.purpose)}</div>
      <a href="mailto:${esc(c.email)}">${esc(c.email)}</a>
    </div>`).join('');
}

function renderToolsStrip(sc: SiteContent): void {
  const el = document.getElementById('tools-strip');
  if (!el || !sc.tools.items.length) return;

  const items = sc.tools.items.map(item => `
    <span class="tools-text">
      <a href="${esc(item.href)}" class="tools-link">${esc(item.label)} ↗</a>
      — ${esc(item.description)}
    </span>`).join('');

  el.innerHTML = `<span class="tools-label">${esc(sc.tools.label)}</span>${items}`;
}

// ── Main export ───────────────────────────────────────────────────────────────

export function populateHomePage(sc: SiteContent, programs: ProgramDescriptor[]): void {
  // Hero
  setText('hero-statement', sc.hero.statement);
  setText('hero-cta-primary', sc.hero.cta_primary_label);
  setAttr('hero-cta-primary', 'href', sc.hero.cta_primary_href);
  setText('hero-cta-ghost', sc.hero.cta_ghost_label);
  setAttr('hero-cta-ghost', 'href', sc.hero.cta_ghost_href);

  // Identity strip (contains <strong> tags — stored as HTML)
  setHtml('identity-text', sc.identity);

  // Publications section header
  setText('pub-section-label', sc.publications.section_label);
  setText('pub-section-title', sc.publications.section_title);

  // Publications cards (auto-rendered from manifest, sorted by date)
  renderFeaturedCard(sc);
  renderSecondaryCards(sc);

  // Research section header
  setText('research-section-label', sc.research.section_label);
  setText('research-section-title', sc.research.section_title);
  setText('research-section-intro', sc.research.section_intro);
  setText('research-browse-btn', sc.research.browse_label);
  setAttr('research-browse-btn', 'href', sc.research.browse_href);

  // Research program cards (auto-rendered from program.json files)
  renderResearchCards(programs);

  // About
  setText('about-name', sc.about.name);
  setText('about-role', sc.about.role);
  setText('about-heading', sc.about.heading);
  setHtml('about-tags', sc.about.tags.map(t => `<span class="tag">${esc(t)}</span>`).join(''));
  // About paragraphs are plain text — wrapped in <p> tags here, not stored as HTML
  setHtml('about-paragraphs', sc.about.paragraphs.map(p => `<p>${esc(p)}</p>`).join(''));

  // Contact
  setText('contact-section-label', sc.contact.section_label);
  setText('contact-section-title', sc.contact.section_title);
  setText('contact-section-intro', sc.contact.section_intro);
  renderContactCards(sc);

  // Tools strip
  renderToolsStrip(sc);

  // Footer
  setText('footer-brand', sc.footer.brand);
  setText('footer-copy', sc.footer.copy);
}
