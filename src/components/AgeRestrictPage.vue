<script setup>
defineEmits(['ageRestrict'])
</script>

<template>
  <div class="has-flex-center ts-container is-fluid" style="height: 100%; width: 100%">
    <div class="ts-segment is-collapsed">
      <div class="ts-blankslate">
        <div class="has-bottom-spaced-large ts-image is-small">
          <img
            src="data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512' %3e%3cpath d='M100 504.5C49 504.5 7.5 463 7.5 412V100C7.5 49 49 7.5 100 7.5h312c51 0 92.5 41.5 92.5 92.5v312c0 51-41.5 92.5-92.5 92.5H100z' fill='%23be1a34'/%3e%3cpath d='M412 15c22.6 0 43.9 8.9 60 25s25 37.4 25 60v312c0 22.6-8.9 43.9-25 60s-37.4 25-60 25H100c-22.6 0-43.9-8.9-60-25s-25-37.4-25-60V100c0-22.6 8.9-43.9 25-60s37.4-25 60-25h312m0-15H100C45 0 0 45 0 100v312c0 55 45 100 100 100h312c55 0 100-45 100-100V100C512 45 467 0 412 0h0zm-4.3 113.4h-47.3V93.8h47.3V43.5h20.5v50.3h47.3v19.6h-47.3v50.3h-20.5v-50.3zM163.4 425.6h-49.1V247.1l.4-26.9 1.2-26.5c-2.2 2.7-5 5.8-8.6 9.2l-11.5 10.9L66.1 239l-25.7-30.2 81.6-70.4h41.4v287.2zm139.8-291.1c24.1 0 44 5.9 59.5 17.7C378.3 164 386 181 386 203.3c0 16.6-4.4 30.6-13.3 42-8.8 11.4-20.7 21.1-35.4 29.2 16.1 9.1 29.6 19.7 40.6 31.8s16.5 27.1 16.5 45c0 15.8-3.8 29.6-11.3 41.4s-18 20.9-31.6 27.3c-13.5 6.4-29.4 9.7-47.7 9.7-29.5 0-52.2-6.8-68.2-20.5s-23.9-32.4-23.9-56.3c0-18.2 4.9-33.6 14.7-46 9.8-12.5 22.5-22.9 38-31.2-13.4-8.8-24.1-19.1-32.2-30.8-8-11.7-12.1-25.5-12.1-41.6 0-14.7 3.6-27.2 10.9-37.4 7.2-10.2 17.2-18 29.8-23.3 12.8-5.4 26.8-8.1 42.4-8.1zM259 351.2c0 11.5 3.6 21.1 10.9 28.8s18.2 11.5 33 11.5c14.7 0 25.9-3.7 33.4-11.1s11.3-17.2 11.3-29.6c0-10.7-3.9-20.1-11.7-28.1s-17.7-15.4-29.8-22.1l-6-3.6c-13.4 7-23.6 14.7-30.6 23.3-7.1 8.6-10.5 18.9-10.5 30.9zm44.2-178.5c-10.5 0-19 3-25.7 8.8-6.7 5.9-10.1 14.2-10.1 24.9 0 11 3.4 20 10.3 27.1 6.8 7.1 15.5 13.5 25.9 19.1 10.7-5.6 19.4-12 25.9-19.1 6.6-7.1 9.9-16.2 9.9-27.1 0-10.7-3.4-19-10.1-24.9s-15.4-8.8-26.1-8.8z' fill='%23f5f5f5'/%3e%3c/svg%3e"
            alt="r18 icon"
          />
        </div>
        <div class="header">年齡驗證</div>
        <div class="has-bottom-spaced-large has-break-words description">
          網站包含有年齡限制的內容，包括裸體和露骨色情素材的內容。<br />
          進入即表示您確認您已年滿 18 歲，或在您造訪本網站時所在的司法管轄區已是成年人。
        </div>
        <div class="ts-app-layout tablet-:is-horizontal desktop+:is-vertical">
          <button
            class="has-bottom-spaced-small tablet-:has-end-spaced ts-button is-fluid is-outlined"
            @click="$emit('ageRestrict', +true)"
          >
            進入 Enter
          </button>
          <button class="ts-button is-fluid" @click="$emit('ageRestrict', +false);">
            離開 Leave
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
