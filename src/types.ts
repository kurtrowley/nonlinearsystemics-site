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
