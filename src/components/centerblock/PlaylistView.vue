<script setup>
import { computed, ref } from 'vue'
import RecordCard from './RecordCard.vue'

const props = defineProps({
  path_current: String,
  list: Array
})

const cardAmount = ref(-40)
const playlist = computed(() => {
  const pathlist = props.path_current.split('/')
  if (pathlist.length > 1) {
    return props.list?.filter((i) => i.streamer === pathlist.at(1))
  } else {
    return props.list
  }
})

const centerdiv = computed(() => document.getElementById('centerblock'))
const scrollTo = (x, y) => window.scroll(x, y)
</script>

<template>
  <!-- Todo Search -->
  <!-- Card View -->
  <!-- Grid -->
  <div
    class="ts-grid has-spaced-large mobile:is-2-columns tablet-desktop:is-3-columns widescreen:is-5-columns"
  >
    <!-- Column -->
    <div class="column" v-for:="i in playlist?.slice(cardAmount).reverse()">
      <RecordCard
        :key="i.name"
        :streamer="i.streamer"
        :publishTime="i.publishTime"
        :duration="i.duration"
        :src="i.src"
        :name="i.name"
        :isLive="'isLive' in i"
      />
    </div>
    <!-- Scroll top button -->
    <button
      class="tablet-:has-hidden ts-button is-start-icon is-wide is-fluid"
      @click="centerdiv.scroll(0, 0)"
    >
      <span class="ts-icon is-wheelchair-move-icon"></span>Top
    </button>
    <button
      class="desktop+:has-hidden ts-button is-start-icon is-wide is-fluid"
      @click="scrollTo(0, 0)"
    >
      <span class="ts-icon is-wheelchair-move-icon"></span>Top
    </button>
    <!-- Load more button -->
    <button
      v-if="playlist?.length > Math.abs(cardAmount)"
      class="ts-button is-wide is-outlined is-fluid"
      @click="cardAmount -= 40"
    >
      Load more
    </button>
    <button v-else class="ts-button is-wide is-outlined is-fluid is-disabled">No more</button>
  </div>
  <!-- Todo List View -->
</template>
