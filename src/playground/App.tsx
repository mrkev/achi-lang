import { useState } from "react";
import "./App.css";
import { editor } from "monaco-editor";
import { System } from "../interpreter/runtime/System";
import { interpret } from "../interpreter/interpreter";
import { tryParse } from "../parser/parser";
import { compileProgram, printTSStatements } from "../compiler/compiler";
import { useLocalStorage } from "usehooks-ts";
import { registerLangForMonaco } from "../playground/registerLangForMonaco";
import { useEditor, useKeyboardShortcuts } from "./uiHooks";
import { Allotment } from "allotment";
import "allotment/dist/style.css";

const DEFAULT_SCRIPT =
  `
class Point(x: number, y: number);
const one = 1;
const point = Point(x: one, y: 2);
#log point
`.trim() + "\n";

// TODO: can return from top-level, print that?

const options: editor.IStandaloneEditorConstructionOptions = {
  fontSize: 18,
  insertSpaces: true,
  tabSize: 2,
  detectIndentation: false,
  minimap: { enabled: false },
} as const;

type Feature = "compile" | "typecheck" | "interpret" | "ast";

export default function App() {
  const [initialScript, setInitialScript] = useLocalStorage(
    "script",
    DEFAULT_SCRIPT
  );
  const [scripts, setScripts] = useLocalStorage<string[]>("scripts", []);
  const [log, setLog] = useState<(Error | string)[]>([]);

  // TODO: make linked set its own package and use it here
  const [featureArr, setFeatures] = useLocalStorage<Array<Feature>>(
    "features",
    ["compile", "typecheck", "interpret", "ast"]
  );

  const features = new Set(featureArr);

  const [tsEditor, tsEditorRef] = useEditor({
    language: "typescript",
    height: "50vh",
    theme: "vs-dark",
    options,
  });

  const [astEditor, astEditorRef] = useEditor({
    language: "json",
    theme: "vs-dark",
    height: "50vh",
  });

  const [scriptEditor, scriptEditorRef] = useEditor({
    language: "achi",
    theme: "vs-dark",
    options: options,
    height: "50vh",
    defaultValue: initialScript,
    // try "same", "indent" or "none"
    // wrappingIndent: "indent",
    beforeMount: registerLangForMonaco,
  });

  useKeyboardShortcuts(doEvaluate);

  function doEvaluate() {
    const system = new System();

    try {
      const editor = scriptEditorRef.current;
      if (!editor) {
        throw new Error("no editor");
      }

      const script = editor.getValue();
      setInitialScript(script);

      const ast = tryParse(script);
      console.log("HERE");
      astEditorRef.current?.setValue(JSON.stringify(ast, null, 2));

      if (features.has("compile")) {
        const tsAst = compileProgram(ast);
        const printed =
          tsAst instanceof Error
            ? "# Compiler error\n" + tsAst.message + "\n" + tsAst.stack
            : printTSStatements(tsAst);
        tsEditorRef.current?.setValue(printed);
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
    console.log("done.");
    setLog(system.console._log);
  }

  const doSave = () => {
    const editor = scriptEditorRef.current;
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
            <details style={{ color: "red" }} key={i}>
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
              (feature) => {
                const isOn = features.has(feature);
                return (
                  <>
                    <input
                      type="checkbox"
                      checked={isOn}
                      onChange={(e) => {
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
                  </>
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
                      scriptEditorRef.current?.setValue(script);
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
