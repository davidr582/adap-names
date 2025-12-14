import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";

export class StringArrayName extends AbstractName {

    private readonly components: readonly string[];

    constructor(source: string[], delimiter?: string) {
        IllegalArgumentException.assert(source != null, "source must not be null");
        super(delimiter);
        this.components = [...source];
        this.assertInvariant();
    }

    public override clone(): Name {
        return super.clone();
    }

    protected createWithComponents(components: string[]): Name {
        return new StringArrayName(components, this.delimiter);
    }

    protected getComponentsSnapshot(): string[] {
        return [...this.components];
    }

    protected override assertInvariant(): void {
        super.assertInvariant();
        InvalidStateException.assert(Array.isArray(this.components), "components must be an array");
        for (const comp of this.components) {
            InvalidStateException.assert(comp != null, "components must not contain null");
        }
    }
}
