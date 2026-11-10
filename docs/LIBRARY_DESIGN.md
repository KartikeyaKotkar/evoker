# Evoker library design

The component library has three user-facing layers: reusable primitives, a scoped visual theme, and optional application blocks. Documentation and package installation are part of the delivered interface. A showcase alone does not demonstrate that a component can be installed or composed in another application.

## Established libraries inspected

- [Radix composition](https://www.radix-ui.com/primitives/docs/guides/composition) establishes that custom component composition must preserve native props, event handlers and refs. Radix uses `asChild` to attach behavior to another element. Evoker uses Base UI's typed `render` mechanism for this purpose, rather than implementing a separate cloning system.
- [Base UI dialog](https://base-ui.com/react/components/dialog) exposes independently assembled root, trigger, portal, backdrop, popup, title, description and close parts, with controlled/uncontrolled state. Its [composition guide](https://base-ui.com/react/handbook/composition) documents custom React components and prop merging. Evoker adapts these parts into its own styled `Dialog.Content` API and uses the same layer for the flat compatibility API.
- [Base UI field](https://base-ui.com/react/components/field) connects controls, labels, descriptions and validation; its controls participate in normal forms. Evoker styles this established contract rather than making every field a custom render callback.
- [shadcn/ui Button](https://ui.shadcn.com/docs/components/button) presents a small component API with visual/size variants, preview, code and install instructions. Its [registry model](https://ui.shadcn.com/docs/registry) distributes owned source files. Evoker adopts the component-documentation conventions but currently distributes npm archives; it does not claim to provide a shadcn-compatible registry or CLI.
- [Radix Themes](https://www.radix-ui.com/themes/docs/theme/overview) separates theme settings and design tokens from component content. Evoker uses its own five-color source constraint, semantic roles, density and motion settings, with inheritance through portalled overlays.

The comparison concerns public APIs, documentation and packaging, not a comprehensive audit of those libraries' implementations. Base UI 1.9.0's documentation and installed TypeScript declarations were inspected for the actual wrappers.

## Ownership and tradeoffs

Base UI is a runtime dependency of the React package. It owns complex focus, keyboard, dismissal, field-validation and selection behavior; this reduces the maintenance burden of duplicating those systems. React DOM is now an explicit peer. The engine-independent core remains unchanged and has no Base UI or React dependency.

Evoker owns original CSS geometry, typography defaults, its source palette, semantic tokens, block choreography and package/documentation structure. Native game artwork and complete recovered tables remain private reference material under the existing research boundary. The game data informs the design relationships; it is not silently loaded by a consumer application.

The initial monolithic Dialog/Tabs convenience signatures remain available, but now compose the public primitives. Existing source-specific compositions are available through `/blocks`; they are not prerequisites for using a button, input, card or modal.

## Developer-facing acceptance

- Individual component pages provide live examples, code, native/behavior contracts and customization options. Installation and theme pages are directly addressable.
- A consumer installs built archives, imports CSS once, and uses components with its own markup/state. Examples use real form values and callbacks rather than hardcoded success data.
- Fields and custom rendered controls retain label/help relationships. Checkbox, switch, select and slider values participate in `FormData`.
- Dialog triggers compose onto Button without nesting buttons or dropping caller refs/events. Overlays preserve theme overrides and focus restoration.
- Packaging includes ESM, declarations and CSS, with side-effect metadata and client entry points. A standalone temporary consumer verifies that installation does not depend on workspace aliases.

Registry distribution, public npm publication, a Figma kit and exact native material/curve playback are separate capabilities. They are not asserted by the current release.
