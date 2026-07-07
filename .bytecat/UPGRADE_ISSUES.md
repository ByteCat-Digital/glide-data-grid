# Upgrade Issues Requiring Detailed Testing

## Runtime and Package Compatibility

- **React 19 / React DOM 19 / React types 19**: The main workspace and test projects now build against React 19. Manual testing should cover grid focus behavior, overlays, keyboard navigation, drag selection, fill handle behavior, row/column selection, and custom editors.
- **TypeScript 6**: Several React ref typings and stricter nullish checks required source changes. Validate generated declaration files and downstream TypeScript consumers.
- **Babel 8**: The deprecated `@babel/plugin-proposal-class-properties` was replaced with `@babel/plugin-transform-class-properties`. Validate CJS/ESM package output in consumers.
- **Linaria 8 / wyw-in-js 2**: CSS extraction is part of the package builds. Visual regression testing should cover themed cells, overlays, custom cells, and Storybook output.
- **Storybook 10**: Storybook packages were upgraded from 9.x. Build and visually inspect Storybook before publishing docs.
- **Vitest 4 / React 19 test harness**: The React act environment flag is now set, `ResizeObserver` and `Image` constructor-style mocks were fixed, hook tests using `@testing-library/react-hooks` were migrated to `renderHook` from `@testing-library/react`, and fake timers now explicitly include timeout/interval APIs plus `Date`. Manual regression testing should still cover visible-region updates, accessibility tree updates, context menu events, drag/drop, overlay close/edit behavior, and new-row scrolling because several failures were caused by timer/ref/effect replay semantics changing under React 19 and Vitest 4.
- **ESLint 9 flat config**: Package-local `eslint.config.mjs` files replaced `.eslintrc` loading. ESLint was kept on the latest 9.x line because `eslint-plugin-import` and `eslint-plugin-react` do not yet publish ESLint 10-compatible peer ranges. `eslint-plugin-unicorn` was kept on 65.x for the same strict peer-resolution reason. New React compiler-adjacent rules and newer Sonar/Unicorn recommended rules were too noisy for this codebase and were scoped out in config. Re-audit lint policy separately if you want the stricter modern recommendations.
- **Strict npm peer resolution**: The root `.npmrc` no longer uses `legacy-peer-deps=true`. The remaining peer conflicts were resolved by removing `@testing-library/react-hooks`, removing `react-laag` from docs/stories, replacing `@toast-ui/react-editor` with a local React adapter around `@toast-ui/editor`, and widening the core `marked` peer range to include the installed 18.x line. A clean `npm install --package-lock-only --ignore-scripts --dry-run` now succeeds without legacy peer resolution.
- **react-select 5.10.2 with React 19 types**: `packages/cells` needed local casts around `react-select` component/style adapter boundaries. Manually test dropdown and multi-select cells.
- **Next 16 test project**: Build passes, but Next rewrote `tsconfig.json` options and warns about multiple lockfiles/workspace root inference. Review the generated `tsconfig.json` diff and consider adding explicit `turbopack.root`.
- **CRA 5 test project removed**: The previous `test-projects/cra5-gdg` fixture was removed rather than continuing to carry `react-scripts@5.0.1`. CRA 5 is obsolete, its React Scripts toolchain produced unresolved transitive audit findings, and force-level audit remediation pointed at inappropriate React Scripts replacement/downgrade paths rather than a safe compatibility update.

## Security / Audit Follow-up

- **Root workspace**: Current `npm audit --json` reports 0 vulnerabilities. The previous moderate advisories from `@toast-ui/editor` through vulnerable `dompurify` were addressed with a root npm `overrides` entry:

  ```json
  {
      "@toast-ui/editor": {
          "dompurify": "^3.4.11"
      }
  }
  ```

  `npm ls dompurify @toast-ui/editor` currently resolves `@toast-ui/editor@3.2.2` and `dompurify@3.4.11`. Do not remove the override unless `@toast-ui/editor` itself updates its `dompurify` dependency to a safe version and audit remains clean.
- **React wrapper removal**: `@toast-ui/react-editor` was removed because its published peer dependency is pinned to React 17. The ArticleCell still uses `@toast-ui/editor`, but through a package-local React adapter. Re-test ArticleCell edit/read-only flows before publishing `@bytecat/glide-data-grid-cells`.
- **Package-local lockfiles**: The root workspace lockfile is the authoritative install state for the monorepo. Some package-local lockfiles are historical npm v1 locks and may show old standalone resolutions if inspected directly; rely on the root `package-lock.json`, `npm ls`, and root `npm audit` for current publish/build verification.
- **CRA test project removed**: The prior CRA fixture had 27 audit findings: 9 low, 8 moderate, and 10 high. The issues were largely from obsolete `react-scripts@5.0.1` and its transitive toolchain (`svgo`, `webpack-dev-server`, `serialize-javascript`, `postcss`, Jest 27/jsdom, Workbox, etc.). Rather than preserve a known vulnerable compatibility fixture, `test-projects/cra5-gdg` was removed. If CRA compatibility is needed again, create a fresh dedicated fixture and treat it as legacy/unsupported unless the React Scripts audit story changes.
- **Next test project**: Current `npm audit --json` reports 2 moderate findings: `postcss` through `next@16.2.9`. npm suggests a force downgrade to `next@9.3.3`, which should not be applied.
- **Fork package names**: Publishable packages and internal dependencies have been moved from the upstream `@glideapps` scope to the Bytecat `@bytecat` scope. The built `packages/cells/dist` and `packages/source/dist` outputs were regenerated so published runtime and declaration files import `@bytecat/glide-data-grid`.
- **Docs Markdown rendering**: `packages/core/src/docs/doc-wrapper.tsx` no longer uses `dangerouslySetInnerHTML` for `marked(p.children)`. Story docs now render `marked.lexer` tokens as React elements, escape raw HTML through React text rendering, and reject unsafe link/image URL schemes.

## Verification Performed

- `npm audit --json` at repo root reports 0 vulnerabilities.
- `npm install --package-lock-only --ignore-scripts --dry-run` succeeds without `legacy-peer-deps`.
- `npm ls --workspaces --all --depth=0` reports no peer or invalid dependency problems.
- `npm run build` passes across all workspaces. Existing docs lint warnings remain in `selection-serialization.stories.tsx`.
- `npm run test-cells -- --run` passes: 64 tests.
- `npm run test-source -- --run` passes: 7 tests.
- `npm test -- --run` passes in `packages/core`: 28 test files, 387 tests.
- `npm run test -w packages/core -- --run test/data-editor.test.tsx` passes: 142 tests.
- Focused React 19 harness checks pass: `npm run test -w packages/core -- --run test/data-editor-input.test.tsx test/data-editor-resize.test.tsx test/use-kinetic-scroll.test.ts test/common.test.ts test/image-window-loader.test.ts`.
- `npm run build` passes in `test-projects/next-gdg`.
- The obsolete `test-projects/cra5-gdg` fixture was removed because its `react-scripts@5.0.1` toolchain carried unresolved transitive audit findings.
- `npm run build -w packages/source` passes after the Bytecat package rename.
- `npm run build -w packages/cells` passes after the Bytecat package rename.
- `npm pack --dry-run --json --cache /tmp/npm-cache-gdg` confirms the publish names `@bytecat/glide-data-grid`, `@bytecat/glide-data-grid-cells`, and `@bytecat/glide-data-grid-source`.
- `rg` verification confirms no active source, test-project, or built `dist` imports remain for `@glideapps/glide-data-grid`; remaining `@glideapps` references are preserved upstream README/changelog/history or explicit "before" examples.
