import { useEffect, useState } from "react";
import "./App.css";
import { System } from "../interpreter/runtime/System";
import { interpret } from "../interpreter/interpreter";
import { tryParse } from "../parser/parser";
import { compileProgram, printTSStatements } from "../compiler/compiler";
import { useLocalStorage } from "usehooks-ts";
import { registerLangForMonaco } from "../playground/registerLangForMonaco";
import { useKeyboardShortcuts } from "./uiHooks";
import { useEditor } from "./useEditor";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { editor, Position } from "monaco-editor";
import * as monaco from "monaco-editor";
import React from "react";
import { DEFAULT_SCRIPT } from "./constants";

const COMPACT_AST = true;

function getJSONObjectAtPosition(
  position: Position,
  editor: editor.IStandaloneCodeEditor
): Error | string {
  const model = editor.getModel();
  if (!model) {
    return new Error("no model");
  }
  const { range: prev } =
    model.findPreviousMatch("{", position, false, false, null, false) ?? {};

  if (!prev) {
    return new Error("no prev");
  }

  const lastLine = model.getLineCount();
  const lastColumn = model.getLineMaxColumn(lastLine);

  const str = model.getValueInRange(
    new monaco.Range(
      prev.startLineNumber,
      prev.startColumn,
      lastLine,
      lastColumn
    )
  );

  let openSquareBrackets = 0;
  let openCurlyBraces = 0;
  let endIndex = 0;

  for (let i = 0; i < str.length; i++) {
    if (str[i] === "[") {
      openSquareBrackets++;
    } else if (str[i] === "{") {
      openCurlyBraces++;
    } else if (str[i] === "]") {
      openSquareBrackets--;
    } else if (str[i] === "}") {
      openCurlyBraces--;
    }

    if (openSquareBrackets === 0 && openCurlyBraces === 0) {
      endIndex = i;
      break;
    }
  }

  return str.substring(0, endIndex + 1);
}

const options: editor.IStandaloneEditorConstructionOptions = {
  fontSize: 18,
  insertSpaces: true,
  tabSize: 2,
  detectIndentation: false,
  minimap: { enabled: false },
} as const;

type Feature = "compile" | "typecheck" | "interpret" | "ast";

export default function App() {
  const [script, setScript] = useLocalStorage("script", DEFAULT_SCRIPT);
  const [scripts, setScripts] = useLocalStorage<string[]>("scripts", []);
  const [log, setLog] = useState<(Error | string)[]>([]);
  const [decoratorRange, setDecoratorRange] = useState<null | monaco.Range>(
    null
  );

  // TODO: make linked set its own package and use it here
  const [featureArr, setFeatures] = useLocalStorage<Feature[]>("features", [
    "compile",
    "typecheck",
    "interpret",
    "ast",
  ]);

  const features = new Set(featureArr);

  const [tsEditor, tsEditorObj] = useEditor({
    language: "typescript",
    height: "50vh",
    theme: "vs-dark",
    options,
  });

  const [astEditor, astEditorObj] = useEditor({
    language: "json",
    theme: "vs-dark",
    height: "50vh",
  });

  const [scriptEditor, scriptEditorObj] = useEditor(
    {
      language: "achi",
      theme: "vs-dark",
      options: options,
      height: "50vh",
      defaultValue: script,
      // try "same", "indent" or "none"
      // wrappingIndent: "indent",
      beforeMount: registerLangForMonaco,
    },
    decoratorRange
  );

  useEffect(() => {
    if (!astEditorObj) {
      return;
    }

    const disposable = astEditorObj.onDidChangeCursorPosition(async (e) => {
      const editor = astEditorObj;
      const model = editor.getModel();
      setDecoratorRange(null);
      if (!model) {
        return null;
      }

      const value = getJSONObjectAtPosition(e.position, editor);

      try {
        if (value instanceof Error) {
          throw value;
        }

        const parsed = JSON.parse(value);
        const { kind, _meta: meta } = parsed;
        if (!kind || !meta) {
          return;
        }

        setDecoratorRange(
          new monaco.Range(
            meta.start.line,
            meta.start.column,
            meta.end.line,
            meta.end.column
          )
        );

        console.log(`${kind}@[${meta.start.line}:${meta.start.column}]`);
      } catch (e) {
        console.groupCollapsed("cant parse");
        console.log("value", value);
        console.error(e);
        console.groupEnd();
      }
    });

    return () => {
      disposable.dispose();
    };
  }, [astEditorObj]);

  useKeyboardShortcuts(doEvaluate);

  function doEvaluate() {
    const system = new System();
    const editor = scriptEditorObj;

    try {
      if (!editor) {
        throw new Error("no editor");
      }

      const script = editor.getValue();
      setScript(script);

      const ast = tryParse(script);
      astEditorObj?.setValue(JSON.stringify(ast, COMPACT_AST ? null : null, 2));

      if (features.has("compile")) {
        const tsAst = compileProgram(ast);
        const printed =
          tsAst instanceof Error
            ? "# Compiler error\n" + tsAst.message + "\n" + tsAst.stack
            : printTSStatements(tsAst);
        tsEditorObj?.setValue(printed);
      }

      if (features.has("typecheck")) {
        // check(script, undefined, system);
      }

      interpret(script, system);
    } catch (e) {
      if (e instanceof Error || typeof e === "string") {
        system.console.log(e);
      }
      console.error(e);
    }

    setLog(system.console._log);
  }

  const doSave = () => {
    const editor = scriptEditorObj;
    if (!editor) {
      throw new Error("no editor");
    }
    const script = editor.getValue();
    setScripts(scripts.concat([script]));
  };

  const evaluationBox = (
    <div style={{ width: "100%", flexShrink: 0, overflow: "scroll" }}>
      <button onClick={doEvaluate}>Evaluate</button>
      <button onClick={doSave}>Save</button>
      <pre>
        {log.map((msg, i) => {
          return msg instanceof Error ? (
            <details style={{ color: "red" }} key={`e${i}`}>
              <summary>{msg.message}</summary>
              {msg.stack}
            </details>
          ) : (
            <span key={i}>
              {msg}
              <br />
            </span>
          );
        })}
      </pre>
    </div>
  );

  return (
    <>
      <Allotment>
        <Allotment.Pane minSize={100} maxSize={200}>
          <details>
            <summary>configure</summary>
            {(["compile", "typecheck", "interpret", "ast"] as const).map(
              (feature, i) => {
                const isOn = features.has(feature);
                return (
                  <React.Fragment key={i}>
                    <input
                      type="checkbox"
                      checked={isOn}
                      onChange={() => {
                        if (isOn) {
                          features.delete(feature);
                        } else {
                          features.add(feature);
                        }
                        setFeatures([...features.values()]);
                      }}
                    />
                    <label>{feature}</label>
                    <br />
                  </React.Fragment>
                );
              }
            )}
          </details>

          <hr />
          <ul
            style={{
              listStyleType: "none",
              padding: 0,
            }}
          >
            {scripts.map((script, i) => {
              return (
                <li key={i}>
                  <button
                    onClick={() => {
                      scriptEditorObj?.setValue(script);
                    }}
                  >
                    {script.split("\n")[0]}
                  </button>
                </li>
              );
            })}
          </ul>
        </Allotment.Pane>

        <div
          style={{
            width: "100%",
            height: "100%",
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gridTemplateRows: "repeat(2, 1fr)",
          }}
        >
          {scriptEditor}
          {features.has("ast") ? astEditor : <div />}
          {evaluationBox}
          {features.has("compile") ? tsEditor : <div />}
        </div>
      </Allotment>
    </>
  );
}
