import { LangType } from "../parser/parser";
import { exhaustive } from "./nullthrows";

export function stringOfType(typeExpression: LangType["TypeExpression"]) {
  const { kind } = typeExpression;
  switch (kind) {
    case "NamedRecordDefinition": {
      return "[NamedRecordDefinition]";
    }

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
