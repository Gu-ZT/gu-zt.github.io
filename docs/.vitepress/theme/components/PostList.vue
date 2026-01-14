<script setup>
import {data as posts} from '../posts.data.ts';
</script>

<template>
  <div class="post-list">
    <div v-for="post in posts" :key="post.url" class="post-item">
      <span class="date">{{ post.date }}</span>
      <a :href="post.url" class="title">{{ post.title }}</a>
    </div>
  </div>
</template>

<style scoped>
.post-list {
  margin-top: 2rem;
}

.post-item {
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
}

.date {
  font-family: monospace;
  color: #888;
}

.title {
  font-size: 1.2rem;
  font-weight: 500;
  color: var(--vp-c-brand);
  text-decoration: none;
}

.title:hover {
  text-decoration: underline;
}
</style>