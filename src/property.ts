import { Entities } from './entities';
import { ArrayKey, Key, Keys } from './keys';
import { pluralize } from './pluralize';

export interface Entity<T extends {}> {
  prop: string;
  extract: (item: T) => any;
  retrieve: (ref: any, entities: Entities) => T;
}

export function entitiesFor<T>(keys: Keys<T>): Entity<T>[] {
  return Object.entries(keys).map(([prop, key]) => ({
    prop,
    extract: extractorFor(prop, key as any),
    retrieve: retrieverFor(prop, key as any),
  }));
}

// =========================================================
// ====================     Private     ====================
// =========================================================

function accessorFor<T>(prop: string, key: any, fn: (t: T) => any) {
  return isArrayKey(key)
    ? (data: any) => (data[prop] || []).map(fn)
    : (data: any) => fn(data[prop]);
}

function at(entities: Entities, prop: string) {
  return (entities && entities[prop]) || {};
}

function extractorFor(prop: string, key: any): (data: {}) => any {
  return accessorFor(prop, key, extractor(isArrayKey(key) ? key[0] : key));
}

function extractor<T>(key: Key<T>): (item: T) => any {
  if (isKeyofT(key)) {
    return thru<T>(item => item[key]);
  }
  if (key instanceof Function) {
    return thru<T>(item => key(item));
  }

  return thru<T>(key.normalize);
}

function isArrayKey<T extends any[]>(
  key: Key<T> | ArrayKey<T>
): key is ArrayKey<T> {
  return key instanceof Array;
}

function isKeyofT<T>(key: Key<T>): key is keyof T {
  return typeof key === 'string';
}

function retrieverFor<T>(
  prop: string,
  key: any
): (data: {}, entities: Entities) => any {
  const retrieve = isArrayKey(key)
    ? retriever(prop, key[0])
    : retriever(pluralize(prop), key);

  return (data: {}, entities: Entities) => {
    const access = accessorFor(prop, key, (item: T) =>
      retrieve(item, entities)
    );

    return access(data);
  };
}

function retriever<T>(prop: string, key: Key<T>) {
  if (isKeyofT(key) || key instanceof Function) {
    return (ref: any, entities: Entities) => at(entities, prop)[ref] || ref;
  }

  return key.denormalize;
}

function thru<T>(fn: (item: T) => any) {
  return (item: T) => (item instanceof Object ? fn(item) : item);
}
