import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { Node } from "./Node";

export class Directory extends Node {

    protected childNodes: Set<Node> = new Set<Node>();

    constructor(bn: string, pn: Directory) {
        super(bn, pn);
    }

    public hasChildNode(cn: Node): boolean {
        return this.childNodes.has(cn);
    }

    public addChildNode(cn: Node): void {
        IllegalArgumentException.assert(cn != null, "child node must not be null");
        this.childNodes.add(cn);
    }

    public removeChildNode(cn: Node): void {
        IllegalArgumentException.assert(cn != null, "child node must not be null");
        this.childNodes.delete(cn); // Yikes! Should have been called remove
    }

    protected findNodesInChildren(bn: string, result: Set<Node>): void {
        for (const cn of this.childNodes) {
            cn.findNodesRecursive(bn, result);
        }
    }

}
