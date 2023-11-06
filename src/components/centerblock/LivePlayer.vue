<script setup>
import { ref, onBeforeUnmount, onMounted, watch } from 'vue'

const props = defineProps({
  resource: Object
})

const hls = ref(null)
const player = ref(null)
const list_quality = ref([])
const curr_quality = ref(localStorage.getItem('config_quality') ?? -1)
const change_quality = (quality) => {
  curr_quality.value = quality
  localStorage.setItem('config_quality', quality)
  hls.value.nextLevel = quality
}

onMounted(() => {
  player.value = document.getElementById('live-player')
  hls.value = new Hls({
    liveSyncDurationCount: 0,
    fetchSetup: (context) => new Request(context.url)
  })

  if (props.resource?.isLive && Hls.isSupported()) {
    hls.value = new Hls({
      liveSyncDurationCount: 0,
      fetchSetup: (context) => new Request(context.url)
    })
    hls.value.on(Hls.Events.ERROR, (event, data) => {
      if (data.fatal) {
        switch (data.type) {
          case Hls.ErrorTypes.NETWORK_ERROR:
            // try to recover network error
            console.log('fatal network error encountered, try to recover')
            hls.value.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.log('fatal media error encountered, try to recover')
            hls.value.recoverMediaError()
            break
          default:
            // cannot recover
            hls.value.destroy()
            break
        }
      }
    })
    hls.value.loadSource(props.resource?.src)
    hls.value.attachMedia(player.value)
    hls.value.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      const play = player.value.play()
      list_quality.value = data.levels.map((i) =>
        i.height ? `${i.height}p (${i.bitrate / 1000}kbps)` : 'Source'
      )
      if (curr_quality.value in list_quality.value) {
        change_quality(curr_quality.value)
      } else {
        change_quality(-1)
      }
      if (play)
        play.catch((error) => {
          if (error.name === 'NotAllowedError') {
            player.value.muted = true
            player.value.play()
          }
        })
    })
  }
  // Fuck you apple
  else if (player.value.canPlayType('application/vnd.apple.mpegurl')) {
    player.value.src = props.resource?.src
    player.value.addEventListener('loadedmetadata', () => player.value.play())
  }
})

watch(
  () => props.resource?.streamer,
  () => {
    if (props.resource?.isLive && Hls.isSupported()) {
      hls.value.destroy()
      setTimeout(() => {
        hls.value = new Hls({
          liveSyncDurationCount: 0,
          fetchSetup: (context) => new Request(context.url)
        })
        hls.value.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR:
                // try to recover network error
                console.log('fatal network error encountered, try to recover')
                hls.value.startLoad()
                break
              case Hls.ErrorTypes.MEDIA_ERROR:
                console.log('fatal media error encountered, try to recover')
                hls.value.recoverMediaError()
                break
              default:
                // cannot recover
                hls.value.destroy()
                break
            }
          }
        })
        hls.value.loadSource(props.resource?.src)
        hls.value.attachMedia(player.value)
        hls.value.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
          player.value.play()
          list_quality.value = data.levels.map((i) =>
            i.height ? `${i.height}p (${i.bitrate / 1000}kbps)` : 'Source'
          )
          if (curr_quality.value in list_quality.value) {
            change_quality(curr_quality.value)
          } else {
            change_quality(-1)
          }
        })
      }, 100)
    }
    // Fuck you apple
    else if (player.value.canPlayType('application/vnd.apple.mpegurl')) {
      player.value.src = props.resource?.src
      player.value.addEventListener('loadedmetadata', () => player.value.play())
    }
  }
)
onBeforeUnmount(() => {
  if (hls.value) hls.value.destroy()
})
</script>

<template>
  <div class="ts-app-layout is-vertical">
    <!-- Player -->
    <div class="cell is-fluid" style="display: inline-flex;">
      <video controls id="live-player" class="has-full-size"></video>
    </div>
    <!-- Dropdown -->
    <div class="cell">
      <div class="ts-grid is-1-columns tablet+:is-2-columns has-padded" style="background-color: var(--ts-gray-200);" >
        <div v-if="resource" class="column" style="display: inline-flex; align-items: center;">
          <div class="item is-text" style="color: var(--ts-gray-900)">{{ resource.streamer }}</div>
          <div class="ts-chip is-small is-start-spaced" style="background-color: #ff4141; border-color: #ff4141; color: #fff">
            Live
          </div>
        </div>
        <div v-if="list_quality.length > 1" class="column" style="display: flex; align-items: center;">
          <div style="flex-shrink: 0;">
            <div class="item is-text"  style="color: var(--ts-gray-900)">Quality Select:</div>
          </div>
          <div class="is-text has-start-spaced has-full-width">
            <!-- Selected -->
            <div class="ts-select is-fluid" data-dropdown="select">
              <div class="content">
                {{ curr_quality == -1 ? 'Auto' : list_quality[curr_quality] }}
              </div>
            </div>
            <!-- Options -->
            <div class="ts-dropdown" data-name="select" data-position="bottom-start" style="color: var(--ts-gray-900)">
              <button class="item" @click="change_quality(-1)">Auto</button>
              <button
                class="item"
                v-for:="(quality, index) in list_quality"
                @click="change_quality(index)"
              >
                {{ quality }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.is-text {
  line-height: normal;
}
</style>
