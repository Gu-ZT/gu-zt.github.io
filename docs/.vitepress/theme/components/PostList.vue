<script setup>
import {data as posts} from '../posts.data.ts';
import PostCard from './PostCard.vue';
</script>

<template>
  <div class="post-list">
    <post-card v-for="post in posts"
               :key="post.url"
               :title="post.title"
               :date="post.date"
               :url="post.url"
               :tags="post.tags"
    />
  </div>
</template>

<style scoped>
.post-list {
  margin-top: 2rem;
}
</style>