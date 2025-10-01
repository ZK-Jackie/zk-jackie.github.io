import {
  getLocaleByAbsolutePath, 
  getDefaultAbsolutePath, 
  getLocalizedPathIfExists,
  getPreferredLocalePath 
} from "../utils.ts";
import { describe, it, expect } from 'vitest';
import {getAbsoluteLocaleUrlList} from "astro:i18n";

describe('getLocaleByPath', () => {
  it('should return the correct locale from the path', () => {
    getAbsoluteLocaleUrlList()
    expect(getLocaleByAbsolutePath('/en/some/page')).toBe('en');
    expect(getLocaleByAbsolutePath('/zh/another/page')).toBe('zh');
    expect(getLocaleByAbsolutePath('/fr/some/page')).toBe('zh'); // fr not supported, returns default
    expect(getLocaleByAbsolutePath('/es')).toBe('zh'); // es not supported, returns default
    expect(getLocaleByAbsolutePath('/de/')).toBe('zh'); // de not supported, returns default
    expect(getLocaleByAbsolutePath('/about')).toBe('zh'); // no language prefix, returns default
  });
})

describe('getDefaultPath', () => {
  it('should return the correct default path based on showDefaultLang setting', () => {
    expect(getDefaultAbsolutePath('/en/some/page')).toBe('/some/page');
    expect(getDefaultAbsolutePath('/zh/another/page')).toBe('/another/page');
    expect(getDefaultAbsolutePath('/about/index')).toBe('/about/index');
    expect(getDefaultAbsolutePath('/')).toBe('/');
  });
})

describe('getLocalizedPathIfExists', () => {
  it('should return localized path for supported languages', () => {
    expect(getLocalizedPathIfExists('/about', 'en')).toBe('/en/about');
    expect(getLocalizedPathIfExists('/zh/about', 'en')).toBe('/en/about');
  });

  it('should return clean path for default language when showDefaultLang is false', () => {
    expect(getLocalizedPathIfExists('/en/about', 'zh')).toBe('/about');
    expect(getLocalizedPathIfExists('/about', 'zh')).toBe('/about');
  });
})

describe('getPreferredLocalePath', () => {
  it('should return default language path when no accept-language header', () => {
    expect(getPreferredLocalePath('/about')).toBe('/about');
  });

  it('should parse accept-language header and return preferred language', () => {
    expect(getPreferredLocalePath('/about', 'en-US,en;q=0.9,zh;q=0.8')).toBe('/en/about');
    expect(getPreferredLocalePath('/about', 'zh-CN,zh;q=0.9,en;q=0.8')).toBe('/about');
  });

  it('should fallback to default language for unsupported languages', () => {
    expect(getPreferredLocalePath('/about', 'fr-FR,fr;q=0.9')).toBe('/about');
  });
})
