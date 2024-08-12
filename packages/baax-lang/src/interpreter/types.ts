import { LangType } from "../parser/parser";
import { exhaustive } from "../nullthrows";

export function stringOfTypeExpression(
  typeExpression: LangType["TypeExpression"]
) {
  const { kind } = typeExpression;
  switch (kind) {
    case "BinaryTypeOperation":
    case "BooleanLiteral":
    case "NumberLiteral":
    case "PrefixUnaryTypeOperation":
    case "StringLiteral":
      return "UNIMPLEMENTED";

    case "TypeIdentifier": {
      return "[TypeIdentifier]";
    }

    case "RecordDefinition": {
      return "[RecordDefinition]";
    }

    default:
      throw exhaustive(kind);
  }
}
