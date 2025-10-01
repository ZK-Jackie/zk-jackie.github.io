/**
 * Calculate word count and reading time for a given text
 * @param text The text content to analyze
 * @param wordsPerMinute The average reading speed (default: 200 words per minute)
 * @param codeReadingFactor The factor to reduce code reading speed (default: 0.3)
 * @returns An object with word count, minutes, seconds and formatted strings
 */
export function getReadingTime(text: string, wordsPerMinute: number = 300, codeReadingFactor: number = 0.3): {
  minutes: number;
  seconds: number;
  wordCount: number;
  regularWords: number;
  codeWords: number;
  text: string;
  wordCountText: string;
} {
  // 移除frontmatter
  const mainBody = text.replace(/^---[\s\S]*?---/, '');

  // Strip HTML tags if present
  const plainText = mainBody.replace(/<\/?[^>]+(>|$)/g, '');

  // Identify code blocks (Markdown code blocks with ``` or indented code)
  const codeBlockRegex = /```[\s\S]*?```|`[^`]+`|\n( {4}|\t)[^\n]+/g;
  const codeBlocks = plainText.match(codeBlockRegex) || [];

  // Calculate code content and non-code content
  let codeContent = '';
  codeBlocks.forEach(block => {
    codeContent += block;
  });

  // Remove code blocks from text to count regular text separately
  let nonCodeContent = plainText;
  codeBlocks.forEach(block => {
    nonCodeContent = nonCodeContent.replace(block, '');
  });

  // Count words in regular text
  const regularWords = nonCodeContent.trim().split(/\s+/).filter(Boolean).length;

  // Count words in code (code takes longer to read)
  const codeWords = codeContent.trim().split(/\s+/).filter(Boolean).length;

  // Total word count
  const totalWords = regularWords + codeWords;

  // Apply different reading speeds to regular text and code
  const adjustedCodeWords = codeWords / codeReadingFactor;
  const totalAdjustedWords = regularWords + adjustedCodeWords;

  // Calculate reading time in minutes and seconds
  const minutes = Math.floor(totalAdjustedWords / wordsPerMinute);
  const seconds = Math.floor((totalAdjustedWords % wordsPerMinute) / (wordsPerMinute / 60));

  // Format the reading time
  let readingTime = '';
  if (minutes > 0) {
    readingTime = `${minutes} 分钟`;
    // if (seconds > 0) readingTime += ` ${seconds} 秒`;
  } else {
    readingTime = `${seconds} 秒`;
  }

  return {
    wordCount: totalWords,
    regularWords,
    codeWords,
    minutes,
    seconds,
    text: readingTime,
    wordCountText: `${totalWords} 字`
  };
}