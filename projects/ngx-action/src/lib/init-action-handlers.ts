import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Actions } from './actions';
import {
  isClassSupported,
  isInitCalled,
  markInitCalled,
} from './internals/helpers';
import {
  actionHandlersSymbol,
  asyncActionHandlersSymbol,
} from './internals/symbols';
import {
  ActionHandlerMeta,
  ActionInstance,
  AsyncActionHandlerMeta,
  DecoratedClassInstanceType,
} from './internals/types';

export function initActionHandlers(
  decoratedClassInstance: DecoratedClassInstanceType,
): void {
  if (!isClassSupported(decoratedClassInstance.constructor)) {
    throw new Error(
      'initActionHandlers(this) should be used inside class decorated with @Component(), @Directive(), or @Injectable().',
    );
  }

  if (isInitCalled(decoratedClassInstance)) {
    throw new Error(
      'Method initActionHandlers(this) should be called only once - inside the deepest child class.',
    );
  } else {
    markInitCalled(decoratedClassInstance);
  }

  try {
    createActionSubscriptions(decoratedClassInstance);
  } catch (error) {
    throw new Error(
      'initActionHandlers(this) should be called inside constructor',
    );
  }
}

function createActionSubscriptions(
  decoratedClassInstance: DecoratedClassInstanceType,
): void {
  const actionHandlers: ActionHandlerMeta[] =
    decoratedClassInstance[actionHandlersSymbol] || [];
  const asyncActionHandlers: AsyncActionHandlerMeta[] =
    decoratedClassInstance[asyncActionHandlersSymbol] || [];
  createSyncSubscriptions(decoratedClassInstance, actionHandlers);
  createAsyncSubscriptions(decoratedClassInstance, asyncActionHandlers);
}

function createSyncSubscriptions(
  decoratedClassInstance: DecoratedClassInstanceType,
  actionHandlers: ActionHandlerMeta[],
): void {
  actionHandlers.forEach((meta: ActionHandlerMeta) => {
    Actions.onAction(...meta.actionClasses)
      .pipe(takeUntilDestroyed())
      .subscribe((action: ActionInstance) => {
        meta.method.call(decoratedClassInstance, action);
      });
  });
}

function createAsyncSubscriptions(
  decoratedClassInstance: DecoratedClassInstanceType,
  asyncActionHandlers: AsyncActionHandlerMeta[],
): void {
  asyncActionHandlers.forEach((meta: AsyncActionHandlerMeta) => {
    const handle$ = Actions.onAction(...meta.actionClasses);
    meta.method
      .call(decoratedClassInstance, handle$)
      .pipe(takeUntilDestroyed())
      .subscribe();
  });
}
