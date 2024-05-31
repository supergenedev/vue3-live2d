<template>
  <div class="vue-live2d-container">

    <div>
      <p>Set Model</p>
      <button @click="onToggleVue3L2d">onToggleVue3L2d</button>
      <button @click="onChangeL2dAsset">onChangeL2dAsset</button>
    </div>
    <div>
      <p>Change Zoom</p>
      <button @click="onChangeZoom(0.5)">zoom * 0.5</button>
      <button @click="onChangeZoom(1)">zoom * 1.0</button>
      <button @click="onChangeZoom(2)">zoom * 2.0</button>
      <button @click="onChangeZoom(2.5)">zoom * 2.5</button>
      <button @click="onChangeZoom(3.5)">zoom * 3.5</button>
    </div>
    <div>
      <p>Change BG image Scale</p>
      <button @click="onBGScale(0.5)">zoom * 0.5</button>
      <button @click="onBGScale(1)">zoom * 1.0</button>
      <button @click="onBGScale(2)">zoom * 2.0</button>
    </div>
    <div>
      <p>Change Emotion</p>
      <button @click="onChangeEmotion('Abashed')">Abashed</button>
      <button @click="onChangeEmotion('Hate')">Hate</button>
      <button @click="onChangeEmotion('Lovestruck')">Lovestruck</button>
      <button @click="onChangeEmotion('Pleased')">Pleased</button>
      <button @click="onChangeEmotion('Sad')">Sad</button>
      <button @click="onChangeEmotion('Recharge')">Recharge</button>
      <button @click="onChangeEmotion('Discharge')">Discharge</button>
    </div>
    <div>
      <p>Change Battery</p>
      <button @click="onChangeBattery(0)">Battery 0</button>
      <button @click="onChangeBattery(1)">Battery 1</button>
    </div>
    <div>
      <p>Change Background Image Index</p>
      <button @click="backgroundImageIndex = (backgroundImageIndex+1) % backgroundImages.length">Current Index : {{ backgroundImageIndex }}</button>
    </div>
    <div style="height: 20px" />
    <VueLive2d
      v-if="isShow"
      ref="l2d"
      :resource-path="'./l2d/'"
      :model-dir="modelName"
      :zoom="zoom"
      :background-scale="scale"
      :background-image="backgroundImages[backgroundImageIndex]"
      :battery="battery"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent, ref, shallowRef } from 'vue';
import { Emotion } from './l2d/useL2d/lapplive2dmanager';

const l2d = shallowRef<InstanceType<typeof VueLive2d>>();

const isShow = ref(false);
function onToggleVue3L2d() {
  isShow.value = !isShow.value;
}

const modelIndex = ref(0);
const modelNames = ['Mei', 'Rinko', 'Ayase'];
const modelName = computed(() => modelNames[modelIndex.value]);
function onChangeL2dAsset() {
  modelIndex.value = (modelIndex.value + 1) % modelNames.length;
}

const zoom = ref(1.0);
function onChangeZoom(zoomSize: number) {
  zoom.value = zoomSize;
}
const scale = ref(1);
function onBGScale(scaleSize: number) {
  scale.value = scaleSize;
}

function onChangeEmotion(_emotion: Emotion) {
  l2d.value?.setEmotion(_emotion);
}

const battery = ref(0);
function onChangeBattery(_battery: number) {
  battery.value = _battery;
}
const backgroundImageIndex = ref(0);
const backgroundImages = [
  'https://media-prod.al-pha.ai/4k80c21x216oulokbkgsy5oxrk0v', 
  'https://media-prod.al-pha.ai/jhpbv4jwi39f7km6pzhm066152nk', 
  'https://media-prod.al-pha.ai/o6hww867vgp57lyt6zh0oe6nihnv'
];

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
  width: 300px;
  height: 800px;
}
</style>
