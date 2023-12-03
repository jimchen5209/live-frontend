import { ref, computed, onMounted, onUnmounted } from 'vue'

export const useRoute = () => {
  const route = ref(window.location.hash.substring(1))

  const splittedRoute = computed(() => {
    return route.value.split('/')
  })

  const profileName = computed(() => {
    return splittedRoute.value[0]
  })

  const isProfilePage = computed(() => {
    return splittedRoute.value.length === 1 || splittedRoute.value[1].split(':')[0] === ''
  })

  const isLive = computed(() => {
    return !isProfilePage.value ? splittedRoute.value[1].split(':')[0] === 'live' : false
  })

  const targetFilename = computed(() => {
    if (isProfilePage.value) return undefined
    return isLive.value ? `${profileName.value}.m3u8` : `${splittedRoute.value[1].split(':')[0]}.mp4`
  })

  const parameters = computed(() => {
    if (isProfilePage.value) return []
    return splittedRoute.value[1].split(':').slice(1)
  })

  const getParameter = (key) => { 
    const parameter = parameters.value.find((parameter) => parameter.startsWith(key))
    if (parameter === undefined) return undefined
    return parameter.split('=')[1]
  }

  const setParameter = (key, value) => {
    const newParameters = parameters.value.slice(0)
    const parameterIndex = newParameters.findIndex((parameter) => parameter.startsWith(key))
    if (parameterIndex === -1) {
      newParameters.push(`${key}=${value}`)
    } else {
      newParameters[parameterIndex] = `${key}=${value}`
    }
    
    const newUrl = new URL(window.location.href)
    newUrl.hash = `#${profileName.value}/${isLive.value ? 'live' : splittedRoute.value[1].split(':')[0]}:${newParameters.join(':')}`
    return {
      href: newUrl.href,
      hash: newUrl.hash
    }
  }

  const replaceHash = (hash) => {
    window.location.replace(hash)
  }

  const mergeUrl = () => {
    const route = window.location.hash.substring(1).split('/')
    if (route.length === 1) return
    if (
      (route[0] === 'record' && !route[1].startsWith('record')) ||
      (route[0] === 'live' && !route[1].startsWith('live'))
    ) {
      // Old Live
      // #record/cute_panda-1698758357.mp4
      // #live/cute_panda
      const isLive = route[0].startsWith('live')
      const profileName = isLive ? route[1] : route[1].split('-').slice(0, -1).join('-')
      const filename = route[1].replace('.mp4', '').replace('.flv', '')
      window.location.replace(`#${profileName}/${isLive ? 'live' : filename}`)
    } else if (route[0] === 'profile' && !route[1].startsWith('profile')) {
      // Beta Old Route
      // #profile/cute_panda/cute_panda-1698758357.mp4
      // #profile/cute_panda/cute_panda.m3u8
      const profileName = route[1]
      if (route.length === 2) {
        window.location.replace(`#${profileName}`)
      } else {
        const isLive = route[2] === `${profileName}.m3u8`
        const filename = route[2].replace('.mp4', '').replace('.flv', '')
        window.location.replace(`#${profileName}/${isLive ? 'live' : filename}`)
      }
    }
  }

  const updateRoute = () => {
    route.value = window.location.hash.substring(1)
    mergeUrl()
  }

  onMounted(() => {
    window.addEventListener('hashchange', updateRoute)
    mergeUrl()
  })

  onUnmounted(() => {
    window.removeEventListener('hashchange', updateRoute)
  })
  return {
    route,
    profileName,
    isProfilePage,
    isLive,
    targetFilename,
    parameters,
    getParameter,
    setParameter,
    replaceHash
  }
}
