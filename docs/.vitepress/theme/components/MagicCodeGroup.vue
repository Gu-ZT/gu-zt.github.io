<script setup>
import {computed, onMounted, ref} from 'vue';
import {createHighlighter} from 'shiki';
import {ShikiMagicMove} from 'shiki-magic-move/vue';

const props = defineProps({
  filesData: String, // 接收来自 Markdown-it 的编码字符串
});

// 解码数据
const files = computed(() => {
  if (!props.filesData) return [];
  return JSON.parse(decodeURIComponent(props.filesData));
});

const activeIndex = ref(0);
const highlighter = ref(null);

onMounted(async () => {
  if (files.value.length === 0) return;

  const langs = [...new Set(files.value.map(f => f.lang || 'ts'))];
  highlighter.value = await createHighlighter({
    themes: ['github-dark'],
    langs: langs
  });
});


</script>

<template>
  <div class="vp-code-group">
    <div class="tabs">
      <div v-for="(file, index) in files">
        <input type="radio" :name="`group-${files.length}`" :id="`tab-${index}`" :checked="activeIndex === index">
        <label
            :id="`tab-${index}`"
            :data-title="file.name"
            @click="activeIndex = index"
        >
          {{ file.name }}
        </label>
      </div>
    </div>

    <div class="magic-code-blocks">
      <ShikiMagicMove
          v-if="highlighter"
          :highlighter="highlighter"
          theme="github-dark"
          :lang="files[activeIndex].lang"
          :code="files[activeIndex].code"
          :options="{ duration: 600, containerStyle:false}"
      />
    </div>
  </div>
</template>

<style scoped>
.magic-code-blocks {
  background-color: var(--vp-code-block-bg);
  font-family: monospace var(--vp-font-family-mono);
  padding: 20px;
  border-radius: 4px;
  font-size: 14px;
}
</style>
