import type { Schema } from './schema';

export type Keys<T> = {
  [K in keyof T]?: FieldKey<T[K]>;
};

export type FieldKey<T> = T extends any[] ? ArrayKey<T[0]> : SingleKey<T>;

export type SingleKey<T> =
  | Key<T> //                                     key
  | [KeyFn<T>, Merger<T>] //           [         keyFn , merger ]
  | [string, Key<T>, Merger<T>?]; //   [ alias ,  key  , merger ]

export type ArrayKey<T> =
  | [Key<T>] //                        [          key ]
  | [[Key<T>], Merger<T>] //           [         [key] , merger ]
  | [string, [Key<T>], Merger<T>?]; // [ alias ,  key  , merger ]

export type Key<T> = keyof T | KeyFn<T>;

export type Merger<T> = (a: T, b: T) => T;

type KeyFn<T> = Schema<T> | ((t: T) => string | number);
