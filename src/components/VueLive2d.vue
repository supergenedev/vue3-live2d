<template>
  <div ref="containerRef" class="l2d-container"></div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';

import '../l2d/Core/live2dcubismcore';
import {
  initL2d,
  loadL2dAsset,
  setZoom,
  setEmotion,
  releaseL2d,
} from '../l2d/useL2d/main';

export interface VueLive2dProps {
  resourcePath: string;
  modelDir?: string;
  zoom?: number;
}
const props = withDefaults(defineProps<VueLive2dProps>(), {
  modelDir: '',
  zoom: 1,
});

const containerRef = ref<HTMLDivElement>();
const l2dAppId = ref<number>(-1);

watch(containerRef, (ref) => {
  if (ref) {
    initL2d(ref).then((appId) => {
      l2dAppId.value = appId;
      loadL2dAsset(l2dAppId.value, props.resourcePath, props.modelDir);
    });
  } else {
    releaseL2d(l2dAppId.value);
  }
});

watch([() => props.resourcePath, () => props.modelDir], () => {
  loadL2dAsset(l2dAppId.value, props.resourcePath, props.modelDir);
});

watch([() => props.zoom], ([zoom]) => {
  setZoom(l2dAppId.value, zoom);
});

onBeforeUnmount(() => {
  releaseL2d(l2dAppId.value);
});

function l2dSetEmotion(emotion: Parameters<typeof setEmotion>[1]) {
  setEmotion(l2dAppId.value, emotion);
}

defineExpose({
  setEmotion: l2dSetEmotion,
});
</script>

<style>
.l2d-container,
.l2d-canvas {
  width: 100%;
  height: 100%;
}
</style>
