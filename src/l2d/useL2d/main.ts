/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { LAppDelegate } from './lappdelegate';
import * as LAppDefine from './lappdefine';
import { LAppGlManager } from './lappglmanager';
import { Emotion, IdleEmotion, LAppLive2DManager } from './lapplive2dmanager';

let isLoad = document.readyState === 'complete';
const initL2dResolver: (() => {})[] = [];

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

export async function initL2d(container?: HTMLDivElement, draggable?: boolean) {
  if (!isLoad) {
    await new Promise((resolve) => {
      initL2dResolver.push(() => resolve);
    });
  }

  if (
    !LAppGlManager.getInstance() ||
    !LAppDelegate.getInstance().initialize(container, draggable)
  ) {
    return;
  }

  LAppDelegate.getInstance().run();
}

export function releaseL2d() {
  LAppDelegate.releaseInstance();
}

export function loadL2dAsset(ResourcesPath: string, ModelDir: string, loadData?: {x: number, y: number, zoom: number}, offDefaultMove?: boolean) {
  const center = loadData && {
    x: loadData.x,
    y: loadData.y
  };

  LAppLive2DManager.getInstance().changeScene(ResourcesPath, ModelDir, center, offDefaultMove);
  if(loadData) {
    setZoom(loadData.zoom);
  }
}

export function setZoom(zoomSize: number) {
  LAppDelegate.getInstance()._view._viewMatrix.scale(
    LAppDefine.ViewScale * zoomSize,
    LAppDefine.ViewScale * zoomSize,
  );
}

export function setCenter(x: number, y: number) {
  LAppLive2DManager.getInstance().makeModelCenter(x, y);
}

export function setEmotion(emotion: Emotion) {
  LAppLive2DManager.getInstance().onEmotion(emotion);
}
export function setMotionGroupIdle(idleEmotion: IdleEmotion){
  LAppDefine.setMotionGroupIdle(idleEmotion)
}
export function toggleLipSync(state: boolean) {
  LAppLive2DManager.getInstance().toggleLipSync(state);
}
