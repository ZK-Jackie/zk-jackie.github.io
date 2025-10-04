import { resolveUrl } from "@utils/pathUtils.ts";


export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  startIndex: number;
  endIndex: number;
  prevUrl: string | null;
  nextUrl: string | null;
  pageSize: number;
}

/**
 * 获取分页信息
 * @param currentPage 当前页码
 * @param totalSize 数据条目总数
 * @param pageSize 每页显示条目数
 * @param currentPath 分页基础路径，若 “/base/page/1” 表示第一页路径，则 basePath 应为 “/base/page” 或 “/base/page”，其中 base 为站点基础路径
 * @param basePath 站点基础路径
 * @return 分页信息对象
 */
export function getPagination(currentPage: number, totalSize: number, pageSize: number, currentPath?: string, basePath?: string): PaginationInfo {
  // Calculate total pages
  const totalPages = getTotalPages(totalSize, pageSize);

  // Ensure page is within valid range
  currentPage = Math.min(Math.max(1, currentPage), totalPages);

  // Calculate start and end indices for slicing the posts array
  const startIndex = (currentPage - 1) * pageSize;
  const endIndex = Math.min(startIndex + pageSize, totalSize);

  // Generate URLs for previous and next pages (Optional)
  let prevUrl: string | null = null;
  let nextUrl: string | null = null ;
  if (basePath && currentPath){
    if (currentPage == 1){
      nextUrl = totalPages > 1 ? resolveUrl('./' + (currentPage + 1), basePath, currentPath) : null;
    } else if (currentPage == totalSize){
      prevUrl = currentPage == 2 ? resolveUrl('.', basePath, currentPath) : resolveUrl('./' + (currentPage - 1), basePath, currentPath);
    } else {
      prevUrl = currentPage == 2 ? resolveUrl('.', basePath, currentPath) : resolveUrl('./' + (currentPage - 1), basePath, currentPath);
      nextUrl = resolveUrl('./' + (currentPage + 1), basePath, currentPath);
    }
  }

  return {
    currentPage,
    totalPages,
    startIndex,
    endIndex,
    prevUrl,
    nextUrl,
    pageSize,
  };
}


/**
 * 计算总页数
 * @param totalSize 数据条目总数
 * @param pageSize 每页显示条目数
 * @return 总页数
 */
export function getTotalPages(totalSize: number, pageSize: number) {
  return Math.max(1, Math.ceil(totalSize / pageSize));
}