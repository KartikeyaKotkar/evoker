# Test coverage

Run checks from the repository root after `npm ci`:

```sh
npm test
npm run typecheck
npm run test:browser
npm run test:package
```

The browser suite requires an installed Chromium browser. It discovers Chrome/Chromium at the paths listed in `scripts/browser-smoke.mjs`; set `CHROME_PATH` for another installation. It starts its own Vite server on port 5174. Optional `EVOKER_SCREENSHOTS` names an existing directory for desktop, mobile and documentation screenshots.

## Playground regression cases

- Opening `/` shows the standalone P3R Blocks & Motion playground and focuses its first menu option. All four opening options are enabled.
- Arrows navigate the opening menu and component selector. Enter enters the selected demo; Escape returns to its selector. Clicking a demo background focuses its controls. Text editing and native history scrolling retain their own keyboard behavior.
- Every one of the 26 playground entries has a documentation page with an API table. Documentation uses a separate view at `/#/docs`; direct URLs survive reload, legacy component URLs work, and browser Back/Forward switch between documentation and the playground.
- Quest rewards remain locked until all three objectives are checked. Progress reflects each change, claiming announces the reward, and restarting resets progress. Public-component checks also prove caller-owned checkbox state, read-only structured objectives and compatibility with string requirements.
- Contact messages start read. Marking unread updates the visible and accessible state; opening the message marks it read and displays its content.
- The date preview checks every time-of-day boundary: 04:59, 05:00, 11:59, 12:00, 16:59, 17:00, 20:59 and 21:00. Manual preview stays fixed. A controlled browser clock proves live date and period updates across midnight and morning; the real clock is restored afterward.
- Panel actions update the example's content and gauge. Other checks exercise tabs, dialogs, inputs, selection indicators and reversible transitions.
- Mobile layouts have no page-level horizontal overflow across all playground documentation entries. The latest five compositions are checked in both themes at mobile and desktop sizes. Unexpected browser runtime errors fail the suite.

## Library and package checks

The core suite covers deterministic motion, timelines, playback, interruption, input mapping and selection. Browser component fixtures cover Strict Mode, controlled state, focus, form values, disabled and empty collections, semantic labels, reduced motion and interrupted overlay lifecycle.

`test:package` builds all workspaces, creates npm archives and installs them in a temporary consumer outside the workspace. It typechecks root and subpath imports, builds a production application and verifies stylesheet inclusion. The consumer exercises both legacy and structured QuestBrief requirements. Archives include only package metadata and built library outputs; private research remains excluded.
