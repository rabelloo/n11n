import type { Entity } from './entitiesFor';
import type { Entities } from './entitiesIn';
import { process } from './process';

export function denormalize<T>(
  item: T,
  schemaEntities: Entity<T>[],
  entities: Entities
): T {
  return process(item, schemaEntities, ({ retrieve }) =>
    retrieve(item, entities)
  );
}
