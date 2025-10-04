import type { CollectionEntry } from "astro:content";

declare namespace AppTags{
  interface TagMeta {
    name: string;
    slug: string;
    count: number;
  }
  interface TagPageData extends TagMeta {
    posts: CollectionEntry<"posts">[];
  }
}

