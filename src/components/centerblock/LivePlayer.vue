<script setup>
import { ref, onBeforeUnmount, onMounted, watch } from 'vue'
import ErrorBlankSlate from '../ErrorBlankSlate.vue'
import PlayerInfoBar from './PlayerInfoBar.vue'

const props = defineProps({
  resource: Object
})

const hls = ref(null)
const player = ref(null)
const status_error = ref(false)

const list_quality = ref([])
const curr_quality = ref(-1)

const change_quality = (quality) => {
  if (list_quality.value.length > quality) {
    curr_quality.value = quality
    localStorage.setItem('config_quality', curr_quality.value)
  }
  hls.value.nextLevel = curr_quality.value
}

onMounted(() => {
  player.value = document.getElementById('live-player')

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
            console.error('fatal network error encountered, try to recover')
            hls.value.startLoad()
            break
          case Hls.ErrorTypes.MEDIA_ERROR:
            console.error('fatal media error encountered, try to recover')
            hls.value.recoverMediaError() 
            break
          default:
            // cannot recover
            console.error('fatal error encountered, could not recover')
            status_error.value = true
            hls.value.destroy()
            break
        }
      } else if (data.details === Hls.ErrorDetails.INTERNAL_EXCEPTION) {
        console.error('internal error encountered, counting as unrecoverable error')
        status_error.value = true
        hls.value.destroy()
      }
    })
    hls.value.loadSource(props.resource?.src)
    hls.value.attachMedia(player.value)
    hls.value.on(Hls.Events.MANIFEST_PARSED, (event, data) => {
      const play = player.value.play()
      list_quality.value = data.levels.map((i) =>
        i.height ? `${i.height}p (${i.bitrate / 1000}kbps)` : 'Source'
      )

      const stored_quality = localStorage.getItem('config_quality')
      change_quality((stored_quality !== null && !isNaN(parseInt(stored_quality))) ? parseInt(stored_quality) : -1)

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

          const stored_quality = localStorage.getItem('config_quality')
          change_quality((stored_quality !== null && !isNaN(parseInt(stored_quality))) ? parseInt(stored_quality) : -1)
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
    <div class="cell is-fluid" style="display: inline-flex">
      <video controls id="live-player" class="has-full-size"></video>
      <ErrorBlankSlate v-if="status_error" style="position: absolute;" />
    </div>
    <!-- Dropdown -->
    <PlayerInfoBar
      :resource="resource"
      :list_quality="list_quality"
      :curr_quality="curr_quality"
      @change-quality="change_quality"
    />
  </div>
</template>
