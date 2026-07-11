import { describe, expect, it } from "vitest";
import { BYTKEY_VERSION } from "../src/index.ts";

describe("bytkey entrypoint", () => {
  it("imports without errors", () => {
    expect(BYTKEY_VERSION).toBe("0.0.1");
  });
});
