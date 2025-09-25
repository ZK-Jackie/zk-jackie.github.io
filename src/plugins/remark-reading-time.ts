import { toString } from 'mdast-util-to-string';
import {getReadingTime} from "@utils/readingUtils.ts";

export interface MarkdownDomData {
  type: string;
  depth?: number;
  children: Array<MarkdownDomData>;
  position?: {
    start: {line: number; column: number; offset: number};
    end: {line: number; column: number; offset: number};
    indent?: Array<number>;
  };
}

export interface CodeDomData extends MarkdownDomData {
  lang: string;
  meta?: string;
}

export function remarkReadingTime() {
  const options = {
    wordsPerMinute: 200,
    codeReadingFactor: 0.3,
  }
  return function (tree: unknown, {data}: any) {
    const textOnPage = toString(tree);
    const readingTime = getReadingTime(
      textOnPage, options.wordsPerMinute, options.codeReadingFactor
    );
    data.astro.frontmatter.minuteRead = readingTime.minutes;
    data.astro.frontmatter.wordCount = readingTime.wordCount;
  };
}