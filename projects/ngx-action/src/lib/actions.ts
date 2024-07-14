import { filter, Observable, Subject } from 'rxjs';
import { ActionClass, ActionInstance } from './internals/types';

export class Actions {
  private static readonly actions$: Subject<ActionInstance> =
    new Subject<ActionInstance>();

  public static dispatch(...actionInstances: ActionInstance[]): void {
    actionInstances.forEach((actionInstance: ActionInstance) => {
      this.actions$.next(actionInstance);
    });
  }

  public static onAction<
    AC extends ActionClass<InstanceType<AC>>,
    ACArray extends ActionClass<InstanceType<AC>>[],
  >(
    ...actionClasses: [AC, ...ACArray]
  ): Observable<InstanceType<AC> | InstanceType<ACArray[number]>> {
    const predicate =
      actionClasses.length === 1
        ? (action: ActionInstance) => action instanceof actionClasses[0]
        : (action: ActionInstance) =>
            actionClasses.some(
              (actionClass: ActionClass) => action instanceof actionClass,
            );
    return this.actions$.pipe(filter(predicate));
  }
}
