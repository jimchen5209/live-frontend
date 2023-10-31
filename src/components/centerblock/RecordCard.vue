<script setup>
import { computed } from 'vue'

const props = defineProps({
  streamer: String,
  publishTime: Date,
  duration: String,
  src: String,
  name: String,
  isLive: Boolean
})
const pubTime = computed(
  () => `${props.publishTime.toLocaleDateString()} ${props.publishTime.toLocaleTimeString()}`
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
  <a class="ts-box" :href="`#profile/${streamer}/${name}`">
    <!-- Preview image -->
    <div class="ts-image">
      <picture>
        <source type="image/jxl" :srcset="src + '.jxl'" />
        <source type="image/avif" :srcset="src + '.avif'" />
        <source type="image/png" :srcset="src + '.png'" />
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
      <div v-if=isLive class="ts-header is-truncated is-heavy" style="color: #ff4141;">Live</div>
      <div v-else class="ts-header is-truncated is-heavy">{{ parsedu }}</div>
      <div v-if=!isLive class="ts-text is-description">{{ pubTime }}</div>
      <div v-else class="ts-text is-description">Now</div>
    </div>
  </a>
</template>
