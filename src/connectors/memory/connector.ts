import type { BytKeyConnector, SchemaDef } from "../../types";
import { InMemoryRedemptionStore } from "./redemption-store";
import { InMemorySchemaStore } from "./schema-store";

export function createInMemoryConnector(
	init: Array<SchemaDef>,
): BytKeyConnector {
	return {
		redemptionStore: new InMemoryRedemptionStore(),
		schemaStore: new InMemorySchemaStore(init),
	};
}
