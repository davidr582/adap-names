import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import { MethodFailedException } from "../common/MethodFailedException";
import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

export abstract class AbstractName implements Name {

    protected readonly delimiter: string;

    constructor(delimiter: string = DEFAULT_DELIMITER) {
        this.assertValidDelimiter(delimiter);
        this.delimiter = delimiter;
    }

    public clone(): Name {
        this.assertInvariant();
        const cloned = this.createWithComponents(this.getComponentsSnapshot());
        MethodFailedException.assert(cloned.isEqual(this), "clone failed");
        return cloned;
    }

    public asString(delimiter: string = this.delimiter): string {
        this.assertInvariant();
        this.assertValidDelimiter(delimiter);
        const components = this.getComponentsSnapshot()
            .map(component => this.unescapeComponent(component, delimiter));
        const result = components.join(delimiter);
        MethodFailedException.assert(result != null, "method failed");
        return result;
    }

    public toString(): string {
        return this.asDataString();
    }

    public asDataString(): string {
        this.assertInvariant();
        const escaped = this.getComponentsSnapshot()
            .map(component => this.escapeComponent(component, this.delimiter));
        const result = escaped.join(this.delimiter);
        MethodFailedException.assert(result != null, "method failed");
        return result;
    }

    public isEqual(other: Object): boolean {
        if (this === other) {
            return true;
        }

        if (!this.isName(other)) {
            return false;
        }

        const otherName: Name = other as Name;
        const components = this.getComponentsSnapshot();

        if (components.length !== otherName.getNoComponents()) {
            return false;
        }

        for (let i = 0; i < components.length; i++) {
            if (components[i] !== otherName.getComponent(i)) {
                return false;
            }
        }

        return true;
    }

    public getHashCode(): number {
        this.assertInvariant();
        const canonical = this.getCanonicalDataString();
        let hashCode = 0;
        for (let i = 0; i < canonical.length; i++) {
            const c = canonical.charCodeAt(i);
            hashCode = (hashCode << 5) - hashCode + c;
            hashCode |= 0;
        }
        return hashCode;
    }

    public isEmpty(): boolean {
        this.assertInvariant();
        return this.getComponentsSnapshot().length === 0;
    }

    public getDelimiterCharacter(): string {
        this.assertInvariant();
        return this.delimiter;
    }

    public getNoComponents(): number {
        this.assertInvariant();
        return this.getComponentsSnapshot().length;
    }

    public getComponent(i: number): string {
        const components = this.getComponentsSnapshot();
        this.assertValidIndex(i, components.length);
        return components[i];
    }

    public setComponent(i: number, c: string): Name {
        this.assertInvariant();
        const components = this.getComponentsSnapshot();
        this.assertValidIndex(i, components.length);
        components[i] = c;
        return this.createWithComponents(components);
    }

    public insert(i: number, c: string): Name {
        this.assertInvariant();
        const components = this.getComponentsSnapshot();
        this.assertValidIndex(i, components.length, true);
        components.splice(i, 0, c);
        return this.createWithComponents(components);
    }

    public append(c: string): Name {
        this.assertInvariant();
        const components = this.getComponentsSnapshot();
        components.push(c);
        return this.createWithComponents(components);
    }

    public remove(i: number): Name {
        this.assertInvariant();
        const components = this.getComponentsSnapshot();
        this.assertValidIndex(i, components.length);
        components.splice(i, 1);
        return this.createWithComponents(components);
    }

    public concat(other: Name): Name {
        IllegalArgumentException.assert(other != null, "other must not be null");
        this.assertInvariant();
        const components = this.getComponentsSnapshot();
        for (let i = 0; i < other.getNoComponents(); i++) {
            components.push(other.getComponent(i));
        }
        return this.createWithComponents(components);
    }

    protected abstract createWithComponents(components: string[]): Name;

    protected abstract getComponentsSnapshot(): string[];

    protected assertInvariant(): void {
        InvalidStateException.assert(this.isValidDelimiter(this.delimiter), "delimiter must be a single character");
    }

    protected assertValidDelimiter(delimiter: string | null | undefined): void {
        IllegalArgumentException.assert(this.isValidDelimiter(delimiter), "delimiter must be a single character");
    }

    protected isValidDelimiter(delimiter: string | null | undefined): boolean {
        return delimiter != null && delimiter != undefined && delimiter.length === 1;
    }

    protected escapeComponent(component: string, delimiter: string): string {
        this.assertValidDelimiter(delimiter);
        return component
            .replace(new RegExp(`\\${ESCAPE_CHARACTER}`, "g"), ESCAPE_CHARACTER + ESCAPE_CHARACTER)
            .replace(new RegExp(`\\${delimiter}`, "g"), ESCAPE_CHARACTER + delimiter);
    }

    protected unescapeComponent(component: string, delimiter: string): string {
        this.assertValidDelimiter(delimiter);
        return component
            .replace(new RegExp(`\\${ESCAPE_CHARACTER}\\${this.delimiter}`, "g"), delimiter)
            .replace(new RegExp(`\\${ESCAPE_CHARACTER}\\${ESCAPE_CHARACTER}`, "g"), ESCAPE_CHARACTER);
    }

    private getCanonicalDataString(): string {
        const components = this.getComponentsSnapshot()
            .map(component => this.escapeComponent(component, DEFAULT_DELIMITER));
        return components.join(DEFAULT_DELIMITER);
    }

    private isName(obj: any): obj is Name {
        return obj != null
            && typeof (obj as Name).getNoComponents === "function"
            && typeof (obj as Name).getComponent === "function";
    }

    protected assertValidIndex(i: number, length: number, allowEqualLength: boolean = false): void {
        IllegalArgumentException.assert(Number.isInteger(i), "index must be an integer");
        IllegalArgumentException.assert(i >= 0, "index out of bounds");
        if (allowEqualLength) {
            IllegalArgumentException.assert(i <= length, "index out of bounds");
        } else {
            IllegalArgumentException.assert(i < length, "index out of bounds");
        }
    }
}
