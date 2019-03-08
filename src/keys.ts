import { Schema } from './schema';

export type Keys<T> = {
  [K in keyof T]?: T[K] extends any[] ? ArrayKey<T[K]> : Key<T[K]>
};

export type Key<T> = keyof T | Schema<T> | ((t: T) => string | number);

export type ArrayKey<T extends any[]> = [Key<T[0]>];
