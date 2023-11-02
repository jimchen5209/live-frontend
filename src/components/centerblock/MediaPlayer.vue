<script setup>
import { ref, computed, onBeforeUnmount, onMounted, watch } from 'vue'

const props = defineProps({
  hist: Array,
  currentPath: String
})

const resource = computed(() => {
  return props.hist?.filter((i) => i.name === props.currentPath.split('/').at(-1))[0]
})

const hls = ref(null)
const player = ref(null)

onMounted(() => {
  player.value = document.getElementById('live-player')
  hls.value = new Hls({
    liveSyncDurationCount: 0,
    fetchSetup: (context) => new Request(context.url)
  })

  if (resource.value?.isLive && Hls.isSupported()) {
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
    hls.value.loadSource(resource.value?.src)
    hls.value.attachMedia(player.value)
    hls.value.on(Hls.Events.MANIFEST_PARSED, () => {
      const play = player.value.play()
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
    player.value.src = resource.value.src
    player.value.addEventListener('loadedmetadata', () => player.value.play())
  }
})

watch(
  () => resource.value?.streamer,
  () => {
    if (resource.value?.isLive && Hls.isSupported()) {
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
        hls.value.loadSource(resource.value.src)
        hls.value.attachMedia(player.value)
        hls.value.on(Hls.Events.MANIFEST_PARSED, (_, manifest) => {
          player.value.play()
          this.qualityList = manifest.levels.map((i) =>
            i.height ? `${i.height}p (${i.bitrate / 1000}kbps)` : 'Source'
          )
          if (localStorage.quality) this.selectedQuality = localStorage.quality
        })
      }, 100)
    }
    // Fuck you apple
    else if (player.value.canPlayType('application/vnd.apple.mpegurl')) {
      player.value.src = resource.value.src
      player.value.addEventListener('loadedmetadata', () => player.value.play())
    }
  }
)
onBeforeUnmount(() => {
  if (hls.value) hls.value.destroy()
})
</script>

<template>
  <video v-if="resource?.isLive" controls class="has-full-size" id="live-player"></video>
  <video v-else controls class="has-full-size" :src="`${resource?.src}`"></video>
</template>
