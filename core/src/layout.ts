/**
 * Layout: anchor points and relative boxes, mirroring the reference UI's
 * anchor + offset positioning model.
 */

export type Anchor =
  | 'center'
  | 'leftUp'
  | 'rightUp'
  | 'leftDown'
  | 'rightDown'
  | 'centerDown'
  | 'leftCenter'
  | 'rightCenter';

export interface LayoutBox {
  anchor: Anchor;
  /** Horizontal offset from the anchor point, in pixels. */
  x: number;
  /** Vertical offset from the anchor point, in pixels. */
  y: number;
  width?: number;
  height?: number;
}

export function resolveAnchor(
  box: LayoutBox,
  containerWidth: number,
  containerHeight: number,
): { x: number; y: number } {
  const width = box.width ?? 0;
  const height = box.height ?? 0;
  let x = 0;
  let y = 0;
  switch (box.anchor) {
    case 'leftUp':
      x = 0;
      y = 0;
      break;
    case 'rightUp':
      x = containerWidth - width;
      y = 0;
      break;
    case 'leftDown':
      x = 0;
      y = containerHeight - height;
      break;
    case 'rightDown':
      x = containerWidth - width;
      y = containerHeight - height;
      break;
    case 'center':
      x = (containerWidth - width) / 2;
      y = (containerHeight - height) / 2;
      break;
    case 'centerDown':
      x = (containerWidth - width) / 2;
      y = containerHeight - height;
      break;
    case 'leftCenter':
      x = 0;
      y = (containerHeight - height) / 2;
      break;
    case 'rightCenter':
      x = containerWidth - width;
      y = (containerHeight - height) / 2;
      break;
  }
  return { x: x + box.x, y: y + box.y };
}

export interface LayoutDataEntry {
  box: LayoutBox;
}

/** Data-driven layout table, mirroring the reference UI's layout data tables. */
export class LayoutData {
  private readonly entries = new Map<string, LayoutDataEntry>();

  constructor(entries: Record<string, LayoutBox> = {}) {
    for (const [id, box] of Object.entries(entries)) this.entries.set(id, { box });
  }

  get(id: string): LayoutDataEntry | undefined {
    return this.entries.get(id);
  }

  set(id: string, box: LayoutBox): void {
    this.entries.set(id, { box });
  }
}
