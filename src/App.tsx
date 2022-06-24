import { useEffect, useState } from "react";
import "./App.css";
import { evaluate } from "./interpreter/interpreter";
import { tryParse } from "./parser/parser";

function App() {
  const [program] = useState(`
  class Point(x: number, y: number);
  const one = 1;
  const point = Point(x: one, y: 2);
  #log point
  `);
  const [log, setLog] = useState<(Error | string)[]>([]);

  // TODO: can return from top-level

  useEffect(() => {
    const newlog: (Error | string)[] = [];

    try {
      const ast = tryParse(program);
      evaluate(ast, newlog);
    } catch (e) {
      newlog.push(e as Error);
    }
    setLog(newlog);
  }, [program]);

  return (
    <div className="App">
      <pre>
        {log.map((msg) => {
          return msg instanceof Error ? (
            <span style={{ color: "red" }}>
              {msg.message}
              <br />
            </span>
          ) : (
            <span>
              {msg}
              <br />
            </span>
          );
        })}
      </pre>
    </div>
  );
}

export default App;
