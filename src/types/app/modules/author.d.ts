import type { CollectionEntry } from "astro:content";

declare namespace AppAuthors {
  interface AuthorMeta {
    name: string;
    slug: string;
    count: number;
  }
  interface AuthorPageData extends AuthorMeta {
    detail: CollectionEntry<"authors">;
    posts: CollectionEntry<"posts">[];
  }
}

