<script setup>
import { computed } from 'vue'

const props = defineProps({
  streamer: String,
  publishTime: String,
  duration: String,
  src: String,
  name: String
})
const publishTime = new Date(props.publishTime)
const pubTime = computed(
  () => `${publishTime.toLocaleDateString()} ${publishTime.toLocaleTimeString()}`
)
const parsedu = computed(() => {
  let h = Math.floor(props.duration / 3600)
  let m = Math.floor((props.duration % 3600) / 60)
  let s = Math.floor(props.duration % 60)
  if (h < 10) h = `0${h}`
  if (m < 10) m = `0${m}`
  if (s < 10) s = `0${s}`
  return `${h}:${m}:${s}`
})
</script>

<template>
  <!-- Box -->
  <a class="ts-box" :href="`/#profile/${streamer}/${name}`">
    <!-- Preview image -->
    <div class="ts-image">
      <picture>
        <source :srcset="src + '.avif'" />
        <source :srcset="src + '.jxl'" />
        <img
          src="../../assets/image.png"
          alt="Record thumb"
          loading="lazy"
          onerror="this.parentNode.children[0] != this && this.parentNode.children[0].remove()"
        />
      </picture>
    </div>
    <!-- Metadata -->
    <div class="ts-content is-secondary">
      <div class="ts-text is-description">{{ streamer }}</div>
      <div class="ts-header is-truncated is-heavy">{{ parsedu }}</div>
      <div class="ts-text is-description">{{ pubTime }}</div>
    </div>
  </a>
</template>
