# @mpact/bytkey

Enable code redemption without storing your codes in advance.

> **Status:** early setup. The public API is still being shaped; the current release is a
> configuration-only placeholder.

## Installation

### Node (NPM)

```sh
npm install @mpact/bytkey
```

### Bun (NPM)

```sh
bun add @mpact/bytkey
```

### Deno (JSR)

```sh
deno add jsr:@mpact/bytkey
```

Or import directly:

```ts
import { BYTKEY_VERSION } from "jsr:@mpact/bytkey";
```

## Usage

```ts
import { BYTKEY_VERSION } from "@mpact/bytkey";

console.log(`bytkey ${BYTKEY_VERSION}`);
```

## Runtime support

- **Node** — install from NPM; the package ships compiled ESM (`.js`) and declaration files
  (`.d.ts`).
- **Bun** — install from NPM or JSR; both registries serve ESM.
- **Deno** — install from JSR; the package is published as TypeScript source.

## Development

[Bun](https://bun.sh) is the primary runtime for local development.

```sh
bun install
bun run lint
bun run fmt:check
bun run typecheck
bun run test
bun run build
```

## Documentation & support

- [Research notes](./docs/research/)
- [Issue tracker](https://github.com/mitchs-pretty-awesome-computer-things/bytkey/issues)
- [License](./LICENSE)
