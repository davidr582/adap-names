import { describe, it, expect } from "vitest";

import { Name } from "../../../src/adap-b03/names/Name";
import { StringName } from "../../../src/adap-b03/names/StringName";
import { StringArrayName } from "../../../src/adap-b03/names/StringArrayName";

describe("Basic StringName function tests", () => {
  it("test insert", () => {
    let n: Name = new StringName("oss.fau.de");
    n.insert(1, "cs");
    expect(n.asString()).toBe("oss.cs.fau.de");
  });
  it("test append", () => {
    let n: Name = new StringName("oss.cs.fau");
    n.append("de");
    expect(n.asString()).toBe("oss.cs.fau.de");
  });
  it("test remove", () => {
    let n: Name = new StringName("oss.cs.fau.de");
    n.remove(0);
    expect(n.asString()).toBe("cs.fau.de");
  });
});

describe("Basic StringArrayName function tests", () => {
  it("test insert", () => {
    let n: Name = new StringArrayName(["oss", "fau", "de"]);
    n.insert(1, "cs");
    expect(n.asString()).toBe("oss.cs.fau.de");
  });
  it("test append", () => {
    let n: Name = new StringArrayName(["oss", "cs", "fau"]);
    n.append("de");
    expect(n.asString()).toBe("oss.cs.fau.de");
  });
  it("test remove", () => {
    let n: Name = new StringArrayName(["oss", "cs", "fau", "de"]);
    n.remove(0);
    expect(n.asString()).toBe("cs.fau.de");
  });
});

describe("Delimiter function tests", () => {
  it("test insert", () => {
    let n: Name = new StringName("oss#fau#de", "#");
    n.insert(1, "cs");
    expect(n.asString()).toBe("oss#cs#fau#de");
  });
});

describe("Escape character extravaganza", () => {
  it("test escape and delimiter boundary conditions", () => {
    let n: Name = new StringName("oss.cs.fau.de", "#");
    expect(n.getNoComponents()).toBe(1);
    expect(n.asString()).toBe("oss.cs.fau.de");
    n.append("people");
    expect(n.asString()).toBe("oss.cs.fau.de#people");
  });

  it("test escaped delimiter in string", () => {
    let n: Name = new StringName("oss\\#cs#fau#de", "#");
    expect(n.getNoComponents()).toBe(3);
    expect(n.asDataString()).toBe("oss\\#cs#fau#de");
    expect(n.asString(".")).toBe("oss#cs.fau.de");
    n.append("people");
    expect(n.asDataString()).toBe("oss\\#cs#fau#de#people");
    expect(n.asString(".")).toBe("oss#cs.fau.de.people");
  });

  it("test escaped delimiter same behavior as with stringarray", () => {
    let n: Name = new StringArrayName(["oss#cs", "fau", "de"], "#");
    expect(n.getNoComponents()).toBe(3);
    expect(n.asDataString()).toBe("oss\\#cs#fau#de");
    expect(n.asString(".")).toBe("oss#cs.fau.de");
    n.append("people");
    expect(n.asDataString()).toBe("oss\\#cs#fau#de#people");
    expect(n.asString(".")).toBe("oss#cs.fau.de.people");
  });

  it("test concat (array)", () => {
    let n: Name = new StringArrayName(["oss#cs", "fau", "de"], "#");
    let m: Name = new StringArrayName(["oss#cs", "fau", "de"], "#");
    expect(n.concat(m));
    expect(n.getNoComponents()).toBe(6);
    expect(n.asDataString()).toBe("oss\\#cs#fau#de#oss\\#cs#fau#de");
    expect(n.asString(".")).toBe("oss#cs.fau.de.oss#cs.fau.de");
    n.append("people");
    expect(n.asDataString()).toBe("oss\\#cs#fau#de#oss\\#cs#fau#de#people");
    expect(n.asString(".")).toBe("oss#cs.fau.de.oss#cs.fau.de.people");
  });

  it("test concat (string)", () => {
    let n: Name = new StringName("oss\\#cs#fau#de", "#");
    let m: Name = new StringName("oss\\#cs#fau#de", "#");
    expect(n.concat(m));
    expect(n.getNoComponents()).toBe(6);
    expect(n.asDataString()).toBe("oss\\#cs#fau#de#oss\\#cs#fau#de");
    expect(n.asString(".")).toBe("oss#cs.fau.de.oss#cs.fau.de");
    n.append("people");
    expect(n.asDataString()).toBe("oss\\#cs#fau#de#oss\\#cs#fau#de#people");
    expect(n.asString(".")).toBe("oss#cs.fau.de.oss#cs.fau.de.people");
  });
});

describe("Parity and full API coverage", () => {
  const makePair = (s: string[], delimiter?: string): [Name, Name] => {
    return [
      new StringName(s.map(c => c ?? "").join(delimiter ?? "."), delimiter),
      new StringArrayName(s, delimiter),
    ];
  };

  it("represents data identically across implementations", () => {
    const [stringName, arrayName] = makePair(["oss", "cs", "fau", "de"]);
    expect(stringName.asString()).toBe(arrayName.asString());
    expect(stringName.asDataString()).toBe(arrayName.asDataString());
    expect(stringName.getNoComponents()).toBe(arrayName.getNoComponents());
    expect(stringName.getDelimiterCharacter()).toBe(arrayName.getDelimiterCharacter());
    for (let i = 0; i < stringName.getNoComponents(); i++) {
      expect(stringName.getComponent(i)).toBe(arrayName.getComponent(i));
    }
    expect(stringName.asString("-")).toBe(arrayName.asString("-"));
  });

  it("mutations (set/insert/append/remove) stay in sync", () => {
    const [stringName, arrayName] = makePair(["oss", "cs", "fau"]);
    stringName.setComponent(1, "systems");
    arrayName.setComponent(1, "systems");
    stringName.insert(2, "group");
    arrayName.insert(2, "group");
    stringName.append("de");
    arrayName.append("de");
    stringName.remove(0);
    arrayName.remove(0);
    expect(stringName.asDataString()).toBe(arrayName.asDataString());
    expect(stringName.asString()).toBe(arrayName.asString());
    expect(stringName.getNoComponents()).toBe(arrayName.getNoComponents());
  });

  it("concat works the same for both implementations", () => {
    const [lhsS, lhsA] = makePair(["oss", "cs"], "#");
    const [rhsS, rhsA] = makePair(["fau", "de"], "#");
    lhsS.concat(rhsS);
    lhsA.concat(rhsA);
    expect(lhsS.asDataString()).toBe(lhsA.asDataString());
    expect(lhsS.asString()).toBe(lhsA.asString());
    expect(lhsS.getNoComponents()).toBe(lhsA.getNoComponents());
  });

  it("clone produces equal but independent copies", () => {
    const [stringName, arrayName] = makePair(["oss", "cs", "fau", "de"]);
    const cloneS = stringName.clone() as Name;
    const cloneA = arrayName.clone() as Name;
    expect(cloneS.isEqual(stringName)).toBe(true);
    expect(cloneA.isEqual(arrayName)).toBe(true);
    stringName.append("team");
    arrayName.append("team");
    expect(cloneS.asDataString()).not.toBe(stringName.asDataString());
    expect(cloneA.asDataString()).not.toBe(arrayName.asDataString());
    expect(cloneS.getNoComponents()).toBe(4);
    expect(cloneA.getNoComponents()).toBe(4);
  });

  it("hash codes align with equality", () => {
    const [stringName, arrayName] = makePair(["oss", "cs", "fau", "de"]);
    expect(stringName.isEqual(arrayName)).toBe(true);
    expect(stringName.getHashCode()).toBe(arrayName.getHashCode());
    stringName.append("team");
    expect(stringName.isEqual(arrayName)).toBe(false);
  });

  it("isEmpty behaves consistently for a single empty component", () => {
    const [stringName, arrayName] = makePair([""]);
    expect(stringName.isEmpty()).toBe(arrayName.isEmpty());
  });

  it("throws on invalid indices", () => {
    const [stringName, arrayName] = makePair(["oss", "cs"]);
    expect(() => stringName.getComponent(-1)).toThrow(RangeError);
    expect(() => arrayName.getComponent(-1)).toThrow(RangeError);
    expect(() => stringName.insert(3, "x")).toThrow(RangeError);
    expect(() => arrayName.insert(3, "x")).toThrow(RangeError);
    expect(() => stringName.remove(3)).toThrow(RangeError);
    expect(() => arrayName.remove(3)).toThrow(RangeError);
  });
});
