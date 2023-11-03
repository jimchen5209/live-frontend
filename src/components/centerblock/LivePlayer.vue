<script setup>
import { ref, onBeforeUnmount, onMounted, watch } from 'vue'

const props = defineProps({
  resource: Object
})

const hls = ref(null)
const player = ref(null)
const list_quality = ref([])

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
    <div class="cell is-fluid">
      <video controls id="live-player" class="has-full-size"></video>
    </div>
    <!-- Dropdown -->
    <div v-if="list_quality.length > 1" class="cell">
      <div class="ts-app-topbar">
        <div class="center is-text">Quality Select:</div>
        <div class="end is-text">
          <!-- Selected -->
          <div class="ts-select is-fluid" data-dropdown="select">
            <div class="ts-content">Auto</div>
          </div>
          <!-- Options -->
          <div class="ts-dropdown" data-name="select" data-position="bottom-start">
            <button class="item" @click="hls.nextLevel = -1">Auto</button>
            <button
              class="item"
              v-for:="(quality, index) in list_quality"
              @click="hls.nextLevel = index"
            >
              {{ quality }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
