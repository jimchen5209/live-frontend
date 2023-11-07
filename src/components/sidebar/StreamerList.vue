<script setup>
defineProps({
  path: String,
  list_livestream: Array
})
</script>

<template>
  <div class="ts-menu is-start-icon is-separated" style="margin-right: 0.5vw">
    <a class="item" href="#"> <span class="ts-icon is-house-icon"></span> Home Page </a>
    <div class="ts-divider"></div>
    <a
      class="item"
      v-for:="i in list_livestream"
      :href="`#profile/${i.streamer}`"
      :class="{ 'is-active': path.split('/').at(1) === i.streamer }"
    >
      <span v-if="i.isLive" class="ts-icon is-video-icon is-negative"></span>
      <span v-else class="ts-icon is-video-icon"></span>
      {{ i.streamer }}
    </a>
  </div>
</template>
