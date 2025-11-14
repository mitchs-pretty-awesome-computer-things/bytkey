export class AlphabetEncoder {
	private base: bigint;
	private zero: string;

	constructor(private alphabet: string) {
		if (alphabet.length < 2) {
			throw new Error("Alphabet must have at least 2 characters");
		}
		if (new Set(alphabet.split("")).size !== alphabet.length) {
			throw new Error("Alphabet contains duplicate characters");
		}
		this.base = BigInt(alphabet.length);
		this.zero = alphabet.charAt(0);
	}

	encode(value: bigint): string {
		if (value < 0n) {
			throw new Error("Cannot encode a negative value");
		}

		if (value === 0n) {
			return this.zero;
		}

		let v = value;
		let result = "";
		while (v > 0n) {
			result = this.alphabet.charAt(Number(v % this.base)) + result;
			v = v / this.base;
		}
		return result;
	}

	decode(value: string): bigint {
		if (value.length === 0) {
			throw new Error("Cannot decode empty string");
		}

		let result = 0n;
		for (const char of value) {
			const n = this.alphabet.indexOf(char);
			if (n < 0) {
				throw new Error(`Invalid character "${char}"`);
			}
			result = result * this.base + BigInt(n);
		}
		return result;
	}
}
