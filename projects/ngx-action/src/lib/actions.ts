import { filter, Observable, Subject } from 'rxjs';
import { ActionClass, ActionInstance } from './_types';

export class Actions {
  private static readonly actions$: Subject<ActionInstance> = new Subject<ActionInstance>();

  constructor() {
  }

  public static dispatch(actionInstance: ActionInstance): void {
    this.actions$.next(actionInstance);
  }

  public static onAction(actionClass: ActionClass): Observable<ActionInstance> {
    return this.actions$.pipe(
      filter((action: ActionInstance) => {
        return action instanceof actionClass;
      }),
    );
  }
}
