import { EditorProps } from "@monaco-editor/react";
import * as monaco from "monaco-editor";
import { editor } from "monaco-editor";
import { useEffect } from "react";
import { registerLangForMonaco } from "../playground/registerLangForMonaco";
import { defaultEditorOptions } from "./App";
import { useEditor } from "./useEditor";

export function useScriptEditor({
  defaultValue,
  onChange,
  decoration,
  breakpoints,
  onToggleBreakpoint,
}: {
  onChange?: EditorProps["onChange"];
  defaultValue?: string;
  decoration?: monaco.Range | null;
  breakpoints?: Set<number>;
  onToggleBreakpoint?: (line: number) => void;
}) {
  const [scriptEditor, scriptEditorObj] = useEditor(
    {
      onChange,
      language: "achi",
      theme: "vs-dark",
      options: { ...defaultEditorOptions, glyphMargin: true },
      height: "100%",
      defaultValue,
      // try "same", "indent" or "none"
      // wrappingIndent: "indent",
      beforeMount: registerLangForMonaco,
    },
    decoration,
    breakpoints
  );

  useEffect(() => {
    if (scriptEditorObj == null) {
      return;
    }

    // https://github.com/microsoft/vscode/blob/b631c0aa4d30ff471171dd75376c6b49504f7ba1/src/vs/workbench/contrib/debug/browser/breakpointEditorContribution.ts#L264
    scriptEditorObj.onMouseDown((e: editor.IEditorMouseEvent) => {
      const model = scriptEditorObj.getModel();
      if (
        !e.target.position ||
        !model ||
        e.target.type !== editor.MouseTargetType.GUTTER_GLYPH_MARGIN ||
        e.target.detail.isAfterLines
        // || !e.target.element?.className.includes("breakpoint")
      ) {
        // console.log("RETURNING", e.target.type);
        return;
      } else {
        const lineNumber = e.target.position.lineNumber;
        onToggleBreakpoint?.(lineNumber);
        // console.log("FOO", lineNumber);
      }
    });
  }, [onToggleBreakpoint, scriptEditorObj]);

  return [scriptEditor, scriptEditorObj] as const;
}
