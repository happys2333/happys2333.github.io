# 站点维护说明

## 页面与内容

- `source/index.html`：个人主页；只展示 AI Ladder、DataMiningFinal 以及 Deskflow、CC Switch、Gitea 的指定贡献。
- `source/assets/site.css`、`site.js`：首页样式与主题切换。内容和导航不依赖 JavaScript、外部字体或运行时 API。
- `scripts/site-polish.js`：通过 Hexo Injector 为 Icarus 博客添加共享样式和主题开关，不修改依赖包。
- `source/about/index.md`：关于页；保留此前的个人表达，不将其放到职业展示首页。
- `source/_posts/{zh-CN,en}`：中英文笔记；原始日期与路径保留，补写使用 `updated` 字段。
- `/blog/`：原博客文章列表；`/archives/`、`/categories/`、`/tags/` 保留浏览入口。

## 本地开发

使用 Node.js 22，执行 `npm ci`、`npm run server`。发布前执行：

```bash
npm run clean
npm run build
node tools/check-site.cjs
```

GitHub Actions 对 PR 只构建和检查；仅 main 的推送或手动运行发布到现有 gh-pages 分支。不再调用未安装的 Algolia 插件，继续使用 Icarus 的本地 Insight 搜索。

## 维护原则

不要为了调整标题而随意改文章日期、目录或 slug。修改项目范围时同步首页与关于页。PR 状态以原仓库为准，不能把已提交写成已合并。演示代码与真实实验结果明确区分，不补造性能数据、获奖或任职经历。

新增标签或分类后，可更新索引页。公开 Issue 不应包含凭据和个人敏感信息。

## 本次验证范围

首页在本地 Chromium 中渲染，检查了 320 / 360 / 390 / 768 / 1024 / 1440 像素视口、横向溢出与深浅色切换。离线预览不等同于 Hexo 完整构建；完整产物检查由 GitHub Actions 的 `check-site.cjs` 执行。最终发布状态以 Actions 与 GitHub Pages 的实际记录为准。
