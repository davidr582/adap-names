import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

export class StringName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;
    protected name: string = "";
    protected noComponents: number = 0;

    constructor(source: string, delimiter?: string) {
        this.name = source;
        if (delimiter != undefined){
            this.delimiter = delimiter;
        }else{
            this.delimiter = DEFAULT_DELIMITER;
        }
        this.noComponents = this.getNoComponents();
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

    private escapeComponent(c: string): string {
        return c
            .replace(new RegExp(`\\${ESCAPE_CHARACTER}`, "g"), ESCAPE_CHARACTER + ESCAPE_CHARACTER)
            .replace(new RegExp(`\\${this.delimiter}`, "g"), ESCAPE_CHARACTER + this.delimiter);
    }

    private unescapeComponent(c: string): string {
        return c
            .replace(new RegExp(`\\${ESCAPE_CHARACTER}\\${this.delimiter}`, "g"), this.delimiter)
            .replace(new RegExp(`\\${ESCAPE_CHARACTER}\\${ESCAPE_CHARACTER}`, "g"), ESCAPE_CHARACTER);
    }

    private rebuild(components: string[]): void {
        this.name = components.map(c => this.escapeComponent(c)).join(this.delimiter);
    }

    public asString(delimiter: string = this.delimiter): string {
        return this.splitComponents()
            .map(c => this.unescapeComponent(c))
            .join(delimiter);
    }

    public asDataString(): string {
        return this.name;
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    public isEmpty(): boolean {
        return this.name.length === 0;
    }

    public getNoComponents(): number {
        return this.splitComponents().length;
    }

    public getComponent(x: number): string {
        const comps = this.splitComponents();
        if (x < 0 || x >= comps.length) throw new RangeError("index out of bounds");
        return comps[x];
    }

    public setComponent(n: number, c: string): void {
        const comps = this.splitComponents();
        if (n < 0 || n >= comps.length) throw new RangeError("index out of bounds");
        comps[n] = c;
        this.rebuild(comps);
    }

    public insert(n: number, c: string): void {
        const comps = this.splitComponents();
        if (n < 0 || n > comps.length) throw new RangeError("index out of bounds");
        comps.splice(n, 0, c);
        this.rebuild(comps);
    }

    public append(c: string): void {
        const comps = this.splitComponents();
        comps.push(c);
        this.rebuild(comps);
    }

    public remove(n: number): void {
        const comps = this.splitComponents();
        if (n < 0 || n >= comps.length) throw new RangeError("index out of bounds");
        comps.splice(n, 1);
        this.rebuild(comps);
    }

    public concat(other: Name): void {
        const comps = this.splitComponents();
        for (let i = 0; i < other.getNoComponents(); i++) {
            comps.push(other.getComponent(i));
        }
        this.rebuild(comps);
    }

}