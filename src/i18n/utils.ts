import {ui, defaultLang, showDefaultLang} from './ui';


export function pathHasLocale(path: string): boolean {
  let [, lang, ...restPaths] = path.split('/');
  return lang in ui;
}

export function getDefaultAbsolutePath(path: string) {
  let [, lang, ...restPaths] = path.split('/');
  const cleanPath = '/' + restPaths.join('/');

  if (lang in ui) {
    // 如果当前路径已包含语言前缀，移除它
    if (showDefaultLang || defaultLang !== 'zh') {
      // 如果需要显示默认语言前缀，或默认语言不是中文
      return `/${defaultLang}${cleanPath}`;
    } else {
      // 如果不需要显示默认语言前缀，直接返回清理后的路径
      return cleanPath;
    }
  } else {
    // 如果当前路径不包含语言前缀
    if (showDefaultLang) {
      // 如果需要显示默认语言前缀，添加它
      return `/${defaultLang}${path}`;
    } else {
      // 如果不需要显示默认语言前缀，直接返回原路径
      return path;
    }
  }
}

export function getLocaleByAbsolutePath(path: string) {
  const [, lang] = path.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
}

export function getLocaleByUrl(url: URL) {
  return getLocaleByAbsolutePath(url.pathname);
}

export function useTranslatedPath(lang: keyof typeof ui) {
  return function translatePath(path: string, l: string = lang) {
    return !showDefaultLang && l === defaultLang ? path : `/${l}${path}`
  }
}

export function useTranslations(lang: keyof typeof ui) {
  return function t(key: keyof typeof ui[typeof defaultLang], ...args: (string | number)[]): string {
    let translation: string = ui[lang][key] || ui[defaultLang][key];

    // Simple interpolation for placeholders like {page}, {current}, {total}
    if (args.length > 0) {
      args.forEach((arg, index) => {
        const placeholder = index === 0 ?
          (key.includes('page') && !key.includes('pageOf') ? '{page}' :
            key.includes('current') ? '{current}' :
              key.includes('total') ? '{total}' : `{${index}}`) :
          `{${index}}`;
        translation = translation.replace(placeholder, String(arg));
      });
    }

    return translation;
  }
}

// Helper function for interpolating named placeholders
export function interpolate(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key) => {
    return values[key] !== undefined ? String(values[key]) : match;
  });
}

/**
 * 检查指定语言的路径是否存在
 * @param pathname 当前路径
 * @param targetLang 目标语言
 * @returns 目标语言的路径（如果存在）或 null
 */
export function getLocalizedPathIfExists(pathname: string, targetLang: keyof typeof ui): string | null {
  // 移除路径开头的语言前缀
  let cleanPath = pathname;
  const [, currentLang, ...segments] = pathname.split('/');

  if (currentLang in ui) {
    cleanPath = '/' + segments.join('/');
  }

  // 如果目标语言是默认语言且配置为不显示默认语言前缀
  if (targetLang === defaultLang && !showDefaultLang) {
    return cleanPath;
  }

  // 否则返回带语言前缀的路径
  return `/${targetLang}${cleanPath}`;
}

/**
 * 获取首选语言路径
 * @param pathname 当前路径
 * @param acceptLanguage Accept-Language 头部信息
 * @returns 首选语言的路径
 */
export function getPreferredLocalePath(pathname: string, acceptLanguage?: string): string {
  if (!acceptLanguage) {
    return getLocalizedPathIfExists(pathname, defaultLang) || pathname;
  }

  // 解析 Accept-Language 头部
  const preferredLanguages = acceptLanguage
    .split(',')
    .map(lang => {
      const [code, q] = lang.trim().split(';q=');
      return {
        code: code.split('-')[0], // 只取主语言代码，如 'zh-CN' -> 'zh'
        quality: q ? parseFloat(q) : 1.0
      };
    })
    .sort((a, b) => b.quality - a.quality);

  // 找到第一个支持的语言
  for (const {code} of preferredLanguages) {
    if (code in ui) {
      const localizedPath = getLocalizedPathIfExists(pathname, code as keyof typeof ui);
      if (localizedPath) {
        return localizedPath;
      }
    }
  }

  // 如果没有找到匹配的语言，返回默认语言路径
  return getLocalizedPathIfExists(pathname, defaultLang) || pathname;
}
