# SOP

## 新增文章

1. 在 `_posts/` 新建 `YYYY-MM-DD-英文标题.md`。
2. 在文件开头填写 `layout`、`title`、`date`、`category`、`excerpt` 和 `reading_time`。
3. 使用 Markdown 撰写正文。
4. 提交并推送到 GitHub，GitHub Pages 会自动更新站点。

## 本地验证

本机有 Ruby/Jekyll 环境时，执行 `bundle exec jekyll serve` 后打开本地地址检查页面。

没有 Ruby 环境时，可启动任意静态 HTTP 服务进行 HTML/CSS/JS 交互验收；Liquid 模板渲染请以 GitHub Pages 构建结果为准。
