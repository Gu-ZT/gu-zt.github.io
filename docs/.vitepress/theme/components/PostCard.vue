<script setup>

import TagIcon from './TagIcon.vue';

const props = defineProps({
  title: String,
  url: String,
  date: String,
  tags: {
    type: Array,
    default: () => []
  }
});

function click() {
  window.open(props.url, '_self');
}
</script>

<template>
  <div class="post-item" @click="click">
    <div class="title">{{ props.title }}</div>
    <span class="date">日期：{{ props.date }}</span>
    <div class="tags">
      <tag-icon class="tag-icon" />
      <div class="tag-list">
        <span v-for="tag in props.tags" class="tag">{{ tag }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.post-item {
  gap: 1rem;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 1rem;
  background-color: rgba(var(--vp-c-bg), 0.1);
  border: 1px solid var(--vp-c-border);
  color: var(--vp-code-color);
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 2px 4px rgba(var(--vp-c-bg), 0.1);
  transition: transform 0.2s ease-in-out;
  backdrop-filter: blur(6px);
}

.post-item:hover {
  transform: scale(1.05);
}

.post-item:hover .title {
  text-decoration: underline;
}

.tags {
  width: 100%;
  display: flex;
  flex-wrap: nowrap;
  overflow: hidden;
}

.tag-list {
  width: 100%;
  display: flex;
  gap: 0.5rem;
  font-size: 12px;
  flex-wrap: nowrap;
  overflow: hidden;
}

.tag-icon {
  color: var(--vp-c-text-3);
}

.tag {
  display: inline-block;
  border-radius: 0.5rem;
  font-family: monospace;
  color: var(--vp-c-text-3);
  border: 1px solid var(--vp-c-border);
  padding: 0 0.25rem;
  margin: 0.2rem;
  white-space: nowrap;
  flex-shrink: 0;
}

.date {
  font-family: monospace;
  color: var(--vp-c-text-2);
}

.title {
  align-items: flex-start;
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--vp-c-indigo-1);
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
</style>