import { isClassSupported, isDecoratorApplied, isInitCalled, markDecoratorApplied } from './internals/helpers';
import { destroySubjectSymbol }                                                     from './internals/symbols';
import { DecoratedClassInstanceType, DecoratedClassType }                           from './internals/types';

export function WithActionHandlers(): (decoratedClass: DecoratedClassType) => void {
  return function (decoratedClass: DecoratedClassType): void {
    if (!isClassSupported(decoratedClass)) {
      throw new Error('@WithActionHandlers() decorator should be applied to class decorated with @Component(), @Directive(), or @Injectable().');
    }

    if (isDecoratorApplied(decoratedClass)) {
      throw new Error('@WithActionHandlers() decorator should be applied only once - to the deepest child class.');
    } else {
      markDecoratorApplied(decoratedClass);
    }

    overrideNgOnDestroy(decoratedClass);
  };
}

function overrideNgOnDestroy(decoratedClass: DecoratedClassType): void {
  const originalNgOnDestroy = decoratedClass.prototype.ngOnDestroy;
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
