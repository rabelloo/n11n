import { defaultClone, Cloner } from '../cloner';
import { Schema } from '../schema';

/**
 * Creates a `Cloner` function that normalizes the specified
 * keys with the specified `Schema`s, in order to remove
 * circular references.
 *
 * To be used with `schema<T>()`.
 * @param properties Object with keys that are `T` properties and
 * values that are `Schema`s of that property's type
 *
 * @example
 * schema<Book>({ author: a => a.id },
 * * linear({
 * *   books: schema<Author>({ book: b => b.id })
 * * })
 * );
 */
export function linear<T>(properties: Linear<T>): Cloner<T> {
  return item => {
    const clone: any = defaultClone(item);

    Object.entries(properties).forEach(([prop, schema]) => {
      clone[prop] = schema.normalize(clone[prop]);
    });

    return clone;
  };
}

export type Linear<T> = { [K in keyof T]?: Schema<T[K]> };
