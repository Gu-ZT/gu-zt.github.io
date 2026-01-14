<script setup>
import DefaultTheme, {useLayout} from 'vitepress/theme';

const {Layout} = DefaultTheme;
const {hasSidebar} = useLayout();
</script>

<template>
  <Layout>
    <template #layout-bottom v-if="!hasSidebar">
      <div class="custom-footer">
        <p>Released under the CC BY-NC-SA 4.0 License.</p>
        <p>Copyright © 2025-present Gugle</p>
        陕ICP备2024046977号 |
        <img style="width: 16px;display: inline-block" src="https://beian.mps.gov.cn/web/assets/logo01.6189a29f.png"
             class="w-full" alt="">
        <a href="https://beian.mps.gov.cn/#/query/webSearch?code=61072402000171" rel="noreferrer" target="_blank">
          陕公网安备61072402000171号
        </a>
      </div>
    </template>
  </Layout>
</template>

<style scoped>
.custom-footer {
  display: block;
  background-color: var(--vp-c-bg);
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  padding: 32px 24px;
  color: var(--vp-c-text-2);
  line-height: 24px;
  border-top: 0.8px solid var(--vp-c-gutter);
}
</style>