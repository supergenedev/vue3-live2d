/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { LAppDelegate } from './lappdelegate';
import * as LAppDefine from './lappdefine';
import { LAppGlManager } from './lappglmanager';

let isLoad = document.readyState === 'complete';
const initL2dResolver: (() => {})[] = []

window.addEventListener(
  'load',
  (): void => {
    isLoad = true;

    while(initL2dResolver.length > 0) {
      const fn = initL2dResolver.pop()
      fn && fn()
    }
  },
  { passive: true }
);

export async function initL2d (container?: HTMLDivElement) {
  if (!isLoad) {
    await new Promise((resolve) => {
      initL2dResolver.push(() => resolve)
    })
  }

  if (
    !LAppGlManager.getInstance() ||
    !LAppDelegate.getInstance().initialize(container)
  ) {
    return;
  }

  LAppDelegate.getInstance().run();
}

export function releaseL2d () {
  LAppDelegate.releaseInstance()
}

/**
 * Process when changing screen size.
 */
window.addEventListener(
  'resize',
  () => {
    if (LAppDefine.CanvasSize === 'auto') {
      LAppDelegate.getInstance().onResize();
    }
  },
  { passive: true }
);
