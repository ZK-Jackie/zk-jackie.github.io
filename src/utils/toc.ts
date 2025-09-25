import type {MarkdownHeading} from "astro";
import {contentConfig} from "@config";

export type Heading = {
  subheadings: Heading[];
  depth: number;
  slug: string;
  text: string;
};

export function buildToc(headings: MarkdownHeading[]) {
  const toc: Heading[] = [];
  const parentHeadings = new Map();
  headings
    .filter((h) => h.depth <= contentConfig.tocMaxDepth) // 最大深度限制由配置文件控制
    .forEach((h) => {
      const heading: Heading = { ...h, subheadings: [] }; // 对每一个 h 都加上一个 subheadings 数组
      parentHeadings.set(heading.depth, heading);         // 设置当前标题为其深度的父级标题
      if (heading.depth === 1) {
        // H1 标题直接添加到 toc
        toc.push(heading);  // 直接添加，不用查找父级
      } else {
        // H2-H6 查找最近的父级标题
        let parentDepth = heading.depth - 1;  // 优先考虑最近一级的父标签
        while (parentDepth >= 1 && !parentHeadings.has(parentDepth)) {  // 如果没有找到父级标题，继续向上查找
          parentDepth--;
        }
        if (parentDepth >= 1 && parentHeadings.has(parentDepth)) {  // 如果找到了父级标题
          parentHeadings.get(parentDepth)!.subheadings.push(heading); // 将当前标题添加到父级标题的 subheadings 中
        } else {
          // 如果找不到父级，添加到根级别
          toc.push(heading);
        }
      }
    });
  return toc;
}