/**
 * Creates an accessor for a property.
 * @param prop Which property to access.
 * @param wasArrayKey Whether the key was one of the Array types.
 * @param fn Function to execute on accessed property.
 */
export function accessorFor<T>(
  prop: string,
  wasArrayKey: boolean,
  fn: (t: T) => any
) {
  return wasArrayKey
    ? (data: any) => (data[prop] || []).map(fn)
    : (data: any) => fn(data[prop]);
}
