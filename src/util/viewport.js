import { ref, onMounted, onUnmounted } from 'vue'

export const useViewport = () => {
  const viewWidth = ref(Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0))
  const viewHeight = ref(
    Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
  )

  const updateViewport = () => {
    viewWidth.value = Math.max(document.documentElement.clientWidth || 0, window.innerWidth || 0)
    viewHeight.value = Math.max(document.documentElement.clientHeight || 0, window.innerHeight || 0)
  }

  onMounted(() => {
    window.addEventListener('resize', updateViewport)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', updateViewport)
  })

  return {
    viewWidth,
    viewHeight
  }
}
