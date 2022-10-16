import React, { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import Editor, { EditorProps } from "@monaco-editor/react";
import monaco, { editor } from "monaco-editor";
import { System } from "../interpreter/runtime/System";
import { interpret } from "../interpreter/interpreter";
import { tryParse } from "../parser/parser";
import { compileProgram, printTSStatements } from "../compiler/compiler";
import { check } from "../checker/checker";
import { useLocalStorage } from "usehooks-ts";
import { registerLangForMonaco } from "../playground/registerLangForMonaco";

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

function useEditor(
  props: Omit<EditorProps, "onMount">
): [
  React.ReactElement,
  React.MutableRefObject<monaco.editor.IStandaloneCodeEditor | null>
] {
  const editorRef = useRef<monaco.editor.IStandaloneCodeEditor | null>(null);
  const handleEditorDidMount = useCallback(
    (editor: monaco.editor.IStandaloneCodeEditor) => {
      editorRef.current = editor;
    },
    []
  );

  return [<Editor {...props} onMount={handleEditorDidMount} />, editorRef];
}

export default function App() {
  const [initialScript, setInitialScript] = useLocalStorage(
    "script",
    DEFAULT_SCRIPT
  );
  const [scripts, setScripts] = useLocalStorage<string[]>("scripts", []);
  const [log, setLog] = useState<(Error | string)[]>([]);

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
      const tsAst = compileProgram(ast);

      const printed =
        tsAst instanceof Error
          ? "# Compiler error\n" + tsAst.message + "\n" + tsAst.stack
          : printTSStatements(tsAst);
      tsEditorRef.current?.setValue(printed);

      // check(script, undefined, system);
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

  return (
    <>
      <ul
        style={{ listStyleType: "none", padding: 0, width: 120, flexShrink: 0 }}
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
      <div
        style={{
          flexGrow: 1,
          display: "grid",
          gridTemplateColumns: "repeat(2, 1fr)",
          gridTemplateRows: "repeat(2, 1fr)",
        }}
      >
        {scriptEditor}
        {tsEditor}

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
        {astEditor}
      </div>
    </>
  );
}
function useKeyboardShortcuts(doEvaluate: () => void) {
  useEffect(() => {
    const onKeyDown = function (e: KeyboardEvent) {
      if (e.key === "s" && e.metaKey) {
        e.preventDefault();
        doEvaluate();
      }
    };

    document.addEventListener("keydown", onKeyDown, false);
    () => {
      document.removeEventListener("keydown", onKeyDown, false);
    };
  }, []);
}
