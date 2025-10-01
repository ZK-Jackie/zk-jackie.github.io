import { 
  resolveUrl, 
  isExternalLink,
  safeCreateURL,
  isValidUrl,
  getHostname,
  isSameDomain,
  cleanUrl
} from '../pathUtils';
import { describe, it, expect } from 'vitest';

describe('resolveUrl', () => {
  const basePath = 'https://example.com';
  const currentUrl = 'https://example.com/blog/post1';

  it('应返回外部链接原值', () => {
    expect(resolveUrl('https://example.com')).toBe('https://example.com');
    expect(resolveUrl('mailto:test@example.com', basePath)).toBe('mailto:test@example.com');
    expect(resolveUrl('tel:123456', basePath)).toBe('tel:123456');
  });

  it('应正确拼接绝对路径', () => {
    expect(resolveUrl('/about', '/base')).toBe('/base/about');
    expect(resolveUrl('/about', basePath)).toBe('https://example.com/about');
  });

  it('应处理相对路径', () => {
    expect(resolveUrl('contact', '/base', 'https://site.com/base/')).toBe('https://site.com/base/contact');
    expect(resolveUrl('./sibling', basePath, currentUrl)).toBe('https://example.com/blog/sibling');
    expect(resolveUrl('../parent', basePath, currentUrl)).toBe('https://example.com/parent');
  });

  it('应当直接返回根路径', () => {
    expect(resolveUrl('/', '/base')).toBe('/base/');
    expect(resolveUrl('/', '/')).toBe('/');
  });

  it('应该处理协议相对URL', () => {
    expect(resolveUrl('//other.com/path', basePath, currentUrl))
      .toBe('https://other.com/path');
  });

  it('应该正确处理锚点和查询参数', () => {
    expect(resolveUrl('#section1', basePath, currentUrl))
      .toBe('https://example.com/blog/post1#section1');
    expect(resolveUrl('?page=2', basePath, currentUrl))
      .toBe('https://example.com/blog/post1?page=2');
    expect(resolveUrl('subpage#top', basePath, currentUrl))
      .toBe('https://example.com/blog/subpage#top');
    expect(resolveUrl('../archive?page=3#bottom', basePath, currentUrl))
      .toBe('https://example.com/archive?page=3#bottom');
  });

  it('应该处理边界情况', () => {
    expect(resolveUrl('', basePath, currentUrl)).toBe(basePath);
    expect(resolveUrl('   ', basePath, currentUrl)).toBe(basePath);
    expect(resolveUrl('relative', basePath)).toBe('https://example.com/relative');
  });
});

describe('isExternalLink', () => {
  it('应识别 HTTP/HTTPS 链接', () => {
    expect(isExternalLink('http://test.com')).toBe(true);
    expect(isExternalLink('https://test.com')).toBe(true);
    expect(isExternalLink('HTTP://TEST.COM')).toBe(true);
  });

  it('应识别各种协议链接', () => {
    expect(isExternalLink('mailto:test@test.com')).toBe(true);
    expect(isExternalLink('tel:123456')).toBe(true);
    expect(isExternalLink('ftp://ftp.example.com')).toBe(true);
    expect(isExternalLink('data:text/plain;base64,SGVsbG8=')).toBe(true);
    expect(isExternalLink('javascript:alert("test")')).toBe(true);
    expect(isExternalLink('whatsapp://send?text=hello')).toBe(true);
  });

  it('应识别协议相对URL', () => {
    expect(isExternalLink('//example.com/path')).toBe(true);
  });

  it('应识别非外部链接', () => {
    expect(isExternalLink('/internal')).toBe(false);
    expect(isExternalLink('./relative')).toBe(false);
    expect(isExternalLink('../parent')).toBe(false);
    expect(isExternalLink('#anchor')).toBe(false);
    expect(isExternalLink('?query=param')).toBe(false);
  });

  it('应该处理边界情况', () => {
    expect(isExternalLink('')).toBe(false);
    expect(isExternalLink('   ')).toBe(false);
    expect(isExternalLink(null as any)).toBe(false);
    expect(isExternalLink(undefined as any)).toBe(false);
  });
});

describe('safeCreateURL', () => {
  it('应该创建有效的URL对象', () => {
    const url = safeCreateURL('https://example.com/path');
    expect(url).toBeInstanceOf(URL);
    expect(url?.hostname).toBe('example.com');
  });

  it('应该处理无效URL', () => {
    expect(safeCreateURL('invalid-url')).toBeNull();
    expect(safeCreateURL('')).toBeNull();
  });

  it('应该支持基础URL', () => {
    const url = safeCreateURL('path', 'https://example.com/');
    expect(url?.href).toBe('https://example.com/path');
  });
});

describe('isValidUrl', () => {
  it('应该验证有效URL', () => {
    expect(isValidUrl('https://example.com')).toBe(true);
    expect(isValidUrl('http://localhost:3000')).toBe(true);
    expect(isValidUrl('ftp://ftp.example.com')).toBe(true);
  });

  it('应该拒绝无效URL', () => {
    expect(isValidUrl('not-a-url')).toBe(false);
    expect(isValidUrl('')).toBe(false);
    expect(isValidUrl('just-text')).toBe(false);
  });
});

describe('getHostname', () => {
  it('应该提取主机名', () => {
    expect(getHostname('https://example.com/path')).toBe('example.com');
    expect(getHostname('http://subdomain.example.com:8080/path')).toBe('subdomain.example.com');
  });

  it('应该处理无效URL', () => {
    expect(getHostname('invalid-url')).toBeNull();
  });
});

describe('isSameDomain', () => {
  it('应该识别相同域名', () => {
    expect(isSameDomain(
      'https://example.com/path1',
      'https://example.com/path2'
    )).toBe(true);
    
    expect(isSameDomain(
      'http://example.com:8080/path1',
      'https://example.com:3000/path2'
    )).toBe(true);
  });

  it('应该识别不同域名', () => {
    expect(isSameDomain(
      'https://example.com/path',
      'https://other.com/path'
    )).toBe(false);
  });

  it('应该处理无效URL', () => {
    expect(isSameDomain('invalid-url', 'https://example.com')).toBe(false);
  });
});

describe('cleanUrl', () => {
  it('应该清理查询参数和片段', () => {
    const url = 'https://example.com/path?param=value&other=test#section1';
    
    expect(cleanUrl(url, false, false)).toBe('https://example.com/path');
    expect(cleanUrl(url, true, false)).toBe('https://example.com/path?param=value&other=test');
    expect(cleanUrl(url, false, true)).toBe('https://example.com/path#section1');
    expect(cleanUrl(url, true, true)).toBe(url);
  });

  it('应该处理无效URL', () => {
    const invalidUrl = 'not-a-url';
    expect(cleanUrl(invalidUrl)).toBe(invalidUrl);
  });
});
