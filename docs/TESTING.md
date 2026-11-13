# Test coverage

Run checks from the repository root after `npm ci`:

```sh
npm test
npm run typecheck
npm run test:browser
npm run test:package
```

The browser suite requires an installed Chromium browser. It discovers Chrome/Chromium at the paths listed in `scripts/browser-smoke.mjs`; set `CHROME_PATH` for another installation. It starts its own Vite server on port 5174. Optional `EVOKER_SCREENSHOTS` names an existing directory for desktop, mobile and documentation screenshots.

GitHub Actions runs these same four commands on Node.js 24 for pull requests and pushes to `main`. The browser checks also verify that the official SVG logo loads in the playground and documentation. Package checks verify that both installed libraries include the project's MIT license text.

## Playground regression cases

- Opening `/` shows the standalone P3R Blocks & Motion playground and focuses its first menu option. All four opening options are enabled.
- Arrows navigate the opening menu and component selector. Enter enters the selected demo; Escape returns to its selector. Clicking a demo background focuses its controls. Text editing and native history scrolling retain their own keyboard behavior.
- Every one of the 27 playground entries has a documentation page with an API table. Documentation uses a separate view at `/#/docs`; direct URLs survive reload, legacy component URLs work, and browser Back/Forward switch between documentation and the playground.
- Quest rewards remain locked until all three objectives are checked. Progress reflects each change, claiming announces the reward, and restarting resets progress. Public-component checks also prove caller-owned checkbox state, read-only structured objectives and compatibility with string requirements.
- Contact messages start read. Marking unread updates the visible and accessible state; opening the message marks it read and displays its content.
- The date preview checks every time-of-day boundary: 04:59, 05:00, 11:59, 12:00, 16:59, 17:00, 20:59 and 21:00. Manual preview stays fixed. A controlled browser clock proves live date and period updates across midnight and morning; the real clock is restored afterward.
- Panel actions update the example's content and gauge. Other checks exercise tabs, dialogs, inputs, selection indicators and reversible transitions.
- Transition, motion preference, panel tone, equipment comparison and documentation motion all use Evoker Select. Real keyboard Home, arrows and Enter select options and update the respective application state through the styled popup.
- Mobile layouts have no page-level horizontal overflow across all playground documentation entries. The latest five compositions are checked in both themes at mobile and desktop sizes. Unexpected browser runtime errors fail the suite.

## Responsive regression cases

`scripts/responsive-checks.mjs` runs within the browser suite. The playground and six representative documentation pages are checked at 17 viewport sizes from 240×640 to 7680×4320, including 480×320 landscape. Every documentation page is checked at 320px width with normal and 200% root text size. The playground also receives normal and enlarged-text checks at 240, 768, 1024 and 1440px.

Checks reject page-level horizontal overflow, content outside the viewport, hero text/menu overlap and incorrect sticky sidebar offsets. Code samples, API tables and horizontal navigation may scroll within their own bounds. Dialogs, selects and action menus must fit 240×320 and 820×320 viewports with 200% text. Existing interaction checks cover focus and keyboard behavior.

The status dialog also receives short-screen overlay checks. Its close button must stay at the header's top right without overlapping a wrapping title at 200% text size.

These are Chromium layout regressions, not a claim that every physical display or browser has been tested. Root text enlargement tests text reflow; it does not emulate every browser zoom or operating-system scaling mode.

## Documentation navigation and appearance

The documentation checks open the mobile navigation with Enter, filter every navigation group, verify the no-results state, clear search and restore input focus. Selecting a page collapses the mobile navigation; widening the viewport restores the desktop sidebar. Browser hover checks verify stable foreground text in both themes. Section links retain the component route, focus their target and survive reload; next-page links follow the grouped component index. Live examples appear before usage and API details.

## CodeBlock regression cases

The browser fixture verifies escaped source, exact whitespace and native selection, line offsets and highlights, optional syntax nodes, wrap state, keyboard scrolling, clipboard success, denied/unavailable clipboard fallback and stale asynchronous completion. Copy and wrap buttons cannot submit surrounding forms. Package checks exercise root and `/blocks` exports, declarations, server rendering, invalid line-number inputs and distributed CSS. Every playground and docs code block uses the shared component and receives the existing responsive checks. The API inspector updates its filename and source when the selected component changes.

## Library and package checks

The core suite covers deterministic motion, timelines, playback, interruption, input mapping and selection. Browser component fixtures cover Strict Mode, controlled state, focus, form values, disabled and empty collections, semantic labels, reduced motion and interrupted overlay lifecycle.

`test:package` builds all workspaces, creates npm archives and installs them in a temporary consumer outside the workspace. It typechecks root and subpath imports, builds a production application and verifies stylesheet inclusion. The consumer exercises both legacy and structured QuestBrief requirements. Archives include only package metadata and built library outputs; private research remains excluded.
