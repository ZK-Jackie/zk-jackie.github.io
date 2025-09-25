import type Fuse from 'fuse.js';
import type { FuseResult } from 'fuse.js';
import type { SearchItem, SearchResult } from './search.d.ts';

export class SearchEngine {
  private fuse: Fuse<SearchItem> | null = null;
  private searchData: SearchItem[] | null = null;
  private loading = false;
  private initPromise: Promise<void> | null = null;

  constructor() {
    // 不在构造函数中立即初始化，而是懒加载
  }

  private async initializeFuse(): Promise<void> {
    // 如果已经有初始化 Promise，直接返回它
    if (this.initPromise) {
      return this.initPromise;
    }

    // 如果已经初始化完成，直接返回
    if (this.searchData !== null && this.fuse !== null) {
      return Promise.resolve();
    }

    // 创建初始化 Promise
    this.initPromise = this.doInitialize();
    return this.initPromise;
  }

  private async doInitialize(): Promise<void> {
    if (this.loading) {
      return;
    }

    this.loading = true;

    try {
      const response = await fetch('/search.json');
      if (!response.ok) {
        throw new Error('Failed to fetch search data');
      }

      this.searchData = await response.json();

      // 动态导入 Fuse.js
      const { default: Fuse } = await import('fuse.js');

      this.fuse = new Fuse(this.searchData!, {
        keys: [
          'title',
          'description',
          'tags',
          'categories',
          'content'
        ],
        includeMatches: true,
        minMatchCharLength: 2,
        threshold: 0.5
      });
    } catch (error) {
      console.error('Error initializing search engine:', error);
      throw error;
    } finally {
      this.loading = false;
    }
  }

  public async search(query: string): Promise<SearchResult[]> {
    if (!query || query.trim() === '') {
      return [];
    }

    // 确保 Fuse 已初始化
    await this.initializeFuse();

    if (!this.fuse) {
      throw new Error('Search engine not initialized');
    }

    const results: FuseResult<SearchItem>[] = this.fuse.search(query.trim());
    return results.map(result => ({
      item: result.item,
      matches: result.matches,
      score: result.score
    }));
  }

  public async isReady(): Promise<boolean> {
    await this.initializeFuse();
    return this.fuse !== null;
  }

  public isLoading(): boolean {
    return this.loading;
  }
}

// 创建单例实例
export const searchEngine = new SearchEngine();