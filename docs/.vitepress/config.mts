import {defineConfig} from 'vitepress'
// @ts-ignore
import container from 'markdown-it-container'
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
        ]
    },
    markdown: {
        lineNumbers: true,
        config: (md) => {
            md.use(container, 'magic-code-group', {
                render(tokens: any[], idx: number, options: any) {
                    console.log(options)
                    console.log(tokens)
                    if (tokens[idx].nesting === 1) {
                        const endIdx = tokens.slice(idx).findIndex(t => t.type === 'container_magic-code-group_close') + idx
                        const codeBlocks = []

                        for (let i = idx + 1; i < endIdx; i++) {
                            if (tokens[i].type === 'fence') {
                                const token = tokens[i]
                                const info = token.info.trim()

                                // 1. 提取语言
                                const lang = info.split(/\s+/)[0].split(':')[0]

                                // 2. 提取名称 [filename]
                                const nameMatch = info.match(/\[(.*)\]/)
                                const name = nameMatch ? nameMatch[1] : (lang || 'code')

                                // 3. 提取行号配置
                                // 逻辑：如果有 :line-numbers 或全局配置开启，则为 true。如果有 :no-line-numbers 则为 false。
                                const hasLineNumbers = info.includes(':line-numbers')
                                const noLineNumbers = info.includes(':no-line-numbers')
                                const lineStartMatch = info.match(/:line-numbers=(\d+)/)

                                const lineStart = lineStartMatch ? parseInt(lineStartMatch[1]) : 1

                                codeBlocks.push({
                                    name,
                                    lang,
                                    code: token.content,
                                    lineNumbers: (options.lineNumbers || hasLineNumbers) && !noLineNumbers,
                                    lineStart: lineStart
                                })

                                tokens[i].type = 'html_block'
                                tokens[i].content = ''
                            }
                        }

                        const jsonStr = JSON.stringify(codeBlocks)
                        const base64Data = Buffer.from(jsonStr).toString('hex')
                        console.log(base64Data)
                        return `<MagicCodeGroup files-data="${base64Data}">`
                    } else {
                        return '</MagicCodeGroup>'
                    }
                }
            })
        }
    }
})