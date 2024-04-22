import { LAppDelegate, LAppDelegateEventHandler } from './lappdelegate';

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

  constructor(container: HTMLDivElement) {
    this.container = container;
    const glInfo = this.initGl();

    this.canvas = glInfo.canvas;
    this.gl = glInfo.gl;

    this._delegate = new LAppDelegateEventHandler(this);
    this._delegate.initialize(this.container);
  }

  _delegate: LAppDelegate;

  container: HTMLDivElement;
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
}
