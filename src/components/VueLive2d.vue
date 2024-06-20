<template>
  <div ref="containerRef" class="l2d-container">
    <div class="l2d-background"/>
  </div>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue';

import '../l2d/Core/live2dcubismcore';
import {
  initL2d,
  loadL2dAsset,
  setZoom,
  setEmotion,
  releaseL2d,
  setMotionGroupIdle,
} from '../l2d/useL2d/main';
import { IdleEmotion } from 'src/l2d/useL2d/lapplive2dmanager';

export interface VueLive2dProps {
  resourcePath: string;
  modelDir?: string;
  zoom?: number;
  backgroundImage?: string;
  backgroundScale?: number;
  centerX?: number;
  centerY?: number;
  idle?: IdleEmotion;
  offDefaultMove?: boolean;
}
const props = withDefaults(defineProps<VueLive2dProps>(), {
  modelDir: '',
  zoom: 1,
  backgroundImage: '',
  backgroundScale: 1,
  centerX: 0.53,
  centerY: 0.5,
  idle: 'Calm',
  offDefaultMove: false
});

const backgroundImage = computed(()=>{
  return `url(${props.backgroundImage})` 
})

const backgroundScale = computed(()=>{
  return `scale(${props.backgroundScale})`
})

const containerRef = ref<HTMLDivElement>();

watch(containerRef, (ref) => {
  if (ref) {
    initL2d(ref);

    loadL2dAsset(props.resourcePath, props.modelDir, {x: props.centerX, y: props.centerY}, props.offDefaultMove);
  }
});

watch([() => props.resourcePath, () => props.modelDir], () => {
  loadL2dAsset(props.resourcePath, props.modelDir, {x: props.centerX, y: props.centerY}, props.offDefaultMove);
});

watch([() => props.zoom, () => props.centerX, () => props.centerY], ([zoom, x, y]) => {
  setZoom(zoom, x, y);
});

watch([()=>props.idle], ([idle]) => {
  setMotionGroupIdle(idle);
})
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
.l2d-container {
  position: relative;
  overflow: hidden;
}
.l2d-background {
  position: absolute;
  z-index: -1;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-image: v-bind(backgroundImage);
  transform: v-bind(backgroundScale);
  -webkit-transform: v-bind(backgroundScale);
  -moz-transform: v-bind(backgroundScale);
  -o-transform: v-bind(backgroundScale);
}
</style>
