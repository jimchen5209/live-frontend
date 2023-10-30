<script setup>
import RecordCard from './RecordCard.vue'

defineProps({
  playlist: Array
})
</script>

<template>
  <div class="cell is-horizontal">
    <!-- Todo Search -->
    <!-- Card View -->
    <!-- Grid -->
    <div class="ts-grid has-spaced-large mobile:is-3-columns tablet+:is-5-columns">
      <!-- Column -->
      <div class="column" v-for:="i in playlist?.slice(-99).reverse()">
        <RecordCard
          :streamer="i.streamer"
          :publishTime="i.publishTime"
          :duration="i.duration"
          :src="i.src"
          :name="i.name"
        />
      </div>
    </div>
    <!-- Todo List View -->
  </div>
</template>
