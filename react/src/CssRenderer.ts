import type { NodeProps, Renderer } from '@evoker/core';

/** Maps motion properties to CSS. Layout, content, and visual design remain owned by React. */
export class CssRenderer implements Renderer {
  private readonly nodes = new Map<string, { element: HTMLElement; props: Partial<NodeProps> }>();
  register(id: string, element: HTMLElement): () => void {
    if (this.nodes.has(id)) throw new Error(`Rendered node already exists: ${id}`);
    this.nodes.set(id, { element, props: {} });
    return () => { this.nodes.delete(id); };
  }
  apply(id: string, updates: Partial<NodeProps>): void {
    const node = this.nodes.get(id);
    if (!node) return;
    Object.assign(node.props, updates);
    const p = node.props;
    const style = node.element.style;
    if (['translateX', 'translateY', 'rotate', 'scaleX', 'scaleY'].some((key) => key in updates)) {
      style.transform = `translate(${p.translateX ?? 0}px, ${p.translateY ?? 0}px) rotate(${p.rotate ?? 0}deg) scale(${p.scaleX ?? 1}, ${p.scaleY ?? 1})`;
    }
    if (updates.opacity !== undefined) style.opacity = String(Math.max(0, Math.min(1, updates.opacity)));
    if (updates.visible !== undefined) style.visibility = updates.visible ? 'visible' : 'hidden';
    if (updates.color !== undefined) style.color = updates.color;
    if (['clipTop', 'clipRight', 'clipBottom', 'clipLeft'].some((key) => key in updates)) {
      const percent = (value = 0) => `${Math.max(0, Math.min(1, value)) * 100}%`;
      style.clipPath = `inset(${percent(p.clipTop)} ${percent(p.clipRight)} ${percent(p.clipBottom)} ${percent(p.clipLeft)})`;
    }
  }
  remove(id: string): void { this.nodes.delete(id); }
  dispose(): void { this.nodes.clear(); }
}
