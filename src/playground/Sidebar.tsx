import { editor } from "monaco-editor";
import React from "react";
import { Feature, SetState } from "./App";

export function Sidebar({
  features,
  setFeatures,
  scripts,
  setScripts,
  scriptEditorObj,
  openScript,
  setOpenScript,
}: {
  features: Set<Feature>;
  setFeatures: SetState<Feature[]>;
  scripts: string[];
  setScripts: SetState<string[]>;
  openScript: number | null;
  setOpenScript: SetState<number | null>;
  scriptEditorObj: editor.IStandaloneCodeEditor | null;
}) {
  return (
    <div style={{ height: "100%" }}>
      <details>
        <summary>configure</summary>
        {(["compile", "interpret", "ast"] as const).map((feature, i) => {
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
        })}
      </details>

      <hr />
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "stretch",
          listStyleType: "none",
          padding: 0,
        }}
      >
        {scripts.map((script, i) => {
          const isOpen = openScript === i;
          return (
            <div
              style={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
              }}
              key={i}
            >
              <div
                style={{
                  overflow: "hidden",
                  background: "#333",
                  whiteSpace: "nowrap",
                  textOverflow: "ellipsis",
                  flexGrow: 1,
                  cursor: "pointer",
                }}
                onClick={() => {
                  if (isOpen) {
                    setOpenScript(null);
                    return;
                  }
                  scriptEditorObj?.setValue(script);
                  setOpenScript(i);
                }}
              >
                {isOpen && <span style={{ color: "green" }}>▶ </span>}
                {script.split("\n")[0]}
              </div>
              <button
                onClick={() => {
                  if (!confirm("Deleting a script cannot be undone")) {
                    return;
                  }
                  const newScripts = [...scripts];
                  newScripts.splice(i, 1);
                  setScripts(newScripts);
                  if (isOpen) {
                    setOpenScript(null);
                  }
                }}
              >
                x
              </button>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => {
          const newScripts = [...scripts, "new script"];
          setScripts(newScripts);
        }}
      >
        +
      </button>
    </div>
  );
}
