/**
 * Scene graph: a tree of nodes carrying animatable properties.
 */

import { DEFAULT_NODE_PROPS, type NodeProps } from './types.js';

export class Node {
  readonly id: string;
  readonly props: NodeProps;
  readonly children: Node[] = [];
  parent: Node | null = null;

  constructor(id: string, props: Partial<NodeProps> = {}) {
    this.id = id;
    this.props = { ...DEFAULT_NODE_PROPS, ...props };
  }

  set(props: Partial<NodeProps>): void {
    Object.assign(this.props, props);
  }

  get<K extends keyof NodeProps>(key: K): NodeProps[K] {
    return this.props[key];
  }

  add(child: Node): void {
    for (let ancestor: Node | null = this; ancestor; ancestor = ancestor.parent) {
      if (ancestor === child) throw new Error('Scene nodes cannot form a cycle');
    }
    if (child.parent) child.parent.remove(child);
    child.parent = this;
    this.children.push(child);
  }

  remove(child: Node): void {
    const index = this.children.indexOf(child);
    if (index >= 0) {
      this.children.splice(index, 1);
      child.parent = null;
    }
  }

  clear(): void {
    for (const child of [...this.children]) this.remove(child);
  }

  walk(callback: (node: Node) => void): void {
    callback(this);
    for (const child of this.children) child.walk(callback);
  }
}

export class Scene {
  readonly root: Node;
  readonly nodes = new Map<string, Node>();

  constructor() {
    this.root = new Node('root');
    this.nodes.set('root', this.root);
  }

  createNode(id: string, props: Partial<NodeProps> = {}, parentId = 'root'): Node {
    if (this.nodes.has(id)) throw new Error(`Node already exists: ${id}`);
    const parent = this.nodes.get(parentId);
    if (!parent) throw new Error(`Parent not found: ${parentId}`);
    const node = new Node(id, props);
    this.nodes.set(id, node);
    parent.add(node);
    return node;
  }

  getNode(id: string): Node | undefined {
    return this.nodes.get(id);
  }

  destroyNode(id: string): void {
    const node = this.nodes.get(id);
    if (!node || node === this.root) return;
    node.parent?.remove(node);
    node.walk((child) => this.nodes.delete(child.id));
  }

  apply(propsByNode: Record<string, Partial<NodeProps>>): void {
    for (const [id, props] of Object.entries(propsByNode)) {
      this.getNode(id)?.set(props);
    }
  }
}
