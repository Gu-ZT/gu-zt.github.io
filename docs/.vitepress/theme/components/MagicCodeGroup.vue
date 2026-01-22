<script setup lang="ts">
import {computed, onMounted, Ref, ref} from 'vue';
import {bundledLanguages, createHighlighter} from 'shiki';
import {ShikiMagicMove} from 'shiki-magic-move/vue';
import {useData} from 'vitepress';
import {CodeFileData} from "../type";

const props = defineProps({
  filesData: String
});

const {isDark} = useData();

function decodeHex(hex: string) {
  if (!hex) return '';
  try {
    const bytes = new Uint8Array(hex.length / 2);
    for (let i = 0; i < hex.length; i += 2) {
      bytes[i / 2] = parseInt(hex.substring(i, i + 2), 16);
    }
    return new TextDecoder('utf-8').decode(bytes);
  } catch (e) {
    console.error('Hex decode error:', e);
    return '';
  }
}

const files: Ref<CodeFileData[]> = computed(() => {
  if (!props.filesData) return [];
  const decode = decodeHex(props.filesData);
  if (!decode) return [];
  try {
    const temp = JSON.parse(decode);
    temp.forEach(handleFileData);
    return temp;
  } catch (e) {
    console.error('Failed to parse files-data:', e);
    return [];
  }
});

const supportLanguages = Object.keys(bundledLanguages);

function handleFileData(file: CodeFileData) {
  handleFileLang(file);
  if (!supportLanguages.includes(file.lang)) {
    file.lang = 'plaintext';
  }
  file.name = file.name || file.lang
  handleFileCode(file);
}

const singleLineRegex = `(\\d+)`
const multiLineRegex = `(\\d+-\\d+)`
const lineRegex = `(${singleLineRegex}|${multiLineRegex})`
const highlightLinesRegex = `\\{${lineRegex}(,?${lineRegex})*}`;

function handleFileLang(file: CodeFileData) {
  const matches = file.lang.match(highlightLinesRegex);
  if (matches) {
    file.lang = file.lang.replace(matches[0], '');
    handleFileHighlight(file, matches[0]);
  }
}

function handleFileHighlight(file: CodeFileData, highlightLines: string) {
  file.highlightLines = [];
  highlightLines.substring(1, highlightLines.length - 1).split(',').forEach(range => {
    if (range.match(`^${singleLineRegex}$`)) {
      file.highlightLines.push(parseInt(range) - 1);
    } else if (range.match(`^${multiLineRegex}$`)) {
      const [start, end] = range.split('-').map(Number);
      for (let i = start; i <= end; i++) {
        file.highlightLines.push(i - 1);
      }
    }
  });
}

function handleFileCode(file: CodeFileData) {
  file.diffAddLines = []
  file.diffReduceLines = []
  file.warningLines = []
  file.errorLines = []
  file.focusedLines = []
  const codes = file.code.split('\n').map((line, index) => handleCodeLine(file, index, line));
  file.code = codes.join('\n');
}

const commentRegex = '(//|#)'
const codeAddRegex = '(\\[!code \\+\\+])';
const codeReduceRegex = '(\\[!code --])';
const codeWarningRegex = '(\\[!code warning])';
const codeErrorRegex = '(\\[!code error])';
const codeFocusRegex = '(\\[!code focus])';

function handleCodeLine(file: CodeFileData, lineNum: number, line: string): string {
  const addMatches = line.match(`${commentRegex} ${codeAddRegex}`)
  if (addMatches) {
    file.diffAddLines.push(lineNum);
    return line.replace(addMatches[0], '');
  }
  const reduceMatches = line.match(`${commentRegex} ${codeReduceRegex}`)
  if (reduceMatches) {
    file.diffReduceLines.push(lineNum);
    return line.replace(reduceMatches[0], '');
  }
  const warningMatches = line.match(`${commentRegex} ${codeWarningRegex}`)
  if (warningMatches) {
    file.warningLines.push(lineNum);
    return line.replace(warningMatches[0], '');
  }
  const errorMatches = line.match(`${commentRegex} ${codeErrorRegex}`)
  if (errorMatches) {
    file.errorLines.push(lineNum);
    return line.replace(errorMatches[0], '');
  }
  const focusMatches = line.match(`${commentRegex} ${codeFocusRegex}`)
  if (focusMatches) {
    file.focusedLines.push(lineNum);
    return line.replace(focusMatches[0], '');
  }
  return line;
}

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

  const langs = files.value.map(f => f.lang || 'ts');
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

const loading = ref(true);

function start() {
  loading.value = true;
}

function end() {
  loading.value = false;
}

function checkTab(index: number) {
  if (index !== activeIndex.value) {
    loading.value = true;
    activeIndex.value = index
  }
}

</script>

<template>
  <div class="vp-code-group VPDoc magic-code-group">
    <div class="tabs">
      <template v-for="(file, index) in files" :key="index">
        <input type="radio" :name="`group-${filesData.length}`" :id="`tab-${index}`" :checked="activeIndex === index">
        <label @click="checkTab(index)">{{ file.name }}</label>
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
          id="shiki-magic-move"
          v-if="highlighter"
          :highlighter="highlighter"
          :theme="currentTheme"
          :lang="files[activeIndex].lang"
          :code="files[activeIndex].code.trimEnd()"
          :options="{ duration: 600, containerStyle: false }"
          @start="start"
          @end="end"
      />
      <div class="custom-lines">
        <div
            v-for="line in files[activeIndex].highlightLines"
            :key="line"
            :class="{'custom-line-hidden':loading, 'custom-line':true, 'custom-highlighted':true}"
            :style="`transform: translateY(${line*100}%)`"
        >
          highlightLine
        </div>
        <div
            v-for="line in files[activeIndex].diffAddLines"
            :key="line"
            :class="{'custom-line-hidden':loading, 'custom-line':true, 'custom-diff-add':true}"
            :style="`transform: translateY(${line*100}%)`"
        />
        <div
            v-for="line in files[activeIndex].diffReduceLines"
            :key="line"
            :class="{'custom-line-hidden':loading, 'custom-line':true, 'custom-diff-reduce':true}"
            :style="`transform: translateY(${line*100}%)`"
        />
        <div
            v-for="line in files[activeIndex].warningLines"
            :key="line"
            :class="{'custom-line-hidden':loading, 'custom-line':true, 'custom-warning':true}"
            :style="`transform: translateY(${line*100}%)`"
        >
          warningLine
        </div>
        <div
            v-for="line in files[activeIndex].errorLines"
            :key="line"
            :class="{'custom-line-hidden':loading, 'custom-line':true, 'custom-error':true}"
            :style="`transform: translateY(${line*100}%)`"
        >
          errorLine
        </div>
        <div
            v-if="files[activeIndex].focusedLines.length"
            v-for="(_, index) in files[activeIndex].code.split('\n')"
            :key="index"
            :class="{
                'custom-line-hidden':loading,
                'custom-line':true,
                'custom-focused':files[activeIndex].focusedLines.includes(index),
                'custom-unfocused':!files[activeIndex].focusedLines.includes(index)
              }"
            :style="`transform: translateY(${index*100}%)`"
        >
          focusedLine
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.custom-lines {
  position: absolute;
  left: 0;
  top: 0;
  margin-top: 20px;
  margin-left: 0;
  width: 100%;
}

.custom-line {
  opacity: 1;
  color: #00000000;
  width: 100%;
  position: absolute;
  left: 0;
  z-index: 1;
  line-height: var(--vp-code-line-height);
  font-size: var(--vp-code-font-size);
  transition-duration: 0.4s;
}

.has-line-numbers .custom-lines {
  margin-left: 32px;
  width: calc(100% - 32px);
}

.custom-line.custom-line-hidden {
  opacity: 0;
}

.custom-diff-add {
  color: var(--vp-code-line-diff-add-symbol-color);
  background-color: var(--vp-code-line-diff-add-color);
}

.custom-diff-add::before {
  content: "+";
  left: 10px;
  position: relative;
}

.custom-diff-reduce {
  color: var(--vp-code-line-diff-remove-symbol-color);
  background-color: var(--vp-code-line-diff-remove-color);
}

.custom-diff-reduce::before {
  content: "-";
  left: 10px;
  position: relative;
}

.custom-highlighted {
  background-color: var(--vp-code-line-highlight-color);
}

.custom-warning {
  background-color: var(--vp-code-line-warning-color);
}

.custom-error {
  background-color: var(--vp-code-line-error-color);
}

.custom-unfocused {
  backdrop-filter: blur(2px);
}

.magic-code-blocks:hover .custom-unfocused {
  opacity: 0;
}

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
  z-index: 1;
}

span.lang {
  position: absolute;
  top: 2px;
  right: 8px;
  z-index: 3;
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
  z-index: 4;
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