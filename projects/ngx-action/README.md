# Description

Lightweight (around 1KB gzipped) library allowing to
sync components of Angular application using actions and decorators.

# Features

- All actions are classes
- Dispatch one or more actions at once using service
- Dispatch one or more actions using rxjs operators
- Subscribe to one or more actions using service
- Subscribe to one or more actions inside Component, Directive, or Injectable with decorators

# Installation

```
npm install ngx-action
# or
yarn add ngx-action
```

# Compatibility

| Library version | @angular/core | rxjs          |
|-----------------|--------------|---------------|
| \>=1.2.0        | \>=13 && <17 | \>=7 && < 8   |
| \<1.2.0         | \>=13 && <16 | \>=7 && < 8   |

# API

## Action examples

Action must be a class, as the library uses the `instanceof` operator
to distinguish between actions.

```ts
class EmptyAction {}

class ActionWithPayload {
  constructor(
    public data: any,
    public anotherData: any,
    // ...
  ) {
  }
}

abstract class AbstractAction {}
```

## Dispatch Actions

Dispatch one or more actions with `Actions.dispatch(action1, ..., actionN)`.

```ts
import { Actions } from 'ngx-action';

class SomeAction {
  constructor(public payload: any) {}
}

// ...
Actions.dispatch(new SomeAction('payload'));

// dispatch many actions at once
Actions.dispatch(new SomeAction('v1'), new SomeAction('v2'));
```

## Subscribe to Actions using service

Subscribe to one or more actions with `Actions.onAction(ActionClass1, ..., ActionClassN)`.

```ts
import { Actions } from 'ngx-action';

// subscribe to single action and do sync stuff
Actions.onAction(SomeAction).subscribe( // don't forget to unsubscribe
  (action: SomeAction) => {
    // do something
  },
);

// subscribe to multiple actions and do sync stuff
Actions.onAction(SomeAction, AnotherAction).subscribe( // don't forget to unsubscribe
  (action: SomeAction | AnotherAction) => {
    // do something
  },
);

// subscribe to single action and do async stuff
Actions.onAction(SomeAction).pipe(
  mergeMap((action: SomeAction) => doSomethingAsync(someAction.payload))
).subscribe( // don't forget to unsubscribe
  (result) => {
    // do something with result
  },
);
```

## Subscribe to Actions using Decorators

Subscribe to one or more actions with `@ActionHandler(ActionClass1, ..., ActionClassN)`
or `@AsyncActionHandler(ActionClass1, ..., ActionClassN)`.

1. Apply `@WithActionHandlers()` class decorator to Component, Directive,
or Service (Injectable).
Unsubscription logic will be added at this point (by patching `ngOnDestroy` hook).
   1. If you have hierarchy of classes (e.g. `ChildComponent`, `ParentComponent`, `GrandParentComponent`),
   **decorator should be applied only once to the deepest child** (`ChildComponent`).
   1. Library will throw an error in case you'll apply decorator twice, or apply it to both parent and child.
1. Call `initActionHandlers(this)` helper method once inside the constructor
(may also be called inside `ngOnInit` or other method, but not recommended).
At this point subscriptions will be created.
   1. This method should also be called in the deepest child.
   1. Error will be thrown in case you call this method twice, or forget to apply class decorator.
   1. Error will be thrown in case you apply class decorator, but forget to call the method.
1. Configure action subscriptions using `@ActionHandler(Action)` and `@AsyncActionHandler(Action)`
method decorators.
   1. If you have decorated method with the same name in the parent and child classes,
   subscription will be created for one described in the child class.

```ts
import {
  ActionHandler,
  AsyncActionHandler,
  initActionHandlers,
  WithActionHandlers
} from 'ngx-action';
import { EMPTY } from 'rxjs';

@WithActionHandlers() // <-- 1. apply class decorator
@Component(...)
export class SomeComponent {
  constructor(
    private apiService: ApiService,
  ) {
    initActionHandlers(this); // <-- 2. call helper method
  }

  @ActionHandler(SyncAction) // 3. <-- use decorator to subscribe to action
  syncActionHandler(action: SyncAction): void { // "action" argument is optional
    // do something synchronously
    // don't forget to handle errors
    // or action handler will be stopped after the first one occurs
  }

  @ActionHandler(SyncAction, SyncAction2) // 3.
  syncActionHandler(action: SyncAction | SyncAction2): void {
    // do something synchronously
  }

  @AsyncActionHandler(AsyncAction) // 3.
  asyncActionHandler(handle$: Observable<AsyncAction>): Observable<any> {
    return handle$.pipe(
      mergeMap((action: AsyncAction) => {
        return this.apiService.doSmth(action.payload).pipe(
          // don't forget to handle errors,
          // or action handler will be stopped after the first one occurs
          catchError((error) => EMPTY),
          tap((result) => {
            // do something with result
          }),
        );
      })
    );
  }
}
```

#### Action handlers lifetime

The library patches `ngOnDestroy` hook under the hood.
That's why active action handlers, **subscribed using decorators**,
will unsubscribe on component, directive, or service destroy
(**all pending async actions, like http requests, will be cancelled**).

## Internal types

Library exports `ActionClass` (parameter of ActionHandler decorator) type,
that may sometimes help with generic types. Example below:

```ts
import { ActionClass } from 'ngx-action';

class ParentClass<T extends ActionClass> {
  constructor(Class: T) {
    Actions.onAction(Class).subscribe(
      () => {
        // do something common
      }
    );
  }
}

class ChildAction {}

class ChildClass entends ParentClass<typeof SpecificAction> {
  constructor() {
    super(ChildAction);
  }

  // do something child-specific
}
```

## Prevent services tree-shaking

If you extract some action handlers into services,
and don't inject those services anywhere in the app,
Angular compiler will remove them from the bundle.
Provide such services using `ActionsModule` to avoid this,
or directly inject services when above technique not applicable.

#### Tree-shakeable service

```ts
import {
  ActionHandler,
  AsyncActionHandler,
  initActionHandlers,
  WithActionHandlers
} from 'ngx-action';

@WithActionHandlers()
@Injectable()
export class FeatureActionHandlers { // <-- tree-shakeable service
  constructor() {
      initActionHandlers(this);
  }

  @ActionHandler(...)
  // ...

  @AsyncActionHandler(...)
  // ...
}
```

### Prevent tree-shaking at NgModule level

```ts
import { ActionsModule } from 'ngx-action';

@NgModule({
  providers: [
    // prevent service tree-shaking
    ActionsModule.provide([FeatureActionHandlers]),
  ],
})
export class FeatureModule {}
```

### Prevent tree-shaking at Component level

`ActionsModule` not applicable here (neither with standard nor with standalone components),
so inject them directly.

```ts
@Component({
  providers: [FeatureActionHandlersService], // <-- provide service
})
export class FeatureComponent {
  constructor(
    public service: FeatureActionHandlers, // <-- inject service by yourself
  ) {}
}
```

### Prevent Route providers tree-shaking (Angular 14+)

You can use Angular `importProvidersFrom` helper with `ActionsModule`
to prevent Route providers tree-shaking.

```ts
import { importProvidersFrom } from '@angular/core';
import { ActionsModule } from 'ngx-action';

export const routes: Routes = [
    {
        path: '',
        component: SomeComponent,
        // prevent service tree-shaking
        providers: [importProvidersFrom(ActionsModule.provide([FeatureActionHandlers]))]
    },
];
```

## rxjs operators

Here are some useful rxjs operators exported by the library.
Should typically be used when doing async stuff, like http requests.

### dispatchOnSuccess

Dispatch one or more actions when source emits a value.

```ts
Actions.onAction(SomeAction).pipe(
  mergeMap((action: SomeAction) => doSomethingAsync(someAction.payload).pipe(
    dispatchOnSuccess((result) => new SuccessAction(result.data)),
    // dispatchOnSuccess((result) => [new SuccessAction(result.data), new OtherAction()]),
  )),
).subscribe();
```

### dispatchOnError

Dispatch one or more actions when source emits error.
Errored Observable will be replaced with rxjs `EMPTY` Observable (won't rethrow an error),
so use `catchError` instead of `dispatchOnError`,
if you want to add additional error handling.

```ts
Actions.onAction(SomeAction).pipe(
  mergeMap((action: SomeAction) => doSomethingAsync(someAction.payload).pipe(
    dispatchOnError((error: unknown) => new ErrorAction()),
    // dispatchOnError((result) => [new ErrorAction(), new OtherAction()]),
  )),
).subscribe();
```

## Change Detection

You may need to manually trigger component change detection to update view on action trigger, because action handler is just a subscription under the hood.
This isn't required if you store view data in Observable and subscribe to it using `async` pipe.  

```ts
import { ChangeDetectorRef } from '@angular/core';

@WithActionHandlers()
@Component({
  template: '<div>Counter: {{counter}}</div>' // <-- view value
})
export class SomeComponent {
  counter = 0; // <-- property

  constructor(
    private cdr: ChangeDetectorRef,
  ) {
    initActionHandlers(this);
  }

  @ActionHandler(SyncAction)
  someActionHandler() {
    this.counter += 1;
    this.cdr.markForCheck(); // <-- trigger change detection to update view
  }

  @AsyncActionHandler(AsyncAction)
  someActionHandler(handle$) {
    return handle$.pipe(
      mergeMap(() => this.apiService.doSmth().pipe(
        tap(() => {
          this.counter += 1;
          this.cdr.markForCheck(); // <-- trigger change detection to update view
        }),
      ))
    );
  }
}
```

## How action handler decorators work under the hood

```ts
@ActionHandler(Action)
actionHandler(action: Action): void {
  console.log('result');
}

// is equivalent to

Actions.onAction(Action).pipe(
  takeUntil(...),
).subscribe(
  () => {
    console.log('result');
  }
);
```

```ts
@AsyncActionHandler(Action)
actionHandler(handle$: Observable<Action>): Observable<any> {
  handle$.pipe(
    mergeMap((action: Action) => doSomethingAsync(action)),
    tap((result) => {
      console.log('result');
    })
  )
}

// is equivalent to

Actions.onAction(Action).pipe(
  mergeMap((action: Action) => doSomethingAsync(action)),
  tap((result) => {
    console.log('result');
  }),
  takeUntil(...),
).subscribe();
```
