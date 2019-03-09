import { Cloner } from './cloner';
import { Entity } from './entity';
import { ObjectMap } from './object-map';

export type Entities = ObjectMap<ObjectMap<{ [key: string]: any }>>;

/**
 * Returns an `ObjectMap` of all entities found in an object or array.
 *
 * Note: each entity is also an `ObjectMap` of their key/value.
 * @param data Object or array to look in.
 * @param schemaEntities Schema defined entities.
 */
export function entitiesIn<T>(
  data: T | T[],
  schemaEntities: Entity<T>[],
  cloner: Cloner<T>
): Entities {
  const entities = {};

  // basically generates the Entities ObjectMap of each item in data
  // and merges the keys according to the schema.Entity merge strategy.
  // could be written explicitly that way, but then the amount of loops
  // through entity names and keys would be exponential
  // e.g.
  // data === [item1, item2]
  // - item1 => { clients: { 1: { id: 1, name: 'abc' } } }
  // - item2 => { clients: { 1: { id: 1, name: 'xyz' } } }
  // = entities => { clients: { 1: { id: 1, name: 'xyz' } } }
  data instanceof Array
    ? data.forEach(item => setEntities(entities, cloner(item), schemaEntities))
    : setEntities(entities, cloner(data), schemaEntities);

  return entities;
}

function setEntities<T>(
  entities: Entities,
  item: T,
  schemaEntities: Entity<T>[]
): void {
  schemaEntities.forEach(({ extract, merge, name, prop }) => {
    const entityB = (item as any)[prop];

    if (!entityB) {
      return;
    }

    if (!entities[name]) {
      entities[name] = {};
    }

    const keys = extract(item);
    const set = (b: T, i?: number) =>
      setEntity(entities, b, `${i != null ? keys[i] : keys}`, name, merge);

    entityB instanceof Array ? entityB.forEach(set) : set(entityB);
  });
}

function setEntity<T>(
  entities: Entities,
  entityB: T,
  key: string,
  name: string,
  merge: (a: T, b: T) => any
): void {
  const entityA = entities[name][key] || {};

  entities[name][key] = merge(entityA as T, entityB);
}
