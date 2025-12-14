import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import { ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";

export class StringName extends AbstractName {

    private readonly name: string;
    private readonly noComponents: number;

    constructor(source: string, delimiter?: string) {
        IllegalArgumentException.assert(source != null, "source must not be null");
        super(delimiter);
        this.name = source;
        this.noComponents = this.splitComponents().length;
        this.assertInvariant();
    }

    public override clone(): Name {
        return super.clone();
    }

    public override getNoComponents(): number {
        this.assertInvariant();
        return this.noComponents;
    }

    protected createWithComponents(components: string[]): Name {
        const rebuilt = components
            .map(component => this.escapeComponent(component, this.delimiter))
            .join(this.delimiter);
        return new StringName(rebuilt, this.delimiter);
    }

    protected getComponentsSnapshot(): string[] {
        return this.splitComponents();
    }

    protected override assertInvariant(): void {
        super.assertInvariant();
        InvalidStateException.assert(this.name != null, "name must not be null");
        InvalidStateException.assert(Number.isInteger(this.noComponents), "component count must be integer");
        InvalidStateException.assert(this.noComponents >= 0, "component count must be non-negative");
        const components = this.splitComponents();
        InvalidStateException.assert(this.noComponents === components.length, "component count mismatch");
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

}
