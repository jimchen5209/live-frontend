<script setup>
defineProps({
  resource: {
    type: Object,
    required: true
  },
  qualityList: {
    type: Array,
    default: () => []
  },
  currentQuality: {
    type: Number,
    default: -1
  }
})
defineEmits(['change-quality'])
</script>

<template>
  <div class="cell">
    <div class="ts-grid is-1-columns tablet+:is-2-columns has-padded style-background">
      <div v-if="resource" class="column is-flexbox">
        <div class="item is-text style-text">{{ resource.streamer }}</div>
        <div v-if="resource.isLive" class="ts-chip is-small is-start-spaced style-live-chip">
          Live
        </div>
        <div v-else class="ts-chip is-outlined is-small is-start-spaced style-record-chip">
          {{
            `${resource.publishTime.toLocaleDateString()} ${resource.publishTime.toLocaleTimeString()}`
          }}
        </div>
      </div>
      <div v-if="qualityList.length > 1" class="column is-flexbox">
        <div style="flex-shrink: 0">
          <div class="item is-text style-text">Quality Select:</div>
        </div>
        <div class="is-text has-start-spaced has-full-width">
          <!-- Selected -->
          <div class="ts-select is-fluid" data-dropdown="select">
            <div class="content">
              {{ currentQuality == -1 ? 'Auto' : qualityList[currentQuality] }}
            </div>
          </div>
          <!-- Options -->
          <div class="ts-dropdown style-text" data-name="select" data-position="bottom-start">
            <button class="item" @click="$emit('change-quality', -1)">Auto</button>
            <button
              class="item"
              v-for:="(quality, index) in qualityList"
              @click="$emit('change-quality', index)"
            >
              {{ quality }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<style scoped>
.is-text {
  line-height: normal;
}
.is-flexbox {
  display: flex;
  align-items: center;
}
.style-background {
  background-color: var(--ts-gray-200);
}
.style-text {
  color: var(--ts-gray-900);
}
.style-live-chip {
  background-color: #ff4141;
  border-color: #ff4141;
  color: #fff;
}
.style-record-chip {
  color: var(--ts-gray-500);
  border-color: var(--ts-gray-500);
}
</style>
