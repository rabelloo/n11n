import {
  AliasedArrayKey,
  AliasedKey,
  ArrayKey,
  ArrayKeyWithMerger,
  DirectArrayKey,
  DirectKey,
  Key,
  KeyWithMerger,
} from '../keys';
import { Merger } from '../merger';
import { countArgs } from './count-args';

/**
 * Defines a common output from a polymorphic key.
 * @param polymorphicKey Key to extract values from.
 */
export function define<T extends any[]>(
  polymorphicKey: Key<T> | ArrayKey<T>
): [string | undefined, DirectKey<T>, boolean, Merger<T> | undefined] {
  let alias: string | undefined;
  let key: DirectKey<T>;
  let wasArrayKey = true;
  let merger: Merger<T> | undefined;

  if (polymorphicKey instanceof Array) {
    if (withMerger(polymorphicKey)) {
      // KeyWithMerger<T> | ArrayKeyWithMerger<T>
      let whichKey: DirectKey<T> | DirectArrayKey<T>;
      [whichKey, merger] = polymorphicKey;
      wasArrayKey = whichKey instanceof Array;
      key = whichKey instanceof Array ? whichKey[0] : whichKey;
    } else if (noAlias(polymorphicKey)) {
      // ArrayKey<T>
      [key] = polymorphicKey;
    } else if (isAliasedArrayKey(polymorphicKey)) {
      // AliasedArrayKey<T>
      let arrayKey: DirectArrayKey<T>;
      [alias, arrayKey, merger] = polymorphicKey;
      [key] = arrayKey;
    } else {
      // AliasedKey<T>
      wasArrayKey = false;
      [alias, key, merger] = polymorphicKey;
    }
  } else {
    // DirectKey<T>
    wasArrayKey = false;
    key = polymorphicKey;
  }

  return [alias, key, wasArrayKey, merger];
}

function withMerger<T extends any[]>(
  key:
    | AliasedArrayKey<T>
    | AliasedKey<T>
    | ArrayKeyWithMerger<T>
    | DirectArrayKey<T>
    | KeyWithMerger<T>
): key is ArrayKeyWithMerger<T> | KeyWithMerger<T> {
  return key[1] instanceof Function && countArgs(key[1]) === 2;
}

function isAliasedArrayKey<T extends any[]>(
  key: AliasedArrayKey<T> | AliasedKey<T>
): key is AliasedArrayKey<T> {
  return key[1] instanceof Array;
}

function noAlias<T extends any[]>(
  key: AliasedArrayKey<T> | AliasedKey<T> | DirectArrayKey<T>
): key is DirectArrayKey<T> {
  return key.length === 1;
}
