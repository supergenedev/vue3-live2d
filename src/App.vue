<template>
  <div class="vue-live2d-container">
    <button @click="onTest">test</button>
    <VueLive2d v-if="isShow" :resource-path="'./l2dSample/Resources/'" />
  </div>
</template>

<script setup lang="ts">
import { defineAsyncComponent, ref } from 'vue';

const isShow = ref(false);
function onTest() {
  isShow.value = !isShow.value;
}

const VueLive2d = defineAsyncComponent({
  // 로더 함수
  loader: async () => {
    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 1000);
    });
    const testCompo = await import('./components/VueLive2d.vue');
    return testCompo;
  },

  // 비동기 컴포넌트가 로드되는 동안 사용할 로딩 컴포넌트입니다.
  // loadingComponent: LoadingComponent,
  // 로딩 컴포넌트를 표시하기 전에 지연할 시간. 기본값: 200ms
  delay: 200,

  // 로드 실패 시 사용할 에러 컴포넌트
  // errorComponent: ErrorComponent,
  // 시간 초과 시, 에러 컴포넌트가 표시됩니다. 기본값: 무한대
  timeout: 3000,
});
</script>

<style scoped>
.vue-live2d-container {
  width: 500px;
  height: 500px;
}
</style>
