<script setup>
import { ref, onMounted } from 'vue'
import { createHighlighter } from 'shiki'
import { ShikiMagicMove } from 'shiki-magic-move/vue'

const props = defineProps(['code', 'lang', 'theme'])
const highlighter = ref(null)

onMounted(async () => {
  highlighter.value = await createHighlighter({
    themes: [props.theme || 'github-dark'],
    langs: [props.lang || 'ts']
  })
})
</script>

<template>
  <div class="magic-move-container">
    <ShikiMagicMove
        v-if="highlighter"
        :highlighter="highlighter"
        :theme="theme"
        :lang="lang"
        :code="code"
        v-bind="$attrs"
    />
  </div>
</template>

<style scoped>

</style>