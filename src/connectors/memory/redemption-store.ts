import type {
	BytKeyRedemptionStore,
	RedemptionData,
	SchemaDef,
} from "../../types";

export class InMemoryRedemptionStore implements BytKeyRedemptionStore {
	private redemptions: Array<string>;

	constructor() {
		this.redemptions = [];
	}

	// TODO actually parse and store key data
	redeem<T extends SchemaDef>(
		key: string,
		schema: T,
		extra?: Record<string, string | number | boolean>,
	) {
		this.redemptions.push(`${this.redemptions.length}`);
		const redemptionData = {} as RedemptionData<T>;
		for (const field of schema.fields) {
			const name = field.name as keyof RedemptionData<T>;
			switch (field.kind) {
				case "bool":
					redemptionData[name] = true as RedemptionData<T>[typeof name];
					break;
				case "enum":
					redemptionData[name] = field
						.values[0] as RedemptionData<T>[typeof name];
					break;
				case "int":
					redemptionData[name] = 1 as RedemptionData<T>[typeof name];
					break;
			}
		}
		return {
			id: "",
			...extra,
			...redemptionData,
		};
	}
}
