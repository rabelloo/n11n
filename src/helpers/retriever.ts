import { Entities } from '../entities';
import { DirectKey } from '../keys';
import { accessorFor } from './acessor';
import { isKeyofT } from './is-key-of-t';

/**
 * Creates a retriever for a key.
 * @param prop Which property to access.
 * @param key DirectKey to use for extraction.
 * @param wasArrayKey Whether the key was one of the Array types.
 */
export function retrieverFor<T>(
  prop: string,
  key: DirectKey<T>,
  name: string,
  wasArrayKey: boolean
): (data: {}, entities: Entities) => any {
  const retrieve = retriever(name, key);

  return (data: {}, entities: Entities) => {
    const access = accessorFor(prop, wasArrayKey, (item: T) =>
      retrieve(item, entities)
    );

    return access(data);
  };
}

function at(entities: Entities, prop: string) {
  return (entities && entities[prop]) || {};
}

function retriever<T>(prop: string, key: DirectKey<T>) {
  if (isKeyofT(key) || key instanceof Function) {
    return (ref: any, entities: Entities) => at(entities, prop)[ref] || ref;
  }

  return key.denormalize;
}
