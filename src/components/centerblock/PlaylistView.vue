<script setup>
import { computed, ref } from 'vue'
import RecordCard from './RecordCard.vue'

const props = defineProps({
  currentPath: String,
  hist: Array
});

const cardAmount = ref(-40);
const playlist = computed(() => {
  const pathlist = props.currentPath.split('/')
  if (pathlist.length > 1) {
    return props.hist
      ?.filter((i) => i.streamer === pathlist.at(1))
  } else {
    return props.hist
  }
});
</script>

<template>
  <div class="cell">
    <!-- Todo Search -->
    <!-- Card View -->
    <!-- Grid -->
    <div
      class="ts-grid has-spaced-large tablet:is-2-columns desktop:is-3-columns widescreen:is-5-columns"
    >
      <!-- Column -->
      <div class="column" v-for:="i in playlist?.slice(cardAmount).reverse()">
        <RecordCard
          :streamer="i.streamer"
          :publishTime="i.publishTime"
          :duration="i.duration"
          :src="i.src"
          :name="i.name"
          :isLive="'isLive' in i"
        />
      </div>
      <!-- Load more button -->
      <button v-if="playlist?.length > Math.abs(cardAmount)" class="ts-button is-wide is-outlined is-fluid" @click="cardAmount -= 40">
        Load more
      </button>
      <button v-else class="ts-button is-wide is-outlined is-fluid is-disabled">No more</button>
    </div>
    <!-- Todo List View -->
  </div>
</template>
