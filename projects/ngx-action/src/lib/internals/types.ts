import { Observable } from 'rxjs';

export type ConstructorType = new(...args: any[]) => any;
export type AbstractConstructorType = abstract new(...args: any[]) => any;

export type DecoratedClassType = ConstructorType;
export type DecoratedClassInstanceType = InstanceType<DecoratedClassType>;

export type ActionClass = ConstructorType | AbstractConstructorType;
export type ActionInstance = InstanceType<ConstructorType>;

export interface ActionHandlerMeta {
  methodName: string;
  actionClass: ActionClass;
  method: (action: ActionInstance) => void;
}

export interface AsyncActionHandlerMeta {
  methodName: string;
  actionClass: ActionClass;
  method: (handle$: Observable<ActionInstance>) => Observable<any>;
}
