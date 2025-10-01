import {getCollection} from "astro:content";

/**
 * 分类法类型
 */
export type TaxonomyType = 'tags' | 'categories' | 'authors';

/**
 * 分类法项目接口
 */
export interface TaxonomyItem {
  key: string;
  slug: string;
  labels: {
    zh: string;
    en: string;
  };
  description?: {
    zh?: string;
    en?: string;
  };
}

/**
 * 映射缓存
 */
let taxonomyData: Map<TaxonomyType, TaxonomyItem[]> | null = null;

/**
 * 初始化taxonomy数据 - 从JSON文件直接导入
 */
async function loadTaxonomyData(): Promise<Map<TaxonomyType, TaxonomyItem[]>> {
  if (taxonomyData) return taxonomyData;
  
  taxonomyData = new Map();
  
  try {
    // 动态导入JSON配置文件
    const taxonomyConfigs = await getCollection('taxonomy');
    
    // 根据type字段正确设置数据
    for (const config of taxonomyConfigs) {
      const type = config.data.type;
      taxonomyData.set(type, config.data.items);
    }
    
    // 确保所有类型都有数据，即使为空数组
    if (!taxonomyData.has('tags')) taxonomyData.set('tags', []);
    if (!taxonomyData.has('categories')) taxonomyData.set('categories', []);
    if (!taxonomyData.has('authors')) taxonomyData.set('authors', []);
    
  } catch (error) {
    console.warn('Failed to load taxonomy data:', error);
    // 设置空数组作为回退
    taxonomyData.set('tags', []);
    taxonomyData.set('categories', []);  
    taxonomyData.set('authors', []);
  }
  
  return taxonomyData;
}

/**
 * 根据原始键值获取分类法项目
 */
export async function getTaxonomyItem(type: TaxonomyType, key: string): Promise<TaxonomyItem | undefined> {
  const data = await loadTaxonomyData();
  const items = data.get(type) || [];
  return items.find(item => item.key === key);
}

/**
 * 根据slug获取分类法项目
 */
export async function getTaxonomyItemBySlug(type: TaxonomyType, slug: string): Promise<TaxonomyItem | undefined> {
  const data = await loadTaxonomyData();
  const items = data.get(type) || [];
  return items.find(item => item.slug === slug);
}

/**
 * 将原始键值转换为URL友好的slug
 */
export async function keyToSlug(type: TaxonomyType, key: string): Promise<string> {
  const item = await getTaxonomyItem(type, key);
  return item ? item.slug : encodeURIComponent(key.toLowerCase());
}

/**
 * 将slug转换回原始键值
 */
export async function slugToKey(type: TaxonomyType, slug: string): Promise<string> {
  const item = await getTaxonomyItemBySlug(type, slug);
  return item ? item.key : decodeURIComponent(slug);
}

/**
 * 获取本地化显示文本
 */
export async function getTaxonomyLabel(type: TaxonomyType, key: string, locale: string = 'zh'): Promise<string> {
  const item = await getTaxonomyItem(type, key);
  if (!item) return key;
  
  const supportedLocale = locale in item.labels ? locale as keyof typeof item.labels : 'zh';
  return item.labels[supportedLocale] || item.labels.zh || key;
}

/**
 * 获取描述文本
 */
export async function getTaxonomyDescription(type: TaxonomyType, key: string, locale: string = 'zh'): Promise<string | undefined> {
  const item = await getTaxonomyItem(type, key);
  if (!item?.description) return undefined;
  
  const supportedLocale = locale in item.description ? locale as keyof typeof item.description : 'zh';
  return item.description[supportedLocale] || item.description.zh;
}

/**
 * 获取所有分类法项目
 */
export async function getAllTaxonomyItems(type: TaxonomyType): Promise<TaxonomyItem[]> {
  const data = await loadTaxonomyData();
  return data.get(type) || [];
}

/**
 * 获取所有slug
 */
export async function getAllTaxonomySlugs(type: TaxonomyType): Promise<string[]> {
  const items = await getAllTaxonomyItems(type);
  return items.map(item => item.slug);
}

/**
 * 获取所有原始键值
 */
export async function getAllTaxonomyKeys(type: TaxonomyType): Promise<string[]> {
  const items = await getAllTaxonomyItems(type);
  return items.map(item => item.key);
}

/**
 * 批量转换键值为slug
 */
export async function keysToSlugs(type: TaxonomyType, keys: string[]): Promise<string[]> {
  const results = await Promise.all(keys.map(key => keyToSlug(type, key)));
  return results;
}

/**
 * 批量转换slug为键值
 */
export async function slugsToKeys(type: TaxonomyType, slugs: string[]): Promise<string[]> {
  const results = await Promise.all(slugs.map(slug => slugToKey(type, slug)));
  return results;
}

/**
 * 批量获取本地化标签
 */
export async function getTaxonomyLabels(type: TaxonomyType, keys: string[], locale: string = 'zh'): Promise<string[]> {
  const results = await Promise.all(keys.map(key => getTaxonomyLabel(type, key, locale)));
  return results;
}

/**
 * 创建面包屑导航数据
 */
export async function createTaxonomyBreadcrumb(type: TaxonomyType, key: string, locale: string = 'zh') {
  const item = await getTaxonomyItem(type, key);
  if (!item) return null;
  
  const label = await getTaxonomyLabel(type, key, locale);
  
  return {
    key: item.key,
    slug: item.slug,
    label,
    url: `/${type}/${item.slug}`,
    description: await getTaxonomyDescription(type, key, locale)
  };
}

/**
 * 搜索分类法项目
 */
export async function searchTaxonomyItems(
  type: TaxonomyType, 
  query: string, 
  locale: string = 'zh'
): Promise<TaxonomyItem[]> {
  const items = await getAllTaxonomyItems(type);
  const lowerQuery = query.toLowerCase();
  
  return items.filter(item => {
    // 搜索原始键值
    if (item.key.toLowerCase().includes(lowerQuery)) return true;
    
    // 搜索slug
    if (item.slug.toLowerCase().includes(lowerQuery)) return true;
    
    // 搜索本地化标签
    const label = item.labels[locale as keyof typeof item.labels] || item.labels.zh;
    if (label.toLowerCase().includes(lowerQuery)) return true;
    
    // 搜索描述
    if (item.description) {
      const description = item.description[locale as keyof typeof item.description] || item.description.zh;
      if (description && description.toLowerCase().includes(lowerQuery)) return true;
    }
    
    return false;
  });
}

/**
 * 检查键值是否已配置
 */
export async function isTaxonomyKeyConfigured(type: TaxonomyType, key: string): Promise<boolean> {
  const item = await getTaxonomyItem(type, key);
  return item !== undefined;
}

/**
 * 检查slug是否已配置
 */
export async function isTaxonomySlugConfigured(type: TaxonomyType, slug: string): Promise<boolean> {
  const item = await getTaxonomyItemBySlug(type, slug);
  return item !== undefined;
}

/**
 * 获取未配置的键值（用于调试和维护）
 */
export async function getUnconfiguredKeys(type: TaxonomyType, keys: string[]): Promise<string[]> {
  const results = await Promise.all(
    keys.map(async key => ({
      key,
      configured: await isTaxonomyKeyConfigured(type, key)
    }))
  );
  
  return results
    .filter(result => !result.configured)
    .map(result => result.key);
}