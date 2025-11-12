import type { BytKeySchemaStore, SchemaDef } from "../types";

export function guardSchemaStore(init: BytKeySchemaStore): BytKeySchemaStore {
	return {
		async registerSchema(id: string, schemaDef: SchemaDef) {
			// TODO guard
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
