import { LAppDelegate, LAppDelegateEventHandler } from './lappdelegate';
import * as LAppDefine from './lappdefine';
import { Emotion } from './lapplive2dmanager';

export class LAppMain {
  // LAppGlManager의 생성자에서 하던 동작
  private initGl() {
    const canvas = document.createElement('canvas');
    canvas.classList.add('l2d-canvas');

    const gl = canvas.getContext('webgl2')!;

    if (!gl) {
      // gl初期化失敗
      alert('Cannot initialize WebGL. This browser does not support.');

      document.body.innerHTML =
        'This browser does not support the <code>&lt;canvas&gt;</code> element.';
    }

    return {
      canvas,
      gl,
    };
  }

  public loadL2dAsset(ResourcesPath: string, ModelDir: string) {
    this._delegate._live2DManager?.changeScene(ResourcesPath, ModelDir);
  }

  public setZoom(zoomSize: number) {
    this._delegate._view._viewMatrix.scale(
      LAppDefine.ViewScale * zoomSize,
      LAppDefine.ViewScale * zoomSize,
    );
  }

  public setEmotion(emotion: Emotion) {
    this._delegate._live2DManager?.onEmotion(emotion);
  }

  public release() {
    this._delegate.release();
  }

  constructor(container: HTMLDivElement) {
    this.container = container;
    const glInfo = this.initGl();

    this.canvas = glInfo.canvas;
    this.gl = glInfo.gl;

    this._delegate = new LAppDelegateEventHandler(this);
    this._delegate.initialize(this.container);

    this._delegate.run();
  }

  _delegate: LAppDelegate;

  container: HTMLDivElement;
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
}
