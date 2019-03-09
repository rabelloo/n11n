import { Merger } from './merger';
import { Schema } from './schema';

export type Keys<T> = {
  [K in keyof T]?: T[K] extends any[] ? ArrayKey<T[K]> : Key<T[K]>
};

export type DirectKey<T> = keyof T | Schema<T> | ((t: T) => string | number);

export type KeyWithMerger<T> = [DirectKey<T>, Merger<T>];

export type AliasedKey<T> = [string, DirectKey<T>, Merger<T>?];

export type Key<T> = DirectKey<T> | KeyWithMerger<T> | AliasedKey<T>;

export type DirectArrayKey<T extends any[]> = [DirectKey<T[0]>];

export type ArrayKeyWithMerger<T extends any[]> = [
  DirectArrayKey<T>,
  Merger<T>
];

export type AliasedArrayKey<T extends any[]> = [
  string,
  DirectArrayKey<T>,
  Merger<T>?
];

export type ArrayKey<T extends any[]> =
  | DirectArrayKey<T>
  | ArrayKeyWithMerger<T>
  | AliasedArrayKey<T>;
