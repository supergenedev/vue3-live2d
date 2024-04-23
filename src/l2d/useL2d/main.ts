/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { Emotion } from './lapplive2dmanager';
import { LAppMain } from './lappmain';

let isLoad = document.readyState === 'complete';
const initL2dResolver: (() => {})[] = [];
const l2dAppMap = new Map<number, LAppMain>();
let l2dAppId: number = 1;

window.addEventListener(
  'load',
  (): void => {
    isLoad = true;

    while (initL2dResolver.length > 0) {
      const fn = initL2dResolver.pop();
      fn && fn();
    }
  },
  { passive: true },
);

export async function createL2dApp(container: HTMLDivElement) {
  const newL2dApp = new LAppMain(container);

  l2dAppId += 1;
  l2dAppMap.set(l2dAppId, newL2dApp);

  return l2dAppId;
}

export async function initL2d(container: HTMLDivElement) {
  if (!isLoad) {
    await new Promise((resolve) => {
      initL2dResolver.push(() => resolve);
    });
  }

  const newL2dAppId = createL2dApp(container);
  return newL2dAppId;
}

export function releaseL2d(appId: number) {
  const targetApp = l2dAppMap.get(appId);

  if (!targetApp) {
    return;
  }

  targetApp.release();
  l2dAppMap.delete(appId);
}

export function loadL2dAsset(
  appId: number,
  ResourcesPath: string,
  ModelDir: string,
) {
  const targetApp = l2dAppMap.get(appId);

  if (!targetApp) {
    return;
  }

  targetApp.loadL2dAsset(ResourcesPath, ModelDir);
}

export function setZoom(appId: number, zoomSize: number) {
  const targetApp = l2dAppMap.get(appId);

  if (!targetApp) {
    return;
  }

  targetApp.setZoom(zoomSize);
}

export function setEmotion(appId: number, emotion: Emotion) {
  const targetApp = l2dAppMap.get(appId);

  if (!targetApp) {
    return;
  }

  targetApp.setEmotion(emotion);
}
