import { DirectKey } from '../keys';

export function isKeyofT<T>(key: DirectKey<T>): key is keyof T {
  return typeof key === 'string';
}
