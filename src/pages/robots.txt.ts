import { siteConfig } from '@config';


const {seo: seoConfig} = siteConfig;

export async function GET(): Promise<Response> {
  const robotsConfig = seoConfig.robots
  let contents = ""

  robotsConfig.map((rule) => {
      const directives = [`User-agent: ${rule.userAgent}`];
      if (rule.allow) {
        directives.push(...rule.allow.map((path) => `Allow: ${path}`));
      }
      if (rule.disallow) {
        directives.push(...rule.disallow.map((path) => `Disallow: ${path}`));
      }
      if (rule.crawlDelay !== undefined) {
        directives.push(`Crawl-delay: ${rule.crawlDelay}`);
      }
      contents += directives.join('\n') + '\n\n';
    }
  );

  return new Response(contents.trim());
}
