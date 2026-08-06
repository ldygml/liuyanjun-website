# 个人网站

一个简约风格、带动态动画的静态个人主页，使用纯 HTML / CSS / JavaScript 编写，无需安装任何依赖或构建工具。

## 本地预览

双击 `index.html` 即可在浏览器中打开。也可以启动一个本地静态服务器：

```bash
python -m http.server 8000
```

然后访问 http://localhost:8000 。

## 目录结构

```text
个人网站/
├── index.html      # 页面结构与内容
├── css/style.css   # 样式（配色等变量在文件顶部 :root 中）
├── js/content.js   # ★ 网站内容配置：想改文字就改这个文件
├── js/main.js      # 交互脚本（打字机、粒子、滚动动画等）
├── assets/         # 存放头像、作品截图等图片
├── avatars/        # 存放头像照片（avatar.jpg）
└── README.md
```

## 修改网站内容（重点）

网站上的**所有文字**（名字、简介、技能、作品、文章、联系方式）都集中在
`js/content.js` 这一个文件里，每段都有中文注释说明。修改后保存、刷新页面即可，
不需要动其他文件。

## 如何改成你自己的网站

1. **名字与简介**：编辑 `js/content.js` 顶部的 `name`、`tagline`、`about` 部分。
2. **头像**：直接用新照片覆盖 `avatars/avatar.jpg`（保持文件名）即可更新头像。
3. **技能**：编辑 `js/content.js` 里的 `skills`（百分比填 0-100）和 `tools` 标签。
4. **个人作品**：编辑 `js/content.js` 里的 `works` 与 `workCategories`（编程/音乐/视频/图片分类），添加或修改作品卡片。
5. **文章**：编辑 `js/content.js` 里的 `posts`。
6. **联系方式**：编辑 `js/content.js` 里的 `contact`。
7. **经历 / 兴趣 / 相册**：分别编辑 `js/content.js` 里的 `journey`、`interests`、`gallery`。
8. **相册照片**：把照片放进 `assets/gallery/`，再在 `gallery` 里填上路径（如 `assets/gallery/01.jpg`）。
9. **配色与字体**：在 `css/style.css` 顶部的 `:root` 中调整 `--accent` 等变量即可整体换肤。

## 部署到线上（购买域名后）

本网站是纯静态文件，任何静态托管平台都可以承载：

- **Vercel**：注册后导入该文件夹，选择静态站点部署，然后在项目设置中添加自定义域名（按提示配置 DNS）。
- **Netlify**：直接把整个文件夹拖拽到 Netlify 后台即可上线，再添加自定义域名。
- **GitHub Pages**：推到仓库后开启 Pages 功能，在设置中绑定你的域名。

购买域名后，到域名服务商的控制台，把域名解析到托管平台提供的地址（一般是添加一条 CNAME 或 A 记录），等解析生效即可用域名访问。

## 更新线上内容（重要）

网站已部署到 GitHub Pages（https://ldygml.github.io/liuyanjun-website/）。

1. 打开 `admin.html` 后台管理页面修改内容，点“保存到网站”（写入本地 `js/content.js`）。
2. 双击 `更新线上.bat` 一键发布：脚本会自动把本地网站文件同步到线上仓库并推送。
3. 等待约 1 分钟，GitHub Pages 自动构建完成，刷新线上页面即可看到更新。

注意：`admin.html` 和 `更新线上.bat` 只在你本地使用，不会上传到线上。


<!-- deploy heartbeat 2026-08-06T14:00Z -->
