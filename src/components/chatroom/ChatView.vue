<script setup>
import { onMounted, watch, ref, onUnmounted } from 'vue'

import MessageBubble from './MessageBubble.vue'

const props = defineProps({
  id_his: String,
  name: String,
  status_playable: Boolean
})

const wsServer = 'wss://live.oktw.one/ws'
const ws = ref(null)
const data_messages = ref([])
const nickname = ref('')
const message = ref('')
const isready = ref(false)

const action_setusername = (username) => {
  ws.value?.send(`{"method":"setName", "name":"${username}"}`)
}
const action_joinchannel = (channel) => {
  ws.value?.send(`{"method":"joinChannel","channelName":"${channel}"}`)
}
const action_sendmessage = (msg) => {
  ws.value?.send(`{"method":"sendBulletMessage","msg":"${msg}"}`)
}
const action_follow = () =>
  document
    .getElementById(props.id_his)
    .scrollTo(0, document.getElementById(props.id_his).scrollHeight)

onMounted(() => {
  if (props.status_playable) {
    ws.value = new WebSocket(wsServer)
    ws.value?.addEventListener('open', () => action_setusername(nickname.value))
    ws.value?.addEventListener('open', () => action_joinchannel(props.name))
    ws.value?.addEventListener('open', () => (isready.value = true))
    ws.value?.addEventListener('message', (event) => {
      data_messages.value.push(JSON.parse(event.data))
    })
    ws.value?.addEventListener('error', (e) => console.error(e))
    action_follow()
  }
})

onUnmounted(() => ws.value?.close())

watch(
  () => props.name,
  () => {
    ws.value?.close()
    if (props.status_playable) {
      ws.value = new WebSocket(wsServer)
      ws.value?.addEventListener('open', () => action_setusername(nickname.value))
      ws.value?.addEventListener('open', () => action_joinchannel(props.name))
      ws.value?.addEventListener('open', () => (isready.value = true))
      ws.value?.addEventListener('message', (event) => {
        console.log(event.data)
        data_messages.value.push(JSON.parse(event.data))
      })
      ws.value?.addEventListener('error', (e) => console.error(e))
      action_follow()
    }
  }
)
</script>

<template>
  <div class="ts-app-layout is-vertical">
    <!-- Header -->
    <div class="cell">
      <div class="ts-content">
        <div class="ts-text is-bold is-center-aligned">Chatroom</div>
      </div>
    </div>
    <!-- History -->
    <div :id="id_his" class="cell is-fluid is-scrollable">
      <div class="ts-content">
        <MessageBubble
          v-if="data_messages"
          v-for:="(value, index) in data_messages.filter((i) => i.type === 'bulletScreenMessage')"
          v-on:vue:mounted="action_follow()"
          :index="index"
          :isself="value.sentFrom === nickname"
          :author="value.sentFrom"
          :text="value.msg"
        />
      </div>
    </div>
    <!-- Input -->
    <div class="cell">
      <div class="ts-content is-dense">
        <div class="ts-input is-start-labeled">
          <input
            class="label"
            style="padding-right: 0%; max-width: 33%;"
            v-model="nickname"
            type="text"
            placeholder="Nickname"
            @focusout="action_setusername(nickname)"
          />
          <input
            class="text"
            v-model="message"
            type="text"
            placeholder="Messages..."
            @keypress="
              (event) => {
                if (event.key === 'Enter' && message.length > 0) {
                  action_sendmessage(message)
                  message = ''
                  action_follow()
                }
              }
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>
