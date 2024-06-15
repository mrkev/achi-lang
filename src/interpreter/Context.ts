import { Type } from "../checker/types";
import { LangType } from "../parser/parser";
import { nullthrows } from "./nullthrows";
import {
  AnonymousFunctionInstance,
  MatchFunctionInstance,
} from "./runtime/runtime.functions";
import {
  NamedRecordDefinitionGroupInstance,
  NamedRecordKlass,
} from "./runtime/runtime.namedrecords";
import { ValueType } from "./runtime/value";
import { printableOfValue } from "./stringOfValue";

// Node => Type
// string => Value

type RuntimeTypeStructures =
  | NamedRecordKlass
  | NamedRecordDefinitionGroupInstance;

/**
 * Context handles variable/ scoping, stack frames (TODO), etc
 */
export class Context {
  static create() {
    return new Context();
  }

  // Currently unused
  readonly stack: Array<AnonymousFunctionInstance | MatchFunctionInstance> = [];

  // Identifier "string" => Value
  // Operates at a block level
  readonly valueScope: Scope<string, ValueType["Value"]> = new Scope();

  // string -> OGIdentifier
  // OGIdentifier -> value

  //
  readonly typeScope: Scope<string, unknown> = new Scope();

  // TODO: standard types, like records?
  // TODO: Should this just go in valueScope?
  types: Map<string, RuntimeTypeStructures> = new Map();

  staticTypes: Map<LangType["Expression"], Type> = new Map();

  ////////////////// Types

  getTypeOrThrow(
    identifer: LangType["TypeIdentifier"] | LangType["NestedTypeIdentifier"],
    msg?: string
  ): NamedRecordKlass | NamedRecordDefinitionGroupInstance {
    const { kind } = identifer;
    switch (kind) {
      case "TypeIdentifier": {
        const result = this.types.get(identifer.value);
        if (result == null) {
          throw new Error(msg ?? `Unknown type ${identifer.value}`);
        }
        return result;
      }

      case "NestedTypeIdentifier": {
        // Currently just supporting strictly one level of nesting
        const [parent, child] = identifer.path;
        const group = this.getTypeOrThrow(
          parent,
          `Unknown NamedRecordDefinitionGroup ${parent.value}`
        );

        if (!(group instanceof NamedRecordDefinitionGroupInstance)) {
          throw new Error(
            `${parent.value} is not a NamedRecordDefinitionGroup`
          );
        }

        const klass = group.klasses.get(child.value);

        if (klass == null) {
          console.log(group);
          throw new Error(`${parent.value}.${child.value} does not exist`);
        }

        return klass;
      }
    }
  }
}

class Scope<K, V> {
  // Note, we start with no scopes. We need to make sure we push
  // a sope before we try to define variables
  readonly _stack: Map<K, V>[] = [];

  push() {
    this._stack.push(new Map());
  }

  pop() {
    if (this._stack.length === 0) {
      throw new Error("Can't pop from empty scope stack!");
    }
    // console.log("this", this._stack.length);
    this._stack.pop();
    // console.log("this", this._stack.length);
  }

  private peek() {
    return this._stack[this._stack.length - 1];
  }

  has(key: K): boolean {
    for (let i = this._stack.length - 1; i > -1; i--) {
      const current = this._stack[i];
      if (current.has(key)) {
        return true;
      }
    }
    return false;
  }

  // two checks to be done at a higher level:
  // - defining something that exists alrady
  // - setting something that hasn't been defined
  // also, when setting a variable that exists already we want to
  // override it, not replace it on the current scope, right?
  set(key: K, value: V) {
    const top = this.peek();
    if (top == null) {
      throw new Error(`no stack element to set into`);
    }

    if (this.has(key)) {
      throw new Error("Cant redefine " + key);
    }

    top.set(key, value);
  }

  define(key: K, value: V) {
    const top = this.peek();
    if (top == null) {
      throw new Error(`no stack element to set into`);
    }
    top.set(key, value);
  }

  get(key: K, errMsg?: string): V {
    const top = this.peek();
    if (top == null) {
      throw new Error(`no stack element to get from`);
    }

    for (let i = this._stack.length - 1; i > -1; i--) {
      const current = this._stack[i];
      if (current.has(key)) {
        // const val = top.get(key);
        // if (val == null) {
        //   console.log("key", key, top.get(key));
        // }
        return nullthrows(current.get(key), "checked for existance above");
      }
    }
    throw new Error(errMsg ?? `'${key}' not in scope`);
  }

  // Used when setting all the bindings in a pattern match at once.
  // In theory, this handles not duplicating binding names
  setAll(entries: Array<[K, V]>) {
    for (const [key, value] of entries) {
      this.set(key, value);
    }
  }
}

export function stringOfValueScope(scope: Scope<string, ValueType["Value"]>) {
  let res = "Value Scope: ";
  for (const i in scope._stack) {
    const map = scope._stack[i];
    const mapRes: Record<string, any> = {};
    for (const [key, value] of map.entries()) {
      mapRes[key] = printableOfValue(value);
    }
    res += `(${i}): ${JSON.stringify(mapRes, null, 2)}\n`;
  }
  return res;
}
