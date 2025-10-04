/**
 * Resolve a potentially relative URL to an absolute URL based on the base URL.
 * @param path The URL to resolve.
 * @param baseUrl The base URL path to use for resolution (e.g., "/", "/project1").
 * @param currentUrl The current URL context for resolving relative paths (optional, should be full URL like "https://site.com/page").
 * @returns The resolved absolute URL.
 */
export function resolveUrl(path: string, baseUrl: string = "/", currentUrl?: string): string {
  // 输入验证和清理
  if (!path?.trim()) {
    console.warn('Invalid path provided to resolveUrl:', path);
    return baseUrl;
  }

  const cleanPath = path.trim();

  // 1. 处理外部链接
  if (isExternalLink(cleanPath)) {
    // 处理协议相对URL (//example.com/path)
    if (cleanPath.startsWith('//')) {
      const protocol = currentUrl ? (safeCreateURL(currentUrl)?.protocol || 'https:') : 'https:';
      return `${protocol}${cleanPath}`;
    }
    return cleanPath;
  }

  // 2. 处理绝对路径
  if (cleanPath.startsWith('/')) {
    return normalizePath(baseUrl, cleanPath);
  }

  // 3. 处理锚点或查询参数
  if (cleanPath.startsWith("#") || cleanPath.startsWith("?")) {
    return resolveAnchorOrQuery(cleanPath, baseUrl, currentUrl);
  }

  // 4. 处理相对路径
  return resolveRelativePath(cleanPath, baseUrl, currentUrl);
}

/**
 * 处理锚点和查询参数
 */
function resolveAnchorOrQuery(path: string, baseUrl: string, currentUrl?: string): string {
  const fullCurrentUrl = buildFullCurrentUrl(baseUrl, currentUrl);
  const url = safeCreateURL(fullCurrentUrl);
  
  if (!url) {
    return normalizePath(baseUrl, path);
  }
  
  if (path.startsWith("#")) {
    url.hash = path;
  } else if (path.startsWith("?")) {
    url.search = path;
  }
  
  return url.toString();
}

/**
 * 处理路径形式的相对路径解析（不涉及完整URL）
 */
function resolvePathRelative(relativePath: string, _baseUrl: string, currentPath: string): string {
  // 清理当前路径，移除查询参数和锚点
  const cleanCurrentPath = currentPath.split(/[?#]/)[0];
  
  // 获取当前目录
  const getCurrentDir = () => cleanCurrentPath.endsWith('/') ? cleanCurrentPath : getPathDirname(cleanCurrentPath);
  
  if (relativePath.startsWith('./')) {
    // 处理 ./sibling 形式
    return normalizePath(getCurrentDir(), relativePath.substring(2));
  }
  
  if (relativePath.startsWith('../')) {
    // 处理 ../parent 形式 - 使用循环简化逻辑
    let currentDir = getCurrentDir();
    let remainingPath = relativePath;
    
    while (remainingPath.startsWith('../')) {
      currentDir = getPathDirname(currentDir);
      remainingPath = remainingPath.substring(3);
    }
    
    return remainingPath ? normalizePath(currentDir, remainingPath) : 
           (currentDir.endsWith('/') ? currentDir : currentDir + '/');
  }
  
  // 处理 contact 形式（相对于当前目录）
  return normalizePath(getCurrentDir(), relativePath);
}

/**
 * 获取路径的目录部分
 */
function getPathDirname(path: string): string {
  if (!path || path === '/') {
    return '/';
  }

  // 移除末尾斜杠（如果有）
  const cleanPath = path.endsWith('/') ? path.slice(0, -1) : path;
  
  // 找到最后一个斜杠的位置
  const lastSlashIndex = cleanPath.lastIndexOf('/');
  
  if (lastSlashIndex <= 0) {
    return '/';
  }
  
  return cleanPath.substring(0, lastSlashIndex + 1);
}

/**
 * 处理相对路径解析
 */
function resolveRelativePath(path: string, baseUrl: string, currentUrl?: string): string {
  if (!currentUrl) {
    return normalizePath(baseUrl, path);
  }
  
  // 如果currentUrl是路径形式，使用路径解析
  if (!isCompleteUrl(currentUrl)) {
    return resolvePathRelative(path, baseUrl, currentUrl);
  }
  
  // 使用 URL API 解析相对路径
  const fullCurrentUrl = buildFullCurrentUrl(baseUrl, currentUrl);
  const resolvedUrl = safeCreateURL(path, fullCurrentUrl);
  
  if (!resolvedUrl) {
    return normalizePath(baseUrl, path);
  }
  
  // 如果baseUrl是路径前缀，确保解析后的路径在正确作用域内
  return !isCompleteUrl(baseUrl) ? 
    ensureWithinBaseUrl(resolvedUrl.toString(), baseUrl) : 
    resolvedUrl.toString();
}

/**
 * 构建完整的当前URL
 */
function buildFullCurrentUrl(baseUrl: string, currentUrl?: string): string {
  if (currentUrl && isCompleteUrl(currentUrl)) {
    return currentUrl;
  }
  
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  
  // 服务端渲染环境，构建一个基本URL
  const baseHost = 'https://localhost'; // 默认域名
  const currentPath = currentUrl || '/';
  
  if (isCompleteUrl(baseUrl)) {
    // baseUrl 是完整URL
    const baseUrlObj = safeCreateURL(baseUrl);
    if (baseUrlObj) {
      return baseUrlObj.origin + normalizePath('', currentPath);
    }
  }
  
  // baseUrl 是路径前缀
  return baseHost + normalizePath(baseUrl, currentPath);
}

/**
 * 确保URL在baseUrl作用域内
 */
function ensureWithinBaseUrl(resolvedUrl: string, baseUrl: string): string {
  if (baseUrl === '/' || !baseUrl) {
    return resolvedUrl; // 根路径，无需特殊处理
  }
  
  const urlObj = safeCreateURL(resolvedUrl);
  if (!urlObj) {
    return resolvedUrl;
  }
  
  const pathname = urlObj.pathname;
  
  // 如果路径不在baseUrl作用域内，需要调整
  if (!pathname.startsWith(baseUrl)) {
    // 提取相对于baseUrl的部分
    const relativePart = pathname.startsWith('/') ? pathname.substring(1) : pathname;
    urlObj.pathname = normalizePath(baseUrl, relativePart);
  }
  
  return urlObj.toString();
}

/**
 * 检查URL是否为完整URL（包含协议）
 */
function isCompleteUrl(url: string): boolean {
  return url.includes('://') || url.startsWith('//');
}

/**
 * 规范化路径拼接（处理斜杠问题）
 */
function normalizePath(base: string, path: string): string {
  if (!base && !path) return '/';
  if (!base) return path;
  if (!path) return base;
  
  // 移除base末尾的斜杠，确保path以斜杠开头
  const cleanBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const cleanPath = path.startsWith('/') ? path : `/${path}`;
  
  return `${cleanBase}${cleanPath}`;
}

/**
 * 检查是否为外部链接，其中，`//` `xx:` 的形式均被视为外部链接
 * @param path 被检查的链接
 * @return 若为外部链接，返回 true，否则为 false
 */
export function isExternalLink(path: string): boolean {
  if (!path?.trim()) {
    return false;
  }

  const trimmedPath = path.trim();

  // 检查协议相对URL (//example.com)
  if (trimmedPath.startsWith('//')) {
    return true;
  }

  // 检查是否包含协议：更简洁的正则表达式匹配 "protocol:" 格式
  // 匹配常见的外部协议，包括 http(s)、ftp、mailto、tel 等
  const protocolRegex = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
  return protocolRegex.test(trimmedPath);
}

/**
 * 安全地创建URL对象，避免抛出异常
 * @param url URL字符串
 * @param base 基础URL (可选)
 * @returns URL对象或null
 */
export function safeCreateURL(url: string, base?: string): URL | null {
  try {
    return new URL(url, base);
  } catch {
    return null; // 简化错误处理，移除多余的日志
  }
}


/**
 * 检查URL是否为有效格式
 * @param url URL字符串
 * @returns 是否有效
 */
export function isValidUrl(url: string): boolean {
  return safeCreateURL(url) !== null;
}

/**
 * 获取URL的域名部分
 * @param url URL字符串
 * @returns 域名或null
 */
export function getHostname(url: string): string | null {
  const urlObj = safeCreateURL(url);
  return urlObj ? urlObj.hostname : null;
}

/**
 * 检查两个URL是否为同一域名
 * @param url1 第一个URL
 * @param url2 第二个URL
 * @returns 是否同域
 */
export function isSameDomain(url1: string, url2: string): boolean {
  const host1 = getHostname(url1);
  const host2 = getHostname(url2);
  return host1 !== null && host2 !== null && host1 === host2;
}

/**
 * 清理URL，移除不必要的查询参数和片段
 * @param url URL字符串
 * @param keepQuery 是否保留查询参数
 * @param keepFragment 是否保留片段标识符
 * @returns 清理后的URL
 */
export function cleanUrl(url: string, keepQuery: boolean = true, keepFragment: boolean = true): string {
  const urlObj = safeCreateURL(url);
  if (!urlObj) {
    return url;
  }

  if (!keepQuery) {
    urlObj.search = '';
  }
  
  if (!keepFragment) {
    urlObj.hash = '';
  }

  return urlObj.toString();
}