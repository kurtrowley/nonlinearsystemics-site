export interface ContentItem {
  file: string;
  title: string;
  date?: string;
  tags?: string[];
  desc?: string;
}

export interface Manifest {
  publications: {
    articles: ContentItem[];
    blog: ContentItem[];
    ebooks: ContentItem[];
  };
  research: Record<string, ContentItem[]>;
  courses: Record<string, string>;
  course_items: Record<string, ContentItem[]>;
}

// ── Site content (site-content.json) ─────────────────────────────────────────

export interface SiteContentHero {
  statement: string;
  cta_primary_label: string;
  cta_primary_href: string;
  cta_ghost_label: string;
  cta_ghost_href: string;
}

export interface SiteContentPublications {
  section_label: string;
  section_title: string;
  featured_article: string;
  featured_excerpt: string;
  card_link_label: string;
  featured_link_label: string;
}

export interface SiteContentResearch {
  section_label: string;
  section_title: string;
  section_intro: string;
  browse_label: string;
  browse_href: string;
}

export interface SiteContentAbout {
  name: string;
  role: string;
  tags: string[];
  heading: string;
  paragraphs: string[];
}

export interface ContactCard {
  label: string;
  purpose: string;
  email: string;
}

export interface SiteContentContact {
  section_label: string;
  section_title: string;
  section_intro: string;
  cards: ContactCard[];
}

export interface ToolsItem {
  label: string;
  href: string;
  description: string;
}

export interface SiteContent {
  meta: { title: string; description: string };
  hero: SiteContentHero;
  identity: string;
  publications: SiteContentPublications;
  research: SiteContentResearch;
  about: SiteContentAbout;
  contact: SiteContentContact;
  tools: { label: string; items: ToolsItem[] };
  footer: { brand: string; copy: string };
}

// ── Research program descriptors (program.json per subdirectory) ──────────────

export interface ProgramDescriptor {
  key: string;
  title: string;
  desc: string;
  href: string;
  card_link_label: string;
  order?: number;
}
