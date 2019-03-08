import { denormalize } from './denormalize';
import { Keys } from './keys';
import { normalize } from './normalize';
import { entitiesFor } from './property';
import { Entities } from './entities';

export interface Schema<T> {
  /**
   * Returns a normalized object to its original form,
   * according to a map of entities.
   *
   * Note: if the entity referenced is not found,
   * the object will keep its reference, e.g. `{ child: 1 }`
   * @param data Object to be denormalized
   * @param entities Entity maps for reference lookup
   */
  denormalize(data: T, entities: Entities): T;
  /**
   * Returns an array of normalized objects to their original form,
   * according to a map of entities.
   *
   * Note: if the entity referenced is not found,
   * each object will keep its reference, e.g. `{ child: 1 }`
   * @param data Array of objects to be denormalized
   * @param entities Entity maps for reference lookup
   */
  denormalize(data: T[], entities: Entities): T[];
  /**
   * Normalizes an object by switching inner memory references to value references,
   * according to the properties in the schema.
   *
   * e.g. `{ child: { id: 1 } }` => `{ child: 1 }`
   *
   * Note: properties not mapped in the schema will remain unchanged.
   * @param data Object to be normalized
   */
  normalize(data: T): T;
  /**
   * Normalizes an array of objects by switching inner memory references to value references,
   * according to the properties in the schema.
   *
   * e.g. `{ child: { id: 1 } }` => `{ child: 1 }`
   *
   * Note: properties not mapped in the schema will remain unchanged.
   * @param data Array of objects to be normalized
   */
  normalize(data: T[]): T[];
}

/**
 * Creates a schema object for a specified Entity.
 * @param properties An object with:
 * - `keys` that determine properties of the Entity to be included in the schema
 * - `values` that determine the type of each property and its extraction method.
 *
 * @example
 * // three options: Key; Map; Schema.
 * // Arrays just need a wrapping `[]`.
 * * const parentSchema = schema<Parent>({
 * *   childKey: 'id',
 * *   childMap: c => c.id,
 * *   childSchema: childSchema,
 * *   childrenKey: ['id'],
 * *   childrenMap: [c => c.id],
 * *   childrenSchema: [childSchema],
 * * });
 *
 * // for example completion
 * * const childSchema = schema<Child>({
 * *  grandChild: gc => gc.id,
 * * });
 */
export function schema<T extends {}>(properties: Keys<T>): Schema<T> {
  const props = entitiesFor(properties);

  return {
    normalize(data: T | T[]): any {
      return data instanceof Array
        ? data.map(item => normalize(item, props))
        : normalize(data, props);
    },
    denormalize(data: T | T[], entities: Entities): any {
      return data instanceof Array
        ? data.map(item => denormalize(item, props, entities))
        : denormalize(data, props, entities);
    },
  };
}
