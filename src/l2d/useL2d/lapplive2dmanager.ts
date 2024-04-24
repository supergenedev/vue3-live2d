/**
 * Copyright(c) Live2D Inc. All rights reserved.
 *
 * Use of this source code is governed by the Live2D Open Software license
 * that can be found at https://www.live2d.com/eula/live2d-open-software-license-agreement_en.html.
 */

import { CubismMatrix44 } from '@framework/math/cubismmatrix44';
import { ACubismMotion } from '@framework/motion/acubismmotion';
import { csmVector } from '@framework/type/csmvector';

import * as LAppDefine from './lappdefine';
import { canvas } from './lappglmanager';
import { LAppModel } from './lappmodel';
import { LAppPal } from './lapppal';

export let s_instance: LAppLive2DManager = null;

const motions = [
  'Abashed',
  'Angry',
  'Annoyed',
  'Flustered',
  'Frustrated',
  'Hate',
  'Lovestruck',
  'Panicking',
  'Pleased',
  'Sad',
] as const;
export type IdleEmotion = 'Calm';
export type Emotion = (typeof motions)[number] | IdleEmotion;

/**
 * サンプルアプリケーションにおいてCubismModelを管理するクラス
 * モデル生成と破棄、タップイベントの処理、モデル切り替えを行う。
 */
export class LAppLive2DManager {
  /**
   * クラスのインスタンス（シングルトン）を返す。
   * インスタンスが生成されていない場合は内部でインスタンスを生成する。
   *
   * @return クラスのインスタンス
   */
  public static getInstance(): LAppLive2DManager {
    if (s_instance == null) {
      s_instance = new LAppLive2DManager();
    }

    return s_instance;
  }

  /**
   * クラスのインスタンス（シングルトン）を解放する。
   */
  public static releaseInstance(): void {
    if (s_instance != null) {
      s_instance = void 0;
    }

    s_instance = null;
  }

  /**
   * 現在のシーンで保持しているモデルを返す。
   *
   * @param no モデルリストのインデックス値
   * @return モデルのインスタンスを返す。インデックス値が範囲外の場合はNULLを返す。
   */
  public getModel(no: number): LAppModel {
    if (no < this._models.getSize()) {
      return this._models.at(no);
    }

    return null;
  }

  /**
   * 現在のシーンで保持しているすべてのモデルを解放する
   */
  public releaseAllModel(): void {
    for (let i = 0; i < this._models.getSize(); i++) {
      this._models.at(i).release();
      this._models.set(i, null);
    }

    this._models.clear();
  }

  /**
   * 画面をドラッグした時の処理
   *
   * @param x 画面のX座標
   * @param y 画面のY座標
   */
  public onDrag(hitPointX: number, hitPointY: number, x: number, y: number): void {
    for (let i = 0; i < this._models.getSize(); i++) {
      const model: LAppModel = this.getModel(i);
      if (model && model.isModelHitted(hitPointX, hitPointY)) {
        if(!model._draggable) {
          model.startDrag(model.getModelMatrix().getTranslateX(), model.getModelMatrix().getTranslateY());
        }
        const {x: originX, y: originY} = model.getDragStartPosition()
        // drag 시 마우스 위치에 따라 모델이 이동함
        model.getModelMatrix().setPosition(originX + x, originY + y);
        // model.setDragging(x, y);
      }
    }
  }

  /**
   * 画面をタップした時の処理
   *
   * @param x 画面のX座標
   * @param y 画面のY座標
   */
  public onTap(x: number, y: number): void {
    if (LAppDefine.DebugLogEnable) {
      LAppPal.printMessage(
        `[APP]tap point: {x: ${x.toFixed(2)} y: ${y.toFixed(2)}}`,
      );
    }

    for (let i = 0; i < this._models.getSize(); i++) {
      const randomIndex = Math.floor(Math.random() * motions.length);
      const randomMotion = motions[randomIndex];

      const model = this._models.at(i);
      model.endDrag();

      if(model.isModelHitted(x, y)) {
        model.startRandomMotion(
            `${randomMotion}.motion3.json`,
            LAppDefine.PriorityNormal,
            this._finishedMotion,
          );
      }
    }
  }

  // onEmotion : 감정 변화 발생 시 (from web-socket) 해당 Motion 을 실행시킴
  // 해당 emotion이 정의되지 않은 캐릭터의 경우, Idle (Calm) motion 이 실행될 수 있도록 예외처리(우선순위를 이용) 해줘야 한다.
  // 라이브러리에서, 캐릭터에 정의되지 않은 emotion 발생할 경우 자동으로 Idle motion 상태이므로 해당 예외처리는 하지 않음.
  public onEmotion(emotion: Emotion) {
    for (let i = 0; i < this._models.getSize(); i++) {
      this._models
        .at(i)
        .startRandomMotion(
          `${emotion}.motion3.json`,
          LAppDefine.PriorityNormal,
          this._finishedMotion,
        );
    }
  }

  /**
   * 画面を更新するときの処理
   * モデルの更新処理及び描画処理を行う
   */
  public onUpdate(): void {
    const { width, height } = canvas;

    const modelCount: number = this._models.getSize();

    for (let i = 0; i < modelCount; ++i) {
      const projection: CubismMatrix44 = new CubismMatrix44();
      const model: LAppModel = this.getModel(i);

      if (model.getModel()) {
        if (model.getModel().getCanvasWidth() > 1.0 && width < height) {
          // 横に長いモデルを縦長ウィンドウに表示する際モデルの横サイズでscaleを算出する
          model.getModelMatrix().setWidth(2.0);
          projection.scale(1.0, width / height);
        } else {
          projection.scale(height / width, 1.0);
        }

        // 必要があればここで乗算
        if (this._viewMatrix != null) {
          projection.multiplyByMatrix(this._viewMatrix);
        }
      }

      model.update();
      model.draw(projection); // 参照渡しなのでprojectionは変質する。
    }
  }

  /**
   * シーンを切り替える
   * サンプルアプリケーションではモデルセットの切り替えを行う。
   */
  public changeScene(ResourcesPath: string, ModelDir: string): void {
    if (LAppDefine.DebugLogEnable) {
      LAppPal.printMessage(`[APP]model change: ${ResourcesPath}/${ModelDir}`);
    }

    const model: string = ModelDir;
    const modelPath: string = ResourcesPath + model + '/';
    let modelJsonName: string = ModelDir;
    modelJsonName += '.model3.json';

    this.releaseAllModel();
    this._models.pushBack(new LAppModel());
    if (ModelDir) {
      this._models.at(0).loadAssets(modelPath, modelJsonName);
    } else {
      // model dir이 없으면 zip으로 asset을 로드
      this._models.at(0).loadZipAssets(ResourcesPath);
    }
  }

  public setViewMatrix(m: CubismMatrix44) {
    for (let i = 0; i < 16; i++) {
      this._viewMatrix.getArray()[i] = m.getArray()[i];
    }
  }

  /**
   * コンストラクタ
   */
  constructor() {
    this._viewMatrix = new CubismMatrix44();
    this._models = new csmVector<LAppModel>();
  }

  _viewMatrix: CubismMatrix44; // モデル描画に用いるview行列
  _models: csmVector<LAppModel>; // モデルインスタンスのコンテナ
  // モーション再生終了のコールバック関数
  _finishedMotion = (self: ACubismMotion): void => {
    LAppPal.printMessage('Motion Finished:');
    console.log(self);
  };
}
