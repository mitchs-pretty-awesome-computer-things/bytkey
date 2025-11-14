import type {
	BytKeyInit,
	BytKeyRedemptionStore,
	BytKeySchemaStore,
	SchemaDef,
} from "./types";
import { getSchemaID } from "./util/schema";

export const DEFAULT_ALPHABET =
	"0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz" as const;

export class BytKey {
	private alphabet: string;
	private secret: string;
	private redemptionStore: BytKeyRedemptionStore;
	private schemaStore: BytKeySchemaStore;

	constructor(init: BytKeyInit) {
		this.alphabet = init.alphabet || DEFAULT_ALPHABET;
		this.secret = init.secret;
		this.redemptionStore = init.connector.redemptionStore;
		this.schemaStore = init.connector.schemaStore;
	}

	async redeem(
		schemaName: string,
		key: string,
		extra?: Record<string, string | number | boolean>,
	) {
		const schema = await this.schemaStore.getByName(schemaName);
		if (schema) {
			return this.redemptionStore.redeem(key, schema, extra);
		}
		throw new Error(`Could not find schema with name "${schemaName}"`);
	}

	async registerSchema(schemaDef: SchemaDef) {
		const id = await getSchemaID(schemaDef);
		return this.schemaStore.registerSchema(id, schemaDef);
	}
}
