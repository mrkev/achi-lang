import { Value } from "./interpreter";
import { NamedRecordKlass } from "./runtime/NamedRecordConstructor";
import { nullthrows } from "./nullthrows";

/**
 * Context handles variable/ scoping, stack frames (TODO), etc
 */
export class Context {
  static create() {
    return new Context();
  }

  private valueScopes: Scope<Value>[] = [new Scope(null)];

  // TODO: standard types, like records?
  types: Map<string, NamedRecordKlass> = new Map();

  pushScope() {
    const currentScope = this.valueScopes.at(-1);
    if (!currentScope) {
      throw new Error("No current scope");
    }
    this.valueScopes.push(currentScope);
  }

  popScope() {
    console.log(this.valueScopes);
    if (this.valueScopes.length === 1) {
      throw new Error("Attempting to pop global (frist) scope!");
    }
    this.valueScopes.pop();
  }

  values(): Scope<Value> {
    const currentScope = nullthrows(
      this.valueScopes[this.valueScopes.length - 1]
    );
    return currentScope;
  }
}

class Scope<T> {
  parent: Scope<T> | null;
  map: Map<string, T> = new Map();

  constructor(parent: Scope<T> | null) {
    this.parent = parent;
  }

  has(identifer: string): boolean {
    if (this.map.has(identifer)) {
      return true;
    } else if (this.parent != null) {
      return this.parent.has(identifer);
    } else {
      return false;
    }
  }

  define(identifer: string, value: T) {
    // only disallow overriding own scope
    if (this.map.has(identifer)) {
      throw new Error(`${identifer} is already defined`);
    }
    this.map.set(identifer, value);
  }

  // TODO: override in its right scope
  set(identifer: string, value: T) {
    if (!this.has(identifer)) {
      throw new Error(`no definition for ${identifer} found`);
    }
    this.map.set(identifer, value);
  }

  get(identifer: string): T | null {
    if (this.map.has(identifer)) {
      return nullthrows(this.map.get(identifer), "checked for existance above");
    }
    if (this.parent != null) {
      return this.parent.get(identifer);
    }
    return null;
  }

  getOrThrow(identifer: string, errorMsg: string): T {
    const value = this.get(identifer);
    if (value == null) {
      throw new Error(errorMsg);
    }
    return value;
  }
}
