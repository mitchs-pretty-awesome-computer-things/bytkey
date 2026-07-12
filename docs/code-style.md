# Code style

Living document for project-specific code style decisions. Add, revise, or remove entries as the project evolves.

## TypeScript

### Capitalize `ID` in identifiers

When `id` appears as part of an identifier, write it as `ID`. A standalone variable named `id` stays lowercase.

```typescript
// Preferred
interface Redemption {
  readonly schemaID: string;
}

function getByID(id: string): Promise<Schema | null>;

// Avoid
interface Redemption {
  readonly schemaId: string;
}
```

### Array types

Prefer `Array<T>` (or `ReadonlyArray<T>` for immutable arrays) over `T[]` (or `readonly T[]`).

```typescript
// Preferred
const values: Array<string> = [];
const fields: ReadonlyArray<DataField> = [];

// Avoid
const values: string[] = [];
const fields: readonly DataField[] = [];
```

### Discriminated union tags

Prefer `kind` over `type` for the field/variable name that identifies what "type" of thing a value is. This avoids confusion with the `type` keyword and keeps the runtime tag visually distinct from TypeScript type-level syntax.

```typescript
// Preferred
interface IntField {
  kind: "int";
  bits: number;
}

// Avoid
interface IntField {
  type: "int";
  bits: number;
}
```
