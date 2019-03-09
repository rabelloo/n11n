import { Entities } from './entities';
import { defaultMerge } from './helpers/default-merge';
import { define } from './helpers/define-key';
import { extractorFor } from './helpers/extractor';
import { pluralize } from './helpers/pluralize';
import { retrieverFor } from './helpers/retriever';
import { DirectKey, Keys } from './keys';

export interface Entity<T extends {}> {
  name: string;
  prop: string;
  merge: (entityA: T, entityB: T) => T;
  extract: (item: T) => any;
  retrieve: (ref: any, entities: Entities) => T;
}

export function entitiesFor<T>(keys: Keys<T>): Entity<T>[] {
  return Object.entries(keys).map(([prop, polymorphicKey]) => {
    const [alias, key, wasArrayKey, merger] = define(polymorphicKey);
    const name = alias || (wasArrayKey ? prop : pluralize(prop));

    return {
      name,
      prop,
      extract: extractorFor(prop, key as DirectKey<T>, wasArrayKey),
      merge: (merger as any) || defaultMerge,
      retrieve: retrieverFor(prop, key as DirectKey<T>, name, wasArrayKey),
    };
  });
}
