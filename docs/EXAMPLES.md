# Customizing motion and interaction

Build the workspaces before importing their ESM outputs. These examples use only the public package API.

## Timing, custom easing, and coordinated targets

```ts
import { ManualClock, Player, Scene, Sequence, Timeline, cubicBezier, fade, slide } from '@k2x/evoker-core';

const scene = new Scene();
scene.createNode('title');
scene.createNode('description');
const clock = new ManualClock();
const player = new Player({ scene, clock });
const curve = cubicBezier(.16, 1, .3, 1);
const forTarget = (timeline: Timeline, target: string) => new Timeline({
  duration: timeline.duration,
  tracks: timeline.tracks.map(track => ({ ...track, target })),
});
const entrance = new Sequence().parallel([
  forTarget(slide({ direction: 'up', distance: 20, duration: 320, easing: curve }), 'title'),
  forTarget(fade({ delay: 60, duration: 260 }), 'description'),
]).build();

player.play(entrance);
clock.advance(160);
player.update();
// Inspect scene.getNode('title')!.props or flush scene properties to a renderer.
```

## Continuous interruptions and reversal

```ts
import { Player, fade } from '@k2x/evoker-core';

const pose = { opacity: 0 };
const player = new Player({ target: pose });
player.play(fade({ duration: 300 }));
// Your host keeps calling player.update() each frame.
// When user intent changes:
player.play(fade({ from: 1, to: 0, duration: 200 }), {
  blend: 'crossfade',
  blendDuration: 100,
});
// Or retrace the same definition from its current pose:
player.reverse();
```

Crossfade snapshots the current output; hard interruption uses `blend: 'none'`. Reversing while paused preserves the paused state. For a new target property that was never previously animated, initialize it in the target pose before blending.

## State-owned enter and exit choreography

```ts
import { Player, StateMachine, fade } from '@k2x/evoker-core';

const pose = { opacity: 0 };
const player = new Player({ target: pose });
const machine = new StateMachine({
  initial: 'closed',
  defaultTarget: { player },
  states: {
    closed: {},
    open: {
      enter: fade({ duration: 260 }),
      exit: fade({ from: 1, to: 0, duration: 180 }),
    },
  },
});
machine.on('transitionEnd', ({ to }) => console.log('Completed:', to));
machine.transition('open');
// Keep updating player in your host frame loop.
machine.transition('closed', { interrupt: true, blendDuration: 80 });
// When the owning view is destroyed:
machine.dispose();
```

## React styling and remapped navigation

```tsx
import { Menu } from '@k2x/evoker';
import '@k2x/evoker/styles.css';

const items = [{ id: 'one', label: 'One' }, { id: 'two', label: 'Two' }];
const bindings = { up: ['ArrowUp', 'k'], down: ['ArrowDown', 'j'] };

export function CustomMenu() {
  return <Menu aria-label="Actions" items={items} bindings={bindings}
    duration={400} stagger={70} distance={60} easing="easeOutBack"
    wrap={false} className="my-menu" onSelect={item => console.log(item.id)} />;
}
```

```css
.my-menu .evoker-menu-button {
  border: 0;
  background: transparent;
  color: var(--evoker-white);
  padding: 12px 20px;
}
.my-menu .evoker-menu-button[data-active='true'] {
  color: var(--evoker-ink);
}
.my-menu .evoker-menu-button:focus-visible {
  outline: 3px solid var(--evoker-cyan);
  outline-offset: 4px;
}
```

Native Enter/Space activation stays available. Custom confirmation bindings are supported through `bindings.confirm`. Use `EvokerProvider reducedMotion` to force immediate final poses or omit the setting to follow the system preference. Keep application state and motion definitions outside the reusable component.
