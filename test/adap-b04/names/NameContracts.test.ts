import { describe, it, expect } from "vitest";

import { IllegalArgumentException } from "../../../src/adap-b04/common/IllegalArgumentException";
import { InvalidStateException } from "../../../src/adap-b04/common/InvalidStateException";
import { Name } from "../../../src/adap-b04/names/Name";
import { StringName } from "../../../src/adap-b04/names/StringName";
import { StringArrayName } from "../../../src/adap-b04/names/StringArrayName";

const expectIllegalArg = (fn: () => unknown) => expect(fn).toThrow(IllegalArgumentException);

describe("StringName contracts", () => {
  it("rejects null source", () => {
    expectIllegalArg(() => new StringName(null as unknown as string));
  });

  it("rejects invalid delimiter length", () => {
    expectIllegalArg(() => new StringName("abc", "##"));
    expectIllegalArg(() => new StringName("abc", ""));
  });

  it("rejects invalid indices", () => {
    const n: Name = new StringName("oss.cs.fau");
    expectIllegalArg(() => n.getComponent(-1));
    expectIllegalArg(() => n.getComponent(99));
    expectIllegalArg(() => n.insert(99, "de"));
    expectIllegalArg(() => n.remove(99));
  });

  it("rejects concat with null", () => {
    const n: Name = new StringName("oss");
    expectIllegalArg(() => n.concat(null as unknown as Name));
  });

  it("rejects asString with invalid delimiter", () => {
    const n: Name = new StringName("oss");
    expectIllegalArg(() => n.asString(""));
  });
});

describe("StringArrayName contracts", () => {
  it("rejects null source", () => {
    expectIllegalArg(() => new StringArrayName(null as unknown as string[]));
  });

  it("rejects invalid delimiter length", () => {
    expectIllegalArg(() => new StringArrayName(["oss"], "##"));
    expectIllegalArg(() => new StringArrayName(["oss"], ""));
  });

  it("rejects invalid indices", () => {
    const n: Name = new StringArrayName(["oss", "cs"]);
    expectIllegalArg(() => n.getComponent(-1));
    expectIllegalArg(() => n.getComponent(5));
    expectIllegalArg(() => n.insert(5, "fau"));
    expectIllegalArg(() => n.remove(5));
  });

  it("rejects null components via invariant", () => {
    expect(() => new StringArrayName(["oss", null as unknown as string])).toThrow(InvalidStateException);
  });

  it("rejects asString with invalid delimiter", () => {
    const n: Name = new StringArrayName(["oss"]);
    expectIllegalArg(() => n.asString(""));
  });
});
