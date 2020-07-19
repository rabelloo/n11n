import type { Entity } from './entitiesFor';

type Index<T> = Record<string, T>;
export type Entities = Index<Index<unknown>>;

/**
 * Returns an `ObjectMap` of all entities found in an object or array.
 *
 * Note: each entity is also an `ObjectMap` of their key/value.
 * @param data Object or array to look in.
 * @param schemaEntities Schema defined entities.
 */
export function entitiesIn<T>(
  data: T[],
  schemaEntities: Entity<T>[]
): Entities {
  const entities = {};

  // basically generates the Entities Record of each item in data
  // and merges the keys according to the schema.Entity merge strategy.
  // could be written explicitly that way, but then the amount of loops
  // through entity names and keys would be exponential
  // e.g.
  // const item1 = { clients: { 1: { id: 1, name: 'abc' } } };
  // const item2 = { clients: { 1: { id: 1, name: 'xyz' } } };
  // const data = [item1, item2];
  // entities === { clients: { 1: { id: 1, name: 'xyz' } } }
  data.forEach((item) => setEntities(entities, item, schemaEntities));

  return entities;
}

function setEntities<T>(
  entities: Entities,
  item: T,
  schemaEntities: Entity<T>[]
): void {
  schemaEntities.forEach(({ extract, merge, name, prop }) => {
    const entityB = item[prop as keyof T];

    if (!entityB) return;

    if (!entities[name]) entities[name] = {};

    const keys = extract(item) as string | string[];

    const set = (b: unknown, key: string | number) =>
      setEntity(entities, b, `${key}`, name, merge);

    entityB instanceof Array
      ? entityB.forEach((b, i) => set(b, keys[i]))
      : set(entityB, keys as string);
  });
}

function setEntity<T>(
  entities: Entities,
  entityB: T,
  key: string,
  name: string,
  merge: (a: T, b: T) => T
): void {
  const entityA = entities[name][key] || {};

  entities[name][key] = merge(entityA as T, entityB);
}
