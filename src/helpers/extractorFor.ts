import type { Key } from '../key.types';
import { accessorFor } from './acessorFor';

/**
 * Creates an extractor for a key.
 * @param prop Which property to access.
 * @param key DirectKey to use for extraction.
 * @param isArrayKey Whether the key is one of the Array types.
 */
export function extractorFor<T>(
  prop: string,
  key: Key<T>,
  isArrayKey: boolean
): (item: T) => unknown {
  return accessorFor(prop, isArrayKey, extractor(key));
}

function extractor<T>(key: Key<T>): (item: T) => unknown {
  if (key instanceof Function) return thru(key);

  if (key instanceof Object) return thru<T>(key.normalize);

  return thru((item) => item[key]);
}

function thru<T>(fn: (item: T) => unknown) {
  return (item: T) => (item instanceof Object ? fn(item) : item);
}
