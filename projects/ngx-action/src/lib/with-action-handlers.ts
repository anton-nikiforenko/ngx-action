import { isDecoratorApplied, isInitCalled, markDecoratorApplied } from './_helpers';
import { destroySubjectSymbol }                                   from './_symbols';
import { DecoratedClassInstanceType, DecoratedClassType }         from './_types';

export function WithActionHandlers(): (decoratedClass: DecoratedClassType) => void {
  return function (decoratedClass: DecoratedClassType): void {
    if (isDecoratorApplied(decoratedClass)) {
      throw new Error('@WithActionHandlers() decorator should be applied only once - to the deepest child class.');
    } else {
      markDecoratorApplied(decoratedClass);
    }

    overrideNgOnDestroy(decoratedClass);
  };
}

function overrideNgOnDestroy(decoratedClass: DecoratedClassType): void {
  const originalNgOnDestroy: Function = decoratedClass.prototype.ngOnDestroy;
  decoratedClass.prototype.ngOnDestroy = function (this: DecoratedClassInstanceType) {
    originalNgOnDestroy?.call(this);
    this[destroySubjectSymbol]?.next();
    this[destroySubjectSymbol]?.complete();
    this[destroySubjectSymbol] = undefined;

    if (!isInitCalled(this)) {
      throw new Error('initActionHandlers(this) should be called when decorator @WithActionHandlers() applied.');
    }
  };
}
