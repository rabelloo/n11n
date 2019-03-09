import { Cloner } from './cloner';
import { Entities } from './entities';
import { Entity } from './entity';
import { process } from './process';

export function denormalize<T>(
  item: T,
  schemaEntities: Entity<T>[],
  entities: Entities,
  cloner: Cloner<T>
): T {
  return process(
    item,
    schemaEntities,
    ({ retrieve }) => retrieve(item, entities),
    cloner
  );
}
