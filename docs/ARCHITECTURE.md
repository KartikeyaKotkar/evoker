# Architecture

## Scope and ownership

The toolkit keeps three boundaries explicit:

1. `core` defines time, interpolation, playback, choreography, and interaction. It accepts plain values and produces property patches. Its TypeScript configuration compiles against ES2020 alone, with an empty ambient `types` list and no DOM library.
2. `react` owns the browser scheduler, element registration, preference detection, CSS mapping, semantic components, accessible event handling and reusable theme. React owns markup and lifecycle.
3. `playground` owns catalog composition, copy, demo state, and application-specific motion choices. It consumes reusable components and styles.

The scene, layout, and command vocabulary remains available as experimental data helpers, but motion integration uses the smaller `Renderer.apply(nodeId, props)` seam. `CssRenderer` does not interpret drawing commands, blend states, game texture masks, or material commands. The public React library separates behavior primitives, a token-based visual theme, and optional source-inspired blocks. Base UI owns complex React interaction; core timelines remain the block motion layer. A command interpreter, game asset loader, and additional production renderer remain outside the implementation.

## Timeline invariants

All times are milliseconds. A `Timeline` owns a finite non-negative duration and sorted copies of its tracks. Every keyframe time must be finite and within that duration. Easing belongs to the destination keyframe. Numbers, number arrays, and supported hex/RGB colors interpolate; booleans and unsupported strings switch at the endpoint. Numeric easing overshoot is preserved in the core. The CSS adapter clamps opacity and normalized clipping fractions when applying them.

`evaluate()` returns a sparse property patch, not a full node pose. Values hold before the first and after the last keyframe. With multiple tracks for the same target/property, the latest track that has started wins; ties use later source order. Before any track starts, the earliest initial value is used. This permits staggered entrances while preventing a future serial step from replacing current motion. Equal-time keyframes use the later value, including zero-duration timelines.

`Sequence.then()` appends after the current end; `parallel()` starts each child at the current cursor and advances to the longest child; `add()` accepts a non-negative explicit offset. Building flattens child keyframes onto a shared timeline. Child playback directions and repeat settings are not nested: composition uses their tracks and durations; set direction and repeats on the final player/timeline. Overlapping tracks do not add together.

## Player invariants

`Player` is explicitly driven. A clock exposes `now()`; the host calls `update()` or passes a timestamp from that clock's origin. The default uses runtime `performance.now()` when present, otherwise `Date.now()`. `ManualClock` makes deterministic tests possible. `FrameClock` converts caller-owned frame counts into milliseconds.

- Default playback runs once. `loop` is a positive **total iteration count**, or `Infinity`. Finite playback finishes exactly at its terminal boundary and invokes completion once. Zero-duration timelines apply the final pose and finish synchronously, even when repeats are infinite.
- Reverse playback starts at the duration unless an offset is supplied. `reverse()` flips the current direction without changing the pose. Reversing a finished player starts it back from its endpoint. Reversing a paused player keeps it paused; call `resume()` to continue.
- `pause()` freezes playback. `resume()` resets the wall-clock baseline so time spent paused is excluded. `seek()` takes a normalized fraction, applies immediately in any playback state, and clears active blending. `stop()` cancels completion and retains the last rendered pose.
- Speeds are finite and non-negative. Use `reverse()` for direction; zero speed freezes timeline time while an active crossfade still advances in real time.
- Hard interruption replaces playback immediately. A crossfade snapshots the **displayed** property pose, not the old timeline's mathematical pose. Subsequent interruptions snapshot the blended output again, preserving continuity. The old pose is held while the new timeline advances; this is not a blend of two independently moving timelines. Blending lasts no longer than the destination playback. Properties absent from the new animation remain held on the target.
- Scene playback evaluates tracks by target id and applies patches to matching nodes. For single-target playback, use `target` or `apply`. `apply` overrides direct target writes. Update event properties describe the actual applied single-target patch; scene update events contain the timeline's flat evaluation, so inspect scene nodes for individual rendered poses.

Large timestamp jumps use arithmetic iteration counting rather than walking through every missed cycle. Timelines remain frame-rate independent.

The `start` event also fires when paused playback resumes or a finished player starts reversing, allowing host schedulers to restart their frame loop.

## State transitions

`StateMachine` owns a named logical state. Its state changes when a transition is accepted. Exit/enter timelines sharing a player run in sequence; different players run in parallel. `transitionEnd` fires only after all participating playback finishes. State changes with no motion complete synchronously.

During a transition, another request returns `false` unless `interrupt: true` is set. Interruption replaces participating playback, stops obsolete players, and invalidates old completion callbacks. A superseded transition emits no completion. Unknown states throw; transitioning to the current state is a no-op. `dispose()` stops active transition playback and clears listeners. The machine owns its participating players during transitions; external `stop()` or `play()` calls cancel that player's completion, so dispose or interrupt the machine before taking over its players.

Timeline factories may read a node's current pose. Use separate state targets for concurrent panels, or a shared target when an exit must precede an entrance. State machines are core abstractions; the React adapter does not provide a state-machine lifecycle hook in this slice.

## Adapter and lifecycle

`Renderer` is a property sink with optional removal, frame, and disposal hooks. `CssRenderer.register()` associates a node id with an existing element. It merges patches and maps translation (pixels), rotation (degrees), scale, opacity, visibility, text color, and normalized `clipTop/Right/Bottom/Left` fractions into CSS. Unrecognized properties remain unmapped. Content, dimensions, layout, materials, and styles outside this mapping belong to the application. Rendering multiple nodes can be implemented by flushing a `Scene` to a renderer after updates.

`useMotion()` creates a stable renderer/player pair, registers its ref in a layout effect, and schedules `requestAnimationFrame` only while playing. Cleanup stops playback, cancels the pending frame, and unregisters the element; setup works again under React Strict Mode. `Animated` uses that hook for a declarative div wrapper. Its timeline and playback object identities determine restarts.

`EvokerProvider` supports a boolean motion preference or `system` (the default). Hook `play()` respects that preference by applying a zero-duration final-pose timeline. Direct calls to the returned low-level `player.play()` bypass that policy; use the hook's `play()` method for preference-aware playback. Core remains independent of accessibility preferences or platform APIs.

## Interaction and accessibility

`FocusGroup` owns index movement, optional wrapping, boundaries, selection, and subscriptions. `Navigation` maps directions to linear or grid strides. `InputMapper` maps plain key strings to actions; it accepts remapped bindings without importing browser event types. `SelectionController` connects explicit move/select/deselect calls to application callbacks.

React `Menu` uses roving focus and native buttons with menu/menuitem roles. Stable ids preserve the active item across reordering; if it disappears or becomes disabled, the first enabled item becomes the tab stop. Each navigation event uses a core `FocusGroup` over enabled items. Enter and Space use native activation; custom bindings confirm once. Focus changes notify `onActiveChange`; activation notifies `onSelect`. Per-row entrance wrappers, individual static layout transforms and a shared decorative cursor have separate ownership. A `ResizeObserver` measures row offsets. Tab exits normally. The application supplies an accessible name, e.g. `aria-label`.

`Tabs.Root/List/Trigger/Content/Indicator` wraps Base UI's typed composable parts. Roots support controlled or uncontrolled values; lists choose manual or focus activation. Disabled tabs may receive arrow focus for discoverability but never activate. Base UI owns linked ids, focus, panel lifetime and selection. The flat `Tabs` convenience signature assembles these same parts with automatic activation, rather than maintaining another navigation engine.

`Dialog.Root/Trigger/Portal/Backdrop/Content/Title/Description/Close/Footer` composes a modal through Base UI. The behavior layer owns focus trapping, pointer/Escape dismissal, background interaction, scroll locking and restoration. Content is a semantic dialog popup rather than a native HTML dialog. Controlled or uncontrolled roots are supported. The flat `Dialog` convenience signature assembles these same parts and maps close requests to its existing callback. CSS data attributes drive enter/exit styling; motion preferences are inherited through the theme.

`Theme` scopes semantic color roles, density and motion preferences. Nested themes inherit omitted options. Its internal portal bridge forwards appearance/density, custom theme classes and inline Evoker CSS variables so portalled content does not fall back to another theme. `Field` and Base UI-backed controls own label/help/error associations and native form values; `render` composes behavior with custom elements that forward their refs and props. The independent consumer test installs built archives outside the workspace and verifies types, styles and a production build without source aliases.

`Gauge` validates finite numeric input, clamps to its declared range and exposes native ARIA meter/progressbar values. Its fill transition is separate from panel entrance. `KeyHint` keeps key text, action and optional glyph independent. `Button` retains native semantics and a rectangular hit region. `Panel` clips only its decorative background, leaving content and focus outlines in ordinary flow.

`Transition` always retains a host element so its motion renderer can register even when initially hidden. On exit, children become inert and hidden to accessibility APIs immediately, then unmount on completion. Reopening crossfades from the displayed pose; obsolete completion callbacks are cancelled by the player. Effect changes reset properties owned by another effect so old clip/translation values cannot strand content. `SelectionIndicator` similarly blends coordinates from the displayed pose without moving the focused element.

## Evidence and next phases

The optional collection, form and feedback blocks reuse the player, sequence, focus group, menu and panel layers. `InspectorList` keeps native action buttons outside its listbox; ids own selection while a separate cursor owns the tab stop. `SettingRow` passes label/help attributes to a caller-supplied native control. `NameEntry` retains native input editing, IME and validation. `RankChange` assigns separate players to incoming/outgoing values and the ring. `CutIn` keeps a persistent motion host, retains children through exit and cancels stale completions when reopening. See EXPANDED_COMPONENTS.md for their public contracts and source relationships. Base UI is confined to the React package; no second sequencing engine or dependency was added to core.

Private reference research informs the composition vocabulary; see [source policy](SOURCE_POLICY.md) for distribution boundaries and fidelity limits. All geometry, timings, browser interactions and accessibility policies in the public toolkit are authored adaptations. No game table, texture or font is imported into a package. Only React/CSS has a production integration and browser verification; core independence alone does not prove another engine's compatibility.
