import type { BytKeyConnector, SchemaDef } from "../../types";
import { guardSchemaStore } from "../schema-guard";
import { InMemoryRedemptionStore } from "./redemption-store";
import { InMemorySchemaStore } from "./schema-store";

export function createInMemoryConnector(
	init?: Array<SchemaDef>,
	alphabet?: string,
): BytKeyConnector {
	return {
		redemptionStore: new InMemoryRedemptionStore(alphabet),
		schemaStore: guardSchemaStore(new InMemorySchemaStore(init)),
	};
}
