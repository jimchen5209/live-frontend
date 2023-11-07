<script setup>
import { computed } from 'vue'
import LivePlayer from './LivePlayer.vue'
import PlayerInfoBar from './PlayerInfoBar.vue'

const props = defineProps({
  path_curr: String,
  list: Array
})

const resource = computed(
  () => props.list?.filter((i) => i.name == props.path_curr?.split('/').at(-1))[0]
)
</script>

<template>
  <LivePlayer v-if="resource?.isLive" :resource="resource" />
  <div v-else class="ts-app-layout is-vertical">
    <!-- Player -->
    <div class="cell is-fluid" style="display: inline-flex">
      <video controls class="has-full-size" :src="resource?.src" />
    </div>
    <!-- Dropdown -->
    <PlayerInfoBar :resource="resource" />
  </div>
</template>

<style scoped>
:global(video) {
  aspect-ratio: 16/9;
  max-height: 80vh;
  display: inline-flex;
  box-sizing: content-box;
}
</style>
