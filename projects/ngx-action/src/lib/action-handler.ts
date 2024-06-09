import { assertIsDefined, removeParentActionHandlerIfOverwritten }    from './internals/helpers';
import { actionHandlersSymbol }                                       from './internals/symbols';
import { ActionClass, ActionHandlerMeta, DecoratedClassInstanceType } from './internals/types';

export function ActionHandler<AC extends ActionClass<InstanceType<AC>>, ACArray extends ActionClass<InstanceType<AC>>[]>(
  ...actionClasses: [AC, ...ACArray]
) {
  return function (
    decoratedClassInstance: DecoratedClassInstanceType,
    key: string,
    descriptor:
      | TypedPropertyDescriptor<(action: InstanceType<AC> | InstanceType<ACArray[number]>) => void>
      | TypedPropertyDescriptor<() => void>,
  ): void {
    assertIsDefined(descriptor.value);

    decoratedClassInstance[actionHandlersSymbol] = (decoratedClassInstance[actionHandlersSymbol] || []).slice();
    const asyncActionHandlers: ActionHandlerMeta[] = decoratedClassInstance[actionHandlersSymbol];
    const actionHandlerMeta: ActionHandlerMeta = {
      methodName: key,
      actionClasses,
      method: descriptor.value,
    };
    removeParentActionHandlerIfOverwritten(asyncActionHandlers, actionHandlerMeta);
    asyncActionHandlers.push(actionHandlerMeta);
  };
}
