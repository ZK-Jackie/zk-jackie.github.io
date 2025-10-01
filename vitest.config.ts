import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',      // 浏览器环境模拟
    include: ['**/*.test.ts'], // 测试文件匹配规则
    testTimeout: 100000,     // 单个测试超时时间
  },
});