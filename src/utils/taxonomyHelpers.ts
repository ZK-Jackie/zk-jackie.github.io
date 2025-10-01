import { 
  keyToSlug, 
  getTaxonomyLabel,
  getAllTaxonomySlugs,
  type TaxonomyType 
} from './taxonomyUtils';

/**
 * 为模板提供的便捷函数集合
 */

/**
 * 生成分类法链接
 */
export async function getTaxonomyLink(type: TaxonomyType, key: string): Promise<string> {
  const slug = await keyToSlug(type, key);
  return `/${type}/${slug}`;
}

/**
 * 批量生成分类法链接
 */
export async function getTaxonomyLinks(type: TaxonomyType, keys: string[]): Promise<Array<{
  key: string;
  slug: string;
  url: string;
  label: string;
}>> {
  const results = await Promise.all(keys.map(async key => {
    const slug = await keyToSlug(type, key);
    return {
      key,
      slug,
      url: `/${type}/${slug}`,
      label: key // 在模板中可以进一步本地化
    };
  }));
  return results;
}

/**
 * 为组件提供的本地化标签获取函数
 */
export async function getLocalizedTaxonomyLabel(
  type: TaxonomyType, 
  key: string, 
  locale: string = 'zh'
): Promise<string> {
  return await getTaxonomyLabel(type, key, locale);
}

/**
 * 生成面包屑数据
 */
export async function generateTaxonomyBreadcrumbs(
  type: TaxonomyType,
  key: string,
  locale: string = 'zh'
) {
  const label = await getTaxonomyLabel(type, key, locale);
  const slug = await keyToSlug(type, key);
  
  return [
    {
      label: locale === 'en' ? 'Home' : '首页',
      url: '/'
    },
    {
      label: locale === 'en' ? 
        (type === 'tags' ? 'Tags' : type === 'categories' ? 'Categories' : 'Authors') :
        (type === 'tags' ? '标签' : type === 'categories' ? '分类' : '作者'),
      url: `/${type}`
    },
    {
      label,
      url: `/${type}/${slug}`,
      current: true
    }
  ];
}

/**
 * 检查URL slug是否有效
 */
export async function isValidTaxonomySlug(type: TaxonomyType, slug: string): Promise<boolean> {
  const validSlugs = await getAllTaxonomySlugs(type);
  return validSlugs.includes(slug);
}

/**
 * 生成sitemap用的URL列表
 */
export async function getAllTaxonomyUrls(baseUrl: string = ''): Promise<string[]> {
  const urls: string[] = [];
  
  const types: TaxonomyType[] = ['tags', 'categories', 'authors'];
  
  for (const type of types) {
    const slugs = await getAllTaxonomySlugs(type);
    slugs.forEach(slug => {
      urls.push(`${baseUrl}/${type}/${slug}`);
    });
  }
  
  return urls;
}

/**
 * 为RSS feed生成分类法信息
 */
export async function getTaxonomyForRSS(
  type: TaxonomyType,
  keys: string[],
  locale: string = 'zh'
): Promise<string> {
  const labels = await Promise.all(
    keys.map(key => getTaxonomyLabel(type, key, locale))
  );
  return labels.join(', ');
}