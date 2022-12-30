import { Observable } from 'rxjs';

export type ConstructorType<T = any> = new(...args: any[]) => T;
export type AbstractConstructorType<T = any> = abstract new(...args: any[]) => T;

export type DecoratedClassType = ConstructorType;
export type DecoratedClassInstanceType = InstanceType<DecoratedClassType>;

export type ActionClass<T = any> = ConstructorType<T> | AbstractConstructorType<T>;
export type ActionInstance = any;

export interface ActionHandlerMeta {
  methodName: string;
  actionClasses: [ActionClass, ...ActionClass[]];
  method: (action: ActionInstance) => void;
}

export interface AsyncActionHandlerMeta {
  methodName: string;
  actionClasses: [ActionClass, ...ActionClass[]];
  method: (handle$: Observable<ActionInstance>) => Observable<any>;
}
