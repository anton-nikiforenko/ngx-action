import { catchError, EMPTY, Observable, Subject, takeUntil }                                     from 'rxjs';
import { isClassSupported, isDecoratorApplied, isInitCalled, markInitCalled }                    from './_helpers';
import { actionHandlersSymbol, asyncActionHandlersSymbol, destroySubjectSymbol }                 from './_symbols';
import { ActionHandlerMeta, ActionInstance, AsyncActionHandlerMeta, DecoratedClassInstanceType } from './_types';
import { Actions }                                                                               from './actions';

export function initActionHandlers(decoratedClassInstance: DecoratedClassInstanceType): void {
  if (!isClassSupported(decoratedClassInstance.constructor)) {
    throw new Error('initActionHandlers(this) should be used inside class decorated with @Component(), @Directive(), or @Injectable().');
  }
  if (!isDecoratorApplied(decoratedClassInstance.constructor)) {
    throw new Error('initActionHandlers(this) should be used inside class decorated with @WithActionHandlers().');
  }

  if (isInitCalled(decoratedClassInstance)) {
    throw new Error('Method initActionHandlers(this) should be called only once - inside the deepest child class.');
  } else {
    markInitCalled(decoratedClassInstance);
  }

  createDestroySubject(decoratedClassInstance);
  createActionSubscriptions(decoratedClassInstance);
}

function createDestroySubject(decoratedClassInstance: DecoratedClassInstanceType): void {
  decoratedClassInstance[destroySubjectSymbol] = new Subject<void>();
}

function createActionSubscriptions(decoratedClassInstance: DecoratedClassInstanceType): void {
  const actionHandlers: ActionHandlerMeta[] = decoratedClassInstance[actionHandlersSymbol] || [];
  const asyncActionHandlers: AsyncActionHandlerMeta[] = decoratedClassInstance[asyncActionHandlersSymbol] || [];
  const destroy$: Subject<void> = decoratedClassInstance[destroySubjectSymbol];
  createSyncSubscriptions(decoratedClassInstance, actionHandlers, destroy$);
  createAsyncSubscriptions(decoratedClassInstance, asyncActionHandlers, destroy$);
}

function createSyncSubscriptions(
  decoratedClassInstance: DecoratedClassInstanceType,
  actionHandlers: ActionHandlerMeta[],
  destroy$: Subject<void>,
): void {
  actionHandlers.forEach((meta: ActionHandlerMeta) => {
    Actions.onAction(meta.actionClass).pipe(
      takeUntil(destroy$),
    ).subscribe(
      (action: ActionInstance) => {
        meta.method.call(decoratedClassInstance, action);
      },
    );
  });
}

function createAsyncSubscriptions(
  decoratedClassInstance: DecoratedClassInstanceType,
  asyncActionHandlers: AsyncActionHandlerMeta[],
  destroy$: Subject<void>,
): void {
  asyncActionHandlers.forEach((meta: AsyncActionHandlerMeta) => {
    const handle$: Observable<ActionInstance> = Actions.onAction(meta.actionClass);
    meta.method.call(decoratedClassInstance, handle$).pipe(
      catchError((error: unknown) => {
        const sourceCode: string = `${decoratedClassInstance.constructor.name}: @AsyncActionHandler(${meta.actionClass.name}) ${meta.methodName}()`;
        console.warn(`${sourceCode} has stopped work due to an unhandled error in observable.`);
        console.warn(error);
        return EMPTY;
      }),
      takeUntil(destroy$),
    ).subscribe();
  });
}
