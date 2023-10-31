<script setup>
import { computed } from 'vue'

const props = defineProps({
  hist: Array,
  currentPath: String
})

const resource = computed(() => {
  return props.hist?.filter((i) => i.name === props.currentPath.split('/').at(-1))[0]
})
</script>

<template>
  <video v-if="resource?.isLive" controls class="has-full-size" :src="resource?.src"></video>
  <video v-else controls class="has-full-size" :src="`${resource?.src}.mp4`"></video>
</template>
