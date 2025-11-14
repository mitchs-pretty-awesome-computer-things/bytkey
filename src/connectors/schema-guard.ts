import type { BytKeySchemaStore, SchemaDef } from "../types";
import { getSchemaID } from "../util/schema";

export function guardSchemaStore(init: BytKeySchemaStore): BytKeySchemaStore {
	return {
		async registerSchema(id: string, schemaDef: SchemaDef) {
			const calculatedID = await getSchemaID(schemaDef);
			if (id !== calculatedID) {
				throw new Error("Schema ID does not match calculated schema ID");
			}
			const existing = await init.getByID(id);
			if (existing) {
				return;
			}
			return init.registerSchema(id, schemaDef);
		},
		async getByID(id: string) {
			return init.getByID(id);
		},
		async getByName(name: string) {
			return init.getByName(name);
		},
	};
}
