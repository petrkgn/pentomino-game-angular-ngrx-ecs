import { filter, Observable, of, OperatorFunction } from 'rxjs';

export function isDefined<T>(value: T): value is NonNullable<T> {
  return value !== undefined && value !== null;
}
export function filterDefined<T>(
  source$: Observable<T>
): Observable<NonNullable<T>> {
  return source$.pipe(filter(isDefined)); 
}

export function isDefined2<T>(): OperatorFunction<
  T,
  Exclude<T, null | undefined>
> {
  return filter(
    (value): value is Exclude<T, null | undefined> =>
      value !== null && value !== undefined
  );
}

export function areAllObjectsDefined<T>(arr: (T | null | undefined)[]): boolean {
  return arr.every(obj => obj !== null && obj !== undefined);
}

//https://codegen.studio/1572/how-to-create-custom-pipe-operators-in-rxjs/
