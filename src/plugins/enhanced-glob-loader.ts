import { existsSync, promises as fs, Stats } from "node:fs";
import { relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { bold, green } from "kleur/colors";
import pLimit from "p-limit";
import picomatch from "picomatch";
import { glob as tinyglobby } from "tinyglobby";

export const EntrySep = '/';


/**
 * POSIX 风格的相对路径
 * @param from
 * @param to
 */
function posixRelative(from: string, to: string): string {
  const rel = relative(from, to);
  return rel.split('\\').join('/');
}

/**
 * 获取内容条目的 ID 和 slug，默认基于 entry 相对于 contentDir 的路径
 * @param entry 内容条目的 URL，file:// 协议，是文件的完整绝对路径
 * @param contentDir 内容目录的 URL，file:// 协议，是提供给 enhancedGlob 的 base 目录的完整绝对路径
 * @param collection 集合名称
 */
function getContentEntryIdAndSlug({ entry, contentDir, collection }: {
  entry: URL;
  contentDir: URL;
  collection: string;
}): { id: string; slug: string } {
  const entryPath = entry.pathname;
  const contentPath = contentDir.pathname;
  const relativePath = entryPath.replace(contentPath, '');
  const pathWithoutExt = relativePath.replace(/\.[^/.]+$/, "");
  const slug = pathWithoutExt.split('/').filter(Boolean).join('/');
  return { id: slug, slug: slug };
}

// 定义处理器类型
export interface FileProcessor {
  name: string;
  process: (data: {
    // 相对于提供给 enhancedGlob 的 base 目录的 URL
    entry: string;
    base: URL;
    fileStats: Stats;
    originalData: any;
    contents: string;
  }) => Promise<any> | any;
}

// 定义增强版配置选项
export interface EnhancedGlobOptions {
  pattern: string | string[];
  base?: string;
  generateId?: (params: { entry: string; base: URL; data: any }) => string;
  processors?: FileProcessor[];
  enableFileStats?: boolean;
  _legacy?: boolean;
}

/**
 * 默认的 ID 生成函数
 * @param entry 相对于 base 的路径，以 "/" 分隔
 * @param base base 目录的 URL，file:// 协议
 * @param data 文件的 frontmatter 数据
 */
function generateIdDefault({ entry, base, data }: { entry: string; base: URL; data: any }): string {
  if (data.slug) {
    return data.slug;
  }
  const entryURL = new URL(encodeURI(entry), base);
  const { slug } = getContentEntryIdAndSlug({
    entry: entryURL,
    contentDir: base,
    collection: ""
  });
  return slug;
}

// 检查模式前缀
function checkPrefix(pattern: string | string[], prefix: string): boolean {
  if (Array.isArray(pattern)) {
    return pattern.some((p) => p.startsWith(prefix));
  }
  return pattern.startsWith(prefix);
}

// 增强版 glob loader
export function enhancedGlob(options: EnhancedGlobOptions) {
  // 验证模式
  if (checkPrefix(options.pattern, "../")) {
    throw new Error(
      "Glob patterns cannot start with `../`. Set the `base` option to a parent directory instead."
    );
  }
  if (checkPrefix(options.pattern, "/")) {
    throw new Error(
      "Glob patterns cannot start with `/`. Set the `base` option to a parent directory or use a relative path instead."
    );
  }

  const generateId = options.generateId ?? generateIdDefault;
  const processors = options.processors ?? [];
  const enableFileStats = options.enableFileStats ?? true;
  const fileToIdMap = new Map<string, string>();

  return {
    name: "enhanced-glob-loader",
    load: async ({ config, logger, watcher, parseData, store, generateDigest, entryTypes }: any) => {
      const renderFunctionByContentType = new WeakMap();
      const untouchedEntries = new Set(store.keys());
      const isLegacy = options._legacy;

      // 同步数据的核心函数
      async function syncData(entry: string, base: URL, entryType: any, oldId?: string) {
        if (!entryType) {
          logger.warn(`No entry type found for ${entry}`);
          return;
        }

        const fileUrl = new URL(encodeURI(entry), base);
        const filePath = fileURLToPath(fileUrl);
        
        // 获取文件内容
        const contents = await fs.readFile(fileUrl, "utf-8").catch((err: Error) => {
          logger.error(`Error reading ${entry}: ${err.message}`);
          return;
        });

        if (!contents && contents !== "") {
          logger.warn(`No contents found for ${entry}`);
          return;
        }

        // 获取文件统计信息
        let fileStats: Stats | null = null;
        if (enableFileStats) {
          try {
            fileStats = await fs.stat(fileUrl);
          } catch (err) {
            logger.warn(`Could not get file stats for ${entry}`);
          }
        }

        // 获取原始数据
        const { body, data: originalData } = await entryType.getEntryInfo({
          contents,
          fileUrl
        });

        // 应用处理器管道
        let processedData = originalData;
        for (const processor of processors) {
          try {
            processedData = await processor.process({
              entry,
              base,
              fileStats: fileStats!,
              originalData: processedData,
              contents
            });
          } catch (error) {
            logger.error(`Error in processor ${processor.name} for ${entry}: ${(error as Error).message}`);
          }
        }

        // 生成ID
        const id = generateId({ entry, base, data: processedData });

        // 清理旧ID
        if (oldId && oldId !== id) {
          store.delete(oldId);
        }

        // 处理legacy ID
        let legacyId: string | undefined;
        if (isLegacy) {
          const entryURL = new URL(encodeURI(entry), base);
          const legacyOptions = getContentEntryIdAndSlug({
            entry: entryURL,
            contentDir: base,
            collection: ""
          });
          legacyId = legacyOptions.id;
        }

        untouchedEntries.delete(id);

        // 检查现有条目和摘要
        const existingEntry = store.get(id);
        const digest = generateDigest(contents);
        const relativePath = posixRelative(fileURLToPath(config.root), filePath);

        // 如果内容未变化，直接返回
        if (existingEntry && existingEntry.digest === digest && existingEntry.filePath) {
          if (existingEntry.deferredRender) {
            store.addModuleImport(existingEntry.filePath);
          }
          if (existingEntry.assetImports?.length) {
            store.addAssetImports(existingEntry.assetImports, existingEntry.filePath);
          }
          fileToIdMap.set(filePath, id);
          return;
        }

        // 解析数据
        const parsedData = await parseData({
          id,
          data: processedData,
          filePath: filePath
        });

        // 处理渲染
        if (entryType.getRenderFunction) {
          if (isLegacy && processedData.layout) {
            logger.error(
              `The Markdown "layout" field is not supported in content collections in Astro 5. Ignoring layout for ${JSON.stringify(entry)}. Enable "legacy.collections" if you need to use the layout field.`
            );
          }

          let render = renderFunctionByContentType.get(entryType);
          if (!render) {
            render = await entryType.getRenderFunction(config);
            renderFunctionByContentType.set(entryType, render);
          }

          let rendered: any = undefined;
          try {
            rendered = await render?.({
              id,
              data: processedData,
              body,
              filePath: filePath,
              digest
            });
          } catch (error) {
            logger.error(`Error rendering ${entry}: ${(error as Error).message}`);
          }

          store.set({
            id,
            data: parsedData,
            body,
            filePath: relativePath,
            digest,
            rendered,
            assetImports: rendered?.metadata?.imagePaths,
            legacyId
          });
        } else if ("contentModuleTypes" in entryType) {
          store.set({
            id,
            data: parsedData,
            body,
            filePath: relativePath,
            digest,
            deferredRender: true,
            legacyId
          });
        } else {
          store.set({ 
            id, 
            data: parsedData, 
            body, 
            filePath: relativePath, 
            digest, 
            legacyId 
          });
        }

        fileToIdMap.set(filePath, id);
      }

      // 设置基础目录
      const baseDir = options.base ? new URL(options.base, config.root) : config.root;
      if (!baseDir.pathname.endsWith("/")) {
        baseDir.pathname = `${baseDir.pathname}/`;
      }

      const filePath = fileURLToPath(baseDir);
      const relativePath = relative(fileURLToPath(config.root), filePath);
      const exists = existsSync(baseDir);

      if (!exists) {
        logger.warn(`The base directory "${fileURLToPath(baseDir)}" does not exist.`);
      }

      // 扫描文件
      const files = await tinyglobby(options.pattern, {
        cwd: fileURLToPath(baseDir),
        expandDirectories: false
      });

      if (exists && files.length === 0) {
        logger.warn(
          `No files found matching "${options.pattern}" in directory "${relativePath}"`
        );
        return;
      }

      // 获取文件配置
      function configForFile(file: string) {
        const ext = file.split(".").at(-1);
        if (!ext) {
          logger.warn(`No extension found for ${file}`);
          return;
        }
        return entryTypes.get(`.${ext}`);
      }

      // 并发限制
      const limit = pLimit(10);
      const skippedFiles: string[] = [];
      const contentDir = new URL("content/", config.srcDir);

      function isInContentDir(file: string): boolean {
        const fileUrl = new URL(file, baseDir);
        return fileUrl.href.startsWith(contentDir.href);
      }

      const configFiles = new Set(
        ["config.js", "config.ts", "config.mjs"].map((file) => new URL(file, contentDir).href)
      );

      function isConfigFile(file: string): boolean {
        const fileUrl = new URL(file, baseDir);
        return configFiles.has(fileUrl.href);
      }

      // 处理所有文件
      await Promise.all(
        files.map((entry) => {
          if (isConfigFile(entry)) {
            return;
          }
          if (!config.legacy?.collections && isInContentDir(entry)) {
            skippedFiles.push(entry);
            return;
          }
          return limit(async () => {
            const entryType = configForFile(entry);
            await syncData(entry, baseDir, entryType);
          });
        })
      );

      // 处理跳过的文件警告
      const skipCount = skippedFiles.length;
      if (skipCount > 0) {
        const patternList = Array.isArray(options.pattern) 
          ? options.pattern.join(", ") 
          : options.pattern;
        logger.warn(
          `The enhanced glob() loader cannot be used for files in ${bold("src/content")} when legacy mode is enabled.`
        );
        if (skipCount > 10) {
          logger.warn(
            `Skipped ${green(String(skippedFiles.length))} files that matched ${green(patternList)}.`
          );
        } else {
          logger.warn(`Skipped the following files that matched ${green(patternList)}:`);
          skippedFiles.forEach((file) => logger.warn(`• ${green(file)}`));
        }
      }

      // 清理未触及的条目
      untouchedEntries.forEach((id) => store.delete(id));

      // 设置文件监听
      if (!watcher) {
        return;
      }

      watcher.add(filePath);

      const matchesGlob = (entry: string) => 
        !entry.startsWith("../") && picomatch.isMatch(entry, options.pattern);
      const basePath = fileURLToPath(baseDir);

      // 文件变化处理
      async function onChange(changedPath: string) {
        const entry = posixRelative(basePath, changedPath);
        if (!matchesGlob(entry)) {
          return;
        }
        const entryType = configForFile(changedPath);
        const baseUrl = pathToFileURL(basePath);
        const oldId = fileToIdMap.get(changedPath);
        await syncData(entry, baseUrl, entryType, oldId);
        logger.info(`Reloaded data from ${green(entry)}`);
      }

      watcher.on("change", onChange);
      watcher.on("add", onChange);
      watcher.on("unlink", async (deletedPath: string) => {
        const entry = posixRelative(basePath, deletedPath);
        if (!matchesGlob(entry)) {
          return;
        }
        const id = fileToIdMap.get(deletedPath);
        if (id) {
          store.delete(id);
          fileToIdMap.delete(deletedPath);
        }
      });
    }
  };
}