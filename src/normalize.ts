import type { Entity } from './entitiesFor';
import { process } from './process';

export function normalize<T>(item: T, schemaEntities: Entity<T>[]): T {
  return process(item, schemaEntities, ({ extract }) => extract(item));
}
