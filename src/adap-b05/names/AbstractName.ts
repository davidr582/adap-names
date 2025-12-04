import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import { MethodFailedException } from "../common/MethodFailedException";
import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

export abstract class AbstractName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;

    constructor(delimiter: string = DEFAULT_DELIMITER) {
        this.assertValidDelimiter(delimiter);
        this.delimiter = delimiter;
    }

    public clone(): Name {
        this.assertInvariant();
        const cloned = Object.assign(
            Object.create(Object.getPrototypeOf(this)),
            this
        ) as AbstractName;

        for (const key of Object.keys(this)) {
            const value = (this as any)[key];
            if (Array.isArray(value)) {
                (cloned as any)[key] = [...value];
            }
        }

        (cloned as AbstractName).assertInvariant();
        return cloned;
    }

    public asString(delimiter: string = this.delimiter): string {
        this.assertInvariant();
        this.assertValidDelimiter(delimiter);
        const components: string[] = [];
        for (let i = 0; i < this.getNoComponents(); i++) {
            components.push(this.unescapeComponent(this.getComponent(i), delimiter));
        }
        const result = components.join(delimiter);
        MethodFailedException.assert(result != null, "method failed");
        return result;
    }

    public toString(): string {
        return this.asDataString();
    }

    public asDataString(): string {
        this.assertInvariant();
        const components: string[] = [];
        for (let i = 0; i < this.getNoComponents(); i++) {
            components.push(this.escapeComponent(this.getComponent(i), this.delimiter));
        }
        const result = components.join(this.delimiter);
        MethodFailedException.assert(result != null, "method failed");
        return result;
    }

    public isEqual(other: Name): boolean {
        if (this === other) {
            return true;
        }

        if (other == null || this.getNoComponents() !== other.getNoComponents()) {
            return false;
        }

        for (let i = 0; i < this.getNoComponents(); i++) {
            if (this.getComponent(i) !== other.getComponent(i)) {
                return false;
            }
        }

        return true;
    }

    public getHashCode(): number {
        this.assertInvariant();
        let hashCode = 0;
        const s = this.asDataString();
        for (let i = 0; i < s.length; i++) {
            const c = s.charCodeAt(i);
            hashCode = (hashCode << 5) - hashCode + c;
            hashCode |= 0; // force 32-bit integer
        }
        return hashCode;
    }

    public isEmpty(): boolean {
        this.assertInvariant();
        return this.getNoComponents() === 0;
    }

    public getDelimiterCharacter(): string {
        this.assertInvariant();
        return this.delimiter;
    }

    abstract getNoComponents(): number;

    abstract getComponent(i: number): string;
    abstract setComponent(i: number, c: string): void;

    abstract insert(i: number, c: string): void;
    abstract append(c: string): void;
    abstract remove(i: number): void;

    public concat(other: Name): void {
        IllegalArgumentException.assert(other != null, "other must not be null");
        this.assertInvariant();
        const startComponents = this.getNoComponents();
        for (let i = 0; i < other.getNoComponents(); i++) {
            this.append(other.getComponent(i));
        }
        this.assertInvariant();
        MethodFailedException.assert(this.getNoComponents() === startComponents + other.getNoComponents(), "concat failed");
    }

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
        this.assertInvariant();
        return component
            .replace(new RegExp(`\\${ESCAPE_CHARACTER}\\${this.delimiter}`, "g"), delimiter)
            .replace(new RegExp(`\\${ESCAPE_CHARACTER}\\${ESCAPE_CHARACTER}`, "g"), ESCAPE_CHARACTER);
    }

}
