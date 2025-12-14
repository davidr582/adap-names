import { Equality } from "../common/Equality";
import { Cloneable } from "../common/Cloneable";
import { Printable } from "../common/Printable";

/**
 * A name is a sequence of string components separated by a delimiter character.
 * Special characters within the string may need masking, if they are to appear verbatim.
 * The escape character can't be set, the delimiter character can.
 * 
 * Examples
 * 
 * "oss.cs.fau.de" is a name with four name components and the delimiter character '.'.
 * "///" is a name with four empty components and the delimiter character '/'.
 * "Oh\\./\\./\\." is a name with one component, if the delimiter character is '.'.
 * 
 * All implementations are immutable value objects. Any modifying operation returns a new instance.
 */
export interface Name extends Cloneable, Printable, Equality {

    /**
     * Returns true, if number of components == 0; else false
     */
    isEmpty(): boolean;

    /** 
     * Returns number of components in Name instance
     */
    getNoComponents(): number;

    getComponent(i: number): string;

    /** Expects that new Name component c is properly masked */
    setComponent(i: number, c: string): Name;

    /** Expects that new Name component c is properly masked */
    insert(i: number, c: string): Name;

    /** Expects that new Name component c is properly masked */
    append(c: string): Name;

    remove(i: number): Name;
    
    concat(other: Name): Name;
    
}
