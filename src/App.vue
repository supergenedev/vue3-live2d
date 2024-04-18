<template>
  <div class="vue-live2d-container">
    <button @click="onToggleVue3L2d">onToggleVue3L2d</button>
    <button @click="onChangeL2dAsset">onChangeL2dAsset</button>
    <div>
      <button @click="changeZoom(0.5)">zoom * 0.5</button>
      <button @click="changeZoom(1)">zoom * 1.0</button>
      <button @click="changeZoom(2)">zoom * 2.0</button>
    </div>
    <VueLive2d
      v-if="isShow"
      :resource-path="'./l2d/'"
      :model-name="modelName"
      :zoom="zoom"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref } from 'vue';

const isShow = ref(false);
function onToggleVue3L2d() {
  isShow.value = !isShow.value;
}

const modelIndex = ref(0);
const modelNames = ['Mei_2', 'Rinko', 'Ayase'];
const modelName = computed(() => modelNames[modelIndex.value]);
function onChangeL2dAsset() {
  modelIndex.value = (modelIndex.value + 1) % modelNames.length;
}

const zoom = ref(1.0);
function changeZoom(zoomSize: number) {
  zoom.value = zoomSize;
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
