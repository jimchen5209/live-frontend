<script setup>
import { ref, onMounted } from 'vue'

import StreamerList from './components/sidebar/StreamerList.vue'
import HeaderBlock from './components/sidebar/HeaderBlock.vue'
import PlaylistView from './components/centerblock/PlaylistView.vue'

const url_live = '/live'
const url_record = '/record'
const url_list = `${url_record}/list.json`

const streamer = ref([])
const hist = ref(null)
onMounted(async () => {
  hist.value = await fetch(url_list)
    .then((res) => res.json())
    .then((list) => {
      if (list.length <= 0) throw 'List empty.'
      return list
        .filter((e) => 'format' in e && e.format.size != 0)
        .map((e) => {
          const filename = e.format.filename.split('/').at(-1)
          return {
            streamer: filename.substring(0, filename.length - 15),
            publishTime: new Date(
              parseInt(filename.substring(filename.length - 14, filename.length - 4) * 1000)
            ),
            duration: e.format.duration,
            src: `${url_record}/${filename.substring(0, filename.length - 4)}`,
            name: filename
          }
        })
        .sort(
          // 我就想整理 爽
          (a, b) => a.publishTime - b.publishTime
        )
    })
    .catch((e) => console.error(e))

  streamer.value = (
    await Promise.all(
      Array.from(new Set(hist.value.map((i) => i.streamer)).values()).map(async (i) => {
        return {
          name: i,
          status: (await fetch(`${url_live}/${i}.m3u8`)).ok
        }
      })
    )
  ).sort((a, b) => (a.status === b.status ? 0 : a.status ? -1 : 1))
})
</script>

<template>
  <div class="ts-container is-fluid">
    <div class="ts-app-layout is-horizontal is-full">
      <!-- Side Bar -->
      <div class="cell is-scrollable is-vertical" style="width: 13%">
        <HeaderBlock />
        <StreamerList :streamer="streamer" />
      </div>
      <!-- Center -->
      <div class="cell is-fluid is-scrollable is-vertical">
        <!-- Player -->
        <div class="cell" style="height: 80%">
          <div class="ts-content">頂部欄</div>
        </div>
        <!-- Playlist -->
        <PlaylistView :playlist="hist" />
      </div>
      <!-- Chat -->
      <div class="cell" style="width: 18%">
        <div class="ts-content">聊天室</div>
      </div>
    </div>
  </div>
</template>
