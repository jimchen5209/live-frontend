<script setup>
defineProps(
  {
    streamer: {
      type: Set,
      required: true
    }
  }
)
</script>

<template>
  <div class="ts-menu is-start-icon is-separate">
    <a class="item" href="/">
      <span class="ts-icon is-house-icon"></span> Home Page
    </a>
    <div class="ts-divider"></div>
    <a class="item" v-for:="i in streamer" v-bind:href="`#profile/${i}`">
      <!-- Todo hightlight when livestreaming. -->
      <span class="ts-icon is-video-icon"></span>{{ i }}
    </a>
  </div>
</template>