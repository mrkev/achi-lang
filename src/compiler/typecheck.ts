import * as ts from "typescript";
import * as fs from "fs";
import * as path from "path";
import { createTempDirectory } from "create-temp-directory";
import { printTSStatements } from "./compiler";

export async function typecheck(
  tsStatements: ts.Statement[]
): Promise<readonly ts.Diagnostic[]> {
  const tsfile = printTSStatements(tsStatements);
  const tempDir = await createTempDirectory();

  fs.writeFileSync(path.join(tempDir.path, "index.ts"), tsfile);

  // const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  // const sourceFile = ts.factory.createSourceFile(
  //   [ast],
  //   ts.factory.createToken(ts.SyntaxKind.EndOfFileToken),
  //   ts.NodeFlags.None
  // );
  // console.log(sourceFile);
  const program = ts.createProgram({
    rootNames: [path.join(tempDir.path, "index.ts")],
    options: {
      target: ts.ScriptTarget.ESNext,
      useDefineForClassFields: true,
      allowJs: false,
      skipLibCheck: true,
      esModuleInterop: false,
      allowSyntheticDefaultImports: true,
      strict: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      isolatedModules: true,
      noEmit: true,
      module: ts.ModuleKind.ESNext,
      moduleResolution: ts.ModuleResolutionKind.NodeNext,
    },
  });

  const diagnostics = [
    ...program.getGlobalDiagnostics(),
    ...program.getOptionsDiagnostics(),
    ...program.getSemanticDiagnostics(),
    ...program.getSyntacticDiagnostics(),
    ...program.getDeclarationDiagnostics(),
    ...program.getConfigFileParsingDiagnostics(),
  ];

  await tempDir.remove();
  return diagnostics;
}
