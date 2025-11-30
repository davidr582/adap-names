import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import { MethodFailedException } from "../common/MethodFailedException";
import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";

export class StringName extends AbstractName {

    protected name: string = "";
    protected noComponents: number = 0;

    constructor(source: string, delimiter?: string) {
        IllegalArgumentException.assert(source != null, "source must not be null");
        super(delimiter);
        this.name = source;
        this.noComponents = this.splitComponents().length;
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
        return this.splitComponents().length;
    }

    public getComponent(i: number): string {
        const comps = this.splitComponents();
        this.assertValidIndex(i, comps.length);
        return comps[i];
    }

    public setComponent(i: number, c: string) {
        const comps = this.splitComponents();
        this.assertValidIndex(i, comps.length);
        const originalLength = comps.length;
        comps[i] = c;
        this.rebuild(comps);
        this.assertInvariant();
        MethodFailedException.assert(this.getNoComponents() === originalLength, "setComponent failed");
        MethodFailedException.assert(this.getComponent(i) === c, "setComponent failed");
    }

    public insert(i: number, c: string) {
        const comps = this.splitComponents();
        this.assertValidIndex(i, comps.length, true);
        const originalLength = comps.length;
        comps.splice(i, 0, c);
        this.rebuild(comps);
        this.assertInvariant();
        MethodFailedException.assert(this.getNoComponents() === originalLength + 1, "insert failed");
        MethodFailedException.assert(this.getComponent(i) === c, "insert failed");
    }

    public append(c: string) {
        const comps = this.splitComponents();
        const originalLength = comps.length;
        comps.push(c);
        this.rebuild(comps);
        this.assertInvariant();
        MethodFailedException.assert(this.getNoComponents() === originalLength + 1, "append failed");
        MethodFailedException.assert(this.getComponent(this.getNoComponents() - 1) === c, "append failed");
    }

    public remove(i: number) {
        const comps = this.splitComponents();
        this.assertValidIndex(i, comps.length);
        const originalLength = comps.length;
        comps.splice(i, 1);
        this.rebuild(comps);
        this.assertInvariant();
        MethodFailedException.assert(this.getNoComponents() === originalLength - 1, "remove failed");
    }

    public concat(other: Name): void {
        super.concat(other);
    }

    protected assertInvariant(): void {
        super.assertInvariant();
        InvalidStateException.assert(this.name != null, "name must not be null");
        const components = this.splitComponents();
        InvalidStateException.assert(this.noComponents === components.length, "component count mismatch");
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

    private splitComponents(): string[] {
        const result: string[] = [];
        let current = "";
        let escaped = false;

        for (let i = 0; i < this.name.length; i++) {
            const ch = this.name[i];

            if (escaped) {
                current += ch;
                escaped = false;
            } else if (ch === ESCAPE_CHARACTER) {
                escaped = true;
            } else if (ch === this.delimiter) {
                result.push(current);
                current = "";
            } else {
                current += ch;
            }
        }
        result.push(current);
        return result;
    }

    private rebuild(components: string[]): void {
        this.name = components.map(c => this.escapeComponent(c, this.delimiter)).join(this.delimiter);
        this.noComponents = components.length;
    }

}
