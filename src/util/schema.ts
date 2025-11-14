import type { SchemaDef } from "../types";

function getCanonicalSchema(schema: SchemaDef) {
	return JSON.stringify({
		n: schema.name,
		f: schema.fields.map((field) => {
			switch (field.kind) {
				case "bool":
					return { n: field.name, k: "bool" };
				case "int":
					return { n: field.name, k: "int", b: field.bits };
				case "enum":
					return { n: field.name, k: "enum", v: field.values };
				default:
					// @ts-expect-error field.kind is `never` here, but could be something else at runtime technically
					throw new Error(`Unknown field kind "${field.kind}"`);
			}
		}),
	});
}

async function getSchemaHash(schema: SchemaDef) {
	const canonicalSchema = getCanonicalSchema(schema);
	const encoder = new TextEncoder();
	const digest = await crypto.subtle.digest(
		"SHA-256",
		encoder.encode(canonicalSchema),
	);
	const fullHash = new Uint8Array(digest);
	return fullHash.slice(0, 16);
}

export async function getSchemaID(schema: SchemaDef) {
	const hash = await getSchemaHash(schema);
	let hex = "";
	for (const byte of hash) {
		const b = byte.toString(16).padStart(2, "0");
		hex += b;
	}
	return hex;
}
