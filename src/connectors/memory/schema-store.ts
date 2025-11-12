import type { BytKeySchemaStore, SchemaDef } from "../../types";

export class InMemorySchemaStore implements BytKeySchemaStore {
	private schemas: Record<string, SchemaDef>;

	constructor(init: Array<SchemaDef>) {
		this.schemas = {};
		for (const def of init) {
			const id = "";
			this.schemas[id] = def;
		}
	}

	registerSchema(id: string, schemaDef: SchemaDef) {
		this.schemas[id] = schemaDef;
	}

	getByID(id: string) {
		const schemaDef = this.schemas[id];
		if (schemaDef) {
			return { id, ...schemaDef };
		}
		return null;
	}

	getByName(name: string) {
		const entries = Object.entries(this.schemas).find(
			([, schemaDef]) => schemaDef.name === name,
		);
		if (entries) {
			return { id: entries[0], ...entries[1] };
		}
		return null;
	}
}
