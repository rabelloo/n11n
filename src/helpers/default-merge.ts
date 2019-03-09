export function defaultMerge<T>(entityA: T, entityB: T) {
  return {
    ...entityA,
    ...entityB,
  };
}
