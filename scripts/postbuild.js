import fs from 'fs'
import path from 'path'
import { minify } from 'terser'
import htmlMinifier from 'html-minifier-terser'

async function optimizeDist() {
  const distPath = path.join(process.cwd(), 'dist')

  console.log('🚀 开始构建后优化...')
  console.log(`📁 目标目录: ${distPath}`)

  try {
    // 1. 压缩 JS 文件
    console.log('⚡️ 正在压缩 JavaScript 文件...')
    const jsFiles = await findFiles(distPath, '.js', (absPath) => {
      return !absPath.includes(`${path.sep}lib${path.sep}`)
    })
    console.log(`📄 找到 ${jsFiles.length} 个 JS 文件`)
    
    let jsOriginalSize = 0
    let jsCompressedSize = 0
    
    for (const file of jsFiles) {
      const code = fs.readFileSync(file, 'utf8')
      jsOriginalSize += code.length
      
      const result = await minify(code, {
        format: {
          comments: false,
        },
        compress: {
          drop_console: true, // 移除 console.log
          drop_debugger: true, // 移除 debugger
          pure_funcs: ['console.log', 'console.info', 'console.debug'], // 移除特定函数调用
        },
        mangle: true, // 变量名混淆
      })
      
      if (result.code) {
        fs.writeFileSync(file, result.code)
        jsCompressedSize += result.code.length
        console.log(`  ✅ ${path.relative(distPath, file)} - ${formatBytes(code.length)} → ${formatBytes(result.code.length)}`)
      }
    }

    // 2. 压缩 HTML 文件
    console.log('📄 正在压缩 HTML 文件...')
    const htmlFiles = await findFiles(distPath, '.html')
    console.log(`📄 找到 ${htmlFiles.length} 个 HTML 文件`)
    
    let htmlOriginalSize = 0
    let htmlCompressedSize = 0
    
    for (const file of htmlFiles) {
      const html = fs.readFileSync(file, 'utf8')
      htmlOriginalSize += html.length
      
      const result = await htmlMinifier.minify(html, {
        removeComments: true,                 // 移除注释
        collapseWhitespace: true,             // 合并空白
        removeRedundantAttributes: true,      // 移除冗余属性
        removeScriptTypeAttributes: true,     // 移除 script 标签的默认 type 属性
        removeStyleLinkTypeAttributes: true,  // 移除 style 和 link 标签的默认 type 属性
        minifyJS: true,                   // 压缩 JS
        minifyCSS: true,                  // 压缩 CSS
        useShortDoctype: true,            // 使用短 doctype
        removeEmptyAttributes: true,      // 移除空属性
        sortAttributes: true,             // 属性排序
        sortClassName: true,              // 类名排序
      })
      
      fs.writeFileSync(file, result)
      htmlCompressedSize += result.length
      console.log(`  ✅ ${path.relative(distPath, file)} - ${formatBytes(html.length)} → ${formatBytes(result.length)}`)
    }

    // 3. 压缩 CSS 文件（如果有的话）
    console.log('🎨 正在检查 CSS 文件...')
    const cssFiles = await findFiles(distPath, '.css')
    console.log(`📄 找到 ${cssFiles.length} 个 CSS 文件`)
    
    if (cssFiles.length > 0) {
      console.log('ℹ️  CSS 文件通常已被 Astro 优化，跳过额外处理')
    }

    // 4. 清理可能的临时文件
    console.log('🧹 清理临时文件...')
    const tempPatterns = [
      '**/*.map', // source maps
      '**/.DS_Store', // macOS 文件
      '**/Thumbs.db', // Windows 文件
    ]
    
    for (const pattern of tempPatterns) {
      try {
        const tempFiles = await findFiles(distPath, pattern.replace('**/*', ''))
        for (const file of tempFiles) {
          fs.unlinkSync(file)
          console.log(`  🗑️ 已删除: ${path.relative(distPath, file)}`)
        }
      } catch (err) {
        // 忽略找不到文件的错误
      }
    }

    // 5. 显示优化结果统计
    console.log('\n📊 优化结果统计:')
    if (jsFiles.length > 0) {
      const jsSavings = jsOriginalSize - jsCompressedSize
      const jsPercent = ((jsSavings / jsOriginalSize) * 100).toFixed(1)
      console.log(`  📦 JavaScript: ${formatBytes(jsOriginalSize)} → ${formatBytes(jsCompressedSize)} (节省 ${formatBytes(jsSavings)}, ${jsPercent}%)`)
    }
    
    if (htmlFiles.length > 0) {
      const htmlSavings = htmlOriginalSize - htmlCompressedSize
      const htmlPercent = ((htmlSavings / htmlOriginalSize) * 100).toFixed(1)
      console.log(`  📄 HTML: ${formatBytes(htmlOriginalSize)} → ${formatBytes(htmlCompressedSize)} (节省 ${formatBytes(htmlSavings)}, ${htmlPercent}%)`)
    }
    
    const totalOriginal = jsOriginalSize + htmlOriginalSize
    const totalCompressed = jsCompressedSize + htmlCompressedSize
    const totalSavings = totalOriginal - totalCompressed
    const totalPercent = totalOriginal > 0 ? ((totalSavings / totalOriginal) * 100).toFixed(1) : '0'
    
    console.log(`  🎯 总计: ${formatBytes(totalOriginal)} → ${formatBytes(totalCompressed)} (节省 ${formatBytes(totalSavings)}, ${totalPercent}%)`)
    console.log('\n✨ 构建后优化完成!')
    
  } catch (error) {
    console.error('❌ 优化过程中出现错误:', error.message)
    process.exit(1)
  }
}

async function findFiles(dir, ext, filter=null) {
  let results = []
  
  try {
    const list = fs.readdirSync(dir)

    for (const file of list) {
      const fullPath = path.join(dir, file)
      const stat = fs.statSync(fullPath)

      if (stat && stat.isDirectory()) {
        results = results.concat(await findFiles(fullPath, ext, filter))
      } else if (file.endsWith(ext) && (!filter || filter(fullPath))) {
        results.push(fullPath)
      }
    }
  } catch (error) {
    console.warn(`⚠️ 无法读取目录 ${dir}:`, error.message)
  }

  return results
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

optimizeDist().catch(console.error)