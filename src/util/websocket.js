import { ref, onUnmounted } from 'vue'

const wsServer = 'wss://live.oktw.one/ws'
const wsSetName = (name) => JSON.stringify({ method: 'setName', name })
const wsJoinChannel = (channelName) => JSON.stringify({ method: 'joinChannel', channelName })
const wsSendBulletMessage = (msg) => JSON.stringify({ method: 'sendBulletMessage', msg })

export const useChat = () => {
  const ws = ref(null)

  const messages = ref([])
  const nickname = ref(localStorage.getItem('config_nickname') ?? 'anonymous')
  const uuid = ref([])
  const viewerCount = ref(0)
  const readyState = ref(false)

  const setNickname = (name) => {
    localStorage.setItem('config_nickname', name)
    ws.value?.send(wsSetName(name))
  }
  const joinChannel = (channel) => {
    ws.value?.send(wsJoinChannel(channel))
  }
  const sendMessage = (message) => {
    ws.value?.send(wsSendBulletMessage(message))
  }

  const connect = (channel) => {
    ws.value = new WebSocket(wsServer)
    ws.value?.addEventListener('open', () => {
      setNickname(nickname.value)
      joinChannel(channel)
      readyState.value = true
    })
    ws.value?.addEventListener('close', (event) => {
      readyState.value = false
      if (event.code === 1006) setTimeout(() => connect(channel), 2000)
    })
    ws.value?.addEventListener('message', (event) => {
      const data = JSON.parse(event.data)
      if ('nowViewerCount' in data && data.uuid) {
        uuid.value.push(data.uuid)
        viewerCount.value = data.nowViewerCount
      }
      messages.value.push(data)
    })
    ws.value?.addEventListener('error', (e) => {
      console.error(e)
      readyState.value = false
    })
  }

  const disconnect = () => {
    ws.value?.close()
    ws.value = null
    messages.value = []
    uuid.value = []
    readyState.value = false
  }

  onUnmounted(() => {
    disconnect()
  })

  return {
    messages,
    nickname,
    uuid,
    viewerCount,
    readyState,
    setNickname,
    sendMessage,
    connect,
    disconnect
  }
}
