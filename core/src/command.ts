/**
 * Command list: renderer-agnostic draw commands, mirroring the reference
 * UI's `BPUICommand_*` / `BtlGuiDraw*` command set.
 */

export type BlendOperation = 'add' | 'subtract' | 'reverseSubtract' | 'min' | 'max';

export type BlendFactor =
  | 'zero'
  | 'one'
  | 'sourceColor'
  | 'inverseSourceColor'
  | 'sourceAlpha'
  | 'inverseSourceAlpha'
  | 'destColor'
  | 'inverseDestColor'
  | 'destAlpha'
  | 'inverseDestAlpha'
  | 'constantBlendFactor'
  | 'inverseConstantBlendFactor';

export type ColorWriteMask = 'none' | 'red' | 'green' | 'blue' | 'alpha' | 'redGreen' | 'redBlue' | 'greenBlue' | 'redGreenBlue' | 'redGreenBlueAlpha';

export interface BlendState {
  operation: BlendOperation;
  sourceFactor: BlendFactor;
  destinationFactor: BlendFactor;
  colorWriteMask: ColorWriteMask;
}

export const DEFAULT_BLEND_STATE: BlendState = {
  operation: 'add',
  sourceFactor: 'sourceAlpha',
  destinationFactor: 'inverseSourceAlpha',
  colorWriteMask: 'redGreenBlueAlpha',
};

export interface Mask {
  type: 'none' | 'rectangle' | 'circle' | 'texture';
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
  inverted: boolean;
}

export const NO_MASK: Mask = {
  type: 'none',
  x: 0,
  y: 0,
  width: 0,
  height: 0,
  radius: 0,
  inverted: false,
};

export interface CommandBase {
  target?: string;
}

export type Command =
  | (CommandBase & {
      type: 'drawRect';
      x: number;
      y: number;
      width: number;
      height: number;
      color: string;
    })
  | (CommandBase & {
      type: 'drawRoundRect';
      x: number;
      y: number;
      width: number;
      height: number;
      radius: number;
      color: string;
    })
  | (CommandBase & {
      type: 'drawSprite';
      sprite: string;
      x: number;
      y: number;
      width?: number;
      height?: number;
      color?: string;
    })
  | (CommandBase & {
      type: 'drawText';
      text: string;
      x: number;
      y: number;
      font?: string;
      size?: number;
      color?: string;
    })
  | (CommandBase & {
      type: 'drawPolygon';
      points: number[];
      color: string;
    })
  | (CommandBase & {
      type: 'drawMaterial';
      material: string;
      x: number;
      y: number;
      width: number;
      height: number;
    })
  | (CommandBase & {
      type: 'drawVerticalGradationRect';
      x: number;
      y: number;
      width: number;
      height: number;
      topColor: string;
      bottomColor: string;
    })
  | (CommandBase & {
      type: 'drawScrollbar';
      x: number;
      y: number;
      width: number;
      height: number;
      progress: number;
      thickness?: number;
      color?: string;
    })
  | (CommandBase & {
      type: 'drawCircle';
      x: number;
      y: number;
      radius: number;
      color: string;
    })
  | (CommandBase & {
      type: 'drawTriangle';
      x1: number;
      y1: number;
      x2: number;
      y2: number;
      x3: number;
      y3: number;
      color: string;
    })
  | (CommandBase & { type: 'setBlendState'; state: BlendState })
  | (CommandBase & { type: 'setMask'; mask: Mask })
  | (CommandBase & { type: 'setRenderTarget'; target: string })
  | (CommandBase & { type: 'clearRenderTarget'; target: string })
  | (CommandBase & { type: 'clear' });

export class CommandList {
  private commands: Command[] = [];

  push(command: Command): this {
    this.commands.push(command);
    return this;
  }

  clear(): void {
    this.commands = [];
  }

  get all(): readonly Command[] {
    return this.commands;
  }

  get length(): number {
    return this.commands.length;
  }
}
