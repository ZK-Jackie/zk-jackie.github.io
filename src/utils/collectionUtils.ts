import { type CollectionEntry, type DataEntryMap, getCollection } from "astro:content";
import { keyToSlug } from "@utils/taxonomyUtils.ts";
import { normalizeUrl } from "@utils/stringUtils.ts";


/**
 * CollectionUtils 提供了一组链式调用的方法，用于过滤、排序和操作 Astro 内容集合。
 * 它支持多种操作，包括过滤、排序、分页、分组等，方便开发者对内容集合进行复杂的处理。
 *
 * 该类的方法可以分为以下几类：
 * | 方法类别       | 说明                                                         |
 * |----------------|--------------------------------------------------------------|
 * | 一般方法       | `getEntries`, `reset`等 - 仅作用于整个实例本身，与链式调用无关的方法 |
 * | 处理方法       | `filter`, `sortBy`等 - 为查询结果进行过滤、排序等，使用链式调用添加行数据处理步骤的方法 |
 * | 获取方法       | `all`, `limit`, `groupBy`, `groupBelongTo`等 - 执行查询，返回链式处理后的结果的方法 |
 *
 * 某些方法的执行依赖于于部分工具函数，如 PostUtils、CategoryUtils、TagUtils 等，这些工具函数提供了常用的过滤和排序逻辑，方便在链式调用中使用。
 *
 * @template T - 集合名称，必须是 DataEntryMap 的键之一
 */
export class CollectionUtils<T extends keyof DataEntryMap> {
  private filters: ((entry: CollectionEntry<T>) => boolean)[] = [];
  private sorters: ((a: CollectionEntry<T>, b: CollectionEntry<T>) => number)[] = [];
  private cachedEntries: CollectionEntry<T>[] | null = null;
  private readonly collectionName: T;

  constructor(collectionName: T) {
    this.collectionName = collectionName;
  }

  /**
   * 重置添加的过滤器和排序器，并清除查询缓存
   */
  reset(): this {
    this.filters = [];
    this.sorters = [];
    this.cachedEntries = null;
    return this;
  }

  /**
   * 添加过滤器
   */
  filter(fn: (entry: CollectionEntry<T>) => boolean): this {
    this.filters.push(fn);
    return this;
  }

  /**
   * 添加排序器
   */
  sortBy(compareFn: (a: CollectionEntry<T>, b: CollectionEntry<T>) => number): this {
    this.sorters.push(compareFn);
    return this;
  }

  /**
   * 获取集合条目，使用缓存避免重复获取（beta 阶段，有可能对数据热重载有影响）
   */
  async getEntries(): Promise<CollectionEntry<T>[]> {
    // 使用缓存避免重复获取
    if (!this.cachedEntries) {
      this.cachedEntries = await getCollection(this.collectionName);
    }
    return this.cachedEntries;
  }

  /**
   * 应用过滤器和排序器，获取所有条目
   */
  async all(): Promise<CollectionEntry<T>[]> {
    const entries = await this.getEntries();

    // 如果有排序器，先排序
    if (this.sorters.length > 0) {
      // sort方法：返回值<0，a排前面；返回值>0，b排前面；返回值=0，保持不变
      entries.sort((a, b) => {
        for (const sorter of this.sorters) {
          const result = sorter(a, b);
          if (result !== 0) return -result;
        }
        return 0;
      });
    }

    // 如果没有过滤器，直接返回所有条目
    if (this.filters.length === 0) return entries;

    // 应用所有过滤器
    return this.filters.reduce(
      (result, filter) => result.filter(filter),
      entries
    );
  }

  /**
   * 限制返回的条目数量，支持偏移
   * @param n 返回数据的数量
   * @param offset 数据的偏移值
   */
  async limit(n: number, offset = 0): Promise<CollectionEntry<T>[]> {
    const all = await this.all();
    return all.slice(offset, offset + n);
  }

  async first(): Promise<CollectionEntry<T> | undefined> {
    const all = await this.all();
    return all[0];
  }

  async count(): Promise<number> {
    const all = await this.all();
    return all.length;
  }

  async groupBy<K>(keyFn: (entry: CollectionEntry<T>) => K): Promise<Map<K, CollectionEntry<T>[]>> {
    const all = await this.all();
    const map = new Map<K, CollectionEntry<T>[]>();
    for (const entry of all) {
      const key = keyFn(entry);
      if (!map.has(key)) {
        map.set(key, []);
      }
      map.get(key)!.push(entry);
    }
    return map;
  }

  async groupBelongTo<K>(keyFn: (entry: CollectionEntry<T>) => K[]): Promise<Map<K, CollectionEntry<T>[]>> {
    const all = await this.all();
    const map = new Map<K, CollectionEntry<T>[]>();
    for (const entry of all) {
      const keys = keyFn(entry);
      for (const key of keys) {
        if (!map.has(key)) {
          map.set(key, []);
        }
        map.get(key)!.push(entry);
      }
    }
    return map;
  }

  async find(
    predicate: (entry: CollectionEntry<T>) => boolean
  ): Promise<CollectionEntry<T> | undefined> {
    const all = await this.all();
    return all.find(predicate);
  }
}


export class PostUtils {
  /**
   * 过滤掉草稿文章，应用于 CollectionUtils.filter 方法
   * @param entry 文章条目
   * @returns 如果不是草稿则返回 true
   */
  static filterNotDraft(entry: CollectionEntry<"posts">): boolean {
    return !entry.data.draft;
  }

  /**
   * 过滤掉 ID 以斜杠开头的文章，应用于 CollectionUtils.filter 方法
   * @param entry 文章条目
   * @returns 如果 ID 不以斜杠开头则返回 true
   */
  static filterNotIdStartsWithSlash(entry: CollectionEntry<"posts">): boolean {
    return !entry.id.startsWith("/");
  }

  /**
   * 过滤掉 ID 为给定值的文章，应用于 CollectionUtils.filter 方法
   * @param id 文章 ID
   * @returns 过滤函数
   */
  static filterNotIdEq(id: string): (entry: CollectionEntry<"posts">) => boolean {
    return (entry: CollectionEntry<"posts">): boolean => entry.id !== id;
  }

  /**
   * 过滤出某字段包含某值的文章，应用于 CollectionUtils.filter 方法
   * @param field 文章字段名称
   * @param value 文章字段值
   * @returns 过滤函数
   */
  static contains(field: keyof CollectionEntry<"posts">["data"], value: string): (entry: CollectionEntry<"posts">) => boolean {
    return (entry: CollectionEntry<"posts">): boolean => {
      const fieldValue = entry.data[field];
      if (Array.isArray(fieldValue)) {
        return fieldValue.includes(value);
      } else if (typeof fieldValue === 'string') {
        return fieldValue === value;
      }
      return false;
    }
  }

  /**
   * 按发布日期降序排序文章，应用于 CollectionUtils.sortBy 方法
   * @param a 文章条目 a
   * @param b 文章条目 b
   * @returns 比较结果，若 a > b 则返回正数，若 a < b 则返回负数，若相等则返回 0
   */
  static compareByDateDesc(a: CollectionEntry<"posts">, b: CollectionEntry<"posts">): number {
    if (!a.data.publishTime) return 1;
    if (!b.data.publishTime) return -1;
    return a.data.publishTime.getTime() - b.data.publishTime.getTime();
  }

  /**
   * 按更新日期降序排序文章，应用于 CollectionUtils.sortBy 方法
   * @param a 文章条目 a
   * @param b 文章条目 b
   * @returns 比较结果，若 a > b 则返回正数，若 a < b 则返回负数，若相等则返回 0
   */
  static compareByUpdateTimeDesc(a: CollectionEntry<"posts">, b: CollectionEntry<"posts">): number {
    if (!a.data.updateTime) return 1;
    if (!b.data.updateTime) return -1;
    return a.data.updateTime.getTime() - b.data.updateTime.getTime();
  }

  /**
   * 获取文章的标签列表，若没有标签则返回空数组，适用于 CollectionUtils.groupBelongTo 方法
   * @param entry 文章条目
   * @returns 文章的标签列表
   */
  static tags(entry: CollectionEntry<"posts">): string[] {
    return entry.data.tags || [];
  }

  /**
   * 获取文章的分类列表，若没有分类则返回空数组，适用于 CollectionUtils.groupBelongTo 方法
   * @param entry 文章条目
   * @returns 文章的分类列表
   */
  static categories(entry: CollectionEntry<"posts">): string[] {
    return entry.data.categories || [];
  }

  /**
   * 获取文章的作者列表，若没有作者则返回空数组，适用于 CollectionUtils.groupBelongTo 方法
   * @param entry 文章条目
   * @returns 文章的作者列表
   */
  static authors(entry: CollectionEntry<"posts">): string[] {
    return entry.data.authors || [];
  }

  /**
   * 将文章条目数组扁平化为包含 slug 和文章对象的对象数组
   * @param entries 文章对象数组
   * @returns 包含 slug 和文章对象的对象数组
   */
  static getPageDataList(entries: CollectionEntry<"posts">[]): App.Posts.PageData[] {
    return entries.map(
      entry => {
        let slug: string | undefined = undefined;
        if (entry.data.canonical) {
          try {
            slug = new URL(entry.data.canonical).pathname.split('/').filter(Boolean).pop();
          } catch (e) {
            console.warn(`Invalid canonical URL in post ${entry.id}: ${entry.data.canonical}`);
          }
        }
        return {
          slug: slug || entry.id,
          post: entry
        }
      }
    );
  }
}

export class CategoryUtils {

  /**
   * 按类别文章数量降序排序类别，应用于 CollectionUtils.sortBy 方法
   * @param a 类别元数据 a
   * @param b 类别元数据 a
   * @returns 比较结果，若 a > b 则返回正数，若 a < b 则返回负数，若相等则返回 0
   */
  static compareByCountDesc(a: App.Categories.CategoryMeta, b: App.Categories.CategoryMeta): number {
    return b.count - a.count;
  }

  /**
   * 获取类别元数据列表
   * @param map 类别名称到文章数组的映射
   * @returns 类别元数据数组
   */
  static async getMetaList(
    map: Map<string, CollectionEntry<"posts">[]>
  ): Promise<App.Categories.CategoryMeta[]> {
    const result: App.Categories.CategoryMeta[] = [];
    for (const [originalCategory, entries] of map) {
      result.push({
        name: originalCategory,
        slug: await keyToSlug('categories', originalCategory),
        count: entries.length,
      });
    }
    return result;
  }

  /**
   * 类别页面数据列表
   * @param map 类别名称到文章数组的映射
   * @returns 类别页面数据数组
   */
  static async getPageDataList(
    map: Map<string, CollectionEntry<"posts">[]>
  ): Promise<App.Categories.CategoryPageData[]> {
    const result: App.Categories.CategoryPageData[] = [];
    for (const [originalCategory, entries] of map) {
      result.push({
        name: originalCategory,
        slug: await keyToSlug('categories', originalCategory),
        count: entries.length,
        posts: entries,
      });
    }
    return result;
  }
}


export class TagUtils {
  /**
   * 按标签文章数量降序排序标签，应用于 CollectionUtils.sortBy 方法
   * @param a 文章标签元数据 a
   * @param b 文章标签元数据 b
   * @return 比较结果，若 a > b 则返回正数，若 a < b 则返回负数，若相等则返回 0
   */
  static compareByCountDesc(a: App.Tags.TagMeta, b: App.Tags.TagMeta): number {
    return b.count - a.count;
  }

  /**
   * 获取标签元数据列表
   * @param map 标签名称到文章数组的映射
   * @returns 标签元数据数组
   */
  static async getMetaList(
    map: Map<string, CollectionEntry<"posts">[]>
  ): Promise<App.Tags.TagMeta[]> {
    const result: App.Tags.TagMeta[] = [];
    for (const [originalTag, entries] of map) {
      result.push({
        name: originalTag,
        slug: await keyToSlug('tags', originalTag),
        count: entries.length,
      });
    }
    return result;
  }

  /**
   * 标签页面数据列表
   * @param map 标签名称到文章数组的映射
   * @returns 标签页面数据数组
   */
  static async getPageDataList(
    map: Map<string, CollectionEntry<"posts">[]>
  ): Promise<App.Tags.TagPageData[]> {
    const result: App.Tags.TagPageData[] = [];
    for (const [originalTag, entries] of map) {
      result.push({
        name: originalTag,
        slug: await keyToSlug('tags', originalTag),
        count: entries.length,
        posts: entries,
      });
    }
    return result;
  }
}

export class AuthorUtils {
  /**
   * 过滤掉草稿作者介绍，应用于 CollectionUtils.filter 方法
   * @param entry 作者介绍条目
   * @returns 如果不是草稿则返回 true
   */
  static filterNotDraft(entry: CollectionEntry<"authors">): boolean {
    return !entry.data.draft;
  }

  /**
   * 过滤掉 ID 以斜杠开头的作者介绍，应用于 CollectionUtils.filter 方法
   * @param entry 作者介绍条目
   * @returns 如果 ID 不以斜杠开头则返回 true
   */
  static filterNotIdStartsWithSlash(entry: CollectionEntry<"authors">): boolean {
    return !entry.id.startsWith("/");
  }

  /**
   * 按文章数量降序排序作者，应用于 CollectionUtils.sortBy 方法
   * @param a 作者元数据 a
   * @param b 作者元数据 b
   * @return 比较结果，若 a > b 则返回正数，若 a < b 则返回负数，若相等则返回 0
   */
  static compareByCountDesc(a: App.Tags.AuthorMeta, b: App.Tags.AuthorMeta): number {
    return b.count - a.count;
  }

  /**
   * 获取作者元数据列表
   * @param map 作者名称到文章数组的映射
   * @param details 作者详情条目数组
   * @returns 作者元数据数组
   */
  static async getMetaList(
    map: Map<string, CollectionEntry<"posts">[]>,
    details: CollectionEntry<"authors">[]
  ): Promise<App.Authors.AuthorMeta[]> {
    const result: App.Authors.AuthorMeta[] = [];
    for (const [originalAuthor, entries] of map) {
      // 检查作者详情是否存在
      const authorDetail = details.find(detail =>
        detail.data.title.toLowerCase() === originalAuthor.toLowerCase()
      );
      // 若没有作者详情页，此处创造页面，并使用作者名称的规范化作为 slug
      const slug = authorDetail?.id || normalizeUrl(originalAuthor);
      result.push({
        name: originalAuthor,
        slug: slug,
        count: entries.length,
      });
    }
    return result;
  }

  /**
   * 获取作者页面数据列表
   * @param map 作者名称到文章数组的映射
   * @param details 作者详情条目数组
   * @returns 作者页面数据数组
   */
  static async getPageDataList(
    map: Map<string, CollectionEntry<"posts">[]>,
    details: CollectionEntry<"authors">[]
  ): Promise<App.Authors.AuthorPageData[]> {
    const result: App.Authors.AuthorPageData[] = [];

    for (const [originalAuthor, entries] of map) {
      // 查找作者详情
      const authorDetail = details.find(detail =>
        detail.data.title.toLowerCase() === originalAuthor.toLowerCase()
      );
      // 若没有作者详情页，此处创造页面，并使用作者名称的规范化作为 slug
      const slug = authorDetail?.id || normalizeUrl(originalAuthor);
      result.push({
        name: originalAuthor,
        slug: slug,
        detail: authorDetail,
        posts: entries,
        count: entries.length,
      });
    }
    return result;
  }
}
