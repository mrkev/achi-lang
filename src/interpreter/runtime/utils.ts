/** is A a subset of B? */
export function aSubsetB(a: string[], b: string[]) {
  if (a.length > b.length) {
    return false;
  }
  const bset = new Set(b);
  for (const akey of a) {
    if (!bset.has(akey)) {
      return false;
    }
  }
  return true;
}
