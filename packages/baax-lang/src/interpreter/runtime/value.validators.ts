import { ScriptError } from "../interpreterErrors";
import { ValueType } from "./value";

// Validators
function expectNumber(value: ValueType["Value"]): ValueType["Number"] {
  if (value.kind === "number") {
    return value;
  } else {
    throw new Error("NUMBER EXPECTED");
  }
}
function expectString(value: ValueType["Value"]): ValueType["String"] {
  if (value.kind === "string") {
    return value;
  } else {
    const src = (value as any).src ?? {};
    const pos = src.pos;
    throw new ScriptError(`STRING EXPECTED`, pos);
  }
}
function expectBoolean(value: ValueType["Value"]): ValueType["Boolean"] {
  if (value.kind === "boolean") {
    return value;
  } else {
    throw new Error("BOOLEAN EXPECTED");
  }
}
export { expectBoolean, expectNumber, expectString };
