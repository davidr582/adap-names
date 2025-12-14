import { describe, it, expect } from "vitest";

import { IllegalArgumentException } from "../../../src/adap-b06/common/IllegalArgumentException";
import { Name } from "../../../src/adap-b06/names/Name";
import { StringName } from "../../../src/adap-b06/names/StringName";
import { StringArrayName } from "../../../src/adap-b06/names/StringArrayName";

const expectIllegalArg = (fn: () => unknown) => expect(fn).toThrow(IllegalArgumentException);

describe("Value object semantics", () => {
  it("append returns a new instance and keeps original unchanged", () => {
    const original: Name = new StringArrayName(["oss", "cs"]);
    const updated = original.append("fau");
    expect(original.asString()).toBe("oss.cs");
    expect(updated.asString()).toBe("oss.cs.fau");
    expect(updated).not.toBe(original);
  });

  it("set/insert/remove create new instances and do not mutate the source", () => {
    const base: Name = new StringName("oss.cs.fau.de");
    const set = base.setComponent(1, "systems");
    const inserted = set.insert(2, "group");
    const removed = inserted.remove(0);

    expect(base.asString()).toBe("oss.cs.fau.de");
    expect(set.asString()).toBe("oss.systems.fau.de");
    expect(inserted.asString()).toBe("oss.systems.group.fau.de");
    expect(removed.asString()).toBe("systems.group.fau.de");
  });

  it("concat produces a new name without touching operands", () => {
    const left: Name = new StringArrayName(["home", "user"]);
    const right: Name = new StringArrayName(["projects", "repo"]);
    const combined = left.concat(right);

    expect(left.asString()).toBe("home.user");
    expect(right.asString()).toBe("projects.repo");
    expect(combined.asString()).toBe("home.user.projects.repo");
  });
});

describe("Equality and hash code contract", () => {
  it("cross-implementation equality includes escaping", () => {
    const stringName: Name = new StringName("oss\\#cs#fau", "#");
    const arrayName: Name = new StringArrayName(["oss#cs", "fau"], "#");

    expect(stringName.isEqual(arrayName)).toBe(true);
    expect(arrayName.isEqual(stringName)).toBe(true);
    expect(stringName.getHashCode()).toBe(arrayName.getHashCode());
    const extended = arrayName.append("team");
    expect(stringName.isEqual(extended)).toBe(false);
  });

  it("clone is equal but independent", () => {
    const original: Name = new StringArrayName(["oss", "cs", "fau"]);
    const clone = original.clone() as Name;

    expect(clone).not.toBe(original);
    expect(clone.isEqual(original)).toBe(true);
    const changed = clone.append("de");
    expect(changed.isEqual(original)).toBe(false);
    expect(original.getNoComponents()).toBe(3);
  });

  it("hash code is delimiter independent", () => {
    const dotDelimited: Name = new StringName("a.b.c");
    const hashDelimited: Name = new StringName("a#b#c", "#");
    expect(dotDelimited.isEqual(hashDelimited)).toBe(true);
    expect(dotDelimited.getHashCode()).toBe(hashDelimited.getHashCode());
  });
});

describe("API parity and formatting", () => {
  it("asString respects alternate delimiters without escaping", () => {
    const n: Name = new StringName("oss\\#cs#fau#de", "#");
    expect(n.getNoComponents()).toBe(3); // components: "oss#cs", "fau", "de"
    expect(n.asDataString()).toBe("oss\\#cs#fau#de");
    expect(n.asString(".")).toBe("oss#cs.fau.de");
  });

  it("StringName and StringArrayName represent the same value", () => {
    const s: Name = new StringName("oss.cs.fau.de");
    const a: Name = new StringArrayName(["oss", "cs", "fau", "de"]);
    expect(s.asDataString()).toBe(a.asDataString());
    expect(s.asString()).toBe(a.asString());
    expect(s.isEqual(a)).toBe(true);
  });
});

describe("Precondition checks", () => {
  it("rejects null sources and invalid delimiters", () => {
    expectIllegalArg(() => new StringName(null as unknown as string));
    expectIllegalArg(() => new StringArrayName(null as unknown as string[]));
    expectIllegalArg(() => new StringName("abc", "##"));
    expectIllegalArg(() => new StringArrayName(["abc"], ""));
  });

  it("rejects invalid indices", () => {
    const n: Name = new StringArrayName(["oss", "cs"]);
    expectIllegalArg(() => n.getComponent(-1));
    expectIllegalArg(() => n.insert(5, "x"));
    expectIllegalArg(() => n.remove(5));
  });

  it("rejects invalid delimiter in asString", () => {
    const n: Name = new StringName("oss");
    expectIllegalArg(() => n.asString(""));
  });
});
