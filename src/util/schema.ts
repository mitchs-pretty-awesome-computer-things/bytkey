/**
 * Schema id generation.
 *
 * A schema's id is derived deterministically from its definition so the same
 * schema always resolves to the same id. This makes schemas immutable by
 * design: changing the definition produces a new id.
 *
 * Fields are canonicalized alphabetically by name before hashing. Encoding and
 * decoding in BytKey core must use the same canonical order.
 */

import { createHash } from "node:crypto";
import type { DataField, SchemaDef } from "../schema";

/**
 * Convert a field into a stable, serialization-friendly shape.
 */
function canonicalizeField(field: DataField): DataField {
  switch (field.kind) {
    case "bool":
      return { kind: "bool", name: field.name };
    case "int":
      return { kind: "int", name: field.name, bits: field.bits };
    case "enum":
      return { kind: "enum", name: field.name, values: field.values };
  }
}

/**
 * Build a canonical JSON representation of a schema definition.
 *
 * Fields are sorted alphabetically by name before serialization. The same set
 * of fields in any definition order produces the same canonical form and
 * therefore the same schema id.
 */
function canonicalizeSchema(schema: SchemaDef): string {
  const fields = schema.fields.toSorted((a, b) => a.name.localeCompare(b.name));
  return JSON.stringify({
    name: schema.name,
    fields: fields.map(canonicalizeField),
  });
}

/**
 * Compute the stable id for a schema definition.
 *
 * Uses SHA-256 over the canonical JSON representation and returns the first
 * 16 bytes as a hex string.
 */
export function getSchemaID(schema: SchemaDef): string {
  const canonical = canonicalizeSchema(schema);
  const hash = createHash("sha256").update(canonical).digest("hex");
  return hash.slice(0, 32);
}
