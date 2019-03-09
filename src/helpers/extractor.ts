import { DirectKey } from '../keys';
import { accessorFor } from './acessor';
import { isKeyofT } from './is-key-of-t';

/**
 * Creates an extractor for a key.
 * @param prop Which property to access.
 * @param key DirectKey to use for extraction.
 * @param wasArrayKey Whether the key was one of the Array types.
 */
export function extractorFor<T>(
  prop: string,
  key: DirectKey<T>,
  wasArrayKey: boolean
): (data: {}) => any {
  return accessorFor(prop, wasArrayKey, extractor(key));
}

function extractor<T>(key: DirectKey<T>): (item: T) => any {
  if (isKeyofT(key)) {
    return thru<T>(item => item[key]);
  }
  if (key instanceof Function) {
    return thru<T>(item => key(item));
  }

  return thru<T>(key.normalize);
}

function thru<T>(fn: (item: T) => any) {
  return (item: T) => (item instanceof Object ? fn(item) : item);
}
