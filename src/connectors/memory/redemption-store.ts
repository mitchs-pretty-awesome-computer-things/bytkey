import { DEFAULT_ALPHABET } from "../../bytkey";
import type { BytKeyRedemptionStore, SchemaDef } from "../../types";
import { decodeKey } from "../../util/keys";

export class InMemoryRedemptionStore implements BytKeyRedemptionStore {
	private redemptions: Map<string, boolean>;

	constructor(private alphabet: string = DEFAULT_ALPHABET) {
		this.redemptions = new Map<string, boolean>();
	}

	async redeem<T extends SchemaDef>(key: string, schema: T) {
		const { id } = decodeKey(key, schema, this.alphabet);

		if (this.redemptions.get(id)) {
			throw new Error("Key has already been redeemed");
		} else {
			this.redemptions.set(id, true);
		}
	}
}
