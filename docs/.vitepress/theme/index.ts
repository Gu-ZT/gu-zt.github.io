// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './style.css'
import { ShikiMagicMove } from 'shiki-magic-move/vue'
import 'shiki-magic-move/dist/style.css'
import MagicCode from './components/MagicCode.vue'
import PostList from './components/PostList.vue'

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(DefaultTheme.Layout, null, {
      // https://vitepress.dev/guide/extending-default-theme#layout-slots
    })
  },
  enhanceApp({ app, router, siteData }) {
    app.component('ShikiMagicMove', ShikiMagicMove)
    app.component('MagicCode', MagicCode)
    app.component('PostList', PostList)
  }
} satisfies Theme
