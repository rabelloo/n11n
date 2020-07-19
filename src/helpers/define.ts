import type { ArrayKey, Key, Merger, SingleKey } from '../key.types';

/**
 * Defines a common output from a polymorphic key.
 * @param polymorphicKey Key to extract values from.
 */
export function define<T>(
  polymorphicKey: ArrayKey<T> | SingleKey<T>
): [Key<T>, boolean, string?, Merger<T>?] {
  // key
  if (!(polymorphicKey instanceof Array)) return [polymorphicKey, false];

  // [key]
  if (polymorphicKey.length === 1) return [polymorphicKey[0], true];

  // [[key], merger?]
  if (isUnaliasedArray(polymorphicKey)) {
    const [[key], merger] = polymorphicKey;
    return [key, true, , merger];
  }

  // [alias, [key], merger?]
  if (isAliasedArray(polymorphicKey)) {
    const [alias, [key], merger] = polymorphicKey;
    return [key, true, alias, merger];
  }

  // [alias, key, merger?]
  if (isAliased(polymorphicKey)) {
    const [alias, key, merger] = polymorphicKey;
    return [key, false, alias, merger];
  }

  // [key, merger?]
  const [k, m] = polymorphicKey;
  return [k, false, , m];
}

const isUnaliasedArray = <T>(
  key:
    | [Key<T>, Merger<T>] //            [         key  , merger ]
    | [string, Key<T>, Merger<T>?] //   [ alias,  key  , merger ]
    | [[Key<T>], Merger<T>] //          [        [key] , merger ]
    | [string, [Key<T>], Merger<T>?] // [ alias,  key  , merger ]
): key is [[Key<T>], Merger<T>] => key[0] instanceof Array;

const isAliasedArray = <T>(
  key:
    | [Key<T>, Merger<T>] //            [         key  , merger ]
    | [string, Key<T>, Merger<T>?] //   [ alias,  key  , merger ]
    | [string, [Key<T>], Merger<T>?] // [ alias, [key] , merger ]
): key is [string, [Key<T>], Merger<T>?] => key[1] instanceof Array;

// TODO: refactor API (breaking change) into [alias | empty, key, merger?]
// i.e. remove [key, merger?]
// because there is a potential type clash between both:
//   A - [ keyof T , merger ]
//   B - [ alias   , keyFn  ]
// Types for A have been hot fixed out to discourage usage.
// This is a best effort disambiguation, but it's not 100% guaranteed.
const isAliased = <T>(
  key:
    | [Key<T>, Merger<T>] //            [        key, merger ]
    | [string, Key<T>, Merger<T>?] //   [ alias, key, merger ]
): key is [string, Key<T>, Merger<T>?] =>
  typeof key[0] === 'string' &&
  key[1] instanceof Function &&
  key[1].length === 1;
