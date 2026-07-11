# Research: oxlint and oxfmt configuration for `@mpact/bytkey`

Date: 2026-07-10
Source: https://oxc.rs/docs/guide/usage/linter.html, https://oxc.rs/docs/guide/usage/formatter.html and linked reference pages.

> **Revision note:** initial draft recommended static JSON configs for cross-runtime compatibility, then switched to TypeScript configs after the team clarified these are dev-only files. After further discussion, the recommendation switched back to JSON because the official `oxlint --init` and `oxfmt --init` commands generate `.oxlintrc.json` and `.oxfmtrc.json`, and aligning with the tools' defaults keeps setup simple.

## TL;DR recommendation

- Use `.oxlintrc.json` for linting and `.oxfmtrc.json` for formatting. The official `oxlint --init` and `oxfmt --init` commands generate these JSON files, so aligning with the tools' defaults keeps setup simple. JSON configs work in every runtime and impose no Node/Bun TypeScript-loader requirements.
- Oxlint defaults already cover `correctness` and enable the `typescript`, `unicorn`, and `oxc` plugins. Keep the default plugin set, add `import` for ESM/export-map checks, and add `vitest` for test files.
- Oxfmt defaults are Prettier-compatible (`printWidth: 100`, `trailingComma: "all"`, `semi: true`, `singleQuote: false`). Only override what the team wants to change (e.g. `printWidth: 80` if Prettier parity is desired).
- Run both in CI with `--check` / `--deny-warnings` so formatting/lint failures block the release workflow.
- Skip type-aware linting and `--type-check` for the initial repo setup; they are not yet semver-stable and require an extra `oxlint-tsgolint` dependency.

## 1. Config files

### oxlint

Oxlint discovers, in order, from the current working directory:

- `.oxlintrc.json`
- `.oxlintrc.jsonc`
- `oxlint.config.ts`

Only one config file per directory. Explicit `-c / --config` disables nested config lookup.

You can generate a starter config by running:

```sh
bunx oxlint --init
```

Recommended for this project (after running `--init` and editing the generated file):

```jsonc
// .oxlintrc.json
{
  "$schema": "./node_modules/oxlint/configuration_schema.json",
  "plugins": ["import", "typescript", "unicorn", "oxc"],
  "env": { "node": true, "es2022": true },
  "categories": {
    "correctness": "error",
    "suspicious": "warn",
  },
  "rules": {
    // Project-specific overrides go here; start empty.
  },
  "overrides": [
    {
      "files": ["*.test.ts", "*.spec.ts"],
      "plugins": ["vitest"],
      "env": { "vitest": true },
    },
  ],
}
```

Notes:

- The `$schema` field gives editors autocomplete/validation.
- `plugins` **overwrites** the default set, so the array must list every plugin you want. The built-in defaults are roughly `typescript`, `unicorn`, `oxc`; add `import` and `vitest` explicitly.
- `env.node: true` provides Node globals; `es2022` provides modern ECMAScript globals.
- Categories: `correctness` is on by default; raising it to `error` and enabling `suspicious` as `warn` is a safe starting point for a new library.
- JSON configs work with the standalone binaries and impose no TypeScript runtime requirements.

### oxfmt

Oxfmt discovers, walking up from each formatted file:

- `.oxfmtrc.json`
- `.oxfmtrc.jsonc`
- `oxfmt.config.ts`

You can generate a starter config by running:

```sh
bunx oxfmt --init
```

Recommended starter config (after running `--init` and editing the generated file):

```jsonc
// .oxfmtrc.json
{
  "$schema": "./node_modules/oxfmt/configuration_schema.json",
  "printWidth": 80,
  "singleQuote": false,
  "trailingComma": "all",
  "semi": true,
  "ignorePatterns": ["dist", "node_modules", "coverage"],
}
```

Notes:

- The `$schema` field gives editors autocomplete/validation.
- Default `printWidth` is `100` (wider than Prettier’s `80`). Pick one and record it as a project decision.
- `sortPackageJson` is enabled by default and will reorder `package.json` keys; this is generally desirable.
- `sortImports` and `sortTailwindcss` are disabled by default; enable only if the team wants sorted imports.
- JSON configs work with the standalone binaries and impose no TypeScript runtime requirements.

## 2. Default rules vs. explicit rules

### oxlint

- `correctness` rules are enabled by default.
- Default plugins enabled implicitly: `typescript`, `unicorn`, `oxc`.
- Other plugins must be opted in via `plugins`: `import`, `react`, `jsdoc`, `jest`, `vitest`, `jsx-a11y`, `nextjs`, `react-perf`, `promise`, `node`, `vue`.
- Rule severity values: `"off"`, `"warn"`, `"error"` (also accepted: `"allow"` / `"deny"`).
- Category overrides from CLI: `-A`, `-W`, `-D` (allow/warn/deny) apply left-to-right.

For a Node/Bun/Deno library, the most relevant optional plugins are:

- `import` — ESM resolution, export map issues, unused exports.
- `node` — Node-specific correctness rules.
- `vitest` — test-file rules (via overrides).

### oxfmt

- No “rules” concept; formatting is style-only.
- Defaults match modern Prettier except `printWidth: 100`.
- Built-in sorting features (disabled unless enabled): `sortImports`, `sortTailwindcss`, `sortPackageJson` (on by default).

## 3. TypeScript, ESM, and `exports` maps

### TypeScript

- Oxlint parses `.ts`, `.mts`, `.cts`, `.tsx` out of the box.
- Type-aware rules require installing `oxlint-tsgolint` and enabling `options.typeAware: true` or `--type-aware`. Not recommended for initial setup.
- `--type-check` / `options.typeCheck: true` is experimental and can replace `tsc --noEmit`, but it is also not semver-stable.

### ESM / `exports`

- Oxlint resolves imports using the same logic as TypeScript/Node. It automatically discovers the relevant `tsconfig.json` for each file.
- The `import` plugin adds rules such as `import/no-cycle`, `import/no-unresolved`, and ESM-related checks.
- For packages with dual-mode publishing, ensure `tsconfig.json` `moduleResolution` is set to `bundler` or `node16+` so `exports` maps resolve correctly.

### oxfmt

- Oxfmt formats TypeScript source directly; it does not consume `exports` maps.
- No special ESM configuration is required.

## 4. Known gaps / instability relevant to CI

| Feature                                                        | Status                                                                                                     | Recommendation                                                          |
| -------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| JS plugins                                                     | Alpha, **not semver-stable**                                                                               | Avoid for initial setup.                                                |
| Type-aware linting                                             | Requires extra `oxlint-tsgolint` package, high memory usage possible on large codebases, not semver-stable | Defer; enable later if needed.                                          |
| `--type-check`                                                 | Experimental                                                                                               | Defer.                                                                  |
| Oxfmt Prettier plugins                                         | Not supported                                                                                              | Use built-in `sortImports`/`sortTailwindcss`/`sortPackageJson` instead. |
| Oxfmt `experimentalTernaries` / `experimentalOperatorPosition` | Not supported                                                                                              | Not relevant for a new library.                                         |
| Oxfmt nested `.editorconfig`                                   | Not supported                                                                                              | Keep a single root `.editorconfig` if used.                             |

Oxlint treats new lint errors in minor/patch releases as non-breaking improvements, not semver breakages. CI should therefore pin the minor version range (e.g. `"oxlint": "^0.x"`) and update deliberately rather than always taking the latest patch automatically.

## 5. Editor and pre-commit integration

### Editors

The Oxc project provides official extensions/integrations for:

- VS Code / Cursor: `oxc.oxc-vscode`
- Zed: Oxc extension
- JetBrains: Oxc plugin
- Neovim: `nvim-lspconfig` (`oxlint`, `oxfmt`) or `conform.nvim`

Team setup for VS Code (`.vscode/settings.json`):

```json
{
  "editor.defaultFormatter": "oxc.oxc-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.oxc": "always"
  }
}
```

And `.vscode/extensions.json`:

```json
{
  "recommendations": ["oxc.oxc-vscode"]
}
```

### Pre-commit hooks

Oxlint:

```json
{
  "lint-staged": {
    "*.{js,jsx,ts,tsx,mjs,cjs}": "oxlint --deny-warnings"
  }
}
```

Oxfmt:

```json
{
  "lint-staged": {
    "*": "oxfmt --check --no-error-on-unmatched-pattern"
  }
}
```

`--no-error-on-unmatched-pattern` avoids failures when a commit contains only non-JS/TS files.

## 6. Suggested `package.json` scripts

```json
{
  "scripts": {
    "lint": "oxlint --deny-warnings .",
    "lint:fix": "oxlint --fix .",
    "fmt": "oxfmt .",
    "fmt:check": "oxfmt --check ."
  }
}
```

For CI, prefer `bun run lint` and `bun run fmt:check` so local and CI behavior match exactly.

## 7. Open decisions for follow-on tickets

- Confirm `printWidth` for Oxfmt (80 vs. 100).
- Decide whether to enable `sortImports` in Oxfmt or handle import sorting separately.
- Decide whether to raise `suspicious` to `error` after the first source files land.
- Decide whether to enable `node` plugin in Oxlint once the library starts using Node/Bun-specific APIs.
- Decide whether to adopt type-aware linting after the public API surface stabilizes.
