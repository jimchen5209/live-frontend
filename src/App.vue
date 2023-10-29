<script setup>
import { ref, onMounted } from 'vue'

import StreamerList from './components/sidebar/StreamerList.vue'
import HeaderBlock from './components/sidebar/HeaderBlock.vue'

const url_live = '/live';
const url_record = '/record';
const url_list = `${url_record}/list.json`;

const streamer = ref(null);
const hist = ref(null);
onMounted(
  async () => {
    hist.value = await fetch(url_list)
      .then(res => res.json())
      .then(
        list => {
          if (list.length <= 0) throw "List empty.";
          return list
            .filter(e => "format" in e && e.format.size != 0)
            .map(
              e => {
                const filename = e.format.filename.split('/').at(-1);
                return {
                  streamer: filename.substring(0, filename.length - 15),
                  publishTime: new Date(
                    parseInt(
                      filename.substring(filename.length - 14, filename.length - 4) * 1000
                    )
                  ),
                  thumbSrc: `${url_record}/${filename.substring(0, filename.length - 3)}`,
                  duration: e.format.duration,
                  src: `${url_record}/${filename.substring(0, filename.length - 3)}.mp4`,
                  name: filename.substring(0, filename.length - 3) + "mp4",
                }
              }
            )
            .sort( // 我就想整理 爽
              (a, b) => {
                if (a.publishTime < b.publishTime) return -1
                else if (a.publishTime > b.publishTime) return 1
                else return 0;
              }
            )
        }
      )
      .catch(e => console.error(e));
    streamer.value = new Set(hist.value.map(i=>i.streamer));
  }
)
</script>

<template>
  <div class="ts-container is-fluid">
    <div class="ts-app-layout is-horizontal is-full">
      <!-- Side Bar -->
      <div class="cell is-scrollable is-vertical" style="width: 13%;">
        <HeaderBlock />
        <StreamerList v-bind:streamer="streamer" />
      </div>
      <!-- Player -->
      <div class="cell is-fluid is-scrollable is-vertical">
        <div class="cell" style="height: 80%;">
          <div class="ts-content">頂部欄</div>
        </div>
        <div class="cell">
          <div class="ts-content" v-for:="i in Array.from(Array(100).keys())">內容欄 {{ i }}</div>
        </div>
      </div>
      <!-- Chat -->
      <div class="cell" style="width: 18%;">
        <div class="ts-content">聊天室</div>
      </div>
    </div>
  </div>
</template>

<style scoped></style>
