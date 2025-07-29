import { envConfig } from "@config";
const BASE_URL: string = envConfig.public.PUBLIC_BASE_URL || '/';
// 确保 BASE_URL 没有以斜杠结尾
const CLEAN_BASE_URL: string = BASE_URL.endsWith('/') ? BASE_URL.slice(0, -1) : BASE_URL;
/**
 * Get the full route path by combining the base URL with the provided path.
 * @param path The path to append to the base URL.
 * @param base The base URL to use, should end with no '/' (default is the environment's BASE_URL).
 * @returns The full route path.
 */
export function getRoutePath(path: string, base: string = CLEAN_BASE_URL): string {
  // 特殊处理
  if (isExternalLink(path)) {
    // 如果是外部链接，直接返回
    return path;
  }
  // 确保 path 以 / 开头
  if (!path.startsWith('/')) {
    path = '/' + path;
  } else if (path === '/') {
    // 如果 path 只有一个斜杠，直接返回 base URL，无需拼接
    return path;
  }
  // 如果 path 末尾有斜杠，去掉末尾的斜杠并警告
  if (path.endsWith('/')) {
    console.warn('Path should not end with a slash. Removing trailing slash:', path);
    path = path.slice(0, -1);
  }
  return base + path;
}

/**
 * Check if a URL is an external link.
 * @param url The URL to check.
 * @return True if the URL is an external link (starts with <AppLink>:// <Contact>: ), false otherwise.
 */
export function isExternalLink(url: string): boolean {
  // 检查链接是否以协议头开头
  return /[a-zA-Z]+:\/\//.test(url) || url.startsWith('mailto:') || url.startsWith('tel:');
}