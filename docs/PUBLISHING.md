# Publishing an Evoker beta

The organization release is prepared as `0.1.0-beta.1` for `@k2x/evoker-core` and `@k2x/evoker`, using the `beta` tag. Publish core first, then React. Do not claim the organization packages are available until registry verification and the fresh consumer check pass.

## Account and scope

Sign in through npm's browser flow:

```sh
npm login --auth-type=web --registry=https://registry.npmjs.org/
npm whoami --registry=https://registry.npmjs.org/
```

The packages use the `@k2x` organization scope. The signed-in publisher must be an owner or authorized team member of that npm organization. Existing `@kartikeyak/evoker` and `@kartikeyak/evoker-core` packages remain available for existing applications; new organization releases use `@k2x`. Keep tokens and one-time passwords out of Git and chat.

## Verify the release

Use Node.js 24. Keep workspace versions and the lockfile synchronized; the React package must depend on the compatible core release. Run:

```sh
npm ci
npm test
npm run typecheck
npm run test:browser
npm run test:package
```

The package check builds both archives and installs them into an isolated consumer. Archives contain only package metadata, their README and built outputs, including the MIT license. Private research is excluded. Review the exact archives with `npm publish --dry-run` before uploading.

## Publish and confirm

With explicit user authorization to publish, upload the tested core archive first, then the React archive. npm may require additional browser or two-factor authentication.

```sh
npm publish artifacts/npm/k2x-evoker-core-0.1.0-beta.1.tgz --access public --tag beta --registry=https://registry.npmjs.org/
npm publish artifacts/npm/k2x-evoker-0.1.0-beta.1.tgz --access public --tag beta --registry=https://registry.npmjs.org/

npm view @k2x/evoker-core@0.1.0-beta.1 version dist.integrity --json
npm view @k2x/evoker@0.1.0-beta.1 version dist.integrity dependencies --json
npm view @k2x/evoker-core dist-tags --json
npm view @k2x/evoker dist-tags --json
```

Verify both version records and beta tags, compare registry integrity with the tested archives, then install `@k2x/evoker@beta` in a fresh consumer without local archive overrides. Update the README and installation page only after those checks pass. Do not use the `latest` tag for this beta. No automated publication or website deployment is configured by this process.

The fresh-registry installation check reuses the isolated consumer:

```sh
npm run test:registry
```
