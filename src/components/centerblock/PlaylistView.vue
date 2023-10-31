<script setup>
import RecordCard from './RecordCard.vue'

defineProps({
  playlist: Array
})
</script>

<template>
  <div class="cell">
    <!-- Todo Search -->
    <!-- Card View -->
    <!-- Grid -->
    <div class="ts-grid has-spaced-large tablet:is-2-columns desktop:is-3-columns widescreen:is-5-columns">
      <!-- Column -->
      <div class="column" v-for:="i in playlist?.slice(-99).reverse()">
        <RecordCard
          :streamer="i.streamer"
          :publishTime="i.publishTime"
          :duration="i.duration"
          :src="i.src"
          :name="i.name"
          :isLive="'isLive' in i"
        />
      </div>
    </div>
    <!-- Todo List View -->
  </div>
</template>
