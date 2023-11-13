<script setup>
import { computed } from 'vue'
import LivePlayer from './LivePlayer.vue'
import PlayerOverlay from './PlayerOverlay.vue';

const props = defineProps({
  currentPath: String,
  list: Array
})

const resource = computed(
  () => props.list?.filter((i) => i.name == props.currentPath?.split('/').at(-1))[0]
)
</script>

<template>
  <LivePlayer v-if="resource?.isLive" :resource="resource" />
  <PlayerOverlay v-else :resource="resource" />
</template>

