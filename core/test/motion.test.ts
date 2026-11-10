import { describe, expect, it, vi } from 'vitest';
import { DEFAULT_NODE_PROPS, FocusGroup, InputMapper, ManualClock, MemoryRenderer, Motion, Navigation, Player, Scene,
  Sequence, StateMachine, Timeline, cubicBezier, fade, getEasing, shake, slide, track, wipe } from '../src/index.js';

function rig() {
  const clock = new ManualClock();
  const target = { ...DEFAULT_NODE_PROPS };
  const player = new Player({ clock, target });
  const advance = (delta: number) => { clock.advance(delta); player.update(); };
  return { clock, target, player, advance };
}
const linearFade = (from = 0, to = 1, duration = 100) => fade({ from, to, duration, easing: 'linear' });

describe('timeline and sequencing', () => {
  it('sorts keyframes, preserves caller input, and uses destination easing', () => {
    const frames = [{ time: 100, value: 1, easing: 'easeIn' as const }, { time: 0, value: 0 }];
    const timeline = new Timeline({ duration: 100, tracks: [track('opacity', frames)] });
    expect(timeline.evaluate(50).opacity).toBe(.125);
    expect(frames[0]!.time).toBe(100);
    expect(timeline.evaluate(-1).opacity).toBe(0);
    expect(timeline.evaluate(200).opacity).toBe(1);
  });
  it('serializes same-property tracks without future steps overwriting the present', () => {
    const sequence = new Sequence().then(linearFade()).then(linearFade(1, 0)).build();
    expect(sequence.duration).toBe(200);
    expect(sequence.evaluate(50).opacity).toBe(.5);
    expect(sequence.evaluate(100).opacity).toBe(1);
    expect(sequence.evaluate(150).opacity).toBe(.5);
    expect(sequence.evaluate(0)).toEqual(sequence.clone().evaluate(0));
  });
  it('coordinates parallel properties and holds gaps before the next serial step', () => {
    const sequence = new Sequence().parallel([linearFade(), slide({ duration: 200, distance: 40, easing: 'linear' })])
      .add(linearFade(1, 0), 300).build();
    expect(sequence.duration).toBe(400);
    expect(sequence.evaluate(50)).toMatchObject({ opacity: .5, translateX: -30 });
    expect(sequence.evaluate(250).opacity).toBe(1);
    expect(sequence.evaluate(350).opacity).toBe(.5);
  });
  it('groups staggered targets and supports arbitrary node ids', () => {
    const timeline = new Timeline({ duration: 100, tracks: [
      track('opacity', [{ time: 0, value: 0 }, { time: 100, value: 1 }], '__proto__'),
      track('opacity', [{ time: 50, value: 0 }, { time: 100, value: 1 }], 'second'),
    ] });
    expect(timeline.evaluateByTarget(50)['__proto__']!.opacity).toBe(.5);
    expect(timeline.evaluateByTarget(50).second!.opacity).toBe(0);
  });
  it('animates wipes continuously using renderer-independent fractions', () => {
    expect(wipe({ duration: 100, easing: 'linear' }).evaluate(50)).toEqual({ clipRight: .5 });
    expect(Motion.slideOutLeft(100).evaluate(100).translateX).toBe(-32);
    expect(Motion.slideOutRight(100).evaluate(0).translateX).toBe(0);
    expect(Motion.fadeIn().evaluate(120).opacity).toBeGreaterThan(0);
    expect(getEasing('easeOut')(.5)).toBe(.875);
  });
  it('rejects invalid times and iteration counts', () => {
    for (const duration of [-1, NaN, Infinity]) expect(() => new Timeline({ duration, tracks: [] })).toThrow();
    expect(() => new Timeline({ duration: 100, tracks: [], loop: 0 })).toThrow();
    expect(() => new Timeline({ duration: 100, tracks: [track('opacity', [{ time: 101, value: 0 }])] })).toThrow();
    expect(() => new Sequence().add(linearFade(), -1)).toThrow();
    expect(() => shake({ duration: Infinity })).toThrow();
    expect(() => shake({ frequency: Infinity })).toThrow();
    expect(() => cubicBezier(-1, 0, 1, 1)).toThrow();
    expect(() => new FocusGroup([], { columns: 0 })).toThrow();
  });
});

describe('playback', () => {
  it('finishes exactly at the endpoint once, with a renderer sink', () => {
    const { player, target, advance } = rig();
    const finished = vi.fn();
    player.play(linearFade(), { onFinished: finished });
    advance(50); expect(target.opacity).toBe(.5);
    advance(50); expect(target.opacity).toBe(1); expect(player.state).toBe('finished');
    advance(100); expect(finished).toHaveBeenCalledTimes(1);
    const renderer = new MemoryRenderer();
    const headless = new Player({ apply: (props) => renderer.apply('box', props) });
    headless.play(linearFade()); headless.pause(); headless.seek(.5);
    expect(renderer.nodes.get('box')!.opacity).toBe(.5);
  });
  it('pause excludes elapsed time; seek applies while paused', () => {
    const { player, target, advance } = rig();
    const start = vi.fn(); player.on('start', start);
    player.play(linearFade()); advance(20); player.pause(); advance(500);
    expect(target.opacity).toBe(.2);
    player.seek(.4); expect(target.opacity).toBe(.4);
    player.resume(); advance(10); expect(target.opacity).toBe(.5);
    expect(start).toHaveBeenCalledTimes(2);
    player.stop(); advance(100); expect(player.state).toBe('idle');
  });
  it('starts reverse playback at the end and reverses in flight without a jump', () => {
    const { player, target, advance } = rig();
    player.play(linearFade(), { direction: 'reverse' }); expect(target.opacity).toBe(1);
    advance(30); expect(target.opacity).toBe(.7);
    player.reverse(); expect(target.opacity).toBe(.7);
    advance(30); expect(target.opacity).toBe(1); expect(player.state).toBe('finished');
    player.reverse(); advance(100); expect(target.opacity).toBe(0);
  });
  it('handles finite, infinite, and alternating loops with large time jumps', () => {
    const { player, target, advance } = rig();
    player.play(linearFade(), { loop: 3 }); advance(250);
    expect(target.opacity).toBe(.5); expect(player.cycle).toBe(2);
    advance(50); expect(target.opacity).toBe(1); expect(player.state).toBe('finished');
    player.play(linearFade(), { loop: Infinity }); advance(10000050); expect(target.opacity).toBe(.5);
    player.play(linearFade(), { loop: 2, direction: 'alternate' }); advance(150); expect(target.opacity).toBe(.5);
    advance(50); expect(target.opacity).toBe(0); expect(player.state).toBe('finished');
    player.reverse(); advance(100); expect(target.opacity).toBe(1);
  });
  it('completes zero-duration timelines synchronously even with infinite repeats', () => {
    const { player, target } = rig();
    const finished = vi.fn();
    player.play(linearFade(0, 1, 0), { loop: Infinity, onFinished: finished });
    expect(target.opacity).toBe(1); expect(player.progress).toBe(1); expect(finished).toHaveBeenCalledTimes(1);
  });
  it('crossfades from the displayed pose through repeated interruptions', () => {
    const { player, target, advance } = rig();
    const obsolete = vi.fn();
    player.play(linearFade(), { onFinished: obsolete }); advance(50);
    player.play(linearFade(1, 0), { blend: 'crossfade', blendDuration: 100 }); expect(target.opacity).toBe(.5);
    advance(20); const displayed = target.opacity;
    player.play(linearFade(0, 1), { blend: 'crossfade', blendDuration: 100 }); expect(target.opacity).toBe(displayed);
    advance(100); expect(target.opacity).toBe(1); expect(obsolete).not.toHaveBeenCalled();
  });
  it('clears an old blend for hard interruptions and emits applied blended values', () => {
    const { player, target, advance } = rig();
    const updates: number[] = [];
    player.on('update', ({ props }) => updates.push(props.opacity!));
    player.play(linearFade()); advance(50);
    player.play(linearFade(1, 0), { blend: 'crossfade' });
    expect(updates.at(-1)).toBe(target.opacity);
    player.play(linearFade()); expect(target.opacity).toBe(0);
  });
  it('settles at the destination even when its playback is shorter than the blend', () => {
    const { player, target, advance } = rig();
    player.play(linearFade()); advance(50);
    player.play(linearFade(1, 0), { blend: 'crossfade', blendDuration: 1000 });
    advance(100); expect(target.opacity).toBe(0); expect(player.state).toBe('finished');
    player.play(linearFade(0, 1, 0), { blend: 'crossfade', blendDuration: 1000 });
    expect(target.opacity).toBe(1); expect(player.state).toBe('finished');
  });
  it('blends scene nodes independently without collapsing their targets', () => {
    const scene = new Scene(); scene.createNode('a'); scene.createNode('b');
    const clock = new ManualClock(); const player = new Player({ clock, scene });
    const timeline = (to: number) => new Timeline({ duration: 100, tracks: ['a', 'b'].map((id) => track('opacity', [{ time: 0, value: 0 }, { time: 100, value: to }], id)) });
    player.play(timeline(1)); clock.advance(50); player.update();
    player.play(timeline(.4), { blend: 'crossfade', blendDuration: 50 });
    expect(scene.getNode('a')!.props.opacity).toBe(.5);
    clock.advance(50); player.update(); expect(scene.getNode('b')!.props.opacity).toBe(.2);
  });
  it('validates input before changing running playback', () => {
    const { player } = rig(); player.play(linearFade());
    expect(() => player.play(linearFade(), { speed: -1 })).toThrow();
    expect(() => player.seek(NaN)).toThrow(); expect(() => player.update(Infinity)).toThrow();
    expect(player.state).toBe('playing');
  });
});

describe('state transitions', () => {
  it('runs exit then enter on a shared player and emits end only after completion', () => {
    const { player, target, advance } = rig();
    const machine = new StateMachine({ states: { closed: { exit: linearFade(1, 0) }, open: { enter: linearFade() } }, initial: 'closed', defaultTarget: { player } });
    const end = vi.fn(); machine.on('transitionEnd', end);
    expect(machine.transition('open')).toBe(true); expect(machine.state).toBe('open');
    advance(50); expect(target.opacity).toBe(.5); expect(end).not.toHaveBeenCalled();
    advance(100); expect(target.opacity).toBe(.5); expect(machine.isTransitioning).toBe(true);
    advance(50); expect(end).toHaveBeenCalledOnce(); expect(machine.isTransitioning).toBe(false);
  });
  it('coordinates distinct players in parallel and waits for both', () => {
    const a = rig(); const b = rig();
    const machine = new StateMachine({ states: { a: { exit: linearFade(1, 0, 100) }, b: { enter: linearFade(0, 1, 200) } }, targets: { a: { player: a.player }, b: { player: b.player } } });
    const end = vi.fn(); machine.on('transitionEnd', end); machine.transition('b');
    a.advance(100); b.advance(100); expect(end).not.toHaveBeenCalled();
    b.advance(100); expect(end).toHaveBeenCalledOnce();
  });
  it('requires interruption during a transition and suppresses obsolete completion', () => {
    const { player, advance } = rig();
    const machine = new StateMachine({ states: { a: {}, b: { enter: linearFade() }, c: { enter: linearFade(1, 0) } }, defaultTarget: { player } });
    const end = vi.fn(); machine.on('transitionEnd', end);
    machine.transition('b'); advance(50); expect(machine.transition('c')).toBe(false);
    machine.transition('c', { interrupt: true }); advance(100);
    expect(end).toHaveBeenCalledOnce(); expect(end).toHaveBeenCalledWith({ from: 'b', to: 'c' });
    machine.dispose(); expect(player.state).toBe('finished');
  });
  it('supports instant state changes, validates state names, and disposes active motion', () => {
    const { player } = rig();
    expect(() => new StateMachine({ states: {}, initial: 'missing' })).toThrow();
    const machine = new StateMachine({ states: { a: {}, b: {}, c: { enter: linearFade() } }, defaultTarget: { player } });
    const end = vi.fn(); machine.on('transitionEnd', end); machine.transition('b'); expect(end).toHaveBeenCalledOnce();
    expect(() => machine.transition('missing')).toThrow(); machine.transition('c'); machine.dispose();
    expect(player.state).toBe('idle'); expect(machine.isTransitioning).toBe(false);
  });
});

describe('interaction and scenes', () => {
  it('wraps focus, emits selection changes, clamps replaced items, handles empty groups', () => {
    const group = new FocusGroup(['a', 'b', 'c']); const change = vi.fn(); group.on('change', change);
    group.move(-1); expect(group.current).toBe('c'); group.select(1); expect(change).toHaveBeenLastCalledWith({ cursor: 1 });
    group.setItems(['a']); expect(group.cursor).toBe(0); group.setItems([]); group.move(1); group.select(); expect(group.current).toBeUndefined();
    expect(() => group.move(NaN)).toThrow();
  });
  it('supports boundaries, grids, and custom input bindings without browser events', () => {
    const group = new FocusGroup([0, 1, 2, 3], { orientation: 'grid', columns: 2, wrap: false });
    const boundary = vi.fn(); group.on('boundary', boundary);
    const navigation = new Navigation(); navigation.addGroup(group); navigation.move('down'); expect(group.cursor).toBe(2);
    navigation.move('right'); expect(group.cursor).toBe(3); navigation.move('down'); expect(boundary).toHaveBeenCalledOnce();
    const input = new InputMapper({ bindings: { confirm: ['q'] } }); expect(input.mapKey('q')).toContain('confirm');
    expect(input.mapKey('Enter')).not.toContain('confirm'); input.unbind('confirm'); expect(input.mapKey('q')).toEqual([]);
  });
  it('prevents scene cycles and destroys entire subtrees', () => {
    const scene = new Scene(); const a = scene.createNode('a'); const b = scene.createNode('b', {}, 'a');
    expect(() => b.add(a)).toThrow(); expect(() => a.add(a)).toThrow();
    scene.destroyNode('a'); expect(scene.getNode('b')).toBeUndefined(); expect(scene.root.children).toHaveLength(0);
  });
});
