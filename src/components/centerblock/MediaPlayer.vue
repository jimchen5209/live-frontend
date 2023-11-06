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
  <div v-else class="ts-app-layout is-vertical">
    <!-- Player -->
    <div class="cell is-fluid" style="display: inline-flex;">
      <video controls class="has-full-size" :src="resource?.src" />
    </div>
    <!-- Dropdown -->
    <div class="cell">
      <div class="ts-grid is-1-columns tablet+:is-2-columns has-padded" style="background-color: var(--ts-gray-200);">
        <div v-if="resource" class="column" style="display: inline-flex; align-items: center;">
          <div class="item is-text" style="color: var(--ts-gray-900)">{{ resource.streamer }}</div>
          <div class="ts-chip is-outlined is-small is-start-spaced" style="color: var(--ts-gray-500); border-color: var(--ts-gray-500);">
            {{`${resource.publishTime.toLocaleDateString()} ${resource.publishTime.toLocaleTimeString()}`}}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
:global(video) {
  aspect-ratio: 16/9;
  max-height: 80vh;
  display: inline-flex;
  box-sizing: content-box;
}
.is-text {
  line-height: normal;
}
</style>