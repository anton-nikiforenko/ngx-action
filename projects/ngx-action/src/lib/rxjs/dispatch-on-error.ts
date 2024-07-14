import { catchError, EMPTY, Observable } from 'rxjs';
import { Actions } from '../actions';
import { ActionInstance } from '../internals/types';

export function dispatchOnError<Value>(
  callback: (error: unknown) => ActionInstance | ActionInstance[],
): (source$: Observable<Value>) => Observable<Value> {
  return function (
    source$: Observable<Value>,
  ): Observable<Value> | Observable<never> {
    return source$.pipe(
      catchError((error: unknown) => {
        const actionInstances: ActionInstance | ActionInstance[] =
          callback(error);
        if (Array.isArray(actionInstances)) {
          Actions.dispatch(...actionInstances);
        } else {
          Actions.dispatch(actionInstances);
        }
        return EMPTY;
      }),
    );
  };
}
