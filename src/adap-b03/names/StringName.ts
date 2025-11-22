import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";

export class StringName extends AbstractName {

    protected name: string = "";
    protected noComponents: number = 0;

    constructor(source: string, delimiter?: string) {
        super(delimiter);
        this.name = source;
        this.noComponents = this.getNoComponents();
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
        return this.splitComponents().length;
    }

    public getComponent(i: number): string {
        const comps = this.splitComponents();
        if (i < 0 || i >= comps.length) throw new RangeError("index out of bounds");
        return comps[i];
    }

    public setComponent(i: number, c: string) {
        const comps = this.splitComponents();
        if (i < 0 || i >= comps.length) throw new RangeError("index out of bounds");
        comps[i] = c;
        this.rebuild(comps);
    }

    public insert(i: number, c: string) {
        const comps = this.splitComponents();
        if (i < 0 || i > comps.length) throw new RangeError("index out of bounds");
        comps.splice(i, 0, c);
        this.rebuild(comps);
    }

    public append(c: string) {
        const comps = this.splitComponents();
        comps.push(c);
        this.rebuild(comps);
    }

    public remove(i: number) {
        const comps = this.splitComponents();
        if (i < 0 || i >= comps.length) throw new RangeError("index out of bounds");
        comps.splice(i, 1);
        this.rebuild(comps);
    }

    public concat(other: Name): void {
        super.concat(other);
    }

    private splitComponents(): string[] {
        const result: string[] = [];
        let current = "";
        let escaped = false;

        for (let i = 0; i < this.name.length; i++) {
            const ch = this.name[i];

            if (escaped) {
                current += ch;          // treat literally
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
    }

}
