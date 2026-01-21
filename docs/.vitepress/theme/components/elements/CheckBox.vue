<script setup>
const props = defineProps({
  checked: {
    type: Boolean,
    default: false
  }
});
</script>

<template>
  <input class="custom-check-box" type="checkbox" disabled="false" :checked="props.checked"/>
</template>

<style scoped>
.custom-check-box {
  transform: scale(1.5);
}
</style>