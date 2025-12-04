import { describe, it, expect } from "vitest";

import { Exception } from "../../../src/adap-b05/common/Exception";
import { InvalidStateException } from "../../../src/adap-b05/common/InvalidStateException";
import { ServiceFailureException } from "../../../src/adap-b05/common/ServiceFailureException";

import { StringName } from "../../../src/adap-b05/names/StringName";

import { Node } from "../../../src/adap-b05/files/Node";
import { File } from "../../../src/adap-b05/files/File";
import { BuggyFile } from "../../../src/adap-b05/files/BuggyFile";
import { Directory } from "../../../src/adap-b05/files/Directory";
import { RootNode } from "../../../src/adap-b05/files/RootNode";

function createFileSystem(): RootNode {
  let rn: RootNode = new RootNode();

  let usr: Directory = new Directory("usr", rn);
  let bin: Directory = new Directory("bin", usr);
  let ls: File = new File("ls", bin);
  let code: File = new File("code", bin);

  let media: Directory = new Directory("media", rn);

  let home: Directory = new Directory("home", rn);
  let riehle: Directory = new Directory("riehle", home);
  let bashrc: File = new File(".bashrc", riehle);
  let wallpaper: File = new File("wallpaper.jpg", riehle);
  let projects: Directory = new Directory("projects", riehle);

  return rn;
}

describe("Basic naming test", () => {
  it("test name checking", () => {
    let fs: RootNode = createFileSystem();
    let ls: Node = [...fs.findNodes("ls")][0];
    expect(ls.getFullName().asString()).toBe(new StringName("/usr/bin/ls", '/'));
  });
});

describe("Traversal test", () => {
  it("findNodes traverses child directories", () => {
    const rn: RootNode = new RootNode();
    const a: Directory = new Directory("a", rn);
    const b: Directory = new Directory("b", a);
    const target: File = new File("target", b);

    const results: Set<Node> = rn.findNodes("target");
    expect(results.has(target)).toBe(true);
    expect(results.size).toBe(1);
  });

  it("findNodes finds multiple matches across branches", () => {
    const rn: RootNode = new RootNode();
    const etc: Directory = new Directory("etc", rn);
    const varDir: Directory = new Directory("var", rn);
    const log: Directory = new Directory("log", varDir);
    const nginx: File = new File("config", etc);
    const syslog: File = new File("config", log);

    const matches: Set<Node> = rn.findNodes("config");
    expect(matches.has(nginx)).toBe(true);
    expect(matches.has(syslog)).toBe(true);
    expect(matches.size).toBe(2);
  });

  it("findNodes descends several levels deep", () => {
    const rn: RootNode = new RootNode();
    const level1: Directory = new Directory("level1", rn);
    const level2: Directory = new Directory("level2", level1);
    const level3: Directory = new Directory("level3", level2);
    const level4: Directory = new Directory("level4", level3);
    const deepFile: File = new File("needle", level4);

    const matches: Set<Node> = rn.findNodes("needle");
    expect(matches.has(deepFile)).toBe(true);
    expect(matches.size).toBe(1);
    expect([...matches][0].getFullName().asString('/')).toBe(new StringName("/level1/level2/level3/level4/needle", '/'));
  });
});

function createBuggySetup(): RootNode {
  let rn: RootNode = new RootNode();

  let usr: Directory = new Directory("usr", rn);
  let bin: Directory = new Directory("bin", usr);
  let ls: File = new BuggyFile("ls", bin);
  let code: File = new BuggyFile("code", bin);

  let media: Directory = new Directory("media", rn);

  let home: Directory = new Directory("home", rn);
  let riehle: Directory = new Directory("riehle", home);
  let bashrc: File = new BuggyFile(".bashrc", riehle);
  let wallpaper: File = new BuggyFile("wallpaper.jpg", riehle);
  let projects: Directory = new Directory("projects", riehle);

  return rn;
}

describe("Buggy setup test", () => {
  it("test finding files", () => {
    let threwException: boolean = false;
    try {
      let fs: RootNode = createBuggySetup();
      fs.findNodes("ls");
    } catch(er) {
      threwException = true;
      let ex: Exception = er as Exception;
      expect(ex).toBeInstanceOf(ServiceFailureException);
      expect(ex.hasTrigger()).toBe(true);
      let tx: Exception = ex.getTrigger();
      expect(tx).toBeInstanceOf(InvalidStateException);
    }
    expect(threwException).toBe(true);
  });
});

describe("findNodes error escalation", () => {
    it("should escalate InvalidStateException even if some matches were found", () => {
        const root = new RootNode();
        const usr = new Directory("usr", root);
        const target = new File("x", usr);
        const bad = new BuggyFile("x", usr);

        expect(() => usr.findNodes("x")).toThrow(ServiceFailureException);
    });
});
