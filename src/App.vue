<script setup>
import { ref, onMounted, watch, computed } from 'vue'

import HeaderBlock from './components/sidebar/HeaderBlock.vue'
import StreamerList from './components/sidebar/StreamerList.vue'
import PlaylistView from './components/centerblock/PlaylistView.vue'
import MediaPlayer from './components/centerblock/MediaPlayer.vue'
import ChatView from './components/chatroom/ChatView.vue'
import ErrorBlankSlate from './components/ErrorBlankSlate.vue'

const url_live = '/live'
const url_record = '/record'
const url_list = `${url_record}/list.json`

const list_livestream = ref([])
const list_records = ref([])

const status_mobile = computed(() => window.innerWidth <= 1023)
const status_error = ref(false)

onMounted(async () => {
  // Data fetching
  list_records.value = await fetch(url_list)
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
            src: `${url_record}/${filename.replace('flv', 'mp4')}`,
            name: filename
          }
        })
        .sort(
          // 我就想整理 爽
          (a, b) => a.publishTime - b.publishTime
        )
    })
    .catch(() => (status_error.value = true))

  list_livestream.value = (
    await Promise.all(
      Array.from(new Set(list_records.value.toReversed().map((i) => i.streamer)).values()).map(
        async (i) => {
          const url_livestream = `${url_live}/${i}.m3u8`
          return {
            streamer: i,
            publishTime: new Date(Date.now()),
            duration: '0',
            src: url_livestream,
            name: `${i}.m3u8`,
            isLive: (await fetch(url_livestream)).ok
          }
        }
      )
    )
  ).sort((a, b) => (a.isLive === b.isLive ? 0 : a.isLive ? -1 : 1))
})

// Custom Routing
const path_current = ref(window.location.hash)
window.addEventListener('hashchange', () => {
  path_current.value = window.location.hash
})

const status_playable = ref(path_current.value.split('/').length > 2)

// 來點回頂部
watch(
  () => path_current.value,
  () => {
    const menu = document.getElementById('menu-mobile')
    if (!menu.getAttribute('class').match('has-hidden'))
      menu.setAttribute('class', `${menu.getAttribute('class')} has-hidden`)
    window.scrollTo(0, 0)
    document.getElementById('centerblock').scrollTo(0, 0)
    status_playable.value = path_current.value.split('/').length > 2
  }
)

// 相容舊的
const p = path_current.value.split('/').at(-1)
if (path_current.value?.startsWith('#record')) {
  // #record/cute_panda-1698758357.mp4
  window.location.replace(`#profile/${p.split('-').at(0)}/${p}`) // #profile/cute_panda/cute_panda-1698758357.mp4
} else if (path_current.value?.startsWith('#live')) {
  // #record/cute_panda-1698758357.mp4
  window.location.replace(`#profile/${p.split('-').at(0)}/${p.split('-').at(0)}.m3u8`) // #profile/cute_panda/cute_panda.m3u8
}
</script>

<template>
  <ErrorBlankSlate v-if="status_error" />
  <div v-else class="ts-app-layout is-vertical is-full">
    <!-- StreamerList for mobile user -->
    <div class="cell desktop+:has-hidden">
      <div class="ts-app-topbar">
        <div class="start">
          <a class="item" data-toggle="menu:has-hidden">
            <span class="ts-icon is-bars-icon"></span>
          </a>
          <div class="item is-text">StreamerList</div>
        </div>
        <div id="menu-mobile" class="content has-hidden" data-name="menu">
          <HeaderBlock />
          <StreamerList
            v-if="list_livestream"
            :list_livestream="list_livestream"
            :path="path_current"
          />
        </div>
      </div>
    </div>
    <!-- Basic Layout for desktop user -->
    <div class="ts-app-layout is-horizontal">
      <div id="sidebar" class="tablet-:has-hidden cell is-scrollable">
        <HeaderBlock />
        <StreamerList
          v-if="list_livestream"
          :list_livestream="list_livestream"
          :path="path_current"
        />
      </div>
      <div id="centerblock" class="cell is-fluid desktop+:is-scrollable">
        <div class="ts-app-layout is-vertical">
          <div v-if="status_playable" class="cell" style="display: inline-flex">
            <MediaPlayer
              v-if="list_livestream"
              :key="path_current"
              :path_curr="path_current"
              :list="list_records.concat(list_livestream.filter((i) => i.isLive))"
            />
          </div>
          <div class="tablet-:has-hidden cell">
            <PlaylistView
              v-if="list_livestream"
              :key="path_current"
              :path_current="path_current"
              :list="list_records.concat(list_livestream.filter((i) => i.isLive))"
            />
          </div>
        </div>
      </div>
      <div v-if="status_playable" id="chatbar" class="tablet-:has-hidden cell">
        <ChatView
          v-if="!status_mobile"
          :key="path_current"
          :id_his="'desktop-history'"
          :name="path_current.split('/').at(-1)"
          :status_playable="status_playable"
        />
      </div>
    </div>
    <!-- Chat and Playlist for mobile user -->
    <div v-if="status_playable" class="desktop+:has-hidden cell" style="height: 80vh">
      <ChatView
        v-if="status_mobile"
        :key="path_current"
        :id_his="'mobile-history'"
        :name="path_current.split('/').at(-1)"
        :status_playable="status_playable"
      />
    </div>
    <div class="desktop+:has-hidden cell">
      <PlaylistView
        v-if="list_livestream"
        :key="path_current"
        :path_current="path_current"
        :list="list_records.concat(list_livestream.filter((i) => i.isLive))"
      />
    </div>
  </div>
</template>

<style scoped>
#sidebar {
  width: 13%;
}
#chatbar {
  width: 18%;
}
</style>
