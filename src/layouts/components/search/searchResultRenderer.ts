import type { SearchItem, SearchResult } from './search.d.ts';
import { getRoutePath } from '@utils/route';

export class SearchResultRenderer {
  private searchResults: HTMLElement;
  private noResults: HTMLElement;
  private searchInfo: HTMLElement;

  constructor(
    searchResultsId: string,
    noResultsId: string,
    searchInfoId: string
  ) {
    const searchResults = document.getElementById(searchResultsId);
    const noResults = document.getElementById(noResultsId);
    const searchInfo = document.getElementById(searchInfoId);

    if (!searchResults || !noResults || !searchInfo) {
      throw new Error('Required DOM elements not found');
    }

    this.searchResults = searchResults;
    this.noResults = noResults;
    this.searchInfo = searchInfo;
  }

  public showLoading(): void {
    const SPINNER = `
      <div class="col-span-1 md:col-span-2 flex justify-center py-10">
        <svg class="animate-spin h-10 w-10 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
    `;

    this.searchResults.innerHTML = SPINNER;
    this.searchResults.classList.remove('hidden');
    this.noResults.classList.add('hidden');
    this.searchInfo.textContent = '';
  }

  public showError(message: string): void {
    this.searchResults.innerHTML = `<div class="col-span-1 md:col-span-2 text-center py-8 text-red-500 text-lg">${message}</div>`;
    this.searchResults.classList.remove('hidden');
    this.noResults.classList.add('hidden');
    this.searchInfo.textContent = '';
  }

  public displayResults(results: SearchResult[], query: string): void {
    this.searchResults.innerHTML = '';

    if (results.length === 0) {
      this.searchResults.classList.add('hidden');
      this.noResults.classList.remove('hidden');
      this.searchInfo.textContent = `没有找到与 '${query}' 相关的内容`;
      return;
    }

    this.searchResults.classList.remove('hidden');
    this.noResults.classList.add('hidden');
    this.searchInfo.textContent = `共找到 ${results.length} 条与 '${query}' 相关的内容`;

    results.forEach(result => {
      const post = result.item;
      const article = this.createArticleElement(post);
      this.searchResults.appendChild(article);
    });
  }

  public clear(): void {
    this.searchResults.innerHTML = '';
    this.searchResults.classList.add('hidden');
    this.noResults.classList.add('hidden');
    this.searchInfo.textContent = '';
  }

  /**
   * 渲染单个搜索结果为 HTML 元素
   * @param post - 搜索结果项
   * @private
   */
  private createArticleElement(post: SearchItem): HTMLElement {
    const article = document.createElement('article');
    // 卡片样式
    article.className = 'bg-white dark:bg-gray-800 rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300';

    // 1. 渲染封面图片
    let imageHtml = '';
    if (post.image && post.image.src) {
      // Handle both relative and absolute image paths
      const imgSrc = post.image.src.startsWith('/') ? post.image.src : `/${post.image.src}`;
      imageHtml = `
        <div class="aspect-video overflow-hidden">
          <img 
            src="${imgSrc}" 
            alt="${post.title}" 
            class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            width="${post.image.width || 400}"
            height="${post.image.height || 225}"
            loading="lazy"
          />
        </div>
      `;
    }

    // 2. 渲染分类
    let categoriesHtml = '';
    if (post.categories && post.categories.length > 0) {
      categoriesHtml = `
        <div class="flex items-center mr-4">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
          </svg>
          <span>${post.categories.join(', ')}</span>
        </div>
      `;
    }

    // 3. 渲染标签（最多个）
    let tagsHtml = '';
    if (post.tags && post.tags.length > 0) {
      tagsHtml = `
        <div class="flex flex-wrap gap-2 mt-3">
          ${post.tags.slice(0, 3).map((tag: string) => `
            <a href="${getRoutePath(`/tags/${tag.toLowerCase()}/`)}" class="px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full text-xs hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors duration-300">
              #${tag}
            </a>
          `).join('')}
        </div>
      `;
    }

    // 组装结果
    article.innerHTML = `
      <a href="${getRoutePath(`/posts/${post.slug}`)}" class="block">
        ${imageHtml}
        <div class="p-4">
          <div class="flex flex-wrap items-center text-xs text-gray-500 dark:text-gray-400 mb-3">
            <div class="flex items-center mr-4">
              <!-- 日期图标和日期 -->
              <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span>${post.publishTime}</span>
            </div>
            ${categoriesHtml}
          </div>
           
          <!-- 标题和描述 -->
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2 hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-300">
            ${post.title}
          </h3>
          
          ${post.description ? `
            <p class="text-sm text-gray-600 dark:text-gray-300 mb-3 line-clamp-2">
              ${post.description}
            </p>
          ` : ''}
          
          <!-- 标签 -->
          ${tagsHtml}
        </div>
      </a>
    `;

    return article;
  }
}