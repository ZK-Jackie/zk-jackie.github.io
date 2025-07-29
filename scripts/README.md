# 构建后优化脚本

这个脚本用于在 Astro 构建完成后进一步优化生成的静态文件，提高网站加载性能。

## 功能特性

### 🚀 JavaScript 优化
- **代码压缩**: 使用 Terser 进行高级压缩
- **去除调试代码**: 自动移除 `console.log`、`console.info`、`console.debug` 和 `debugger` 语句
- **变量名混淆**: 缩短变量名以减少文件大小
- **去除注释**: 清理所有注释内容

### 📄 HTML 优化
- **空白符压缩**: 去除多余的空格、换行符和制表符
- **去除注释**: 清理 HTML 注释
- **属性优化**: 移除冗余属性、排序属性和类名
- **内联 JS/CSS 压缩**: 压缩 HTML 中的内联脚本和样式
- **使用短 DOCTYPE**: 优化文档类型声明

### 🧹 清理功能
- **临时文件清理**: 自动删除 source maps、系统临时文件
- **详细日志**: 显示每个文件的压缩前后大小对比
- **统计报告**: 提供详细的优化效果统计

## 使用方法

### 方法一：集成到构建流程（推荐）
```bash
npm run build
```
这将自动执行 `astro build` 后运行优化脚本。

### 方法二：单独运行
```bash
# 先构建项目
npm run build:original

# 然后运行优化
node scripts/postbuild.js
```

## 配置选项

可以通过修改 `scripts/postbuild.js` 来调整优化选项：

### JavaScript 优化配置
```javascript
const result = await minify(code, {
  format: {
    comments: false,  // 是否保留注释
  },
  compress: {
    drop_console: true,     // 移除 console 语句
    drop_debugger: true,    // 移除 debugger 语句
    pure_funcs: [...],      // 要移除的函数调用
  },
  mangle: true,  // 变量名混淆
})
```

### HTML 优化配置
```javascript
const result = await htmlMinifier.minify(html, {
  removeComments: true,              // 移除注释
  collapseWhitespace: true,          // 压缩空白符
  removeRedundantAttributes: true,   // 移除冗余属性
  minifyJS: true,                    // 压缩内联 JS
  minifyCSS: true,                   // 压缩内联 CSS
  // ... 更多选项
})
```

## 性能影响

### 典型优化效果
- **JavaScript**: 通常可以节省 3-8% 的文件大小
- **HTML**: 通常可以节省 5-15% 的文件大小
- **总体**: 根据项目复杂度，通常能节省数 KB 到数十 KB

### 构建时间
- **增加构建时间**: 通常增加 5-15 秒（取决于文件数量）
- **首次加载速度**: 显著提升用户首次访问速度
- **缓存效率**: 更小的文件大小提高缓存效率

## 注意事项

1. **源码调试**: 压缩后的代码难以调试，建议在开发环境使用 `npm run build:dev`
2. **兼容性**: 脚本使用 ES 模块语法，确保 Node.js 版本 >= 14
3. **错误处理**: 如果优化过程中出现错误，脚本会自动退出并显示错误信息
4. **备份**: 首次使用建议备份 `dist` 目录

## 扩展功能

### 添加图片优化
可以集成图片压缩库（如 `imagemin`）来进一步优化图片文件：

```javascript
// 示例：添加图片优化
import imagemin from 'imagemin'
import imageminPngquant from 'imagemin-pngquant'
import imageminMozjpeg from 'imagemin-mozjpeg'

// 在 optimizeDist 函数中添加
const imageFiles = await findFiles(distPath, ['.png', '.jpg', '.jpeg'])
await imagemin(imageFiles, distPath, {
  plugins: [
    imageminPngquant({ quality: [0.6, 0.8] }),
    imageminMozjpeg({ quality: 80 })
  ]
})
```

### 添加 Gzip 预压缩
为支持 Gzip 的服务器预生成压缩文件：

```javascript
import { gzipSync } from 'zlib'

// 为 HTML、CSS、JS 文件生成 .gz 版本
const filesToCompress = [...htmlFiles, ...jsFiles, ...cssFiles]
for (const file of filesToCompress) {
  const content = fs.readFileSync(file)
  const compressed = gzipSync(content)
  fs.writeFileSync(file + '.gz', compressed)
}
```

## 故障排除

### 常见问题

1. **"require is not defined" 错误**
   - 确保项目 `package.json` 中有 `"type": "module"`
   - 或将脚本重命名为 `.cjs` 扩展名

2. **文件未找到错误**
   - 确保先运行 `astro build` 生成 `dist` 目录
   - 检查 `dist` 目录路径是否正确

3. **压缩效果不明显**
   - Astro 已经进行了基础优化
   - 主要优化体现在去除调试代码和进一步压缩上

## 更新日志

- **v1.1.0**: 增加详细日志输出和统计报告
- **v1.0.0**: 基础 HTML 和 JavaScript 压缩功能
