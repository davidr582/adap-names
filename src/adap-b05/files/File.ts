import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import { MethodFailedException } from "../common/MethodFailedException";
import { Node } from "./Node";
import { Directory } from "./Directory";

enum FileState {
    OPEN,
    CLOSED,
    DELETED        
};

export class File extends Node {

    protected state: FileState = FileState.CLOSED;

    constructor(baseName: string, parent: Directory) {
        super(baseName, parent);
    }

    public open(): void {
        InvalidStateException.assert(this.state !== FileState.DELETED, "file is deleted");
        InvalidStateException.assert(this.state === FileState.CLOSED, "file already open");
        this.state = FileState.OPEN;
    }

    public read(noBytes: number): Int8Array {
        IllegalArgumentException.assert(noBytes >= 0, "number of bytes must be non-negative");
        InvalidStateException.assert(this.state === FileState.OPEN, "file must be open");

        let result: Int8Array = new Int8Array(noBytes);

        for (let i: number = 0; i < noBytes; i++) {
            try {
                result[i] = this.readNextByte();
            } catch(ex) {
                if (ex instanceof MethodFailedException) {
                    throw ex;
                }
                throw ex;
            }
        }

        return result;
    }

    protected readNextByte(): number {
        MethodFailedException.assert(this.state === FileState.OPEN, "file must be open");
        return 0;
    }

    public close(): void {
        InvalidStateException.assert(this.state === FileState.OPEN, "file must be open");
        this.state = FileState.CLOSED;
    }

    protected doGetFileState(): FileState {
        return this.state;
    }

}
