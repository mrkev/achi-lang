import * as ts from "typescript";
import { exhaustive } from "../nullthrows";
import { LangType } from "../parser/parser";

export function compileTypeExpression(
  texpr: LangType["TypeExpression"]
): ts.TypeNode {
  switch (texpr.kind) {
    case "TypeIdentifier": {
      const typeRef = ts.factory.createTypeReferenceNode(texpr.value);
      return typeRef;
    }
    case "StringLiteral": {
      return ts.factory.createLiteralTypeNode(
        ts.factory.createStringLiteral(texpr.value)
      );
    }
    case "BooleanLiteral": {
      return ts.factory.createLiteralTypeNode(
        texpr.value ? ts.factory.createTrue() : ts.factory.createFalse()
      );
    }
    case "NumberLiteral": {
      return ts.factory.createLiteralTypeNode(
        ts.factory.createNumericLiteral(texpr.value, undefined)
      );
    }
    case "BinaryTypeOperation": {
      return compileBinaryTypeOperation(texpr);
    }
    case "RecordDefinition": {
      const members = texpr.definitions.map((defn) => {
        const name = ts.factory.createIdentifier(defn.identifier.value);
        const typeNode = compileTypeExpression(defn.typeTag.typeExpression);
        return ts.factory.createPropertySignature(
          undefined,
          name,
          undefined,
          typeNode
        );
      });
      return ts.factory.createTypeLiteralNode(members);
    }
    case "PrefixUnaryTypeOperation":
      throw new Error("Unimplemented");

    default:
      throw exhaustive(texpr);
  }
}

function compileBinaryTypeOperation(
  bto: Extract<LangType["TypeExpression"], { kind: "BinaryTypeOperation" }>
): ts.TypeNode {
  switch (bto.operator) {
    case "|": {
      return ts.factory.createUnionTypeNode([
        compileTypeExpression(bto.left),
        compileTypeExpression(bto.right),
      ]);
    }
    case "&":
      throw new Error("Unimplemented");
    default:
      throw exhaustive(bto.operator);
  }
}
