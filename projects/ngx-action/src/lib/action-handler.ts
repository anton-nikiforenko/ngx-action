import { removeParentActionHandlerIfOverwritten }                     from './internals/helpers';
import { actionHandlersSymbol }                                       from './internals/symbols';
import { ActionClass, ActionHandlerMeta, DecoratedClassInstanceType } from './internals/types';

export function ActionHandler<AC extends ActionClass>(actionClass: AC) {
  return function (
    decoratedClassInstance: DecoratedClassInstanceType,
    key: string,
    descriptor:
      | TypedPropertyDescriptor<(action: InstanceType<AC>) => void>
      | TypedPropertyDescriptor<() => void>,
  ): void {
    decoratedClassInstance[actionHandlersSymbol] = (decoratedClassInstance[actionHandlersSymbol] || []).slice();
    const asyncActionHandlers: ActionHandlerMeta[] = decoratedClassInstance[actionHandlersSymbol];
    const actionHandlerMeta: ActionHandlerMeta = {
      methodName: key,
      actionClass,
      method: descriptor.value!,
    };
    removeParentActionHandlerIfOverwritten(asyncActionHandlers, actionHandlerMeta);
    asyncActionHandlers.push(actionHandlerMeta);
  };
}
