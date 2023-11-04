<script setup>
import { computed } from 'vue';
import LivePlayer from './LivePlayer.vue'

const props = defineProps({
  path_curr: String,
  list: Array
})

const resource = computed(() => props.list?.filter((i) => i.name == props.path_curr?.split('/').at(-1))[0])
</script>

<template>
  <LivePlayer
    v-if="resource?.isLive"
    :resource=resource
  />
  <video
    v-else
    controls
    class="has-full-size"
    :src="resource?.src"
  ></video>
</template>

<style scoped>
:global(video) {
  aspect-ratio: 16/9;
  max-height: 80vh;
  display: inline-flex;
  box-sizing: content-box;
}
</style>