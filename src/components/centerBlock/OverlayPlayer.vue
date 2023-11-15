<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import ErrorBlankSlate from '../ErrorBlankSlate.vue'
import { useViewport } from '../../util/viewport'

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
  },
  isError: {
    type: Boolean,
    default: false
  }
})
defineEmits(['change-quality'])

const { viewWidth } = useViewport()
const isMobile = computed(() => viewWidth.value <= 1023)

const overlayVideo = ref(null)
const video = ref(null)

const buffering = ref(false)

const autoHideTimer = ref(null)
const onPlayerMouseMove = () => {
  if (autoHideTimer.value) {
    clearTimeout(autoHideTimer.value)
    autoHideTimer.value = null
  }

  // set timeout to wait of idle time
  const t = setTimeout(() => {
    autoHideTimer.value = null
    overlayVideo.value?.classList.add('auto-hidden')
  }, 3.5 * 1000)
  autoHideTimer.value = t

  overlayVideo.value?.classList.remove('auto-hidden')
}

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

const volume = ref(100)

const currentTime = ref(0)

const duration = ref(0)

const isFullscreen = ref(false)

const timeText = computed(() => timeToText(currentTime.value))

const durationText = computed(() => timeToText(duration.value))

const rate = ref(1)

const rateList = ref([
  { value: 0.25, text: '0.25x' },
  { value: 0.5, text: '0.5x' },
  { value: 0.75, text: '0.75x' },
  { value: 1, text: '1x' },
  { value: 1.25, text: '1.25x' },
  { value: 1.5, text: '1.5x' },
  { value: 1.75, text: '1.75x' },
  { value: 2, text: '2x' },
  { value: 3, text: '3x' },
  { value: 4, text: '4x' }
])

const updateStatus = () => {
  currentTime.value = video.value?.currentTime
  duration.value = video.value?.duration
  isPaused.value = video.value?.paused
  isMuted.value = video.value?.muted
  volume.value = video.value?.volume * 100
  isFullscreen.value = document.fullscreenElement !== null
  rate.value = video.value?.playbackRate
}

const setRate = (rate) => {
  video.value.playbackRate = rate
}

const setTime = () => {
  video.value.currentTime = currentTime.value
}

const seekForward = () => {
  currentTime.value = Math.min(currentTime.value + 5, duration.value)
  setTime()
}

const seekBackward = () => {
  currentTime.value = Math.max(currentTime.value - 5, 0)
  setTime()
}

const setVolume = () => {
  video.value.volume = volume.value / 100
}

const volumeUp = () => {
  volume.value = Math.min(volume.value + 5, 100)
  setVolume()
}

const volumeDown = () => {
  volume.value = Math.max(volume.value - 5, 0)
  setVolume()
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

const onKeyDown = (event) => {
  if (!video.value)
    return

  onPlayerMouseMove()

  switch (event.key) {
    // Play-Pause
    case ' ':
      event.preventDefault()
      togglePlay()
      break
    // Seek
    case 'ArrowRight':
      event.preventDefault()
      seekForward()
      break
    case 'ArrowLeft':
      event.preventDefault()
      seekBackward()
      break
    // Volume
    case 'ArrowUp':
      event.preventDefault()
      volumeUp()
      break
    case 'ArrowDown':
      event.preventDefault()
      volumeDown()
      break
    case 'M':
    case 'm':
      event.preventDefault()
      toggleMute()
      break
  }
}

const onMouseWheel = (event) => {
  event.preventDefault()
  if (event.deltaY > 0)
    volumeDown()
  else
    volumeUp()
}

const onDblClick = (event) => {
  if (video.value && isMobile.value)
    if (event.x < video.value?.clientWidth / 2)
      seekBackward()
    else
      seekForward()
  else
    toggleFullscreen()
}

onMounted(() => {
  document.addEventListener('keydown', onKeyDown)
})

onUnmounted(() => {
  document.removeEventListener('keydown', onKeyDown)
})
</script>

<template>
  <div
    id="playerContainer"
    ref="overlayVideo"
    class="has-full-size"
    style="display: inline-flex"
    @mousemove="onPlayerMouseMove"
  >
    <video
      id="mediaPlayer"
      ref="video"
      @timeupdate="updateStatus"
      @seeking="updateStatus"
      @click="togglePlay"
      @dblclick="onDblClick"
      @loadeddata="updateStatus"
      @waiting="buffering = true"
      @playing="buffering = false"
      class="has-full-size"
      :src="resource?.isLive ? undefined : resource?.src"
      autoplay
    />

    <ErrorBlankSlate v-if="isError" style="position: absolute" />
    <div v-if="buffering" class="ts-mask">
        <div class="ts-center">
            <div class="ts-loading is-large" style="color: #FFF"></div>
        </div>
    </div>
    <div class="ts-mask is-faded is-top is-hidable">
      <div class="ts-content" style="color: #fff">
        <div class="ts-header">{{ resource?.streamer }}</div>
        <span v-if="resource?.isLive">
          <span class="ts-icon is-circle-icon" :style="{ color: '#ff4141' }" />
          Live
        </span>
        <span v-else>
          {{
            `${resource?.publishTime.toLocaleDateString()} ${resource?.publishTime.toLocaleTimeString()}`
          }}
        </span>
      </div>
    </div>
    <div class="ts-mask is-faded is-bottom is-hidable">
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
            <button class="button has-flex-center" @click="toggleMute" @wheel="onMouseWheel">
              <span v-if="isMuted" class="ts-icon is-volume-xmark-icon" />
              <span v-else-if="volume === 0" class="ts-icon is-volume-off-icon" />
              <span v-else-if="volume <= 50" class="ts-icon is-volume-low-icon" />
              <span v-else class="ts-icon is-volume-high-icon" />
            </button>
            <input type="range" class="mobile:has-hidden" v-model="volume" :max="100" @input="setVolume" @wheel="onMouseWheel" />
            <span class="has-horizontally-padded">
              {{ timeText }}
              <span v-if="!isNaN(duration) && !resource?.isLive" class="mobile:has-hidden"> / {{ durationText }} </span>
            </span>
          </div>
          <div class="is-flex">
            <div v-if="qualityList.length > 1">
              <button class="ts-button is-secondary" data-dropdown="quality">
                {{ currentQuality == -1 ? 'Auto' : qualityList[currentQuality].split(' ')[0] }}
              </button>
              <div class="ts-dropdown style-text" data-name="quality" data-position="top-end">
                <button
                  class="item"
                  :class="{ 'is-selected': currentQuality === -1 }"
                  @click="$emit('change-quality', -1)"
                >
                  Auto
                </button>

                <button
                  v-for="(quality, index) in qualityList"
                  :key="`quality-${index}`"
                  class="item"
                  :class="{ 'is-selected': currentQuality === index }"
                  @click="$emit('change-quality', index)"
                >
                  {{ quality }}
                </button>
              </div>
            </div>
            <div>
              <button class="ts-button is-secondary is-icon" data-dropdown="speed">
                {{ rateList.find((rateItem) => rateItem.value === rate)?.text }}
              </button>
              <div class="ts-dropdown style-text" data-name="speed" data-position="top-end">
                <button
                  v-for="rateItem in rateList"
                  :key="rateItem.value"
                  class="item"
                  :class="{ 'is-selected': rateItem.value === rate }"
                  @click="setRate(rateItem.value)"
                >
                  {{ rateItem.text }}
                </button>
              </div>
            </div>
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
.ts-mask.is-hidable {
  opacity: 0;
  transition-duration: 500ms;
}

.ts-mask.is-faded.is-top {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0, rgba(0, 0, 0, 0.1) 90%, transparent);
}

.ts-mask.is-faded.is-bottom {
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0, rgba(0, 0, 0, 0.1) 90%, transparent);
}

#playerContainer:not(.auto-hidden) > .ts-mask.is-hidable {
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

.style-text {
  color: var(--ts-gray-900);
}

#playerContainer:not(:fullscreen) video {
  aspect-ratio: 16/9;
  max-height: 80vh;
  display: inline-flex;
  box-sizing: content-box;
}

.auto-hidden {
  cursor: none;
}
</style>
