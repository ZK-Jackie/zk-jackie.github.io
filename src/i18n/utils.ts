import { ui, defaultLang } from './ui';

export function getLangFromUrl(url: URL) {
  const [, lang] = url.pathname.split('/');
  if (lang in ui) return lang as keyof typeof ui;
  return defaultLang;
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
