export interface ContentItem {
  file: string;
  title: string;
  date?: string;
  tags?: string[];
  desc?: string;
}

export interface Manifest {
  writing: {
    articles: ContentItem[];
    blog: ContentItem[];
  };
  research: ContentItem[];
  videos: ContentItem[];
  software: ContentItem[];
  courses: Record<string, string>;
  course_items: Record<string, ContentItem[]>;
  products: ContentItem[];
  publications: {
    workbooks: ContentItem[];
    ebooks: ContentItem[];
    tools: ContentItem[];
    papers: ContentItem[];
  };
}
