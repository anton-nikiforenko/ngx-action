import { Observable, tap } from 'rxjs';
import { Actions }         from '../actions';
import { ActionInstance }  from '../internals/types';

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
