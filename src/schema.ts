/**
 * Core schema types and the {@link SchemaStore} contract.
 *
 * Encoding/decoding logic lives in BytKey core, outside the store abstraction.
 * The store only owns registration and lookup of schema definitions.
 */

/**
 * Integer field with a fixed bit width.
 */
export interface IntField {
  readonly kind: "int";
  readonly bits: number;
}

/**
 * Boolean field — always a single bit, so no extra metadata is needed.
 */
export interface BoolField {
  readonly kind: "bool";
}

/**
 * Enum field with a closed set of string values.
 */
export interface EnumField {
  readonly kind: "enum";
  readonly values: ReadonlyArray<string>;
}

/**
 * A single field in a schema definition.
 */
export type DataField = {
  readonly name: string;
} & (IntField | BoolField | EnumField);

/**
 * User-provided schema definition.
 */
export interface SchemaDef {
  /** Human-readable schema name. Used as the lookup key in {@link SchemaStore.getByName}. */
  readonly name: string;

  /**
   * Fields that define the code payload shape.
   *
   * Field order in the definition is not semantically significant: fields are
   * canonicalized alphabetically by name for id generation and encoding.
   */
  readonly fields: ReadonlyArray<DataField>;
}

/**
 * A schema as stored by a {@link SchemaStore}: a definition plus its stable,
 * computed ID.
 */
export interface Schema extends SchemaDef {
  /** Stable identifier computed from the schema definition. */
  readonly id: string;
}

/**
 * Minimal contract for storing and retrieving {@link Schema} records.
 *
 * Implementations only need to support registration and lookup; listing is
 * available as an optional extension via {@link QueryableSchemaStore}.
 */
export interface SchemaStore {
  /**
   * Register a schema.
   *
   * The store computes the schema id from the definition. Implementations must
   * treat repeated registration of the same schema as a no-op. Registering a
   * different schema with an already-registered `name` is an error.
   */
  registerSchema(schemaDef: SchemaDef): Promise<void>;

  /** Look up a schema by its unique name. Returns `null` if not found. */
  getByName(name: string): Promise<Schema | null>;

  /** Look up a schema by its stable ID. Returns `null` if not found. */
  getByID(id: string): Promise<Schema | null>;
}

/**
 * Optional extension for backends that can enumerate registered schemas.
 *
 * Admin/debug tooling can use this without forcing minimal implementations to
 * support listing.
 */
export interface QueryableSchemaStore extends SchemaStore {
  /** Return all registered schemas in an implementation-defined order. */
  listSchemas(): Promise<ReadonlyArray<Schema>>;
}
