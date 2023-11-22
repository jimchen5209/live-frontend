<script setup>
defineEmits(['ageRestrict'])
</script>

<template>
  <div class="has-flex-center ts-container is-fluid" style="height: 100%; width: 100%">
    <div class="ts-segment is-collapsed">
      <div class="ts-blankslate">
        <div class="has-bottom-spaced-large ts-image is-small">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12rem"
            height="12rem"
            viewBox="0 0 472.41 320.9"
          >
            <polygon
              points="443.83 28.28 443.83 0 399.18 0 399.18 28.28 370.9 28.28 370.9 72.93 399.18 72.93 399.18 101.21 443.83 101.21 443.83 72.93 472.41 72.93 472.41 28.28 443.83 28.28"
              style="fill: var(--ts-gray-900)"
            />
            <path
              d="M80.37,13.99c-.89,13.99-8.93,47.03-67.87,47.03H0v49.12H69.96v202.72h66.68V10.13h-55.96l-.3,3.87h-.01Z"
              style="fill: var(--ts-gray-900)"
            />
            <path
              d="M333.1,150.03c19.35-12.8,29.47-33.04,29.47-58.94,0-39-30.66-80.97-97.64-80.97-56.56,0-95.85,34.83-95.85,84.84,0,25.3,10.42,44.65,30.96,57.45-40.19,22.33-40.19,59.83-40.19,74.72,0,43.16,27.68,93.77,106.27,93.77,83.94,0,106.27-65.19,106.27-99.72s-11.31-55.07-39.29-71.14h0Zm-66.38-20.55c-21.73,0-33.34-16.67-33.34-32.15,0-20.54,12.8-32.15,35.42-32.15,17.56,0,29.77,13.1,29.77,32.15-.3,19.65-12.5,32.15-31.85,32.15h0Zm-1.19,52.39c36.91,0,38.7,34.83,38.7,41.67,0,14.59-7.74,41.97-37.51,41.97-23.81,0-38.4-16.37-38.4-42.57,0-30.06,19.05-41.08,37.21-41.08h0Z"
              style="fill: var(--ts-gray-900)"
            />
          </svg>
        </div>
        <div class="header">年齡驗證</div>
        <div class="tablet-:has-hidden has-break-words description">
          網站包含有年齡限制的內容，包括裸體和露骨色情素材的內容。<br />
          進入即表示您確認您已年滿 18 歲，或在您造訪本網站時所在的司法管轄區已是成年人。
        </div>
        <div class="has-top-spaced-large ts-app-layout tablet-:is-horizontal desktop+:is-vertical">
          <button
            class="has-bottom-spaced-small tablet-:has-end-spaced ts-button is-fluid is-outlined is-large"
            @click="$emit('ageRestrict', +true)"
          >
            進入 Enter
          </button>
          <button class="ts-button is-fluid is-large" @click="$emit('ageRestrict', +false)">
            離開 Leave
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
