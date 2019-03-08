import { Entities } from './entities';
import { process } from './process';
import { Entity } from './property';

export function denormalize<T>(
  item: T,
  schemaEntities: Entity<T>[],
  entities: Entities
): T {
  return process(item, schemaEntities, ({ retrieve }) => retrieve(item, entities));
}
