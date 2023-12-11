<script setup>
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { debounce } from 'lodash'

import VolumeControl from './OverlayPlayer/VolumeControl.vue'
import ErrorBlankSlate from '../ErrorBlankSlate.vue'

const props = defineProps({
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

const touchMode = ref(false)
const isTouch = (event) => event?.pointerType === 'touch'

const overlayVideo = ref(null)
const video = ref(null)
const videoAmplifier = computed(() => {
  if (!video.value) return null
  const context = new (window.AudioContext || window.webkitAudioContext)(),
    result = {
      context: context,
      source: context.createMediaElementSource(video.value),
      gain: context.createGain(),
      media: video.value,
      amplify: function (multiplier) {
        result.gain.gain.value = multiplier
      },
      getAmpLevel: function () {
        return result.gain.gain.value
      }
    }
  result.source.connect(result.gain)
  result.gain.connect(context.destination)
  result.amplify(1)
  return result
})

const convertVolume = (volume) => {
  if (volume <= 100) return volume
  return 100 + (volume - 100) * 2
}

const reverseVolume = (volume) => {
  if (volume <= 100) return volume
  return 100 + (volume - 100) / 2
}

const isVideoError = ref(false)

const rateDropdown = ref(null)
const qualityDropdown = ref(null)
const isDropdownVisible = () =>
  rateDropdown.value?.classList.contains('is-visible') ||
  qualityDropdown.value?.classList.contains('is-visible')

const isBuffering = ref(false)

const autoHideTimer = ref(null)
const isPlayerHidden = () => overlayVideo.value?.classList.contains('auto-hidden') ?? false

const hideUI = () => {
  if (isDropdownVisible()) return
  if (autoHideTimer.value) {
    clearTimeout(autoHideTimer.value)
    autoHideTimer.value = null
  }
  overlayVideo.value?.classList.add('auto-hidden')
}

const onPlayerPointerMove = (event) => {
  touchMode.value = isTouch(event)
  if (autoHideTimer.value) {
    clearTimeout(autoHideTimer.value)
    autoHideTimer.value = null
  }

  // set timeout to wait of idle time
  const t = setTimeout(hideUI, (isTouch(event) ? 2 : 1) * 1000)
  autoHideTimer.value = t

  overlayVideo.value?.classList.remove('auto-hidden')
}

const timeToText = (time) => {
  const hours = Math.floor(time / 3600)
  const minutes = Math.floor((time % 3600) / 60)
  const seconds = Math.floor(time % 60)

  const hourValue = hours.toString().padStart(2, '0')
  const minuteValue = minutes.toString().padStart(2, '0')
  const secondValue = seconds.toString().padStart(2, '0')

  return `${hourValue}:${minuteValue}:${secondValue}`
}

const isPaused = ref(true)

const isMuted = ref(false)

const volume = ref(100)

const currentTime = ref(0)

const draggingCurrentTime = ref(undefined)

const doubleClickCount = ref(0)

const doubleClickTimer = ref(null)

const duration = ref(0)

const isFullscreen = ref(false)

const timeText = computed(() => timeToText(currentTime.value))

const durationText = computed(() => timeToText(duration.value))

const rate = ref(1)

const rateList = ref([
  { value: 0.25, text: '0.25x' },
  { value: 0.5, text: '0.5x' },
  { value: 1, text: '1x' },
  { value: 1.5, text: '1.5x' },
  { value: 2, text: '2x' },
  { value: 3, text: '3x' },
  { value: 5, text: '5x' }
])

const updateStatus = () => {
  isBuffering.value = false
  currentTime.value = draggingCurrentTime.value ?? video.value?.currentTime
  duration.value = video.value?.duration
  isPaused.value = video.value?.paused
  isMuted.value = video.value?.muted
  volume.value = video.value?.muted ? 0 : reverseVolume(videoAmplifier.value?.getAmpLevel() * 100)
  isFullscreen.value = document.fullscreenElement !== null
  rate.value = video.value?.playbackRate
}

const onPlayerReady = () => {
  updateStatus()
  onPlayerPointerMove()
}

const setRate = (rate) => {
  video.value.playbackRate = rate
  updateStatus()
}

const onSeekDrag = () => {
  draggingCurrentTime.value = currentTime.value
  debounce(setTime, 500)()
}

const setTime = () => {
  draggingCurrentTime.value = undefined
  video.value.currentTime = currentTime.value
  updateStatus()
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
  if (volume.value === 0) {
    video.value.muted = true
    updateStatus()
    return
  }

  video.value.muted = false
  videoAmplifier.value?.amplify(convertVolume(volume.value) / 100)
  updateStatus()
}

const volumeUp = () => {
  volume.value = Math.min(volume.value + 5, 150)
  setVolume()
}

const volumeDown = () => {
  volume.value = Math.max(volume.value - 5, 0)
  setVolume()
}

const resetVolume = () => {
  volume.value = 100
  setVolume()
}

const toggleMute = () => {
  video.value.muted = !video.value.muted
  updateStatus()
}

const onMuteButtonPointerUp = (event) => {
  setTimeout(() => onPlayerPointerMove(event), 50)
  toggleMute()
}

const togglePlay = () => {
  if (!props.resource) return
  if (video.value.paused) {
    video.value.play()
  } else {
    video.value.pause()
  }
  updateStatus()
}

const onOverlayPointerUp = (event) => {
  setTimeout(() => onPlayerPointerMove(event), 50)
}

const onPlayButtonPointerUp = (event) => {
  const isHidden = isPlayerHidden()
  setTimeout(() => onPlayerPointerMove(event), 50)
  if (isHidden) {
    return
  }
  setTimeout(() => onPlayerPointerMove(event), 50)
  togglePlay()
}

const toggleFullscreen = () => {
  if (!props.resource) return
  if (!document.fullscreenElement) {
    overlayVideo.value?.requestFullscreen().catch((err) => {
      console.error(`Error attempting to enable fullscreen mode: ${err.message} (${err.name})`)
    })
  } else {
    document.exitFullscreen()
  }
}

const onFullscreenButtonPointerUp = (event) => {
  setTimeout(() => onPlayerPointerMove(event), 50)
  toggleFullscreen()
}

const onKeyDown = (event) => {
  if (
    document.activeElement instanceof HTMLInputElement &&
    !document.activeElement.classList.contains('player-slider')
  )
    return
  if (!video.value) return
  if (!props.resource) return

  onPlayerPointerMove(event)

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

const onVolumeMouseWheel = (event) => {
  event.preventDefault()
  if (event.deltaY > 0) volumeDown()
  else volumeUp()
  onPlayerPointerMove(event)
}

const onPlayerPointerUp = (event) => {
  if (!event.isPrimary || event.button !== 0) return
  event.preventDefault()
  // prevent click on icon button
  if (event.target instanceof HTMLSpanElement) return
  const isHidden = isPlayerHidden()
  const isTouchEvent = isTouch(event)
  touchMode.value = isTouchEvent
  doubleClickCount.value++
  if (doubleClickCount.value === 1) { // First click
    if (isHidden && isTouchEvent) {
      onPlayerPointerMove(event) // Show UI
      doubleClickTimer.value = setTimeout(() => doubleClickCount.value = 0, 300)
    } else {
      onPlayerClick(event)
      // Delay 300 to detect double click and hide UI on touch
      doubleClickTimer.value = setTimeout(() => {
        doubleClickCount.value = 0
        if (isTouchEvent && !isHidden) hideUI()
      }, 300)
    }
  } else if (doubleClickCount.value === 2) { // Second click, trigger double click
    clearTimeout(doubleClickTimer.value)
    doubleClickCount.value = 0
    onPlayerDoubleClick(event)
  }
}

const onPlayerClick = (event) => {
  const isHidden = isPlayerHidden()
  setTimeout(() => onPlayerPointerMove(event), 50)
  if (isHidden) return
  if (isTouch(event)) return
  // do not toggle play when dropdown is visible
  if (isDropdownVisible()) return
  togglePlay()
}

const onPlayerDoubleClick = (event) => {
  setTimeout(() => onPlayerPointerMove(event), 50)
  if (video.value && isTouch(event)) {
    // Click center will toggle play, left and right sides will seek time
    const leftSideEnd = video.value?.clientWidth / 3
    const RightSideStart = leftSideEnd * 2
    if (event.x < leftSideEnd) {
      seekBackward()
    } else if (event.x > RightSideStart) {
      seekForward()
    } else {
      togglePlay()
    }
  } else {
    toggleFullscreen()
  }
}

const onVideoPlaying = () => {
  isBuffering.value = false
  isVideoError.value = false
}

const onVideoError = () => {
  isBuffering.value = false
  isVideoError.value = true
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
    @pointermove="onPlayerPointerMove"
  >
    <video
      id="mediaPlayer"
      ref="video"
      crossorigin="anonymous"
      @timeupdate="updateStatus"
      @seeking="updateStatus"
      @pointerup="onPlayerPointerUp"
      @loadstart="isBuffering = true"
      @loadeddata="onPlayerReady"
      @waiting="isBuffering = true"
      @playing="onVideoPlaying"
      @error="onVideoError"
      class="has-full-size"
      :src="resource?.isLive ? undefined : resource?.src"
      autoplay
    />

    <ErrorBlankSlate v-if="isError || isVideoError" style="position: absolute" />
    <div v-if="isBuffering || !resource" class="ts-mask" @pointerup="onPlayerPointerUp">
      <div class="ts-center">
        <div class="ts-loading is-large" style="color: #fff"></div>
      </div>
    </div>
    <div
      v-if="resource && touchMode"
      id="mobileCenterControl"
      class="is-hidable has-flex-center has-horizontally-padded-huge"
    >
      <button class="button-touch has-flex-center" @pointerup="onPlayButtonPointerUp">
        <span v-if="isPaused" class="ts-icon is-huge tablet+:is-heading is-play-icon" />
        <span v-else class="ts-icon is-huge tablet+:is-heading is-pause-icon" />
      </button>
    </div>
    <div v-if="resource" class="ts-mask is-faded is-top is-hidable" @pointerup="onOverlayPointerUp">
      <div class="ts-content" style="color: #fff">
        <div class="ts-header is-truncated">{{ resource.streamer }}</div>
        <span v-if="resource.isLive">
          <span class="ts-icon is-circle-icon" :style="{ color: '#ff4141' }" />
          Live
        </span>
        <span v-else>
          {{
            `${resource.publishTime.toLocaleDateString()} ${resource.publishTime.toLocaleTimeString()}`
          }}
        </span>
      </div>
    </div>
    <div v-if="resource" class="ts-mask is-faded is-bottom is-hidable">
      <div class="ts-content" style="color: #fff">
        <input
          v-if="!touchMode"
          type="range"
          class="has-full-width has-cursor-pointer player-slider"
          v-model="currentTime"
          :max="duration"
          step="any"
          @input="onSeekDrag"
        />
        <div
          class="is-flex justify-between"
          :class="{ 'has-horizontally-padded': !touchMode }"
          @pointerup="onOverlayPointerUp"
        >
          <div class="is-flex">
            <button
              v-if="!touchMode"
              class="button has-flex-center"
              @pointerup="onPlayButtonPointerUp"
            >
              <span v-if="isPaused" class="ts-icon tablet+:is-big is-play-icon" />
              <span v-else class="ts-icon tablet+:is-big is-pause-icon" />
            </button>
            <VolumeControl
              v-if="!touchMode"
              v-model:volume="volume"
              :is-muted="isMuted"
              :convert-volume="convertVolume"
              :reset-volume="resetVolume"
              @mute-button-pointerup="onMuteButtonPointerUp"
              @volume-mousewheel="onVolumeMouseWheel"
              @update:volume="setVolume"
            />
            <span>
              {{ timeText }}
              <span v-if="!isNaN(duration)"> / {{ durationText }} </span>
            </span>
          </div>
          <div class="is-flex">
            <VolumeControl
              v-if="touchMode"
              v-model:volume="volume"
              :is-muted="isMuted"
              :convert-volume="convertVolume"
              :reset-volume="resetVolume"
              @mute-button-pointerup="onMuteButtonPointerUp"
              @volume-mousewheel="onVolumeMouseWheel"
              @update:volume="setVolume"
            />
            <div v-if="qualityList.length > 1">
              <button
                class="button has-flex-center"
                data-dropdown="quality"
                @pointerup="onPlayerPointerMove"
              >
                <span class="ts-icon tablet+:is-big is-images-icon" />
              </button>
              <div
                ref="qualityDropdown"
                class="ts-dropdown style-text"
                data-name="quality"
                data-position="top-end"
              >
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
              <button
                class="button has-flex-center"
                data-dropdown="speed"
                @pointerup="onPlayerPointerMove"
              >
                <span class="ts-icon tablet+:is-big is-gauge-simple-high-icon" />
              </button>
              <div
                ref="rateDropdown"
                class="ts-dropdown style-text"
                data-name="speed"
                data-position="top-end"
              >
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
            <button class="button has-flex-center" @pointerup="onFullscreenButtonPointerUp">
              <span v-if="isFullscreen" class="ts-icon is-compress-icon" />
              <span v-else class="ts-icon tablet+:is-big is-expand-icon" />
            </button>
          </div>
        </div>
        <input
          v-if="touchMode"
          type="range"
          class="has-full-width has-cursor-pointer player-slider"
          v-model="currentTime"
          :max="duration"
          step="any"
          @input="onSeekDrag"
        />
      </div>
    </div>
  </div>
</template>

<style scoped>
.is-hidable {
  opacity: 0;
  transition-duration: 500ms;
}

.ts-mask.is-faded.is-top {
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.9) 0, rgba(0, 0, 0, 0.1) 90%, transparent);
}

.ts-mask.is-faded.is-bottom {
  background: linear-gradient(0deg, rgba(0, 0, 0, 0.9) 0, rgba(0, 0, 0, 0.1) 90%, transparent);
}

#playerContainer:not(.auto-hidden) > .is-hidable {
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
  width: 30px;
  height: 30px;
}

.button-touch {
  width: 36px;
  height: 36px;
}

@media (min-width: 768px) {
  .button-touch {
    width: 90px;
    height: 90px;
  }
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

.auto-hidden,
.auto-hidden * {
  cursor: none;
}

#mobileCenterControl {
  color: #fff;
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
}

#mobileCenterControl .ts-icon::before {
  text-shadow: #000 2px 2px 5px;
}

/* Workaround tocas-ui's important */
.auto-hidden .has-cursor-pointer {
  cursor: none !important;
}
</style>
