import { useEffect } from "react";

export function useKeyboardShortcuts(doEvaluate: () => void) {
  useEffect(() => {
    const onKeyDown = function (e: KeyboardEvent) {
      // Cmd+S
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
