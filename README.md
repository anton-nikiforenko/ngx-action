...will be updated with more information soon

# Description

Decorator-based library allowing to synchronize Angular application parts using class-based actions.

# Compatibility

| Library version | @angular/core | rxjs            |
|--------------|----------------|-----------------|
| \>=1        | \>=13 && <16 | \>=7 && < 8 |

# API

## Action examples

Library uses `instanceof` operator under the hood to distinguish actions.
Thus, you may create parent action and then subscribe on it and its children separately.

```ts
class SomeAction {}

class AnotherAction {
  constructor(
    public data: any,
    public anotherData: any,
    // ...
  ) {
  }
}

abstract class ParentAction {} // may also be subscribed to

class ConcreteChildAction extends ParentAction {
  constructor(public payload: any) {
    super();
  }
}
```

## "Actions" service

### Dispatch action: `Actions.dispatch(instanceOfAction)`

```ts
import { Actions } from 'ngx-action';

class SomeAction {
  constructor(public payload: any) {}
}

// ...
Actions.dispatch(new SomeAction('payload'));
```

### Subscribe on stream of actions: `Actions.onAction(ActionClass)`

```ts
import { Actions } from 'ngx-action';

// ...
Actions.onAction(SomeAction).subscribe( // don't forget to unsubscribe
  (action: SomeAction) => {
    // do something
  },
);

// ...
Actions.onAction(SomeAction).pipe( // don't forget to unsubscribe
  mergeMap((action: SomeAction) => doSomethingAsync(someAction.payload))
).subscribe(
  (result) => {
    // do something with result
  },
);
```

## Decorators

### @ActionHandler(Action)

```ts
import { ActionHandler, initActionHandlers, WithActionHandlers } from 'ngx-action';

@WithActionHandlers() // <-- 1. apply decorator to component
@Component(...) // or @Directive(), or @Injectable()
export class SomeComponent {
  constructor() {
    initActionHandlers(this); // <-- 2. make ActionHandler decorators work
  }

  @ActionHandler(SyncAction) // 3. <-- subscribe on action
  someActionHandler(action: SyncAction): void { // argument is optional
    // do something synchronously
    // errors thrown will propagate to default Angular error handler
  }
}
```

### @AsyncActionHandler(Action)

```ts
import { ActionHandler, initActionHandlers, WithActionHandlers } from 'ngx-action';
import { EMPTY } from 'rxjs';

@WithActionHandlers() // <-- 1.
@Component(...) // or @Directive(), or @Injectable()
export class SomeComponent {
  constructor(
    private apiService: ApiService,
  ) {
    initActionHandlers(this); // <-- 2.
  }

  @AsyncActionHandler(AsyncAction) // 3.
  someActionHandler(handle$: Observable<AsyncAction>): Observable<any> {
    return handle$.pipe(
      mergeMap((action: AsyncAction) => {
        return this.apiService.doSmth(action.payload).pipe(
          // don't forget to handle possible errors,
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

## ActionsModule

If you extract some action handlers into services and don't inject them anywhere in the app, Angular compiler will tree-shake them.
You can prevent this by providing such services using `ActionsModule.provide()` helper method.

```ts
import { ActionHandler, ActionsModule, initActionHandlers, WithActionHandlers } from 'ngx-action';

@WithActionHandlers()
@Injectable()
export class FeatureActionHandlersService {
  constructor() {
      initActionHandlers(this);
  }

  @ActionHandler(...)
  // ...
}

@NgModule({
  providers: [
    // prevent tree-shaking of FeatureActionHandlersService
    ActionsModule.provide([FeatureActionHandlersService]),
  ],
})
export class FeatureModule {}
```

## rxjs helpers

### dispatchOnSuccess
//todo

### dispatchOnError
//todo

### ignoreSourceErrors
//todo

# Other important notes

## Action handlers lifetime

The library patches `ngOnDestroy` hook under the hood.
That's why active action handlers, **subscribed using decorators**, will unsubscribe on component, directive, or service destroy (**all pending async actions will be cancelled**).

## Inheritance

`@WithActionHandlers()` decorator and `initActionHandlers(this)` helper should be used with the deepest child class.
Library will detect some cases of incorrect usage and will throw an error.

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
    this.counter += 1; // <-- trigger change detection to update view
    this.cdr.markForCheck();
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
