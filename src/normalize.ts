import { Cloner } from './cloner';
import { Entity } from './entity';
import { process } from './process';

export function normalize<T>(
  item: T,
  schemaEntities: Entity<T>[],
  cloner: Cloner<T>
): T {
  return process(item, schemaEntities, ({ extract }) => extract(item), cloner);
}
