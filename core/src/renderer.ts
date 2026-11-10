/**
 * Renderer seam. The core produces node property updates and draw commands;
 * a renderer decides how to present them (DOM/CSS, Canvas 2D, WebGL, …).
 */

import type { NodeProps } from './types.js';

export interface Renderer {
  /** Apply a batch of property updates to a node. */
  apply(nodeId: string, props: Partial<NodeProps>): void;
  /** Remove a node's rendered output. */
  remove?(nodeId: string): void;
  /** Frame lifecycle hooks. */
  beginFrame?(): void;
  endFrame?(): void;
  /** Release resources. */
  dispose?(): void;
}

/** A renderer that writes into a plain record of property maps. */
export class MemoryRenderer implements Renderer {
  readonly nodes = new Map<string, Partial<NodeProps>>();

  apply(nodeId: string, props: Partial<NodeProps>): void {
    const current = this.nodes.get(nodeId) ?? {};
    this.nodes.set(nodeId, { ...current, ...props });
  }

  remove(nodeId: string): void {
    this.nodes.delete(nodeId);
  }

  dispose(): void {
    this.nodes.clear();
  }
}
