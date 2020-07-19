/**
 * Creates an accessor for a property.
 * @param prop Which property to access.
 * @param isArrayKey Whether the key is one of the Array types.
 * @param fn Function to execute on accessed property.
 */
export function accessorFor<T>(
  prop: string,
  isArrayKey: boolean,
  fn: (t: T) => unknown
): (item: T) => unknown {
  return isArrayKey
    ? (data: Record<string, any>) => (data[prop] || []).map(fn)
    : (data: Record<string, T>) => fn(data[prop]);
}
