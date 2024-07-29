import { exhaustive } from "../nullthrows";
import { LangType } from "../parser/parser";
import { DynamicTypeError } from "./interpreterErrors";
import { ValueType } from "./runtime/value";

/** @throws DynamicTypeError */
export function dynamicTypecheck(
  value: ValueType["Value"],
  type: LangType["TypeExpression"]
): void {
  // console.log(
  //   "Checking that",
  //   stringOfValue(value),
  //   "conforms to",
  //   stringOfAst(type),
  //   type
  // );
  switch (type.kind) {
    case "RecordDefinition": {
      if (value.kind !== "RecordInstance") {
        throw new DynamicTypeError(type, value);
      } else {
        return dynamicTypecheckRecord(value, type);
      }
    }
    // case "NamedRecordDefinition": {
    //   if (value.kind !== "NamedRecordInstance") {
    //     throw new DynamicTypeError(type, value);
    //   } else {
    //     return dynamicTypecheckNamedRecord(value, type);
    //   }
    // }
    case "BinaryTypeOperation":
    case "BooleanLiteral":
    case "NumberLiteral":
    case "PrefixUnaryTypeOperation":
    case "StringLiteral":
    case "TypeIdentifier": {
      // TODO
      break;
    }

    default:
      throw exhaustive(type);
  }
}

function dynamicTypecheckRecord(
  recordInstance: ValueType["RecordInstance"],
  type: LangType["RecordDefinition"]
) {
  const recordProps = new Set(recordInstance.props.keys());

  // for (const [propKey, type] of namedRecordKlass.valueSpec) {
  //   const value = recordInstance.props.get(propKey);
  //   if (value == null) {
  //     throw new Error(
  //       `Type ${namedRecordKlass.classname} requires prop ${propKey}`
  //     );
  //   }
  //   recordProps.delete(propKey);

  //   // console.log(propKey, type, recordInstance.props.get(propKey));

  //   // TODO: typecheck
  // }

  // if (recordProps.size > 0) {
  //   throw new Error(
  //     `Type ${namedRecordKlass.classname} doesnt expect keys: ${Array.from(
  //       recordProps
  //     ).join(", ")}`
  //   );
  // }
}

function dynamicTypecheckNamedRecord(
  value: ValueType["NamedRecordInstance"],
  type: LangType["NamedRecordDefinition"]
) {}
