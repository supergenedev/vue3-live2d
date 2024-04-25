<template>
  <div ref="containerRef" class="l2d-container" :style="`background-image: url(${backgroundImage})`"></div>
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
  // isOuterBackground?: boolean;
  backgroundImage?: string;
}
const props = withDefaults(defineProps<VueLive2dProps>(), {
  modelDir: '',
  zoom: 1,
  // isOuterBackground: true,
  backgroundImage: '',
});

const containerRef = ref<HTMLDivElement>();

watch(containerRef, (ref) => {
  if (ref) {
    initL2d(ref);

    loadL2dAsset(props.resourcePath, props.modelDir);
  }
});

watch([() => props.resourcePath, () => props.modelDir], () => {
  loadL2dAsset(props.resourcePath, props.modelDir);
});

watch([() => props.zoom], ([zoom]) => {
  setZoom(zoom);
});

onBeforeUnmount(() => {
  releaseL2d();
});

defineExpose({
  setEmotion,
});
</script>

<style>
.l2d-container,
.l2d-canvas {
  width: 100%;
  height: 100%;
}
</style>
