<script setup>
defineProps({
  index: Number,
  isself: Boolean,
  author: String,
  text: String
})
</script>

<template>
  <div class="ts-conversation is-sent" :class="{ 'is-self': isself, 'has-top-spaced': index > 0 }">
    <div class="has-break-all content">
      <div class="bubble">
        <div class="author">{{ author }}</div>
        <div class="text">{{ text }}</div>
        <div class="meta">
          <div class="item">{{ new Date(Date.now()).toLocaleTimeString('en-US') }}</div>
        </div>
      </div>
    </div>
  </div>
</template>
