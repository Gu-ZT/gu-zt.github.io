// .vitepress/theme/posts.data.ts
import { createContentLoader } from 'vitepress'

interface Post {
    title: string
    url: string
    date: string
}

declare const data: Post[]
export { data }

export default createContentLoader('posts/**/*.md', {
    transform(raw): Post[] {
        return raw
            .filter((data)=> !data.url.endsWith('/'))
            .map(({ url, frontmatter }) => ({
                title: frontmatter.title,
                url,
                date: formatDate(frontmatter.date)
            }))
            .sort((a, b) => +new Date(b.date) - +new Date(a.date)) // 按时间排序
    }
})

function formatDate(raw: string): string {
    const date = new Date(raw)
    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    })
}
