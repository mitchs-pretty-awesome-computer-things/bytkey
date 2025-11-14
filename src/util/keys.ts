import type { RedemptionData, SchemaDef } from "../types";
import { AlphabetEncoder } from "./encoder";

type DecodedKey<T extends SchemaDef> = {
	id: string;
	hash: string;
} & RedemptionData<T>;

export function decodeKey<T extends SchemaDef>(
	key: string,
	schema: T,
	alphabet: string,
): DecodedKey<T> {
	const encoder = new AlphabetEncoder(alphabet);
	const raw = encoder.decode(key);

	// TODO calculate bit widths and extract data based on schema

	const { fields } = schema;

	const redemptionData = {} as RedemptionData<T>;
	for (const field of fields) {
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
		hash: "",
		...redemptionData,
	};
}
