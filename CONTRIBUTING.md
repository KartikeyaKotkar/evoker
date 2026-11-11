# Contributing to Evoker

Contributions to accessibility, component behavior, examples, documentation and motion are welcome. You do not need a game installation or any private research files to work on Evoker.

## Start here

1. Read the [README](README.md) and [source policy](docs/SOURCE_POLICY.md).
2. Search [existing issues](https://github.com/KartikeyaKotkar/evoker/issues) before opening a bug or proposing a feature. Use the issue forms for a reproduction or a concrete use case.
3. For a new public API or a broad visual change, open an issue first so the design can be discussed. Small fixes and documentation improvements can go straight to a pull request.

## Local setup

Use Node.js 24, npm and Git. `.nvmrc` records the version used by CI.

```sh
git clone https://github.com/YOUR-USERNAME/evoker.git
cd evoker
git switch -c fix/describe-your-change
npm ci
npm run dev
```

Fork the repository before cloning if you do not have write access. The dev server prints its local URL. The front page is the P3R Blocks & Motion playground; `/#/docs` opens the documentation.

## Where changes belong

| Area | Responsibility |
| --- | --- |
| `core/src`, `core/test` | DOM-free motion, timelines, playback and interaction |
| `react/src` | React primitives, blocks, theme and rendering adapter |
| `playground/src` | Shared examples, keyboard playground and documentation pages |
| `assets/brand` | Official, editable SVG logo assets |
| `scripts` | Browser regressions and independent package verification |

Keep component state with the application unless the component's contract explicitly owns it. Reuse existing controls and Base UI behavior for complex focus, overlays and forms. Preserve native attributes, accessible names, keyboard behavior and reduced-motion support. Keep the core independent of React and the DOM.

## Choose the right checks

```sh
npm test                 # Core unit tests
npm run typecheck        # TypeScript across the workspaces
npm run test:browser     # Real Chromium: components, docs and playground
npm run test:package     # Build, archives and a separate consumer application
```

- For core behavior, add a meaningful regression in `core/test` and run the core tests and typecheck.
- For React behavior, keyboard interaction or playground changes, update the relevant browser fixture and run typecheck and the browser suite.
- For public exports, declarations, CSS distribution, licensing or package changes, also run `test:package`.
- For prose-only changes, check spelling, links and code examples. You do not need to run unrelated browser checks.

The browser suite needs a locally installed Chrome/Chromium. Set `CHROME_PATH` when it is outside the detected paths. The package check needs npm registry access. See [test coverage](docs/TESTING.md) for details. CI runs all four checks on pushes to `main` and pull requests.

## Submit a pull request

Explain the problem, the resulting behavior and how you verified it. Add screenshots for visual changes and a small reproduction for interaction fixes. Update the component's documentation when its public contract changes. Keep each pull request focused; avoid dependency upgrades or generated files unrelated to the change.

Do not commit `node_modules`, build archives, credentials, private research, extracted game artwork or fonts. Public code and geometry must be original or appropriately licensed. The same boundary applies to issue attachments and screenshots.

Contributions are accepted under the project's [MIT license](LICENSE). No CLA or sign-off process is required. Follow the [code of conduct](CODE_OF_CONDUCT.md); report vulnerabilities through the [private security channel](SECURITY.md).
