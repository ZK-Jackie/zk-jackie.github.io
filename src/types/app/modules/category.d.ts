import type { CollectionEntry } from "astro:content";

declare namespace AppCategories {
  interface CategoryMeta {
    name: string;
    slug: string;
    count: number;
  }
  interface CategoryPageData extends CategoryMeta {
    posts: CollectionEntry<"posts">[];
  }
}

