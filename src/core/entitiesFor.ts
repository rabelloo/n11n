import { defaultMerge } from '../helpers/defaultMerge';
import { define } from '../helpers/define';
import { extractorFor } from '../helpers/extractorFor';
import { pluralize } from '../helpers/pluralize';
import { retrieverFor } from '../helpers/retrieverFor';
import type { ArrayKey, Key, Keys, SingleKey } from '../key.types';
import type { Entities } from './entitiesIn';

export function entitiesFor<T>(keys: Keys<T>): Entity<T>[] {
  return Object.entries(keys).map(([prop, polymorphicKey]) => {
    const [key, isArrayKey, alias, merger] = define(polymorphicKey as U<T>);
    const name = alias || (isArrayKey ? prop : pluralize(prop));

    return {
      name,
      prop,
      merge: merger ?? defaultMerge,
      extract: extractorFor(prop, key as Key<T>, isArrayKey),
      retrieve: retrieverFor(prop, key as Key<T>, name, isArrayKey),
    };
  });
}

export interface Entity<T> {
  name: string;
  prop: string;
  merge: (a: T, b: T) => T;
  extract: (item: T) => unknown;
  retrieve: (item: T, entities: Entities) => unknown;
}

type U<T> = SingleKey<T> | ArrayKey<T>;
