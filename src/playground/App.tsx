import { Allotment } from "allotment";
import "allotment/dist/style.css";
import * as monaco from "monaco-editor";
import { editor } from "monaco-editor";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { useLocalStorage } from "usehooks-ts";
import { compileProgram, printTSStatements } from "../compiler/compiler";
import { Context, stringOfValueScope } from "../interpreter/Context";
import { interpret } from "../interpreter/interpreter";
import { FixmeError, ScriptError } from "../interpreter/interpreterErrors";
import { System } from "../interpreter/runtime/System";
import { nullthrows } from "../nullthrows";
import { tryParse } from "../parser/parser";
import { registerLangForMonaco } from "../playground/registerLangForMonaco";
import "./App.css";
import { Sidebar } from "./Sidebar";
import { DEFAULT_SCRIPT } from "./constants";
import { getJSONObjectAtPosition } from "./getJSONObjectAtPosition";
import { transformASTForDisplay } from "./transformASTForDisplay";
import { useEditor } from "./useEditor";
import { useKeyboardShortcuts } from "./useKeyboardShortcuts";

export type SetState<S> = React.Dispatch<React.SetStateAction<S>>;

export const COMPACT_AST = true;

const options: editor.IStandaloneEditorConstructionOptions = {
  fontSize: 16,
  insertSpaces: true,
  tabSize: 2,
  detectIndentation: false,
  minimap: { enabled: false },
} as const;

export type Feature = "compile" | "typecheck" | "interpret" | "ast";

export default function App() {
  const [script, setScript] = useLocalStorage("script", DEFAULT_SCRIPT);
  const [savedScripts, setSavedScripts] = useLocalStorage<string[]>(
    "scripts",
    []
  );
  const [openScript, setOpenScript] = useState<null | number>(null);
  const [log, setLog] = useState<(Error | string)[]>([]);
  const [fatalScriptError, setFatalScriptError] = useState<Error | null>(null);
  const [systemError, setSystemError] = useState<Error | null>(null);
  const [finalContext, setFinalContext] = useState<Context | null>(null);

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

  const features = useMemo(() => new Set(featureArr), [featureArr]);

  const [_tsEditor, tsEditorObj] = useEditor({
    language: "typescript",
    height: "50vh",
    theme: "vs-dark",
    options,
  });

  const [astEditor, astEditorObj] = useEditor({
    language: "json",
    theme: "vs-dark",
    height: "100%",
    options: {
      readOnly: true,
      folding: true,
    },
  });

  const [scriptEditor, scriptEditorObj] = useEditor(
    {
      onChange: () => setDecoratorRange(null),
      language: "achi",
      theme: "vs-dark",
      options: options,
      height: "100%",
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
        const { kind, "@": pos } = parsed;
        if (!kind || !pos || kind === "Program") {
          return;
        }

        if (typeof pos === "string") {
          const [sl, sc, el, ec] = pos.split(":").map((s) => parseInt(s));
          setDecoratorRange(new monaco.Range(sl, sc, el, ec));
        } else {
          setDecoratorRange(
            new monaco.Range(
              pos.start.line,
              pos.start.column,
              pos.end.line,
              pos.end.column
            )
          );
          console.log(`${kind}@[${pos.start.line}:${pos.start.column}]`);
        }
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

  const doEvaluate = useCallback(() => {
    const system = new System();

    setDecoratorRange(null);
    setFatalScriptError(null);
    setSystemError(null);

    try {
      const editor = nullthrows(scriptEditorObj, "no editor");
      const script = editor.getValue();

      setScript(script);

      const ast = tryParse(script);

      astEditorObj?.setValue(transformASTForDisplay(ast));

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

      const finalContext = interpret(script, system);
      setFinalContext(finalContext);
    } catch (e) {
      if (e instanceof Error) {
        setSystemError(e);
      } else if (typeof e === "string") {
        setSystemError(new Error(e));
      } else {
        console.error(e);
      }
    }

    setFatalScriptError(system.console._fatalError);
    setLog(system.console._log);
  }, [astEditorObj, features, scriptEditorObj, setScript, tsEditorObj]);

  useKeyboardShortcuts(doEvaluate);

  const doSave = () => {
    const editor = scriptEditorObj;
    if (!editor) {
      throw new Error("can't save, no editor");
    }

    const script = editor.getValue();

    if (openScript == null) {
      setSavedScripts(savedScripts.concat([script]));
      setOpenScript(savedScripts.length);
    } else {
      const newScripts = [...savedScripts];
      newScripts.splice(openScript, 1, script);
      setSavedScripts(newScripts);
    }
  };

  useEffect(() => {
    if (
      (fatalScriptError instanceof ScriptError ||
        fatalScriptError instanceof FixmeError) &&
      fatalScriptError.pos != null
    ) {
      const { pos } = fatalScriptError;
      setDecoratorRange(
        new monaco.Range(
          pos.start.line,
          pos.start.column,
          pos.end.line,
          pos.end.column
        )
      );
    }
  }, [fatalScriptError]);

  const valueScope = finalContext?.valueScope;
  const evaluationBox = (
    <div
      style={{
        width: "100%",
        height: "100%",
        flexShrink: 0,
        overflow: "scroll",
      }}
    >
      <button onClick={doEvaluate}>Evaluate</button>
      <button onClick={doSave}>Save</button>

      {valueScope && <pre>{stringOfValueScope(valueScope)}</pre>}

      <pre>
        {systemError && (
          <details style={{ color: "red" }}>
            <summary>SYSTEM: {systemError.message}</summary>
            {systemError.stack}
          </details>
        )}
        {/* {fatalScriptError && (
          <details style={{ color: "red" }}>
            <summary>SCRIPT: {fatalScriptError.message}</summary>
            {fatalScriptError.stack}
          </details>
        )} */}
        {log.map((msg, i) => {
          return msg instanceof Error ? (
            <details style={{ color: "red" }} key={`e${i}`}>
              <summary>
                {msg.constructor.name}: {msg.message}
              </summary>
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
    <Allotment>
      <Allotment.Pane minSize={100} maxSize={200}>
        <Sidebar
          features={features}
          setFeatures={setFeatures}
          scripts={savedScripts}
          setScripts={setSavedScripts}
          scriptEditorObj={scriptEditorObj}
          openScript={openScript}
          setOpenScript={setOpenScript}
        />
      </Allotment.Pane>
      <Allotment>
        <Allotment vertical>
          <Allotment.Pane>{scriptEditor}</Allotment.Pane>
          <Allotment.Pane>{evaluationBox}</Allotment.Pane>
        </Allotment>
        <Allotment.Pane>{astEditor}</Allotment.Pane>
      </Allotment>
    </Allotment>
  );
}
