import { catchError, EMPTY, Observable, tap, throwError } from 'rxjs';
import { ActionInstance }                                 from './_types';
import { Actions }                                        from './actions';

export function dispatchOnSuccess<Value>(
  callback: (value: Value) => ActionInstance,
): (source$: Observable<Value>) => Observable<Value> {
  return function (source$: Observable<Value>): Observable<Value> {
    return source$.pipe(
      tap((value: Value) => {
        Actions.dispatch(callback(value));
      }),
    );
  };
}

export function dispatchOnError<Value>(
  callback: (error: unknown) => ActionInstance,
): (source$: Observable<Value>) => Observable<Value> {
  return function (source$: Observable<Value>): Observable<Value> {
    return source$.pipe(
      catchError((error: unknown) => {
        Actions.dispatch(callback(error));
        return throwError(() => error);
      }),
    );
  };
}

export function ignoreSourceErrors<Value>(): (source$: Observable<Value>) => Observable<Value> {
  return function (source$: Observable<Value>): Observable<Value> {
    return source$.pipe(
      catchError(() => EMPTY),
    );
  };
}
