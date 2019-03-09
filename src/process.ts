import { Cloner } from './cloner';
import { Entity } from './entity';

/**
 * Processes an item according to schema.Entity[],
 * a processor and a cloner.
 * @param item Item to process with entities.
 * @param entities schema.Entity[] to process in item.
 * @param processor Processor to apply for each schema.Entity.
 * @param cloner Cloner to excute with item on setup.
 */
export function process<T>(
  item: T,
  entities: Entity<T>[],
  processor: (entity: Entity<T>) => void,
  cloner: Cloner<T>
) {
  const clone = cloner(item) as any;

  // reducer would be potentially slower
  // because of the amount of spreading
  // depending on the number of properties
  entities.forEach(entity => {
    clone[entity.prop] = processor(entity);
  });

  return clone;
}
