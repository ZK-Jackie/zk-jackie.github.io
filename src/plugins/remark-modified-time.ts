import {execSync} from "child_process";


export function remarkCreateTime() {
  return function (tree: any, file: any) {
    const filepath = file.history[0];
    let created = "";
    try {
      // ISO 8601 格式时间字符串，默认为当地时区
      const out = execSync(
        `git log --follow --diff-filter=A --pretty="format:%cI" -- "${filepath}"`
      )
        .toString()
        .trim();
      if (out) {
        const lines = out.split(/\r?\n/);
        // 取最早的添加提交时间（最后一行）
        created = lines[lines.length - 1];
      }
    } catch {
      // ignore
    }
    file.data.astro.frontmatter.publishTime =
      created || new Date().toISOString();
  };
}

export function remarkModifiedTime() {
  return function (tree: any, file: any) {
    const filepath = file.history[0];
    const result = execSync(`git log -1 --pretty="format:%cI" "${filepath}"`);
    file.data.astro.frontmatter.modifiedTime = result.toString();
  };
}