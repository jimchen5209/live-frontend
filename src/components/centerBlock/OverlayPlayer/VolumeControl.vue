<script setup>
defineProps({
  volume: {
    type: Number,
    required: true
  },
  isMuted: {
    type: Boolean,
    required: true
  }
})

defineEmits(['mute-button-pointerup', 'volume-mousewheel', 'update:volume'])
</script>

<template>
  <div class="is-flex">
    <button
      class="button has-flex-center"
      @pointerup="$emit('mute-button-pointerup', $event)"
      @wheel="$emit('volume-mousewheel', $event)"
    >
      <span v-if="isMuted" class="ts-icon tablet+:is-big is-volume-xmark-icon" />
      <span v-else-if="volume === 0" class="ts-icon tablet+:is-big is-volume-off-icon" />
      <span v-else-if="volume <= 50" class="ts-icon tablet+:is-big is-volume-low-icon" />
      <span v-else class="ts-icon tablet+:is-big is-volume-high-icon" />
    </button>
    <input
      type="range"
      class="mobile:has-hidden has-cursor-pointer player-slider"
      :value="volume"
      :max="100"
      step="any"
      @input="$emit('update:volume', $event.target.value)"
      @wheel="$emit('volume-mousewheel', $event)"
    />
    <span class="mobile:has-hidden">{{ Math.round(volume) }}%</span>
  </div>
</template>

<style scoped>
.button {
  width: 30px;
  height: 30px;
}

.is-flex {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

/* Workaround tocas-ui's important */
.auto-hidden .has-cursor-pointer,
.auto-hidden button {
  cursor: none !important;
}
</style>
