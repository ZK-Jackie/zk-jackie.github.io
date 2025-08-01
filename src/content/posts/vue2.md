---
title: "Vue2 基本使用及性能优化"
meta_title: "Vue2 基本使用、Vue2 性能优化"
description: "Vue2 初学笔记和熟练之后的性能优化方法记录，中间还有很多东西待补充..."
date: 2025-07-21
image: ""
authors: ["Jackie"]
categories: ["Web 开发"]
tags: ["前端", "Vue", "Vue2"]
---

## 一、Vue2 的基本介绍

vue是一个基于MVVM模型的前端js框架，是一个辅助JS开发的工具，重要特点是视图与数据的双向绑定特性，省略繁琐的js和html标签的反复绑定

### 1. v-指令

#### （1）v-bind动态绑定href属性

例如：

```html
<a href="..">
```

变成

```vue
<a v-bind:href="url">
```

若在某个input框中用v-model修改上述bind的url则可动态修改

注意：使用v-bind和v-model的变量一定要在数据模型中声明给初始值

#### （2）v-on绑定事件

例如：

```html
<input type="button" onclick="fun()">
```

变成

```vue
<input type="button" v-on:click="fun()">
<!-- func() 是一个 JS 函数 -->
```

#### （3）v-if等和v-show绑定组件加载条件

例如：已经在数据模型中定义了某变量，通过input框修改age的值

```html
<span v-if="age满足某些条件">正文</span>
```

当age满足条件，显示整个span

类似地，也有 v-show="条件"，但 v-show 是将不满足条件的整个模块进行隐藏，而不是完全不显示，即 v-show 利用 css 的 display: none 实现功能

#### （4）v-for遍历数组

例如：

```vue
<span v-for=(遍历出来的个体名，对应的下标数字) in 数组名>{{下标（从0开始）}} : {{遍历出来的个体（会自动换行）}}</span>
```

### 2. vue的生命周期

（1）beforeCreate
（2）created
（3）beforeMount
（4）**mounted**
（5）beforeUpdate
（6）updated
（7）beforeDestroy
（8）detroyed

mounted 与数据模型平级，代表 vue 挂载完成，此时可以创建 mounted 钩子方法，示意服务器可以开始发送数据了


## 二、vue2 的性能优化

vue 的性能优化，从访问的角度上看，主要是两大方面：首屏加载速度和页面切换速度；则主要有以下优化角度，分别为：nginx 部署方面、项目资源优化方面、代码结构方面（按需引用、懒加载等）、webpack 配置方面，下面将逐一进行详细分析并说明做法

### 1. 代码结构方面

#### （1）按需导入

由于 vue2 的 tree-shaking 机制和遵循的 es 规范较旧，则在“只导入有效代码“的思想上还较为落后，需要一些额外的插件和操作以实现按需导入。

vue2 中导入 ElementUI，推荐的做法只能是常用的组件 `在 main.js 中导入` 而少用的组件在文件中独立导入，以避免对同一组件的重复导入。

则我们可以优化 main.js 中的导入——

##### 步骤1：安装 [babel-plugin-component](https://github.com/QingWei-Li/babel-plugin-component)

```shell
npm install babel-plugin-component -D
```

> 注意，如果报错——
>
> Error: Cannot find module 'babel-plugin-import'
>
> 可能是有依赖包未安装，则可以先安装 qs axios，再次安装 babel-plugin-import 试试
>
> 参考：[Cannot find module 'babel-plugin-import'报错的解决方法-CSDN博客](https://blog.csdn.net/qq_43412333/article/details/104030464)

##### 步骤:2：修改 babel 配置

在 .babelrc 中修改 babel 配置  或  在 babel.config.js 中修改配置

```json
//.babelrc
{
  "presets": [["es2015", { "modules": false }]],
  "plugins": [
    [
      "component",
      {
        "libraryName": "element-ui",
        "styleLibraryName": "theme-chalk"
      }
    ]
  ]
}
```

```js
// babel.config.js
module.exports = {
  plugins: [
    [
      'import',
      {
        libraryName: 'element-ui',
        styleLibraryName: 'theme-chalk'
      }
    ]
  ]
}
```

##### 步骤3：调整 main.js

按需导入，如：

```js
import Vue from 'vue';
import { Button, Select } from 'element-ui';
import App from './App.vue';

Vue.component(Button.name, Button);
Vue.component(Select.name, Select);
/* 或写为
 * Vue.use(Button)
 * Vue.use(Select)
 */

new Vue({
  el: '#app',
  render: h => h(App)
});
```

> ```js
> // 如果不用插件，直接按需引入会将整个ElementUI打包
> import { Button } from 'element-ui';
> // 实际上相当于
> import ElementUI from 'element-ui';
> const { Button } = ElementUI;
> 
> 
> // 插件转换后只引入具体的模块
> import Button from 'element-ui/lib/button';
> import 'element-ui/lib/theme-chalk/button.css';
> ```



#### （2）路由懒加载

下面的写法已经是基于 Promise，实现了路由的懒加载，即需要访问页面时才下载对应的包：

```js
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/home/index.vue')
  }
]
```

但是我们可以通过加入 webpack 注释标记进一步控制 webpack 的分包逻辑，将相关的页面打包到同一个 chunk中 ：

```js
const routes = [
  {
    path: '/',
    name: 'home',
    component: () => import(/* webpackChunkName: "home" */ '../views/home/index.vue')
  },
  {
    path: '/auth',
    name: 'auth',
    component: () => import(/* webpackChunkName: "user" */ '../views/user/auth.vue')
  },
  {
    path: '/user',
    name: 'user',
    component: () => import(/* webpackChunkName: "user" */ '../views/user/profile')
  },
  {
    path: '/chat',
    name: 'chat',
    component: () => import(/* webpackChunkName: "features" */ '../views/room/index.vue')
  },
  {
    path: '/graph',
    name: 'graph',
    component: () => import(/* webpackChunkName: "features" */ '../views/graph/index.vue')
  }
]
```



#### （3）页面图片懒加载

在 img 标签中加上 loading="lazy" 属性



#### （4）vue 代码优化

- v-for 遍历避免同时使用 v-if
- 使用 v-for 跟上 id 属性
- 多用 v-show 增强性能



#### （5）script 标签属性优化

借助浏览器原生 script 标签的属性，也可以高效控制脚本的导入时机，常用的属性有——

##### 性能优化相关

- type="module"
    - 作用：启用ES6模块支持
    - 原理：浏览器原生支持import/export语法
    - 特点：自动defer，严格模式，独立作用域
- nomodule
    - 作用：为不支持ES模块的浏览器提供fallback
    - 原理：支持ES模块的浏览器会忽略nomodule脚本
    - 适用场景：渐进式增强策略
- async
    - 作用：异步加载，不阻塞HTML解析
    - 原理：浏览器并行下载脚本，下载完成后立即执行（可能打乱执行顺序）
    - 适用场景：独立的第三方脚本（如Google Analytics）
- defer
    - 作用：延迟执行，保持脚本顺序
    - 原理：并行下载，但等待HTML解析完成后按顺序执行
    - 适用场景：依赖DOM的脚本，你的ECharts就很适合

##### 安全相关

- crossorigin="anonymous/use-credentials"
    - 作用：控制跨域请求的凭据发送
    - 原理：
        - anonymous：不发送cookies/认证信息
        - use-credentials：发送cookies/认证信息 适用场景：CDN资源，配合integrity使用
- integrity="sha384-xxx"
    - 作用：验证资源完整性，防止被篡改
    - 原理：浏览器计算文件hash，与integrity值对比
    - 适用场景：所有外部CDN资源
- referrerpolicy
    - 作用：控制请求时发送的referrer信息
    - 原理：覆盖页面默认的referrer策略
    - 适用场景：隐私保护，防止信息泄露

##### 示例

对于 echarts 组件，最方便的实现即是在官网中下载压缩后的包，在public/index.html中使用 script 导入并加上 async 属性，即：

```html 
<script async src="<%= BASE_URL %>lib/echarts.min.js"></script>
```

随后持续检查下载情况、注册 echarts：

```js
// plugins/lazy-echarts.js
// 在 main.js 中 Vue.use 这个文件即可
export default {
  install(Vue) {
    Vue.prototype.$echarts = () => {
      if (window.echarts) {
        return Promise.resolve(window.echarts);
      }
      
      // 等待defer脚本加载完成
      return new Promise((resolve) => {
        const checkECharts = () => {
          if (window.echarts) {
            resolve(window.echarts);
          } else {
            setTimeout(checkECharts, 50);
          }
        };
        checkECharts();
      });
    };
  }
};
```

不过，Vue.prototype.\$echarts 或者说 this.\$echarts 就会变成一个 Promise 对象，使用时需要一定的特殊写法：

```js
this.$echarts().then(
    echarts => {
        this.chartDOM = echarts.init(document.getElementById('chart-item-map-' + this.id));
        this.loadChart(graph);	// 注意由于这个函数依赖this.chartDOM，那他需要一起放在then里面
    }
)
```





### 2. 项目资源优化方面

#### （1）字体资源

常见字体格式

**不推荐：**

- eot：IE系列专属字体方案
- ttf：兼容性好，但是字体文件较大
- svg：不是真的字体，存在很多兼容问题（IE古老浏览器）

**推荐：**

- woff：W3C标准，兼容性好
- woff2：W3C标准，但是不兼容IE

> 字体压缩网页工具：
>
> [压缩 TTF 字体，在线 TTF 到 WOFF2 压缩器 | YouCompress](https://www.youcompress.com/zh-cn/ttf/)

#### （2）图片资源

由于项目中图片用的比较多、打包后图片文件很大导致dist包体积很大，这时候想通过webpack插件去处理图片资源、从而瘦身dist包体积。

- url-loader

  > 这里踩过坑，详情请移步：[url-loader图片不显示、不报错踩坑 - 掘金 (juejin.cn)](https://juejin.cn/post/7209934991043412023)
  >
  > 用url-loader转换图片为base64（图片打包成字符串，放到js中），减少文件请求次数。

  **问题：**
  这种方式仅适合于比较小的图片资源，如果一个图片文件很大这样又会导致构建出的 `.js` 文件变大，导致加载缓慢。所以需要配合 `image-webpack-loader` 使用

- image-webpack-loader

  > 使用url-loader的 `limit` 字段控制指定大小图片才转base64（我这里也使用url-loader处理了字体文件） 然后使用 `image-webpack-loader` 来压缩超过limit阈值的大图片。这样就是小图片转base64、大图片压缩完还打包到指定路径中。



### 3. webpack 配置方面

#### （1）gzip压缩

安装 `compression-webpack-plugin` 后，在 webpack 中配置压缩

```js
module.exports = defineConfig({
    configureWebpack: {
        plugins: [
            // 添加 gzip 压缩
            new CompressionPlugin({
                test: /\.(js|css|html|svg|json)(\?.*)?$/i,
                threshold: 10240, // 超过 10kb 才压缩
                minRatio: 0.8, // 压缩比
                deleteOriginalAssets: false  // 保留原始文件
            })
        ],
    }
})
        
```

#### （2）移除 console.log / console.error

安装 `terser-webpack-plugin` 后（也可以不用安装，webpack5 自带），在webpack中配置移除：

```js
module.exports = defineConfig({
    configureWebpack: {
        optimization: {
            minimize: true,
            minimizer: [
                new TerserPlugin({
                    terserOptions: {
                        compress: {
                            drop_console: process.env.NODE_ENV === 'production',
                            drop_debugger: process.env.NODE_ENV === 'production',
                        },
                        output: {
                          comments: false // 移除注释
                        },
                        extractComments: false // 不提取注释文件
                    }
                }),
            ],
        }
    }
})
```

#### （3）不生成 .map 文件

```js
module.exports = defineConfig({
    // 生产环境关闭sourcemap以减小体积
    productionSourceMap: process.env.NODE_ENV !== 'production',
})
```

#### （4）CDN 导包

让某些库从 cdn 中下载，避免服务器传输，在一定程度上也可以加快APP加载速度，例如 vue、vuex、vue-router 都可以通过这种方式导入。主要有以下操作步骤：

- 步骤1：在 https://cdnjs.com/ 中搜索
- 步骤2：获得包的链接，如：https://cdnjs.cloudflare.com/ajax/libs/vue/2.7.16/vue.runtime.min.js
- 步骤3：使用国内加速，将 cdnjs.cloudflare.com 换成 mirrors.sustech.edu.cn/cdnjs
- 步骤4：在 public/index.html 中加入

```html
 <script src="https://mirrors.sustech.edu.cn/cdnjs/ajax/libs/vue/2.7.16/vue.min.js"></script>
```

- 步骤5：

```js
module.exports = defineConfig({
    // 生产环境关闭sourcemap以减小体积
    chainWebpack: config => {
        // 设置外部依赖
        config.externals({
            'vue': 'Vue'
        })
    }
})
```

> [CDNJS/UNPKG/JSDelivr 太慢用不了，换成这些国内高速镜像-阿里云开发者社区](https://developer.aliyun.com/article/1426614)



### 4. nginx 配置方面

#### （1）开启 gzip

##### 如果使用 http2

```nginx
server {
    listen 443 ssl http2;
    server_name your-domain.com;

    # SSL配置
    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Gzip配置（适配HTTP/2）
    gzip on;
    # 针对 web 前端静态文件，6 级是合适的平衡点
    gzip_comp_level 6;
    gzip_min_length 1024;
    gzip_buffers 16 8k;
    # 兼容
    gzip_http_version 1.1;
    
    # HTTP/2环境下推荐的gzip类型
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        application/x-javascript
        application/x-font-ttf
        application/vnd.ms-fontobject
        font/opentype
        image/svg+xml
        image/x-icon;

    gzip_proxied any;
    gzip_vary on;
    gzip_disable "msie6";

    # 静态资源gzip优化
    location ~* \.(css|js|woff|woff2|ttf|otf)$ {
        gzip_static on;
        expires 1y;
        add_header Cache-Control "public, immutable";
        add_header Vary Accept-Encoding;
    }

    # 前端应用配置
    location / {
        try_files $uri $uri/ /index.html;
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
    }
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```


```nginx
# 全局优化配置
http {
    # 启用文件缓存
    open_file_cache max=1000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    
    # 客户端缓冲区
    client_body_buffer_size 128k;
    client_max_body_size 50m;
    
    # Gzip配置
    gzip on;
    gzip_comp_level 6;
    gzip_min_length 1024;
    gzip_proxied any;
    gzip_vary on;
}
```



##### 如果使用 http1

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    # SSL配置
    ssl_certificate /path/to/your/cert.pem;
    ssl_certificate_key /path/to/your/private.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    ssl_prefer_server_ciphers off;

    # Gzip配置（HTTP/1.1标准配置）
    gzip on;
    gzip_comp_level 6;
    gzip_min_length 1024;
    gzip_buffers 32 4k;
    gzip_http_version 1.1;

    # 需要压缩的文件类型
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        application/json
        application/javascript
        application/xml+rss
        application/atom+xml
        application/x-javascript
        image/svg+xml;

    gzip_proxied any;
    gzip_vary on;
    gzip_disable "msie6";

    # 静态资源处理
    location ~* \.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2)$ {
        expires 1y;
        add_header Cache-Control "public";
        add_header Vary Accept-Encoding;
        access_log off;
    }

    # Spring Boot应用代理
    location /api/ {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Vue前端应用
    location / {
        try_files $uri $uri/ /index.html;
        add_header X-Frame-Options DENY;
        add_header X-Content-Type-Options nosniff;
    }
}

# HTTP重定向到HTTPS
server {
    listen 80;
    server_name your-domain.com;
    return 301 https://$server_name$request_uri;
}
```

```nginx
http {
    # 连接保持优化
    keepalive_timeout 65;
    keepalive_requests 100;

    # Gzip全局配置
    gzip on;
    gzip_comp_level 6;
    gzip_min_length 1024;
    gzip_buffers 32 4k;
    gzip_http_version 1.1;
    gzip_proxied any;
    gzip_vary on;

    # 针对MediSmart项目的文件类型
    gzip_types
        text/plain
        text/css
        text/xml
        text/javascript
        text/x-component
        application/json
        application/javascript
        application/x-javascript
        application/xml
        application/xml+rss
        application/atom+xml
        image/svg+xml;

    # 客户端缓冲区优化
    client_body_buffer_size 128k;
    client_header_buffer_size 1k;
    large_client_header_buffers 4 4k;
}
```

经过以上操作，白屏时间基本能够缩短85%~95%，由最开始的20s缩减到2~3s；



### 5. 其他

#### （1）虚拟滚动技术

页面滑动到某个位置才开始渲染相应的 DOM

> [Vue2 项目中一定要会的性能优化措施为什么在 2023 年了还提 Vue2 项目的性能优化？ Vue CLI 帮我们很 - 掘金](https://juejin.cn/post/7226387497566257212#heading-18)



