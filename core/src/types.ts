/**
 * Shared types for the Evoker core.
 */

export type EasingFn = (t: number) => number;

export type EasingName =
  | 'linear'
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'easeInQuad'
  | 'easeOutQuad'
  | 'easeInOutQuad'
  | 'easeInCubic'
  | 'easeOutCubic'
  | 'easeInOutCubic'
  | 'easeInQuart'
  | 'easeOutQuart'
  | 'easeInOutQuart'
  | 'easeInQuint'
  | 'easeOutQuint'
  | 'easeInOutQuint'
  | 'easeInSine'
  | 'easeOutSine'
  | 'easeInOutSine'
  | 'easeInExpo'
  | 'easeOutExpo'
  | 'easeInOutExpo'
  | 'easeInCirc'
  | 'easeOutCirc'
  | 'easeInOutCirc'
  | 'easeInBack'
  | 'easeOutBack'
  | 'easeInOutBack'
  | 'easeInElastic'
  | 'easeOutElastic'
  | 'easeInOutElastic'
  | 'easeOutBounce'
  | 'step'
  // Persona 3 Reload style named curves (approximated)
  | 'bowa1'
  | 'fuwari1'
  | 'haneru1'
  | 'haneru2'
  | 'haneru3'
  | 'gachan2'
  | 'yureruRot'
  | 'kaesiSlide2'
  | 'sin90'
  | 'sin180'
  | 'sin360'
  | 'hSin180'
  | 'curveUp1'
  | 'curveUp2'
  | 'curveUp3'
  | 'curveDown1'
  | 'curveDown2'
  | 'curveDown3'
  | 'easeOut1'
  | 'easeOut2'
  | 'easeOut3'
  | 'buttonPush';

export type Interpolator<T> = (a: T, b: T, t: number) => T;

export interface Keyframe<T = number> {
  /** Time in milliseconds from the start of the owning timeline. */
  time: number;
  value: T;
  /** Easing used to reach this keyframe from the previous one. Defaults to linear. */
  easing?: EasingName | EasingFn;
}

export interface Track<T = number> {
  /** Property name written onto the target node. */
  property: string;
  keyframes: Keyframe<T>[];
  /** Node id when the timeline is evaluated against a Scene. */
  target?: string;
}

export type NodePropertyValue = number | string | boolean | number[];

export interface NodeProps {
  opacity: number;
  translateX: number;
  translateY: number;
  scaleX: number;
  scaleY: number;
  rotate: number;
  visible: boolean;
  color: string;
  clipTop: number;
  clipRight: number;
  clipBottom: number;
  clipLeft: number;
  [key: string]: NodePropertyValue | undefined;
}

export type Direction = 'normal' | 'reverse' | 'alternate';

export const DEFAULT_NODE_PROPS: NodeProps = {
  opacity: 1,
  translateX: 0,
  translateY: 0,
  scaleX: 1,
  scaleY: 1,
  rotate: 0,
  visible: true,
  color: '#ffffff',
  clipTop: 0,
  clipRight: 0,
  clipBottom: 0,
  clipLeft: 0,
};

export function clamp(value: number, min: number, max: number): number {
  return value < min ? min : value > max ? max : value;
}

export function clamp01(value: number): number {
  return clamp(value, 0, 1);
}
