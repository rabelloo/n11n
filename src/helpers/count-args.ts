// tslint:disable-next-line: ban-types
export function countArgs(fn: Function): number {
  return (
    fn
      .toString()
      // for functions
      .replace(/.*function.*?\((.*)\).*/, '$1')
      // for lambdas
      .replace(/\(?(.*?)\)? *=>.*/, '$1')
      .replace(/{|}|\[|\]/g, '')
      .split(',').length
  );
}
