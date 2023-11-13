<script setup>
import { computed, ref } from 'vue'

defineProps({
  resource: {
    type: Object,
    required: true
  },
  qualityList: {
    type: Array,
    default: () => []
  },
  currentQuality: {
    type: Number,
    default: -1
  }
})
defineEmits(['change-quality'])

const overlayVideo = ref(null)
const video = ref(null)

const timeToText = (time) => {
  const hour = Math.floor(time / 3600)
  const minutes = Math.floor((time - hour * 3600) / 60)
  const seconds = Math.floor(time - hour * 3600 - minutes * 60)

  const minuteValue = minutes.toString().padStart(2, '0')
  const secondValue = seconds.toString().padStart(2, '0')

  return `${hour}:${minuteValue}:${secondValue}`
}

const isPaused = ref(true)

const isMuted = ref(false)

const volume = ref(0.5)

const currentTime = ref(0)

const duration = ref(0)

const isFullscreen = ref(false)

const timeText = computed(() => timeToText(currentTime.value))

const durationText = computed(() => timeToText(duration.value))

const updateStatus = () => {
  currentTime.value = video.value.currentTime
  duration.value = video.value.duration
  isPaused.value = video.value.paused
  isMuted.value = video.value.muted
  volume.value = video.value.volume * 100
  isFullscreen.value = document.fullscreenElement !== null
}

const setTime = () => {
  video.value.currentTime = currentTime.value
}

const setVolume = () => {
  video.value.volume = volume.value / 100
}

const toggleMute = () => {
  video.value.muted = !video.value.muted
}

const togglePlay = () => {
  if (video.value.paused) {
    video.value.play()
  } else {
    video.value.pause()
  }
}

const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    overlayVideo.value?.requestFullscreen().catch((err) => {
      console.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`)
    })
  } else {
    document.exitFullscreen()
  }
}
</script>

<template>
  <div id="playerContainer" ref="overlayVideo" class="has-full-size" style="display: inline-flex">
    <video
      ref="video"
      @timeupdate="updateStatus"
      @seeking="updateStatus"
      @click="togglePlay"
      @dblclick="toggleFullscreen"
      class="has-full-size"
      :src="resource?.src"
    />
    <div class="ts-mask is-faded is-top">
      <div class="ts-content" style="color: #fff">
        <div class="ts-header">{{ resource?.streamer }}</div>
        <span v-if="resource?.isLive"> Live </span>
        <span v-else>
          {{
            `${resource?.publishTime.toLocaleDateString()} ${resource?.publishTime.toLocaleTimeString()}`
          }}
        </span>
      </div>
    </div>
    <div class="ts-mask is-faded is-bottom">
      <div class="ts-content" style="color: #fff">
        <input
          type="range"
          v-model="currentTime"
          :max="duration"
          @change="setTime"
          class="has-full-width"
        />
        <div class="is-flex justify-between has-horizontally-padded">
          <div class="is-flex">
            <button class="button has-flex-center" @click="togglePlay">
              <span v-if="isPaused" class="ts-icon is-play-icon" />
              <span v-else class="ts-icon is-pause-icon" />
            </button>
            <button class="button has-flex-center" @click="toggleMute">
              <span v-if="isMuted" class="ts-icon is-volume-xmark-icon" />
              <span v-else-if="volume === 0" class="ts-icon is-volume-off-icon" />
              <span v-else-if="volume <= 50" class="ts-icon is-volume-low-icon" />
              <span v-else class="ts-icon is-volume-high-icon" />
            </button>
            <input type="range" v-model="volume" :max="100" @input="setVolume" />
            <span class="has-horizontally-padded">
              {{ timeText }}
              <span v-if="!isNaN(duration)"> / {{ durationText }} </span>
            </span>
          </div>
          <div class="is-flex">
            <button class="button has-flex-center" @click="toggleFullscreen">
              <span v-if="isFullscreen" class="ts-icon is-compress-icon" />
              <span v-else class="ts-icon is-expand-icon" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.ts-mask {
  opacity: 0;
  transition-duration: 500ms;
}
.ts-mask.is-faded.is-top {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0, rgba(0, 0, 0, 0.1) 90%, transparent);
}
.ts-mask.is-faded.is-bottom {
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0, rgba(0, 0, 0, 0.1) 90%, transparent);
}
video:hover ~ .ts-mask {
  opacity: 1;
}
.ts-mask:hover {
  opacity: 1;
}
.ts-mask:hover ~ .ts-mask {
  opacity: 1;
}

.is-flex {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.justify-between {
  justify-content: space-between;
}

.button {
  width: 18px;
  height: 18px;
}

#playerContainer:not(:fullscreen) video {
  aspect-ratio: 16/9;
  max-height: 80vh;
  display: inline-flex;
  box-sizing: content-box;
}
</style>
