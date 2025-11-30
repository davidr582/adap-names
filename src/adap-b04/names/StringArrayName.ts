import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import { MethodFailedException } from "../common/MethodFailedException";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";

export class StringArrayName extends AbstractName {

    protected components: string[] = [];

    constructor(source: string[], delimiter?: string) {
        IllegalArgumentException.assert(source != null, "source must not be null");
        super(delimiter);
        this.components = [...source];
        this.assertInvariant();
    }

    public clone(): Name {
        return super.clone();
    }

    public asString(delimiter: string = this.delimiter): string {
        return super.asString(delimiter);
    }

    public asDataString(): string {
        return super.asDataString();
    }

    public isEqual(other: Name): boolean {
        return super.isEqual(other);
    }

    public getHashCode(): number {
        return super.getHashCode();
    }

    public isEmpty(): boolean {
        return super.isEmpty();
    }

    public getDelimiterCharacter(): string {
        return super.getDelimiterCharacter();
    }

    public getNoComponents(): number {
        this.assertInvariant();
        return this.components.length;
    }

    public getComponent(i: number): string {
        this.assertValidIndex(i, this.components.length);
        return this.components[i];
    }

    public setComponent(i: number, c: string) {
        this.assertValidIndex(i, this.components.length);
        const originalLength = this.components.length;
        this.components[i] = c;
        this.assertInvariant();
        MethodFailedException.assert(this.getNoComponents() === originalLength, "setComponent failed");
        MethodFailedException.assert(this.getComponent(i) === c, "setComponent failed");
    }

    public insert(i: number, c: string) {
        this.assertValidIndex(i, this.components.length, true);
        const originalLength = this.components.length;
        this.components.splice(i, 0, c);
        this.assertInvariant();
        MethodFailedException.assert(this.getNoComponents() === originalLength + 1, "insert failed");
        MethodFailedException.assert(this.getComponent(i) === c, "insert failed");
    }

    public append(c: string) {
        const originalLength = this.components.length;
        this.components.push(c);
        this.assertInvariant();
        MethodFailedException.assert(this.getNoComponents() === originalLength + 1, "append failed");
        MethodFailedException.assert(this.getComponent(this.getNoComponents() - 1) === c, "append failed");
    }

    public remove(i: number) {
        this.assertValidIndex(i, this.components.length);
        const originalLength = this.components.length;
        this.components.splice(i, 1)
        this.assertInvariant();
        MethodFailedException.assert(this.getNoComponents() === originalLength - 1, "remove failed");
    }

    public concat(other: Name): void {
        super.concat(other);
    }

    protected assertInvariant(): void {
        super.assertInvariant();
        InvalidStateException.assert(Array.isArray(this.components), "components must be an array");
        for (const comp of this.components) {
            InvalidStateException.assert(comp != null, "components must not contain null");
        }
    }

    private assertValidIndex(i: number, length: number, allowEqualLength: boolean = false): void {
        IllegalArgumentException.assert(Number.isInteger(i), "index must be an integer");
        IllegalArgumentException.assert(i >= 0, "index out of bounds");
        if (allowEqualLength) {
            IllegalArgumentException.assert(i <= length, "index out of bounds");
        } else {
            IllegalArgumentException.assert(i < length, "index out of bounds");
        }
    }
}
