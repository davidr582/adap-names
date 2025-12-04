import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import { ServiceFailureException } from "../common/ServiceFailureException";
import { Name } from "../names/Name";
import { Directory } from "./Directory";

export class Node {

    protected baseName: string = "";
    protected parentNode: Directory;

    constructor(bn: string, pn: Directory) {
        IllegalArgumentException.assert(bn != null, "base name must not be null");
        IllegalArgumentException.assert(pn != null, "parent node must not be null");
        this.doSetBaseName(bn);
        this.parentNode = pn; // why oh why do I have to set this
        this.initialize(pn);
    }

    protected initialize(pn: Directory): void {
        IllegalArgumentException.assert(pn != null, "parent node must not be null");
        this.parentNode = pn;
        this.parentNode.addChildNode(this);
    }

    public move(to: Directory): void {
        IllegalArgumentException.assert(to != null, "target directory must not be null");
        this.parentNode.removeChildNode(this);
        to.addChildNode(this);
        this.parentNode = to;
    }

    public getFullName(): Name {
        const result: Name = this.parentNode.getFullName();
        result.append(this.getBaseName());
        return result;
    }

    public getBaseName(): string {
        return this.doGetBaseName();
    }

    protected doGetBaseName(): string {
        return this.baseName;
    }

    public rename(bn: string): void {
        IllegalArgumentException.assert(bn != null, "base name must not be null");
        this.doSetBaseName(bn);
    }

    protected doSetBaseName(bn: string): void {
        this.baseName = bn;
    }

    public getParentNode(): Directory {
        return this.parentNode;
    }

    /**
     * Returns all nodes in the tree that match bn
     * @param bn basename of node being searched for
     */
    public findNodes(bn: string): Set<Node> {
        IllegalArgumentException.assert(bn != null, "base name must not be null");
        try {
            const result: Set<Node> = new Set<Node>();
            this.findNodesRecursive(bn, result);
            return result;
        } catch(ex) {
            if (ex instanceof InvalidStateException) {
                throw new ServiceFailureException("service failed", ex);
            }
            throw ex;
        }
    }

    public findNodesRecursive(bn: string, result: Set<Node>): void {
        const bnOfThis: string = this.getBaseName();
        InvalidStateException.assert(bnOfThis != null, "base name must not be null");
        const parentNode: Directory = this.getParentNode();
        const isRoot: boolean = parentNode === (this as unknown as Directory);
        InvalidStateException.assert(bnOfThis.length > 0 || isRoot, "base name must not be empty");
        if (bnOfThis === bn) {
            result.add(this);
        }
        this.findNodesInChildren(bn, result);
    }

    // hook for directories
    protected findNodesInChildren(bn: string, result: Set<Node>): void {
    }

}
