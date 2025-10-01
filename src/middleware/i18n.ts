import {defineMiddleware} from "astro:middleware";
import {getDefaultAbsolutePath, getLocaleByAbsolutePath, pathHasLocale} from "@i18n/utils.ts";

export const customI18nMiddleware = defineMiddleware(async (ctx, next) => {
  const pathname = ctx.url.pathname;

  // 设置当前语言到上下文
  ctx.locals.lang = getLocaleByAbsolutePath(pathname);

  // 如果请求中没有语言路径，直接通行
  if (!pathHasLocale(pathname)) {
    return next();
  }
  
  // 如果请求有语言路径，需要进行分析处理
  try {
    // 1. 检查是否有用户首选的语言版本
    // const useLocale = ctx.request.headers.get('accept-language') || locale;
    // const preferredPath = getPreferredLocalePath(pathname, acceptLanguage);
    
    // 2. 检查是否有实际存在的语言路径
    const testNext = await next();
    if (testNext.status !== 404) {
      // 如果存在，直接返回
      return testNext;
    } else{
      // 如果不存在，重写到默认路径，继续处理
      const defaultPath = getDefaultAbsolutePath(pathname);
      return next(defaultPath);
    }
  } catch (error) {
    console.error('i18n middleware error:', error);
    // 发生错误时，返回 500
    return new Response('Internal Server Error', { status: 500 });
  }
});