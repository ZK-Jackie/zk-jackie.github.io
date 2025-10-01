/**
 * Checks if a character is an alphabet letter (A-Z, a-z).
 * @param char - The character to check.
 * @returns True if the character is an alphabet letter, false otherwise.
 */
export function isAlpha(char: string): boolean {
  return /^[A-Za-z]$/.test(char);
}