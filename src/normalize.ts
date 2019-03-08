import { process } from './process';
import { Entity } from './property';

export function normalize<T>(item: T, schemaEntities: Entity<T>[]): T {
  return process(item, schemaEntities, ({ extract }) => extract(item));
}
