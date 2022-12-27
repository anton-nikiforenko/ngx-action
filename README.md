# Compatibility

| Library version | @angular/core | rxjs            |
|--------------|----------------|-----------------|
| \>=1        | \>=13 && <16 | \>=7 && < 8 |

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

## Dispatch Action

```ts
import { Actions } from 'ngx-action';

class SomeAction {
  constructor(public payload: any) {}
}

// ...
Actions.dispatch(new SomeAction('payload'));
```

## Subscribe on Action

```ts
import { Actions } from 'ngx-action';

// ...
Actions.onAction(SomeAction).subscribe( // don't forget to unsubscribe
  (action: SomeAction) => {
    // do something
  },
);

// ...
Actions.onAction(SomeAction).pipe(
  mergeMap((action: SomeAction) => doSomethingAsync(someAction.payload))
).subscribe( // don't forget to unsubscribe
  (result) => {
    // do something with result
  },
);
```

## Subscribe on Action using Decorators

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

  @ActionHandler(SyncAction) // 3. <-- use decorator to subscribe on action
  syncActionHandler(action: SyncAction): void { // "action" argument is optional
    // do something synchronously
    // don't forget to handle errors
    // or action handler will be stopped after the first one occurs
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
(**all pending async actions will be cancelled**).

## Prevent services tree-shaking

If you extract some action handlers into services,
and don't inject those services anywhere in the app,
Angular compiler will remove them from bundle.
Provide such services using `ActionsModule` to avoid this.

```ts
import {
  ActionHandler,
  ActionsModule,
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

@NgModule({
  providers: [
    // prevent service tree-shaking
    ActionsModule.provide([FeatureActionHandlers]),
  ],
})
export class FeatureModule {}
```

Helper may only be used inside modules and standalone (Angular 14+) components.
For non-standalone components add service to constructor dependencies to prevent tree-shaking.

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

## rxjs operators

Here are some useful rxjs operators exported by the library.
Should typically be used when doing async stuff, like http requests.

### dispatchOnSuccess

Dispatch an action if source works as expected.

```ts
Actions.onAction(SomeAction).pipe(
  mergeMap((action: SomeAction) => doSomethingAsync(someAction.payload).pipe(
    dispatchOnSuccess((result) => new SuccessAction(result.data)),
  )),
).subscribe();
```

### dispatchOnError

Dispatch an action when source emits error.
Error will be rethrown and still has to be handled.

```ts
Actions.onAction(SomeAction).pipe(
  mergeMap((action: SomeAction) => doSomethingAsync(someAction.payload).pipe(
    dispatchOnError((error: unknown) => new ErrorAction()),
  )),
).subscribe();
```

## Change Detection

You may need to manually trigger component change detection to update view on action trigger, because action handler is just a subscription under the hood.
This isn't required if you store view data in Observable and subscribe on it using `async` pipe.  

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
