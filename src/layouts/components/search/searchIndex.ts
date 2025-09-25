import { getCollection } from 'astro:content';
import type {CollectionEntry} from "astro:content";
import type { SearchItem } from './search.d.ts';
import {notDataDraft} from "@utils/collectionUtils.ts";
import {formatDate} from "@utils/dateUtils.ts";


export class SearchIndex {
  private posts: CollectionEntry<"posts">[] = [];
  private indexData: SearchItem[] = [];

  async index(){
    if (this.posts.length === 0) {
      this.posts = await getCollection('posts', notDataDraft);
      this.indexData = this.posts.map(post => {
        // Create a serializable version of the image data if it exists
        const imageData = post.data.image ? {
          src: post.data.image.src,
          width: post.data.image.width,
          height: post.data.image.height
        } : undefined;

        return {
          slug: post.id,
          title: post.data.title,
          description: post.data.description || '',
          publishTime: post.data.publishTime ? formatDate(post.data.publishTime) : '',
          tags: post.data.tags || [],
          categories: post.data.categories || [],
          content: post.body,
          image: imageData
        };
      });
    }
    return this
  }

  getIndexData(): SearchItem[] {
    return this.indexData;
  }
}