import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

export abstract class AbstractName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;

    constructor(delimiter: string = DEFAULT_DELIMITER) {
        if (delimiter != undefined){
            this.delimiter = delimiter;
        }else{
            this.delimiter = DEFAULT_DELIMITER;
        }
    }

    public clone(): Name {
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

        return cloned;
    }

    public asString(delimiter: string = this.delimiter): string {
        const components: string[] = [];
        for (let i = 0; i < this.getNoComponents(); i++) {
            components.push(this.unescapeComponent(this.getComponent(i), delimiter));
        }
        return components.join(delimiter);
    }

    public toString(): string {
        return this.asDataString();
    }

    public asDataString(): string {
        const components: string[] = [];
        for (let i = 0; i < this.getNoComponents(); i++) {
            components.push(this.escapeComponent(this.getComponent(i), this.delimiter));
        }
        return components.join(this.delimiter);
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
        return this.getNoComponents() === 0;
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    abstract getNoComponents(): number;

    abstract getComponent(i: number): string;
    abstract setComponent(i: number, c: string): void;

    abstract insert(i: number, c: string): void;
    abstract append(c: string): void;
    abstract remove(i: number): void;

    public concat(other: Name): void {
        if (other == null) {
            throw new RangeError("other must not be null");
        }
        for (let i = 0; i < other.getNoComponents(); i++) {
            this.append(other.getComponent(i));
        }
    }

    protected escapeComponent(component: string, delimiter: string): string {
        return component
            .replace(new RegExp(`\\${ESCAPE_CHARACTER}`, "g"), ESCAPE_CHARACTER + ESCAPE_CHARACTER)
            .replace(new RegExp(`\\${delimiter}`, "g"), ESCAPE_CHARACTER + delimiter);
    }

    protected unescapeComponent(component: string, delimiter: string): string {
        return component
            .replace(new RegExp(`\\${ESCAPE_CHARACTER}\\${this.delimiter}`, "g"), delimiter)
            .replace(new RegExp(`\\${ESCAPE_CHARACTER}\\${ESCAPE_CHARACTER}`, "g"), ESCAPE_CHARACTER);
    }

}
