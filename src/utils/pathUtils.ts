/**
 * Resolve a potentially relative URL to an absolute URL based on the base URL.
 * @param path The URL to resolve.
 * @param baseUrl The base URL path to use for resolution (e.g., "/", "/project1").
 * @param currentUrl The current URL context for resolving relative paths (optional, should be full URL like "https://site.com/page").
 * @returns The resolved absolute URL.
 */
export function resolveUrl(path: string, baseUrl: string = "/", currentUrl?: string): string {
  // 输入验证
  if (!path) {
    console.warn('Invalid path provided to resolveUrl:', path);
    return baseUrl;
  }

  // 去除首尾空白字符
  path = path.trim();
  
  // 空路径返回base URL
  if (!path) {
    return baseUrl;
  }

  // 1. 处理外部链接（特例：协议相对 URL 也是外部链接，需继续处理）
  if (isExternalLink(path)) {
    // 2. 处理协议相对URL (//example.com/path)
    if (path.startsWith('//')) {
      // 如果有当前URL，使用其协议；否则默认使用https
      const protocol = currentUrl ? safeCreateURL(currentUrl)?.protocol || 'https:' : 'https:';
      return `${protocol}${path}`;
    }
    return path;
  }

  // 3. 处理绝对路径
  if (path.startsWith('/')) {
    // 检查 baseUrl 是完整URL还是路径前缀
    if (isCompleteUrl(baseUrl)) {
      // baseUrl 是完整URL (如 "https://example.com")
      return normalizePath(baseUrl, path);
    } else {
      // baseUrl 是路径前缀 (如 "/", "/project1")
      return normalizePath(baseUrl, path);
    }
  }

  // 4. 处理锚点或查询参数
  if (path.startsWith("#") || path.startsWith("?")) {
    return resolveAnchorOrQuery(path, baseUrl, currentUrl);
  }

  // 5. 处理相对路径（需要当前 URL）
  return resolveRelativePath(path, baseUrl, currentUrl);
}

/**
 * 处理锚点和查询参数
 */
function resolveAnchorOrQuery(path: string, baseUrl: string, currentUrl?: string): string {
  // 构建完整的当前URL
  let fullCurrentUrl = buildFullCurrentUrl(baseUrl, currentUrl);
  
  try {
    const url = safeCreateURL(fullCurrentUrl);
    if (!url) {
      console.error('Cannot create URL from:', fullCurrentUrl);
      return normalizePath(baseUrl, path);
    }
    
    if (path.startsWith("#")) {
      url.hash = path;
    } else {
      url.search = path;
    }
    return url.toString();
  } catch (e) {
    console.error('Error processing anchor/query:', e);
    return normalizePath(baseUrl, path);
  }
}

/**
 * 处理相对路径解析
 */
function resolveRelativePath(path: string, baseUrl: string, currentUrl?: string): string {
  if (!currentUrl) {
    console.warn('Relative path requires current URL for resolution, using base URL instead');
    return normalizePath(baseUrl, path);
  }
  
  try {
    // 构建完整的当前URL用于相对路径解析
    const fullCurrentUrl = buildFullCurrentUrl(baseUrl, currentUrl);
    
    // 使用 URL API 解析相对路径
    const resolvedUrl = safeCreateURL(path, fullCurrentUrl);
    if (!resolvedUrl) {
      console.error('Failed to resolve relative path:', path, 'with base:', fullCurrentUrl);
      return normalizePath(baseUrl, path);
    }
    
    // 如果baseUrl是路径前缀，确保解析后的路径也在正确的作用域内
    if (!isCompleteUrl(baseUrl)) {
      return ensureWithinBaseUrl(resolvedUrl.toString(), baseUrl);
    }
    
    return resolvedUrl.toString();
  } catch (e) {
    console.error('Error resolving relative path:', e);
    return normalizePath(baseUrl, path);
  }
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
  if (!base || !path) {
    return base || path || '/';
  }
  
  const normalizedBase = base.endsWith('/') ? base.slice(0, -1) : base;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}

/**
 * Check if a path is an external link.
 * @param path The path to check.
 * @return True if the path is an external link (starts with protocol:// or special protocols), false otherwise.
 */
export function isExternalLink(path: string): boolean {
  if (!path) {
    return false;
  }

  // 去除首尾空白字符
  path = path.trim();

  // 检查常见的外部协议
  const externalProtocols = [
    'http://', 'https://',
    'ftp://', 'ftps://',
    'mailto:', 'tel:', 'sms:',
    'data:', 'blob:',
    'file://', 'javascript:',
    // 社交媒体和应用协议
    'twitter:', 'facebook:', 'instagram:',
    'whatsapp:', 'telegram:', 'skype:',
    // 其他协议
    'steam:', 'discord:', 'spotify:',
  ];

  // 检查是否以任何外部协议开头
  for (const protocol of externalProtocols) {
    if (path.toLowerCase().startsWith(protocol)) {
      return true;
    }
  }

  // 检查协议相对URL (//example.com)
  if (path.startsWith('//')) {
    return true;
  }

  // 更严格的协议检查：匹配 "protocol:" 格式
  const protocolRegex = /^[a-zA-Z][a-zA-Z0-9+.-]*:/;
  return protocolRegex.test(path);
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
  } catch (e) {
    console.warn('Invalid URL:', url, 'Base:', base, 'Error:', e);
    return null;
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