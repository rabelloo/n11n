import { denormalize } from './core/denormalize';
import { entitiesFor } from './core/entitiesFor';
import { Entities, entitiesIn } from './core/entitiesIn';
import { normalize } from './core/normalize';
import { defaultClone } from './helpers/defaultClone';
import type { Keys } from './key.types';

/**
 * Creates a schema object for a specified Entity.
 * @param keys An object with:
 * - `keys` that determine properties of the Entity to be included in the schema.
 * - `values` that determine the type of each property and its extraction method.
 * @example
 * const parentSchema = schema<Parent>({
 *   childKey:    'id',          // keyof Parent
 *   childKeyFn:  (c) => c.id,   // (p: Parent) => string | number
 *   childSchema: schema({}),    // Schema<any>
 *
 *   // properties with Array values just need a wrapping `[]`:
 *   childrenKey:    [ 'id'        ],
 *   childrenKeyFn:  [ (c) => c.id ],
 *   childrenSchema: [ schema({})  ],
 *
 *   // properties are auto-pluralized,
 *   // but you can provide your own alias:
 *   aliased:      [ 'alias',  key  ],
 *   aliasedArray: [ 'alias', [key] ],
 *
 *   // you can also defined a merge strategy:
 *   // Default is (a, b) => ({ ...a, ...b })
 *   withMerge:      [  key , (_, b) => b ],
 *   withMergeArray: [ [key], (_, b) => b ],
 *
 *   // and you can do both at the same time:
 *   both:      [ 'alias',  key , (_, b) => b ],
 *   bothArray: [ 'alias', [key], (_, b) => b ],
 * });
 */
export function schema<T>(
  keys: Keys<T>,
  clone: (item: T) => T = defaultClone
): Schema<T> {
  const schemaEntities = entitiesFor(keys);

  return {
    denormalize(data: T | T[], entities: Entities): any {
      return data instanceof Array
        ? data.map((item) => denormalize(clone(item), schemaEntities, entities))
        : denormalize(clone(data), schemaEntities, entities);
    },
    entities(data: T | T[]): Entities {
      return entitiesIn(
        (data instanceof Array ? data : [data]).map(clone),
        schemaEntities
      );
    },
    normalize(data: T | T[]): any {
      return data instanceof Array
        ? data.map((item) => normalize(clone(item), schemaEntities))
        : normalize(clone(data), schemaEntities);
    },
  };
}

export interface Schema<T> {
  /**
   * Returns a normalized object to its original form,
   * according to a map of entities.
   * @note if the entity is not found,
   * its reference will be kept, e.g. `{ foo: 1 }`
   * @param data Object to be denormalized.
   * @param entities Entity maps for reference lookup.
   * @example
   * const entities = { users: { '1': { id: 1 } } };
   * const userSchema = schema<User>({ user: 'id' });
   *
   * userSchema.denormalize({ user: 1 }, entities);
   * // { user: { id: 1 } }
   *
   * userSchema.denormalize({ user: 1 }, {});
   * // { user: 1 }
   */
  denormalize(data: T, entities: Entities): T;
  /**
   * Returns an array of normalized objects to their original form,
   * according to a map of entities.
   * @note if the entity is not found,
   * its reference will be kept, e.g. `{ foo: 1 }`
   * @param data Array of objects to be denormalized.
   * @param entities Entity maps for reference lookup.
   * @example
   * const entities = { users: { '1': { id: 1 } } };
   * const userSchema = schema<User>({ user: 'id' });
   *
   * userSchema.denormalize([{ user: 1 }], entities);
   * // [{ user: { id: 1 } }]
   *
   * userSchema.denormalize([{ user: 1 }], {});
   * // [{ user: 1 }]
   */
  denormalize(data: T[], entities: Entities): T[];
  /**
   * Returns a `Record` of entities found.
   *
   * Its keys are entity names/aliases,
   * and its values are `Record`s of each specific entity.
   * @note entities are defined on `schema` call by properties specified.
   * @note names are automatically pluralized or aliased explicitly.
   * @note keys will be coerced to strings.
   * @param data Object or array of objects to scan
   * @example
   * schema<User>({ role: (r) => r.id })
   *   .entities({ role: { id: 1 }, untracked: { id: 2 } });
   * // { roles: { '1': { id: 1 } } }
   *
   * schema<Farm>({ goose: ['geese', 'id'] })
   *   .entities([{ goose: { id: 1 } }, { goose: { id: 2 } }]);
   * // { geese: { '1': { id: 1 } }, { '2': { id: 2 } } }
   */
  entities(data: T | T[]): Entities;
  /**
   * Normalizes an object by mapping keys according to the schema.
   * @note keys not defined in the schema will remain unchanged.
   * @param data Object to be normalized.
   * @example
   * schema<User>({ role: (r) => r.id })
   *   .normalize({ role: { id: 1 }, untracked: { id: 2 } });
   * // { role: '1', untracked: { id: 2 } }
   */
  normalize(data: T): T;
  /**
   * Normalizes an array of object by mapping keys according to the schema.
   * @note keys not defined in the schema will remain unchanged.
   * @param data Array of objects to be normalized.
   * @example
   * schema<User>({ role: (r) => r.id })
   *   .normalize([{ role: { id: 1 } }, { role: { id: 2 } }]);
   * // [{ role: '1' }, { role: '2' }]
   */
  normalize(data: T[]): T[];
}
