<template>
    <div ref="containerRef" class="l2d-container">
    </div>
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue';

import '../l2d/Core/live2dcubismcore'
import {initL2d, releaseL2d} from '../l2d/useL2d/main'

export interface VueLive2dProps {
    resourcePath: string;
}
defineProps<VueLive2dProps>()

const containerRef = ref<HTMLDivElement>()

watch(containerRef, (ref) => {
    if (ref) {
        initL2d(ref)
    }
})

onBeforeUnmount(() => {
    releaseL2d()
})
</script>

<style scoped>
.l2d-container {
    width: 100%;
    height: 100%;
}
</style>

<style>
.l2d-canvas {
    width: 100%;
    height: 100%;
}
</style>