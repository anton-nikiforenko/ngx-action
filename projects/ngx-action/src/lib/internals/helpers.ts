import { ɵNG_COMP_DEF as NG_COMP_DEF, ɵNG_DIR_DEF as NG_DIR_DEF, ɵNG_PROV_DEF as NG_PROV_DEF }       from '@angular/core';
import { isDecoratorAppliedSymbol, isInitCalledSymbol }                                              from './symbols';
import { ActionHandlerMeta, AsyncActionHandlerMeta, DecoratedClassInstanceType, DecoratedClassType } from './types';

export function isClassSupported(decoratedClass: DecoratedClassType): boolean {
  return NG_PROV_DEF in decoratedClass
    || NG_COMP_DEF in decoratedClass
    || NG_DIR_DEF in decoratedClass;
}

export function isDecoratorApplied(decoratedClass: DecoratedClassType): boolean {
  return !!decoratedClass.prototype[isDecoratorAppliedSymbol];
}

export function markDecoratorApplied(decoratedClass: DecoratedClassType): void {
  decoratedClass.prototype[isDecoratorAppliedSymbol] = true;
}

export function isInitCalled(decoratedClassInstance: DecoratedClassInstanceType): boolean {
  return !!decoratedClassInstance[isInitCalledSymbol];
}

export function markInitCalled(decoratedClassInstance: DecoratedClassInstanceType): void {
  decoratedClassInstance[isInitCalledSymbol] = true;
}

export function removeParentActionHandlerIfOverwritten<AHM extends ActionHandlerMeta | AsyncActionHandlerMeta>(
  actionHandlers: AHM[],
  childActionHandler: AHM,
): void {
  const indexOfOverwrittenParentActionHandler: number = actionHandlers.findIndex(
    (actionHandler: AHM) => actionHandler.methodName === childActionHandler.methodName,
  );
  if (indexOfOverwrittenParentActionHandler !== -1) {
    actionHandlers.splice(indexOfOverwrittenParentActionHandler, 1);
  }
}
