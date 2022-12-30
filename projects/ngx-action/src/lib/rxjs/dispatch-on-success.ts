import { Observable, tap } from 'rxjs';
import { Actions }         from '../actions';
import { ActionInstance }  from '../internals/types';

export function dispatchOnSuccess<Value>(
  callback: (value: Value) => ActionInstance | ActionInstance[],
): (source$: Observable<Value>) => Observable<Value> {
  return function (source$: Observable<Value>): Observable<Value> {
    return source$.pipe(
      tap((value: Value) => {
        const actionInstances: ActionInstance | ActionInstance[] = callback(value);
        if (Array.isArray(actionInstances)) {
          Actions.dispatch(...actionInstances);
        } else {
          Actions.dispatch(actionInstances);
        }
      }),
    );
  };
}
