import { describe, expect, it } from "vitest";
import { AlreadyRedeemedError } from "../src/connector";
import { inMemoryConnector } from "../src/connectors/in-memory";
import { getSchemaID } from "../src/index";
import type { SchemaDef } from "../src/schema";

const testSchemaDef = {
  name: "reward",
  fields: [
    { name: "amount", kind: "int", bits: 16 },
    { name: "claimed", kind: "bool" },
    { name: "tier", kind: "enum", values: ["bronze", "silver", "gold"] },
  ],
} as const satisfies SchemaDef;

const testSchema = { ...testSchemaDef, id: getSchemaID(testSchemaDef) } as const;

describe("InMemorySchemaStore", () => {
  it("registers a schema and retrieves it by id", async () => {
    const { schemaStore } = await inMemoryConnector();

    await schemaStore.registerSchema(testSchemaDef);
    const schema = await schemaStore.getByID(testSchema.id);

    expect(schema).not.toBeNull();
    expect(schema?.id).toBe(testSchema.id);
    expect(schema?.name).toBe(testSchema.name);
    expect(schema?.fields).toEqual(testSchema.fields);
  });

  it("treats repeated registration of the same schema as a no-op", async () => {
    const { schemaStore } = await inMemoryConnector();

    await schemaStore.registerSchema(testSchemaDef);
    await schemaStore.registerSchema(testSchemaDef);

    const schemas = await schemaStore.listSchemas();
    expect(schemas).toHaveLength(1);
    expect(schemas[0]?.id).toBe(testSchema.id);
  });

  it("returns null when looking up a missing schema id", async () => {
    const { schemaStore } = await inMemoryConnector();
    const missing = getSchemaID({ name: "missing", fields: [] });

    await expect(schemaStore.getByID(missing)).resolves.toBeNull();
  });
});

describe("InMemoryRedemptionStore", () => {
  it("redeems a code and retrieves the record", async () => {
    const { redemptionStore } = await inMemoryConnector();
    const data = { amount: 42, claimed: true, tier: "gold" as const };

    const record = await redemptionStore.redeem("code-1", testSchema, data);

    expect(record.id).toBe("code-1");
    expect(record.schemaID).toBe(testSchema.id);
    expect(record.data).toEqual(data);
    expect(record.redeemedAt).toBeInstanceOf(Date);

    const lookedUp = await redemptionStore.getRedemption("code-1", testSchema);
    expect(lookedUp).toEqual(record);
  });

  it("reports isRedeemed as false before redemption and true after", async () => {
    const { redemptionStore } = await inMemoryConnector();
    const data = { amount: 1, claimed: false, tier: "bronze" as const };

    await expect(redemptionStore.isRedeemed("code-2")).resolves.toBe(false);

    await redemptionStore.redeem("code-2", testSchema, data);

    await expect(redemptionStore.isRedeemed("code-2")).resolves.toBe(true);
  });

  it("rejects redeeming the same id twice with AlreadyRedeemedError", async () => {
    const { redemptionStore } = await inMemoryConnector();
    const data = { amount: 1, claimed: false, tier: "bronze" as const };

    await redemptionStore.redeem("code-3", testSchema, data);

    await expect(redemptionStore.redeem("code-3", testSchema, data)).rejects.toThrow(
      AlreadyRedeemedError,
    );
  });

  it("round-trips optional extra metadata through redemption", async () => {
    const { redemptionStore } = await inMemoryConnector<{ readonly note: string }>();
    const data = { amount: 7, claimed: true, tier: "silver" as const };
    const extra = { note: "first redemption" };

    const record = await redemptionStore.redeem("code-4", testSchema, data, extra);

    expect(record.extra).toEqual(extra);

    const lookedUp = await redemptionStore.getRedemption("code-4", testSchema);
    expect(lookedUp?.extra).toEqual(extra);
  });

  it("returns null when looking up a missing redemption id", async () => {
    const { redemptionStore } = await inMemoryConnector();

    await expect(redemptionStore.getRedemption("missing", testSchema)).resolves.toBeNull();
  });
});

describe("inMemoryConnector factory", () => {
  it("pre-registers schemas supplied in options", async () => {
    const { schemaStore } = await inMemoryConnector({ schemas: [testSchemaDef] });

    const schema = await schemaStore.getByID(testSchema.id);
    expect(schema).not.toBeNull();
    expect(schema?.name).toBe(testSchema.name);
  });
});
