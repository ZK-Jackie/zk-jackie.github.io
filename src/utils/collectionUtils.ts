import type {CollectionEntry} from "astro:content";

export function chain(...filters: ((entry: CollectionEntry<"posts">) => boolean)[]) {
  return (entry: CollectionEntry<"posts">) => {
    for (const filter of filters) {
      if (!filter(entry)) {
        return false;
      }
    }
    return true;
  };
}

export function notDataDraft(entry: { data: { draft?: boolean } }) {
  return !entry.data.draft;
}

export function notDataSlugStartsWithSlash(entry: { data: { slug?: string } }) {
  return !(entry.data.slug && entry.data.slug.startsWith("/"));
}