import { Context } from "../Context";
import { runtimeTypeOf } from "./runtimeType";
import { System } from "./System";
import { nativeFunction, nil, number, ValueType } from "./value";

function memGet(
  arg: ValueType["Value"],
  context: Context,
  system: System
): ValueType["Value"] {
  console.log(arg);

  switch (arg.kind) {
    case "RecordInstance":
    case "NamedRecordInstance":
    case "AnonymousFunctionInstance":
    case "ListInstance":
    case "MatchFunctionInstance":
    case "NamedRecordDefinitionGroupInstance":
    case "NamedRecordKlass":
    case "NativeFunctionInstance":
    case "boolean":
    case "nil":
    case "number":
    case "string":
      break;
  }

  throw new Error("memGet: Unimplemented");
  return number(3);
}

function memSet(
  obj: ValueType["Value"],
  context: Context,
  system: System
): ValueType["Value"] {
  throw new Error("memSet: Unimplemented");
  return nil();
}

export function globalScope(): Map<string, ValueType["Value"]> {
  // const [a, b] = [
  //   // runtimeTypeOf("(obj: Object, mem: string)"),
  //   // runtimeTypeOf("any"),
  // ];
  return new Map([
    ["memGet", nativeFunction(memGet)],
    ["memSet", nativeFunction(memSet)],
  ]);
}
