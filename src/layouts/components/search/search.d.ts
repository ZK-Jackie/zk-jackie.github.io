export interface SearchItem {
  slug: string;
  title: string;
  description?: string;
  publishTime: string;
  tags?: string[];
  categories?: string[];
  content: string | undefined;
  image?: {
    src: string;
    width?: number;
    height?: number;
  };
}

export interface SearchResult {
  item: SearchItem;
  matches?: readonly any[];
  score?: number;
}