/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismFramework, Option } from '@framework/live2dcubismframework';

import * as LAppDefine from './lappdefine';
import { LAppLive2DManager } from './lapplive2dmanager';
import { LAppPal } from './lapppal';
import { LAppTextureManager } from './lapptexturemanager';
import { LAppView } from './lappview';
import { LAppMain } from './lappmain';

/**
 * アプリケーションクラス。
 * Cubism SDKの管理を行う。
 */
export class LAppDelegate {
  /**
   * APPに必要な物を初期化する。
   */
  public initialize(container: HTMLDivElement): boolean {
    const targetContainer = container || document.body;

    const { canvas, gl } = this.AppMain;

    // キャンバスを DOM に追加
    targetContainer.appendChild(canvas);

    if (LAppDefine.CanvasSize === 'auto') {
      this._resizeCanvas();
    } else {
      canvas.width = LAppDefine.CanvasSize.width;
      canvas.height = LAppDefine.CanvasSize.height;
    }

    if (!this.frameBuffer) {
      this.frameBuffer = gl.getParameter(gl.FRAMEBUFFER_BINDING);
    }

    // 透過設定
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    // AppViewの初期化
    this._view.initialize();

    // Cubism SDKの初期化
    this.initializeCubism();

    return true;
  }

  /**
   * Resize canvas and re-initialize view.
   */
  public onResize(): void {
    this._resizeCanvas();
    this._view.initialize();
    this._view.initializeSprite();
  }

  /**
   * 解放する。
   */
  public release(): void {
    this._animationLoopHandle &&
      cancelAnimationFrame(this._animationLoopHandle);

    this._textureManager.release();
    // @ts-ignore
    this._textureManager = null;

    this._view.release();
    // @ts-ignore
    this._view = null;

    // リソースを解放
    this._live2DManager?.releaseAllModel();

    // Cubism SDKの解放
    CubismFramework.dispose();
  }

  /**
   * 実行処理。
   */
  public run(): void {
    // メインループ
    const loop = (): void => {
      // 時間更新
      LAppPal.updateTime();

      const { gl } = this.AppMain;

      // 画面の初期化
      gl.clearColor(0.0, 0.0, 0.0, 1.0);

      // 深度テストを有効化
      gl.enable(gl.DEPTH_TEST);

      // 近くにある物体は、遠くにある物体を覆い隠す
      gl.depthFunc(gl.LEQUAL);

      // カラーバッファや深度バッファをクリアする
      gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

      gl.clearDepth(1.0);

      // 透過設定
      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      // 描画更新
      this._view.render();

      // ループのために再帰呼び出し
      this._animationLoopHandle = requestAnimationFrame(loop);
    };
    this._animationLoopHandle &&
      cancelAnimationFrame(this._animationLoopHandle);

    loop();
  }

  /**
   * シェーダーを登録する。
   */
  public createShader(): WebGLProgram {
    const { gl } = this.AppMain;

    // バーテックスシェーダーのコンパイル
    const vertexShaderId = gl.createShader(gl.VERTEX_SHADER);

    if (vertexShaderId == null) {
      LAppPal.printMessage('failed to create vertexShader');
      // @ts-ignore
      return null;
    }

    const vertexShader: string =
      'precision mediump float;' +
      'attribute vec3 position;' +
      'attribute vec2 uv;' +
      'varying vec2 vuv;' +
      'void main(void)' +
      '{' +
      '   gl_Position = vec4(position, 1.0);' +
      '   vuv = uv;' +
      '}';

    gl.shaderSource(vertexShaderId, vertexShader);
    gl.compileShader(vertexShaderId);

    // フラグメントシェーダのコンパイル
    const fragmentShaderId = gl.createShader(gl.FRAGMENT_SHADER);

    if (fragmentShaderId == null) {
      LAppPal.printMessage('failed to create fragmentShader');
      // @ts-ignore
      return null;
    }

    const fragmentShader: string =
      'precision mediump float;' +
      'varying vec2 vuv;' +
      'uniform sampler2D texture;' +
      'void main(void)' +
      '{' +
      '   gl_FragColor = texture2D(texture, vuv);' +
      '}';

    gl.shaderSource(fragmentShaderId, fragmentShader);
    gl.compileShader(fragmentShaderId);

    // プログラムオブジェクトの作成
    const programId = gl.createProgram()!;
    gl.attachShader(programId, vertexShaderId);
    gl.attachShader(programId, fragmentShaderId);

    gl.deleteShader(vertexShaderId);
    gl.deleteShader(fragmentShaderId);

    // リンク
    gl.linkProgram(programId);

    gl.useProgram(programId);

    return programId;
  }

  /**
   * View情報を取得する。
   */
  public getView(): LAppView {
    return this._view;
  }

  public getTextureManager(): LAppTextureManager {
    return this._textureManager;
  }

  /**
   * コンストラクタ
   */
  constructor(appMain: LAppMain) {
    this.AppMain = appMain;

    this._captured = false;
    this._mouseX = 0.0;
    this._mouseY = 0.0;
    this._isEnd = false;

    this._cubismOption = new Option();
    this._view = new LAppView(this);
    this._textureManager = new LAppTextureManager(this);
  }

  /**
   * Cubism SDKの初期化
   */
  public initializeCubism(): void {
    // setup cubism
    this._cubismOption.logFunction = LAppPal.printMessage;
    this._cubismOption.loggingLevel = LAppDefine.CubismLoggingLevel;
    CubismFramework.startUp(this._cubismOption);

    // initialize cubism
    CubismFramework.initialize();

    // load model
    this._live2DManager = new LAppLive2DManager(this);

    LAppPal.updateTime();

    this._view.initializeSprite();
  }

  /**
   * Resize the canvas to fill the screen.
   */
  private _resizeCanvas(): void {
    const { gl, canvas } = this.AppMain;

    canvas.width = canvas.clientWidth * window.devicePixelRatio;
    canvas.height = canvas.clientHeight * window.devicePixelRatio;
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
  }

  AppMain: LAppMain;

  _cubismOption: Option; // Cubism SDK Option
  _view: LAppView; // View情報
  _captured: boolean; // クリックしているか
  _mouseX: number; // マウスX座標
  _mouseY: number; // マウスY座標
  _isEnd: boolean; // APP終了しているか
  _textureManager: LAppTextureManager; // テクスチャマネージャー
  _live2DManager?: LAppLive2DManager;

  _animationLoopHandle?: number;
  frameBuffer?: WebGLFramebuffer;
}

export class LAppDelegateEventHandler extends LAppDelegate {
  /**
   * クリックしたときに呼ばれる。
   */
  public onClickBegan(e: MouseEvent): void {
    if (!this._view) {
      LAppPal.printMessage('view notfound');
      return;
    }
    this._captured = true;

    const posX: number = e.pageX;
    const posY: number = e.pageY;

    this._view.onTouchesBegan(posX, posY);
  }

  /**
   * マウスポインタが動いたら呼ばれる。
   */
  public onMouseMoved(e: MouseEvent): void {
    if (!this._captured) {
      return;
    }

    if (!this._view) {
      LAppPal.printMessage('view notfound');
      return;
    }

    const rect = (e.target as Element).getBoundingClientRect();
    const posX: number = e.clientX - rect.left;
    const posY: number = e.clientY - rect.top;

    this._view.onTouchesMoved(posX, posY);
  }

  /**
   * クリックが終了したら呼ばれる。
   */
  public onClickEnded(e: MouseEvent): void {
    this._captured = false;
    if (!this._view) {
      LAppPal.printMessage('view notfound');
      return;
    }

    const rect = (e.target as Element).getBoundingClientRect();
    const posX: number = e.clientX - rect.left;
    const posY: number = e.clientY - rect.top;

    this._view.onTouchesEnded(posX, posY);
  }

  /**
   * タッチしたときに呼ばれる。
   */
  public onTouchBegan(e: TouchEvent): void {
    if (!this._view) {
      LAppPal.printMessage('view notfound');
      return;
    }

    this._captured = true;

    const posX = e.changedTouches[0].pageX;
    const posY = e.changedTouches[0].pageY;

    this._view.onTouchesBegan(posX, posY);
  }

  /**
   * スワイプすると呼ばれる。
   */
  public onTouchMoved(e: TouchEvent): void {
    if (!this._captured) {
      return;
    }

    if (!this._view) {
      LAppPal.printMessage('view notfound');
      return;
    }

    const rect = (e.target as Element).getBoundingClientRect();

    const posX = e.changedTouches[0].clientX - rect.left;
    const posY = e.changedTouches[0].clientY - rect.top;

    this._view.onTouchesMoved(posX, posY);
  }

  /**
   * タッチが終了したら呼ばれる。
   */
  public onTouchEnded(e: TouchEvent): void {
    this._captured = false;

    if (!this._view) {
      LAppPal.printMessage('view notfound');
      return;
    }

    const rect = (e.target as Element).getBoundingClientRect();

    const posX = e.changedTouches[0].clientX - rect.left;
    const posY = e.changedTouches[0].clientY - rect.top;

    this._view.onTouchesEnded(posX, posY);
  }

  /**
   * タッチがキャンセルされると呼ばれる。
   */
  public onTouchCancel(e: TouchEvent): void {
    this._captured = false;

    if (!this._view) {
      LAppPal.printMessage('view notfound');
      return;
    }

    const rect = (e.target as Element).getBoundingClientRect();

    const posX = e.changedTouches[0].clientX - rect.left;
    const posY = e.changedTouches[0].clientY - rect.top;

    this._view.onTouchesEnded(posX, posY);
  }

  /**
   * @override
   * @param container
   */
  public initialize(container: HTMLDivElement): boolean {
    const { canvas } = this.AppMain;
    const supportTouch: boolean = 'ontouchend' in canvas;

    if (supportTouch) {
      // タッチ関連コールバック関数登録
      canvas.addEventListener('touchstart', this.onTouchBegan, {
        passive: true,
      });
      canvas.addEventListener('touchmove', this.onTouchMoved, {
        passive: true,
      });
      canvas.addEventListener('touchend', this.onTouchEnded, { passive: true });
      canvas.addEventListener('touchcancel', this.onTouchCancel, {
        passive: true,
      });
    } else {
      // マウス関連コールバック関数登録
      canvas.addEventListener('mousedown', this.onClickBegan, {
        passive: true,
      });
      canvas.addEventListener('mousemove', this.onMouseMoved, {
        passive: true,
      });
      canvas.addEventListener('mouseup', this.onClickEnded, { passive: true });
    }
    return super.initialize(container);
  }

  constructor(appMain: LAppMain) {
    super(appMain);
  }
}
