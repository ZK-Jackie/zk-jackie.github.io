import type { APIContext } from "astro";
import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import { siteConfig } from '@config';


export async function GET(context: APIContext ): Promise<Response> {
  const { features: featuresConfig, siteMetadata: siteMetadataConfig } = siteConfig;
  if (!featuresConfig.rss) {
    return new Response(null);
  }

  const posts = await getCollection('posts');

  // Sort posts by publish date (newest first)
  const sortedPosts = posts.sort((a, b) => {
    if (!a.data.publishTime) return 1;
    if (!b.data.publishTime) return -1;
    return b.data.publishTime.getTime() - a.data.publishTime.getTime();
  });

  return rss({
    title: siteMetadataConfig.title, // Updated from siteConfig.name
    description: siteMetadataConfig.description,
    site: context?.site ? context.site.toString() : '', // Use context.site, fallback to empty if undefined
    items: sortedPosts.map((post) => ({
      title: post.data.title,
      pubDate: post.data.publishTime,
      description: post.data.description,
      link: `/posts/${post.id}`,
      categories: post.data.categories || [],
      // Optional custom data
      customData: post.data.tags ?
        `<tags>${post.data.tags.join(',')}</tags>` : '',
    })),
    // Optional: customize the RSS output
    stylesheet: '/rss/styles.xsl',
  });
}
