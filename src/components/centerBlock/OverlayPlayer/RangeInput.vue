<!-- https://blog.logrocket.com/creating-custom-css-range-slider-javascript-upgrades/ -->
<!-- https://stackoverflow.com/questions/39069993/show-input-range-value-on-hover -->
<script setup>
import { onMounted, ref, watch } from 'vue'

const props = defineProps({
  inputClass: {
    type: String,
  },
  modelValue: {
    type: Number,
  },
  value: {
    type: Number,
  },
  min: {
    type: Number,
  },
  max: {
    type: Number,
  },
  step: {
    type: String,
  },
  timeRange: {
    type: Object,
  },
  list:{
    type: String,
  },
  tooltipValue: {
    type: Function,
    default: (value) => Math.round(value)
  },
  showTooltip: {
    type: Boolean,
    default: true
  }
})
const emit = defineEmits(['input', 'wheel', 'update:modelValue'])

const sliderRef = ref(null)
const tooltipRef = ref(null)

const toProgress = (value) => {
  return (value / sliderRef.value.max) * 100
}

const updateBackground = (value) => {
  const list = []
  if (!props.timeRange) {
    list.push(`var(--range-fg-color) ${toProgress(value)}%`)
    list.push(`var(--range-bg-color) ${toProgress(value)}%`)
  } else {
    list.push(`var(--range-fg-color) 0%, var(--range-fg-color) ${toProgress(value)}%`)
    let lastValue = value
    for (let i = 0; i < props.timeRange.length; i++) {
      const start = props.timeRange.start(i)
      const end = props.timeRange.end(i)
      if (end < value) continue
      if (start > lastValue) {
        list.push(`var(--range-bg-color) ${toProgress(lastValue)}%`)
        list.push(`var(--range-bg-color) ${toProgress(start)}%`)
      }
      list.push(`var(--range-buffered-color) ${toProgress(Math.max(lastValue, start))}%`)
      list.push(`var(--range-buffered-color) ${toProgress(end)}%`)
      lastValue = end
    }
    if (lastValue < sliderRef.value.max) {
      list.push(`var(--range-bg-color) ${toProgress(lastValue)}%`)
      list.push(`var(--range-bg-color) 100%`)
    }
  }
  sliderRef.value.style.background = `linear-gradient(to right, ${list.join(', ')})`
}

const onSliderInput = (event) => {
  updateBackground(event.target.value)
  emit('update:modelValue', event.target.value)
  emit('input', event)
}

const onInputMouseMove = (event) => {
  if (!props.showTooltip) return
  const w = sliderRef.value.clientWidth
  const x = event.offsetX
  const percents = (x - 5) / (w - 10)
  const min = sliderRef.value.min
  const max = sliderRef.value.max
  tooltipRef.value.innerHTML = props.tooltipValue(Math.max(min, Math.min(max, percents * max)))
  const tooltipWidth = tooltipRef.value.clientWidth
  tooltipRef.value.style.left = `${x - tooltipWidth / 2}px`
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
  if (props.modelValue) 
    updateBackground(props.modelValue)
  if (props.value)
    updateBackground(props.value)
})
</script>

<template>
  <div style="position: relative">
    <input
      ref="sliderRef"
      type="range"
      :value="modelValue ?? value"
      :min="min"
      :max="max"
      :step="step"
      :list="list"
      :class="[inputClass, { 'with-list': list }]"
      @input="onSliderInput"
      @wheel="$emit('wheel', $event)"
      @mousemove="onInputMouseMove"
    />
    <p v-if="showTooltip" ref="tooltipRef" id="tooltip">0</p>
  </div>
</template>

<style scoped>
#tooltip {
  display: none;
  position: absolute;
}

input[type='range']:hover ~ #tooltip {
  display: block;
  background: var(--ts-gray-200);
  color: #fff;
  padding: 5px 10px;
  border-radius: 5px;
  font-size: 12px;
  top: -40px;
  z-index: 300;
}

input[type='range'] {
  --range-fg-color: var(--ts-primary-500);
  --range-buffered-color: color-mix(in srgb, var(--ts-static-gray-400), transparent 40%);
  --range-bg-color: color-mix(in srgb, var(--ts-static-gray-500), transparent 40%);
  /* removing default appearance */
  -webkit-appearance: none;
  appearance: none;
  /* creating a custom design */
  width: 100%;
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

/* Thumb: webkit with ticks */
input[type='range'].with-list::-webkit-slider-thumb {
  margin-top: -14px;
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
