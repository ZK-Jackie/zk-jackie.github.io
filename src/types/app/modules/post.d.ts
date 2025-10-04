import type { CollectionEntry } from "astro:content";

declare namespace AppPosts{
  interface PageData {
    slug: string;
    post: CollectionEntry<"posts">;
  }
}

