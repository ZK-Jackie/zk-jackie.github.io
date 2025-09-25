import { Stats } from "node:fs";
import { type FileProcessor, EntrySep } from "@plugins/enhanced-glob-loader";
import {getReadingTime} from "@utils/readingUtils.ts";
import {execSync} from "child_process";
import {fileURLToPath} from "node:url";


// 文件统计信息处理器（基于 Git 信息）
export const gitStatsProcessor: FileProcessor = {
  name: "git-stats",
  process: async ({ fileStats, originalData, ...args }) => {
    if (!fileStats) return originalData;
    if (!originalData.filePath) {
      throw new Error(
        "`gitStatsProcessor` requires `filePath` to generate a git stats. " +
        "Please use `filePathProcessor` before this processor."
      );
    }

    // 执行 git 命令并获得文件的创建和修改时间
    const gitStats = {
      publishTime: execSync(`git log --follow --diff-filter=A --pretty="format:%cI" -- "${originalData.filePath}"`)
        .toString()
        .trim()
        .split(/\r?\n/)
        .pop() || new Date(), // 取最早的添加提交时间（最后一行）或当前时间
      updateTime: execSync(`git log -1 --pretty="format:%cI" "${originalData.filePath}"`)
        .toString()
        .trim() || new Date() // 取最后一次提交时间或当前时间
    }

    if (typeof gitStats.publishTime === 'string') {
      gitStats.publishTime = new Date(gitStats.publishTime);
    }
    if (typeof gitStats.updateTime === 'string') {
      gitStats.updateTime = new Date(gitStats.updateTime);
    }

    return {
      ...originalData,
      // 添加文件首次提交时间
      publishTime: gitStats.publishTime,
      // 添加文件修改时间
      updateTime: gitStats.updateTime
    };
  }
};

// 文件统计信息处理器（基于文件系统统计）
export const fileStatsProcessor: FileProcessor = {
  name: "file-stats",
  process: async ({ fileStats, originalData }) => {
    if (!fileStats) return originalData;
    
    return {
      ...originalData,
      // 添加文件创建时间
      createTime: fileStats.birthtime,
      // 添加文件修改时间
      updateTime: fileStats.mtime,
      // 添加文件大小，单位字节
      fileSize: fileStats.size,
    };
  }
};

// 自动日期处理器
export const autoCreateTimeProcessor: FileProcessor = {
  name: "auto-create-time",
  process: async ({ fileStats, originalData, ...args }) => {
    if (!fileStats) return originalData;
    
    return {
      ...originalData,
      // 如果没有 createTime 字段，使用文件创建时间
      createTime: fileStats.birthtime,
    };
  }
};

// 文件路径处理器
export const filePathProcessor: FileProcessor = {
  name: "file-path",
  process: async ({ entry, base, originalData }) => {
    const fileUrl = new URL(encodeURI(entry), base);
    const filePath = fileURLToPath(fileUrl);
    const fileName = entry.split(EntrySep).pop();
    const fileNameWithoutExt = fileName?.split('.')[0];
    
    return {
      ...originalData,
      // 添加完整文件路径
      filePath: filePath,
      // 添加文件名
      fileName: fileNameWithoutExt,
      // 添加完整文件名（包含扩展名）
      fullFileName: fileName,
    };
  }
};

// 分类处理器（基于文件夹结构）
export const categoryFromPathProcessor: FileProcessor = {
  name: "category-from-path",
  process: async ({ entry, originalData }) => {
    if (originalData.categories && originalData.categories.length > 0) {
      return originalData;
    }
    
    const pathParts = entry.split(EntrySep).filter(part => part !== '');
    // 移除文件名，只保留目录
    pathParts.pop();
    
    const categories = pathParts.length > 0 ? pathParts : ['其他'];
    
    return {
      ...originalData,
      categories
    };
  }
};

// 标签处理器（从文件名提取）
export const tagsFromFileNameProcessor: FileProcessor = {
  name: "tags-from-filename",
  process: async ({ entry, originalData }) => {
    if (originalData.tags && originalData.tags.length > 0) {
      return originalData;
    }
    
    const fileName = entry.split(EntrySep).pop()?.split('.')[0] || '';
    const tags = fileName
      .split(/[-_]/)
      .filter(tag => tag.length > 1)
      .slice(0, 3); // 最多提取3个标签
    
    return {
      ...originalData,
      tags: tags.length > 0 ? tags : ['其他']
    };
  }
};

// 阅读时间估算处理器
export const readingTimeProcessor: FileProcessor = {
  name: "reading-time",
  process: async ({ contents, originalData }) => {
    const {minutes, wordCount} = getReadingTime(contents);

    return {
      ...originalData,
      readingCost: minutes,
      wordCount: wordCount
    };
  }
};

// 内容摘要生成处理器
export const excerptProcessor: FileProcessor = {
  name: "excerpt",
  process: async ({ contents, originalData }) => {
    if (originalData.excerpt || originalData.description) {
      return originalData;
    }
    
    // 移除frontmatter
    let content = contents.replace(/^---[\s\S]*?---/, '');
    
    // 移除Markdown标记
    content = content
      .replace(/^#+\s/gm, '') // 标题
      .replace(/\*\*(.*?)\*\*/g, '$1') // 粗体
      .replace(/\*(.*?)\*/g, '$1') // 斜体
      .replace(/`(.*?)`/g, '$1') // 行内代码
      .replace(/```[\s\S]*?```/g, '') // 代码块
      .replace(/!\[.*?\]\(.*?\)/g, '') // 图片
      .replace(/\[.*?\]\(.*?\)/g, '') // 链接
      .trim();
    
    // 提取前150个字符作为摘要
    const excerpt = content.substring(0, 150).trim();
    
    return {
      ...originalData,
      excerpt: excerpt || originalData.title || ''
    };
  }
};

// 组合常用处理器
export const defaultProcessors = [
  autoCreateTimeProcessor,
  filePathProcessor,
  gitStatsProcessor,
  readingTimeProcessor,
  excerptProcessor
];

export const postsProcessors = [
  autoCreateTimeProcessor,
  filePathProcessor,
  gitStatsProcessor,
  // categoryFromPathProcessor,
  // tagsFromFileNameProcessor,
  readingTimeProcessor,
  excerptProcessor
];

export const fullProcessors = [
  fileStatsProcessor,
  autoCreateTimeProcessor,
  filePathProcessor,
  // categoryFromPathProcessor,
  // tagsFromFileNameProcessor,
  readingTimeProcessor,
  excerptProcessor
];