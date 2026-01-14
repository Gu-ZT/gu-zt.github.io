import {defineConfig} from 'vitepress'
// @ts-ignore
import fs from 'node:fs'
// @ts-ignore
import path from 'node:path'
// @ts-ignore
import matter from 'gray-matter'

// 配置根目录
const postsPath = path.resolve(__dirname, '../posts')

/**
 * 获取 Markdown 文件的标题
 * 优先级：Frontmatter title > 一级标题 (# Title) > 文件名
 */
function getFileTitle(filePath: string) {
    try {
        const content = fs.readFileSync(filePath, 'utf-8')
        const {data} = matter(content)
        if (data.title) return data.title

        const h1Match = content.match(/^#\s+(.*)/m)
        if (h1Match) return h1Match[1].trim()

        return path.basename(filePath, '.md')
    } catch (e) {
        return path.basename(filePath, '.md')
    }
}

/**
 * 自动生成导航和侧边栏
 */
function getAutoConfig() {
    const nav: any[] = [{text: '首页', link: '/'}]
    const sidebar: any = {}

    // 读取 posts 目录下的所有第一级子目录
    if (!fs.existsSync(postsPath)) return {nav, sidebar}

    const categories = fs.readdirSync(postsPath).filter(f =>
        fs.statSync(path.join(postsPath, f)).isDirectory()
    )

    categories.forEach((cat: any) => {
        const catPath = path.join(postsPath, cat)
        const indexPath = path.join(catPath, 'index.md')

        // 1. 生成 Nav: 获取该分类 index.md 的标题
        const catTitle = fs.existsSync(indexPath) ? getFileTitle(indexPath) : cat
        nav.push({
            text: catTitle,
            link: `/posts/${cat}/index`
        })

        // 2. 生成 Sidebar: 扫描该目录下所有 md
        const items = fs.readdirSync(catPath)
            .filter((f: string) => f.endsWith('.md'))
            .map((f: string) => {
                return {
                    text: getFileTitle(path.join(catPath, f)),
                    link: `/posts/${cat}/${f.replace('.md', '')}`
                }
            })
            // 让 index.md 始终在最前面
            .sort((a: { link: string }) => (a.link.endsWith('index') ? -1 : 1))

        sidebar[`/posts/${cat}/`] = [
            {
                text: catTitle, // 侧边栏大标题使用该分类的 index.md 标题
                items: items
            }
        ]
    })

    return {nav, sidebar}
}

const {nav, sidebar} = getAutoConfig()

const copyright = `
Copyright © 2025-present Gugle
</p>
陕ICP备2024046977号 | 
<img style="width: 16px;display: inline-block" src="https://beian.mps.gov.cn/web/assets/logo01.6189a29f.png" class="w-full" alt="">
<a href="https://beian.mps.gov.cn/#/query/webSearch?code=61072402000171" rel="noreferrer" target="_blank">
陕公网安备61072402000171号
</a>
`

export default defineConfig({
    title: "Gugle's Blog",
    description: "古镇天的个人博客",
    lastUpdated: true,
    head: [['link', {rel: 'icon', href: '/favicon.ico'}]],
    themeConfig: {
        nav,
        sidebar,
        socialLinks: [
            {icon: 'github', link: 'https://github.com/Gu-ZT'}
        ],
        footer: {
            message: 'Released under the CC BY-NC-SA 4.0 License.',
            copyright
        }
    }
})