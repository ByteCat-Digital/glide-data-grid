# Upgrade Issues Requiring Detailed Testing

## Runtime and Package Compatibility

- **React 19 / React DOM 19 / React types 19**: The main workspace and test projects now build against React 19. Manual testing should cover grid focus behavior, overlays, keyboard navigation, drag selection, fill handle behavior, row/column selection, and custom editors.
- **TypeScript 6**: Several React ref typings and stricter nullish checks required source changes. Validate generated declaration files and downstream TypeScript consumers.
- **Babel 8**: The deprecated `@babel/plugin-proposal-class-properties` was replaced with `@babel/plugin-transform-class-properties`. Validate CJS/ESM package output in consumers.
- **Linaria 8 / wyw-in-js 2**: CSS extraction is part of the package builds. Visual regression testing should cover themed cells, overlays, custom cells, and Storybook output.
- **Storybook 10**: Storybook packages were upgraded from 9.x. Build and visually inspect Storybook before publishing docs.
- **Vitest 4 / React 19 test harness**: The React act environment flag is now set, `ResizeObserver` and `Image` constructor-style mocks were fixed, hook tests using `@testing-library/react-hooks` were migrated to `renderHook` from `@testing-library/react`, and fake timers now explicitly include timeout/interval APIs plus `Date`. Manual regression testing should still cover visible-region updates, accessibility tree updates, context menu events, drag/drop, overlay close/edit behavior, and new-row scrolling because several failures were caused by timer/ref/effect replay semantics changing under React 19 and Vitest 4.
- **ESLint 10 flat config**: Package-local `eslint.config.mjs` files replaced `.eslintrc` loading. New React compiler-adjacent rules and newer Sonar/Unicorn recommended rules were too noisy for this codebase and were scoped out in config. Re-audit lint policy separately if you want the stricter modern recommendations.
- **react-select 5.10.2 with React 19 types**: `packages/cells` needed local casts around `react-select` component/style adapter boundaries. Manually test dropdown and multi-select cells.
- **web-vitals 5 in CRA test project**: `getFID` was replaced with `onINP`, and `ReportHandler` was replaced with `Metric` callback typing.
- **Next 16 test project**: Build passes, but Next rewrote `tsconfig.json` options and warns about multiple lockfiles/workspace root inference. Review the generated `tsconfig.json` diff and consider adding explicit `turbopack.root`.
- **CRA 5 test project**: Build passes after TypeScript asset declarations and React 19 `createRoot`, but CRA 5 remains obsolete and still carries transitive advisories.

## Security / Audit Follow-up

- **Root workspace**: `npm audit fix` reduced findings to 3 moderate advisories from `@toast-ui/editor` / `@toast-ui/react-editor` via vulnerable `dompurify`. npm only suggests `npm audit fix --force`, which downgrades `@toast-ui/editor` to `3.1.0`; do not force this without testing markdown/article cells.
- **CRA test project**: Non-force audit fixes reduced findings from 67 to 26 vulnerabilities. Remaining issues are largely from `react-scripts@5.0.1` and require force-level changes or replacing CRA.
- **Next test project**: Non-force audit fixes reduced findings to 2 moderate `postcss` advisories through `next@16.2.9`; npm suggests a force downgrade to `next@9.3.3`, which should not be applied.

## Verification Performed

- `npm run build` at repo root passes for all workspaces, with lint warnings remaining.
- `npm run test-cells -- --run` passes: 64 tests.
- `npm run test-source -- --run` passes: 7 tests.
- `npm test -- --run` passes in `packages/core`: 28 test files, 387 tests.
- `npm run test -w packages/core -- --run test/data-editor.test.tsx` passes: 142 tests.
- Focused React 19 harness checks pass: `npm run test -w packages/core -- --run test/data-editor-input.test.tsx test/data-editor-resize.test.tsx test/use-kinetic-scroll.test.ts test/common.test.ts test/image-window-loader.test.ts`.
- `npm run build` passes in `test-projects/next-gdg`.
- `npm run build` passes in `test-projects/cra5-gdg`.
