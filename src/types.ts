type EnumField = { kind: "enum"; values: Array<string> };
type IntField = { kind: "int"; bits: number };
type BoolField = { kind: "bool" };
export type DataField = { name: string } & (EnumField | IntField | BoolField);

export type SchemaDef = {
	name: string;
	fields: Array<DataField>;
};

type Schema = {
	id: string;
} & SchemaDef;

export interface BytKeySchemaStore {
	registerSchema(id: string, schemaDef: SchemaDef): Promise<void> | void;
	getByName(name: string): Promise<Schema | null> | Schema | null;
	getByID(id: string): Promise<Schema | null> | Schema | null;
}

type ExtraData = Record<string, string | number | boolean>;

type FieldValue<F extends DataField> = F extends EnumField
	? F["values"][number]
	: F extends IntField
		? number
		: F extends BoolField
			? boolean
			: never;

export type RedemptionData<T extends SchemaDef> = {
	[K in T["fields"][number] as K["name"]]: FieldValue<K>;
};

export type Redemption<T extends SchemaDef> = {
	id: string;
	extra?: ExtraData;
} & RedemptionData<T>;

export interface BytKeyRedemptionStore {
	redeem<T extends SchemaDef>(
		key: string,
		schema: T,
		extra?: ExtraData,
	): Promise<Redemption<T>> | Redemption<T>;
	// TODO what else?
}

export type BytKeyConnector = {
	redemptionStore: BytKeyRedemptionStore;
	schemaStore: BytKeySchemaStore;
};

export type BytKeyInit = {
	secret: string;
	connector: BytKeyConnector;
};
