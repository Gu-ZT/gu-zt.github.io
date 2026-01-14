// https://vitepress.dev/guide/custom-theme
import { h } from 'vue'
import type { Theme } from 'vitepress'
import DefaultTheme from 'vitepress/theme'
import './style.css'
import { ShikiMagicMove } from 'shiki-magic-move/vue'
import 'shiki-magic-move/dist/style.css'
import MagicCode from './components/MagicCode.vue'
import PostList from './components/PostList.vue'
import CustomLayout from './theme/CustomLayout.vue'

export default {
  extends: DefaultTheme,
  Layout: CustomLayout,
  enhanceApp({ app, router, siteData }) {
    app.component('ShikiMagicMove', ShikiMagicMove)
    app.component('MagicCode', MagicCode)
    app.component('PostList', PostList)
  }
} satisfies Theme
