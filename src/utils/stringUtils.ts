/**
 * Checks if a character is an alphabet letter (A-Z, a-z).
 * @param char - The character to check.
 * @returns True if the character is an alphabet letter, false otherwise.
 */
export function isAlpha(char: string): boolean {
  return /^[A-Za-z]$/.test(char);
}

/**
 * Capitalizes the first letter of a string, remains unchanged when the first character is not an alphabet letter.
 * @param str - The string to capitalize.
 * @returns The string with the first letter capitalized if it's an alphabet letter, otherwise returns the original string.
 */
export function capitalizeFirstLetter(str: string): string {
  if (str.length === 0) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Capitalizes the first letter of each word in a string.
 * @param str - The string to capitalize.
 * @returns The string with the first letter of each word capitalized.
 */
export function capitalizeWords(str: string): string {
  return str.split(' ').map(capitalizeFirstLetter).join(' ');
}

/**
 * Normalizes a string to create a URL-friendly slug.
 * @param str - The string to normalize.
 * @returns The normalized URL slug.
 */
export function normalizeUrl(str: string): string {
  return str
    // 1. 将字符串转换为 Unicode 规范形式，将 'é' 这样的字符分解为 'e' 和 '´'
    .normalize('NFD')
    // 2. 移除所有组合变音符号
    .replace(/[\u0300-\u036f]/g, '')
    // 3. 将所有非字母、数字、空格或连字符的字符替换为空格
    .replace(/[^a-z0-9\s-]/gi, '')
    // 4. 将连续的空格替换为单个连字符
    .replace(/\s+/g, '-')
    // 5. 将连续的连字符合并为单个
    .replace(/-+/g, '-')
    // 6. 移除开头和结尾的连字符
    .replace(/^-+|-+$/g, '')
    // 7. 转换为小写
    .toLowerCase();
}