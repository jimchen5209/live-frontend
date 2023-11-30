<script setup>
import { ref } from 'vue'

const isHost = ref(false)
const hostname = ref('username')
const hasAction = ref(false)
</script>

<template>
  <div id="status" class="ts-wrap is-vertical is-compact is-end-aligned">
    <div class="ts-wrap">
      <div class="ts-wrap is-middle-aligned">
        <span
          class="ts-icon is-tower-broadcast-icon"
          :style="{ color: isHost ? 'var(--ts-negative-500)' : 'var(--ts-positive-500)' }"
        />
        <span class="mobile:has-hidden">{{ isHost ? '您正在主持' : hostname }}</span>
      </div>
      <div class="ts-wrap mobile:has-hidden is-middle-aligned">
        <span class="ts-icon is-eye-icon" />
        <span class="">2</span>
      </div>
    </div>
    <div v-if="hasAction" class="ts-wrap is-middle-aligned">
      <span class="ts-icon is-play-icon" style="color: var(--ts-gray-400)" />
      <span class="ts-icon is-pause-icon" style="color: var(--ts-gray-400)" />
      <span class="ts-icon is-forward-icon" style="color: var(--ts-gray-400)" />
      <span class="ts-icon is-backward-icon" style="color: var(--ts-gray-400)" />
      <span class="mobile:has-hidden">username: 播放</span>
    </div>
  </div>
</template>
