/**
 * Connector bundle and shared error types for the BytKey store abstraction.
 */

import type { Redemption, RedemptionData, RedemptionStore } from "./redemption";
import type { Schema, SchemaDef, SchemaStore } from "./schema";
import { getSchemaID } from "./util/schema";

/**
 * A connector bundles the schema and redemption stores used by BytKey core.
 *
 * Connectors are responsible for providing a consistent pair of stores. They
 * accept an external connection (pool/client) where needed and do not expose a
 * connect/close lifecycle in the core contract.
 */
export interface BytKeyConnector {
  /** Store for schema registration and lookup. */
  readonly schemaStore: SchemaStore;

  /** Store for atomic code redemption and redemption lookup. */
  readonly redemptionStore: RedemptionStore;
}

/**
 * Base error class for all store-related failures.
 */
export class StoreError extends Error {
  constructor(message: string, options?: ErrorOptions | undefined) {
    super(message, options);
    this.name = "StoreError";
  }
}

/**
 * Thrown when a required schema cannot be found.
 *
 * The store lookup methods return `null` for missing schemas; this error is
 * intended for higher-level code that expects a schema to exist.
 */
export class SchemaNotFoundError extends StoreError {
  constructor(
    message: string,
    public readonly lookup: { readonly name: string } | { readonly id: string },
    options?: ErrorOptions | undefined,
  ) {
    super(message, options);
    this.name = "SchemaNotFoundError";
  }
}

/**
 * Thrown when attempting to redeem a code that has already been redeemed.
 */
export class AlreadyRedeemedError extends StoreError {
  constructor(
    message: string,
    public readonly id: string,
    options?: ErrorOptions | undefined,
  ) {
    super(message, options);
    this.name = "AlreadyRedeemedError";
  }
}

/**
 * Optional base class for {@link SchemaStore} implementations.
 *
 * Handles the idempotency rule from the store contract: registering the same
 * schema twice is a no-op. Schema identity is determined solely by the
 * computed id; names are treated as metadata and are not required to be unique.
 *
 * Subclasses only need to implement the actual persistence methods.
 */
export abstract class AbstractSchemaStore implements SchemaStore {
  async registerSchema(schemaDef: SchemaDef): Promise<void> {
    const id = getSchemaID(schemaDef);
    const existingByID = await this.getByID(id);
    if (existingByID !== null) {
      return;
    }

    await this.persistSchema({ ...schemaDef, id });
  }

  protected abstract persistSchema(schema: Schema): Promise<void>;

  abstract getByID(id: string): Promise<Schema | null>;
}

/**
 * Optional base class for {@link RedemptionStore} implementations.
 *
 * Provides a helper for constructing {@link Redemption} records with a
 * store-generated timestamp. Subclasses must implement the persistence and
 * atomicity semantics required by the store contract.
 */
export abstract class AbstractRedemptionStore<Extra = unknown> implements RedemptionStore<Extra> {
  abstract redeem<T extends Schema>(
    id: string,
    schema: T,
    data: RedemptionData<T>,
    extra?: Extra | undefined,
  ): Promise<Redemption<T, Extra>>;

  abstract isRedeemed(id: string): Promise<boolean>;

  abstract getRedemption<T extends Schema>(
    id: string,
    schema: T,
  ): Promise<Redemption<T, Extra> | null>;

  /**
   * Build a {@link Redemption} record with a store-generated timestamp.
   */
  protected makeRedemption<T extends Schema>(
    id: string,
    schema: T,
    data: RedemptionData<T>,
    extra?: Extra | undefined,
  ): Redemption<T, Extra> {
    return {
      id,
      schemaID: schema.id,
      redeemedAt: new Date(),
      data,
      extra,
    };
  }
}
