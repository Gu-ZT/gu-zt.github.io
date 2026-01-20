<script setup>
import {computed, onMounted, ref} from 'vue';
import {createHighlighter} from 'shiki';
import {ShikiMagicMove} from 'shiki-magic-move/vue';
import {useData} from 'vitepress';

const props = defineProps({
  filesData: String
});

const {isDark} = useData();

function decodeHex(hex) {
  if (!hex) return '';
  try {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substr(i, 2), 16);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    console.error('Hex decode error:', e);
    return '';
  }
}

const files = computed(() => {
  if (!props.filesData) return [];
  const decode = decodeHex(props.filesData);
  if (!decode) return [];
  try {
    return JSON.parse(decode);
  } catch (e) {
    console.error('Failed to parse files-data:', e);
    return [];
  }
});

const activeIndex = ref(0);
const highlighter = ref(null);

const currentTheme = computed(() => isDark.value ? 'github-dark' : 'github-light');

const lineNumbers = computed(() => {
  const currentFile = files.value[activeIndex.value];
  if (!currentFile || !currentFile.lineNumbers) return [];

  const linesCount = currentFile.code.trimEnd().split('\n').length;
  const start = currentFile.lineStart || 1;

  return Array.from({length: linesCount}, (_, i) => i + start);
});

onMounted(async () => {
  if (files.value.length === 0) return;

  const langs = [...new Set(files.value.map(f => f.lang || 'ts'))];
  highlighter.value = await createHighlighter({
    themes: ['github-dark', 'github-light'],
    langs: langs
  });
});

const copied = ref(false);

function copyCode() {
  navigator.clipboard.writeText(files.value[activeIndex.value].code);
  copied.value = true;
  setTimeout(() => {
    copied.value = false;
  }, 2000);
}
</script>

<template>
  <div class="vp-code-group VPDoc magic-code-group">
    <div class="tabs">
      <template v-for="(file, index) in files" :key="index">
        <input type="radio" :name="`group-${filesData.length}`" :id="`tab-${index}`" :checked="activeIndex === index">
        <label @click="activeIndex = index">{{ file.name }}</label>
      </template>
    </div>

    <div :class="{'magic-code-blocks':true, 'has-line-numbers': lineNumbers.length > 0 }">
      <span class="lang">{{ files[activeIndex].lang }}</span>
      <button title="Copy Code" :class="{'copy':true, 'copied': copied}" @click="copyCode"/>
      <div v-if="lineNumbers.length > 0" class="magic-line-numbers-wrapper">
        <template v-for="num in lineNumbers" :key="num">
          <span class="line-number">{{ num }}</span>
          <br>
        </template>
      </div>
      <ShikiMagicMove
          :class="{'shiki-magic-move-container':true, 'has-line-numbers': lineNumbers.length > 0 }"
          v-if="highlighter"
          :highlighter="highlighter"
          :theme="currentTheme"
          :lang="files[activeIndex].lang"
          :code="files[activeIndex].code.trimEnd()"
          :options="{ duration: 600, containerStyle: false }"
      />
    </div>
  </div>
</template>

<style scoped>
.magic-code-group {
  position: relative;
}

.magic-code-blocks {
  display: block;
  position: relative;
  width: 100%;
  background-color: var(--vp-code-block-bg);
  border-radius: 8px;
}

.magic-line-numbers-wrapper {
  display: block;
  padding-top: 20px;
  padding-bottom: 20px;
  text-align: center;
  border-right: 1px solid var(--vp-code-block-divider-color);;
  color: var(--vp-code-line-number-color);
  font-size: var(--vp-code-font-size);
  font-family: var(--vp-font-family-mono), serif;
  line-height: var(--vp-code-line-height);
  position: absolute;
  width: 32px;
}

:deep(.shiki-magic-move-container) {
  display: block;
  margin: 0;
  padding: 20px 24px 20px 24px;
  background: transparent !important;
  transition: padding 600ms;
  font-size: var(--vp-code-font-size);
  font-family: var(--vp-font-family-mono), serif;
  line-height: var(--vp-code-line-height);
}

:deep(.shiki-magic-move-container.has-line-numbers) {
  padding-left: 60px;
}

span.lang {
  position: absolute;
  top: 2px;
  right: 8px;
  z-index: 2;
  font-size: 12px;
  font-weight: 500;
  user-select: none;
  color: var(--vp-code-lang-color);
  transition: color 0.4s, opacity 0.4s;
}

button.copy {
  direction: ltr;
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 3;
  border: 1px solid var(--vp-code-copy-code-border-color);
  border-radius: 4px;
  width: 40px;
  height: 40px;
  background-color: var(--vp-code-copy-code-bg);
  opacity: 0;
  cursor: pointer;
  background-image: var(--vp-icon-copy);
  background-position: 50%;
  background-size: 20px;
  background-repeat: no-repeat;
  transition: border-color 0.25s, background-color 0.25s, opacity 0.25s;
}

.magic-code-blocks:hover button.copy {
  opacity: 1;
}

.magic-code-blocks:hover span.lang {
  opacity: 0;
}

button.copy:hover {
  opacity: 1;
  border-color: var(--vp-code-copy-code-hover-border-color);
  background-color: var(--vp-code-copy-code-hover-bg);
}

button.copy:hover.copied {
  border-color: var(--vp-code-copy-code-hover-border-color);
}

button.copy.copied {
  border-radius: 0 4px 4px 0;
  background-image: var(--vp-icon-copied);
}

button.copy.copied::before {
  width: 70px;
  height: 40px;
  content: 'Copied';
  position: absolute;
  color: var(--vp-code-copy-code-active-text);
  border: 1px solid var(--vp-code-copy-code-hover-border-color);
  border-color: var(--vp-code-copy-code-hover-border-color);
  background-color: var(--vp-code-copy-code-hover-bg);
  border-radius: 4px 0 0 4px;
  transform: translate(-70px, -50%);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>