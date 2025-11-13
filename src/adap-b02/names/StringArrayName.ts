import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

export class StringArrayName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;
    protected components: string[] = [];

    constructor(source: string[], delimiter?: string) {
        this.components = [...source];
        if (delimiter != undefined){
            this.delimiter = delimiter;
        }else{
            this.delimiter = DEFAULT_DELIMITER;
        }
    }

    public asString(delimiter: string = this.delimiter): string {
        return this.components
            .map(c => this.unescapeComponent(c, delimiter))
            .join(this.delimiter); 
    }

    public asDataString(): string {
        return this.components
            .map(c => this.escapeComponent(c, this.delimiter))
            .join(this.delimiter);  
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    public isEmpty(): boolean {
        return this.components.length == 0;
    }

    public getNoComponents(): number {
        return this.components.length;
    }

    public getComponent(i: number): string {
        if (i < 0) {throw new Error("i cant be negative")};
        if (i >= this.getNoComponents()){throw new RangeError("index out of bounds")};
        return this.components[i];
    }

    public setComponent(i: number, c: string): void {
        if (i < 0) {throw new RangeError("i cant be negative")};
        if (i >= this.getNoComponents()){throw new RangeError("index out of bounds")};
        this.components[i] = c;
    }

    public insert(i: number, c: string): void {
        if (i < 0) {throw new RangeError("i cant be negative")};
        if (i >= this.getNoComponents()){throw new RangeError("index out of bounds")};
        this.components.splice(i, 0, c);
    }

    public append(c: string): void {
        this.components.push(c);
    }

    public remove(i: number): void {
        if (i < 0) {throw new RangeError("i cant be negative")};
        if (i >= this.getNoComponents()){throw new RangeError("index out of bounds")};
        this.components.splice(i, 1)
    }

    public concat(other: Name): void {
        for(let i = 0; i < other.getNoComponents(); i++) {
            this.append(other.getComponent(i));
        }
    }

    /**  @methodtype utility-method */
    private escapeComponent(component: string, delimiter: string): string {
        return component
            .replace(new RegExp(`\\${ESCAPE_CHARACTER}`, 'g'), ESCAPE_CHARACTER + ESCAPE_CHARACTER)
            .replace(new RegExp(`\\${delimiter}`, 'g'), ESCAPE_CHARACTER + delimiter);
    }

    /**  @methodtype utility-method */
    private unescapeComponent(component: string, delimiter: string): string {
        return component
            .replace(new RegExp(`\\${ESCAPE_CHARACTER}\\${this.delimiter}`, 'g'), delimiter)
            .replace(new RegExp(`\\${ESCAPE_CHARACTER}\\${ESCAPE_CHARACTER}`, 'g'), ESCAPE_CHARACTER);
    }

}