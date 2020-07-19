/**
 * Default cloner function that simply creates a
 * shallow copy of an object.
 * @param item Object to clone.
 */
export function defaultClone<T>(item: T): T {
  return { ...item };
}
