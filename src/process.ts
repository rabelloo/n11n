import { Entity } from './property';

export function process<T>(
  item: T,
  entities: Entity<T>[],
  processor: (prop: Entity<T>) => void
) {
  if (!(item instanceof Object)) {
    return item;
  }

  const clone = { ...item } as any;

  // reducer would be potentially slower
  // because of the amount of spreading
  // depending on the number of properties
  entities.forEach(entity => {
    clone[entity.prop] = processor(entity);
  });

  return clone;
}
