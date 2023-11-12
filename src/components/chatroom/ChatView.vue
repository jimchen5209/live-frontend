<script setup>
import { ref } from 'vue'

import MessageBubble from './MessageBubble.vue'

defineProps({
  viewerCount: Number,
  messages: Array,
  uuid: Array,
  nickname: String,
  ready: Boolean
})

defineEmits(['send-message', 'set-nickname'])

const historyRef = ref(null)
const message = ref('')

const followChat = () =>
  historyRef.value?.scrollTo({ top: historyRef.value?.scrollHeight, left: 0, behavior: 'smooth' })
</script>

<template>
  <div class="ts-app-layout is-vertical">
    <!-- Header -->
    <div class="cell">
      <div class="ts-content">
        <div class="ts-text is-bold is-center-aligned">Chatroom ({{ viewerCount }})</div>
      </div>
    </div>
    <!-- History -->
    <div ref="historyRef" class="cell is-fluid is-scrollable">
      <div class="ts-content">
        <MessageBubble
          v-if="messages"
          v-for:="(value, index) in messages.filter((i) => i.type === 'bulletScreenMessage')"
          v-on:vue:mounted="followChat()"
          :index="index"
          :is-self="uuid.includes(value.uuid)"
          :author="value.sentFrom"
          :text="value.msg"
        />
      </div>
    </div>
    <!-- Input -->
    <div class="cell">
      <div class="ts-content is-dense">
        <div class="ts-input is-start-labeled" :class="{ 'is-disabled': !ready }">
          <input
            class="label"
            style="padding-right: 0%; max-width: 33%"
            type="text"
            placeholder="Nickname"
            :value="nickname"
            @focusout="event => $emit('set-nickname', event.target.value)"
          />
          <input
            class="text"
            v-model="message"
            type="text"
            placeholder="Messages..."
            @keypress="
              (event) => {
                if (event.key === 'Enter' && message.length > 0) {
                  $emit('send-message', message)
                  message = ''
                  followChat()
                }
              }
            "
          />
        </div>
      </div>
    </div>
  </div>
</template>
