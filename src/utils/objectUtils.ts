/**
 * 深度合并两个对象
 * @param target 目标对象
 * @param source 源对象
 * @returns 合并后的新对象
 */
export function deepMerge<T extends Record<string, any>>(target: T, source: DeepPartial<T>): T {
  const result = {...target};

  for (const key in source) {
    if (source[key] !== undefined) {
      if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
        // 递归合并对象
        result[key] = deepMerge(result[key] || {} as any, source[key] as any);
      } else {
        // 直接覆盖基本类型和数组
        (result as any)[key] = source[key];
      }
    }
  }

  return result;
}