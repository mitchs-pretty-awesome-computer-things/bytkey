/**
 * In-memory reference connector for BytKey.
 *
 * This is a single-threaded, process-local implementation intended for
 * testing, development, and as a reference for backend connector authors.
 */

import {
  AbstractRedemptionStore,
  AbstractSchemaStore,
  AlreadyRedeemedError,
  type BytKeyConnector,
} from "../connector";
import type { QueryableRedemptionStore, Redemption, RedemptionData } from "../redemption";
import type { QueryableSchemaStore, Schema, SchemaDef } from "../schema";

/**
 * In-memory implementation of {@link SchemaStore}.
 *
 * Also implements {@link QueryableSchemaStore} so admin/debug tooling can
 * enumerate registered schemas without extra infrastructure.
 */
export class InMemorySchemaStore extends AbstractSchemaStore implements QueryableSchemaStore {
  readonly #schemas = new Map<string, Schema>();

  protected async persistSchema(schema: Schema): Promise<void> {
    this.#schemas.set(schema.id, schema);
  }

  async getByID(id: string): Promise<Schema | null> {
    return this.#schemas.get(id) ?? null;
  }

  async listSchemas(): Promise<ReadonlyArray<Schema>> {
    return Array.from(this.#schemas.values());
  }

  async findSchemasByName(name: string): Promise<ReadonlyArray<Schema>> {
    return Array.from(this.#schemas.values()).filter((schema) => schema.name === name);
  }
}

/**
 * In-memory implementation of {@link RedemptionStore}.
 *
 * Atomicity is guaranteed by single-threaded JavaScript and the fact that
 * {@link redeem} checks for an existing record before inserting.
 *
 * Also implements {@link QueryableRedemptionStore} for enumeration.
 */
export class InMemoryRedemptionStore<Extra = unknown>
  extends AbstractRedemptionStore<Extra>
  implements QueryableRedemptionStore<Extra>
{
  readonly #redemptions = new Map<string, Redemption<Schema, Extra>>();

  async redeem<T extends Schema>(
    id: string,
    schema: T,
    data: RedemptionData<T>,
    extra?: Extra,
  ): Promise<Redemption<T, Extra>> {
    if (await this.isRedeemed(id)) {
      throw new AlreadyRedeemedError(`Code ${id} has already been redeemed`, id);
    }

    const redemption = this.makeRedemption(id, schema, data, extra);
    this.#redemptions.set(id, redemption);
    return redemption;
  }

  async isRedeemed(id: string): Promise<boolean> {
    return this.#redemptions.has(id);
  }

  async getRedemption<T extends Schema>(
    id: string,
    schema: T,
  ): Promise<Redemption<T, Extra> | null> {
    const redemption = this.#redemptions.get(id);
    if (redemption === undefined || redemption.schemaID !== schema.id) {
      return null;
    }
    return redemption as Redemption<T, Extra>;
  }

  async listRedemptions(): Promise<ReadonlyArray<Redemption<Schema, Extra>>> {
    return Array.from(this.#redemptions.values());
  }
}

/**
 * Connector bundle backed by in-memory stores.
 */
export interface InMemoryConnector<Extra = unknown> extends BytKeyConnector {
  /** In-memory schema store. */
  readonly schemaStore: InMemorySchemaStore;

  /** In-memory redemption store. */
  readonly redemptionStore: InMemoryRedemptionStore<Extra>;
}

/**
 * Factory for the in-memory reference connector.
 *
 * @param options - Optional initialization options.
 * @param options.schemas - Schemas to register before the connector is returned.
 * Useful for tests and for deployments with a static, known schema catalog.
 */
export async function inMemoryConnector<Extra = unknown>(options?: {
  readonly schemas?: ReadonlyArray<SchemaDef>;
}): Promise<InMemoryConnector<Extra>> {
  const schemaStore = new InMemorySchemaStore();
  await Promise.all((options?.schemas ?? []).map((schema) => schemaStore.registerSchema(schema)));

  return {
    schemaStore,
    redemptionStore: new InMemoryRedemptionStore<Extra>(),
  };
}
