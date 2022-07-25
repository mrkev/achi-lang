export function nullthrows<T>(val: T | null | undefined, msg?: string): T {
  if (val == null) {
    throw new Error(msg ?? `unexpected nullable found`);
  }
  return val;
}

export function exhaustive(a: never, msg?: string) {
  throw new Error(msg ?? `Non-exhaustive: ${a} went through`);
}
