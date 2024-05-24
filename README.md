# Vue 3 + TypeScript + Vite

This template should help get you started developing with Vue 3 and TypeScript in Vite. The template uses Vue 3 `<script setup>` SFCs, check out the [script setup docs](https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup) to learn more.

## Recommended Setup

- [VS Code](https://code.visualstudio.com/) + [Vue - Official](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (previously Volar) and disable Vetur

- Use [vue-tsc](https://github.com/vuejs/language-tools/tree/master/packages/tsc) for performing the same type checking from the command line, or for generating d.ts files for SFCs.

## 로드 방법
```
<template>
<ClientOnly>
    <VueLive2d></VueLive2d>
</ClientOnly>
</template>

<script setup lang="ts">
import { VueLive2d } from 'vue3-live2d';
import 'vue3-live2d/style.css';
</script>

```

## git submodule 로 사용 시, 커밋 최신화 방법
```
cd [vue3-live2d 경로]
git pull origin main
npm run build
```