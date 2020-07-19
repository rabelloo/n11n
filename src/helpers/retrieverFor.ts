import type { Entities } from '../entitiesIn';
import type { Key } from '../key.types';
import { Schema } from '../schema';
import { accessorFor } from './acessorFor';

/**
 * Creates a retriever for a key.
 * @param prop Which property to access.
 * @param key Key to use for extraction.
 * @param type Which entity to use.
 * @param isArrayKey Whether the key is one of the Array types.
 */
export function retrieverFor<T>(
  prop: string,
  key: Key<T>,
  type: string,
  isArrayKey: boolean
) {
  const retrieve = retriever(type, key);

  return (data: T, entities: Entities): unknown => {
    const access = accessorFor(prop, isArrayKey, (item: unknown) =>
      retrieve(item as any, entities)
    );

    return access(data as any);
  };
}

function retriever<T>(type: string, key: Key<T>) {
  if (isSchema(key)) return key.denormalize;

  return (ref: string | number, entities: Entities) =>
    (entities[type]?.[ref] as T) ?? ref;
}

const isSchema = (value: unknown): value is Schema<unknown> =>
  (value as any).constructor === Object;
