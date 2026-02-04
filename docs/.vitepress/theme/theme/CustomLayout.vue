<script setup>
import DefaultTheme, {useLayout} from 'vitepress/theme';
import {onMounted, ref} from 'vue';

const {Layout} = DefaultTheme;
const {hasSidebar} = useLayout();
const showRecordNum = ref(false);

function getBaseUrl(str) {
  return str.split('/').slice(2, 3).join('/');
}

onMounted(() => {
  const baseUrl = getBaseUrl(window.location.href);
  if (baseUrl.includes('ztxy666.cn') || baseUrl.includes('localhost')) {
    showRecordNum.value = true;
  }
});
</script>

<template>
  <Layout>
    <template #layout-bottom v-if="!hasSidebar">
      <div class="custom-footer">
        <p>Released under the CC BY-NC-SA 4.0 License.</p>
        <p>Copyright © 2025-present Gugle</p>
        <div v-if="showRecordNum">
          <p class="record-num">
            陕ICP备2024046977号
          </p>
          <p class="record-num record-num-split">
            |
          </p>
          <p class="record-num">
            <img style="width: 16px;display: inline-block" src="https://beian.mps.gov.cn/web/assets/logo01.6189a29f.png"
                 class="w-full" alt="">
            <a href="https://beian.mps.gov.cn/#/query/webSearch?code=61072402000171" rel="noreferrer" target="_blank">
              陕公网安备61072402000171号
            </a>
          </p>
        </div>
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

.record-num {
  display: inline-block;
}

.record-num-split {
  margin: 0 5px;
}

@media (max-width: 640px) {
  .record-num {
    display: block;
  }

  .record-num-split {
    display: none;
  }
}
</style>