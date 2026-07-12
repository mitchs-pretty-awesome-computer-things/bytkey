/**
 * Placeholder version export so the package entrypoint is importable
 * while the full `BytKey` API is being implemented.
 */
export const BYTKEY_VERSION: string = "0.0.1";

export type {
  BoolField,
  DataField,
  EnumField,
  IntField,
  Schema,
  SchemaDef,
  SchemaStore,
  QueryableSchemaStore,
} from "./schema.ts";

export type { FieldValue, Redemption, RedemptionData, RedemptionStore } from "./redemption.ts";

export {
  AbstractRedemptionStore,
  AbstractSchemaStore,
  AlreadyRedeemedError,
  type BytKeyConnector,
  SchemaNotFoundError,
  StoreError,
} from "./connector.ts";

export { getSchemaID } from "./util/schema.ts";
