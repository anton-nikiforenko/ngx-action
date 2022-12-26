import { removeParentActionHandlerIfOverwritten }                     from './_helpers';
import { actionHandlersSymbol }                                       from './_symbols';
import { ActionClass, ActionHandlerMeta, DecoratedClassInstanceType } from './_types';

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
