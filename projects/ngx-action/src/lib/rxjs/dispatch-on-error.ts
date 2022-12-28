import { catchError, EMPTY, Observable } from 'rxjs';
import { Actions }                       from '../actions';
import { ActionInstance }                from '../internals/types';

export function dispatchOnError<Value>(
  callback: (error: unknown) => ActionInstance,
): (source$: Observable<Value>) => Observable<Value> {
  return function (source$: Observable<Value>): Observable<Value> {
    return source$.pipe(
      catchError((error: unknown) => {
        Actions.dispatch(callback(error));
        return EMPTY;
      }),
    );
  };
}
