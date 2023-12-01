<!-- https://blog.logrocket.com/creating-custom-css-range-slider-javascript-upgrades/ -->
<script setup>
import { onMounted, ref, watch } from 'vue'

const props = defineProps(['modelValue', 'value', 'min', 'max', 'step'])
const emit = defineEmits(['input', 'wheel', 'update:modelValue'])

const sliderRef = ref(null)

const updateBackground = (value) => {
  const progress = (value / sliderRef.value.max) * 100
  sliderRef.value.style.background = `linear-gradient(to right, var(--range-fg-color) ${progress}%, var(--range-bg-color) ${progress}%)`
}

const onSliderInput = (event) => {
  updateBackground(event.target.value)
  emit('update:modelValue', event.target.value)
  emit('input', event)
}

watch(
  () => props.value,
  (value) => {
    updateBackground(value)
  }
)

watch(
  () => props.modelValue,
  (value) => {
    updateBackground(value)
  }
)

onMounted(() => {
  if (props.modelValue) {
    updateBackground(props.modelValue)
    return
  }
  updateBackground(props.value)
})
</script>

<template>
  <input
    ref="sliderRef"
    type="range"
    :value="modelValue ?? value"
    :min="min"
    :max="max"
    :step="step"
    @input="onSliderInput"
    @wheel="$emit('wheel', $event)"
  />
</template>

<style scoped>
input[type='range'] {
  --range-fg-color: var(--ts-primary-500);
  --range-bg-color: #ccc;
  /* removing default appearance */
  -webkit-appearance: none;
  appearance: none;
  /* creating a custom design */
  outline: none;
  border-radius: 15px;

  /* New additions */
  height: 6px;
  background: var(--range-bg-color);
}

/* Thumb: webkit */
input[type='range']::-webkit-slider-thumb {
  /* removing default appearance */
  -webkit-appearance: none;
  appearance: none;
  /* creating a custom design */
  height: 15px;
  width: 15px;
  background-color: var(--range-fg-color);
  border-radius: 50%;
  border: none;

  transition: 0.2s ease-in-out;
}

/* Thumb: Firefox */
input[type='range']::-moz-range-thumb {
  height: 15px;
  width: 15px;
  background-color: var(--range-fg-color);
  border-radius: 50%;
  border: none;

  transition: 0.2s ease-in-out;
}

/* Workaround tocas-ui's important */
.auto-hidden .has-cursor-pointer {
  cursor: none !important;
}
</style>
