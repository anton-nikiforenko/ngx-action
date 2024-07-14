[![npm downloads total](https://img.shields.io/npm/dt/ngx-action.svg?style=flat-square)](https://www.npmjs.com/package/ngx-action)
[![npm downloads monthly](https://img.shields.io/npm/dm/ngx-action.svg?style=flat-square)](https://www.npmjs.com/package/ngx-action)

# Description

Lightweight (around 1KB gzipped) library allowing to
sync components, directives and services of Angular application.

# Installation

```
npm install ngx-action
# or
yarn add ngx-action
```

# Compatibility

| Library version      | @angular/core | rxjs        |
| -------------------- | ------------- | ----------- |
| \>=2.0.0             | \>=16         | \>=7 && < 8 |
| \>=1.2.2             | \>=13         | \>=7 && < 8 |
| \>=1.2.0 && <= 1.2.1 | \>=13 && <17  | \>=7 && < 8 |
| \<1.2.0              | \>=13 && <16  | \>=7 && < 8 |

# Usage

## 1. Create actions

> Action must be a class, as the library uses the `instanceof` operator under the hood.

```ts
class SignOut {}
class DetailsSuccess {
  constructor(public payload: any) {}
}
class ListSuccess {
  constructor(public payload: any) {}
}
abstract class LoggableAction {}
class ShowErrorNotification extends LoggableAction {
  constructor(public text: string) {}
}
```

## 2. Subscribe to actions

### 2.1 `Actions.onAction()` method:

```ts
import { Actions } from "ngx-action";

Actions.onAction(DetailsSuccess, ListSuccess)
  .pipe(takeUntilDestroyed())
  .subscribe((action: DetailsSuccess | ListSuccess) => {
    console.log(action.payload);
  });
```

### 2.2 `@ActionHandler()` or `@AsyncActionHandler()` decorator:

```ts
import { signal } from "@angular/core";
import { BehaviorSubject, EMPTY } from 'rxjs';
import { ActionHandler, AsyncActionHandler, initActionHandlers } from 'ngx-action';

@Component(...) // or @Directive(...), or @Injectable()
export class MyComponent {
  payloadSignal = signal<any>(null);
  payload$ = new BehaviorSubject<any>(null);
  payload = null;

  constructor(
    private httpClient: HttpClient,
    private cdr: ChangeDetectorRef,
    private notifications: Notifications,
  ) {
    initActionHandlers(this); // <-- !!! call helper method to activate subscriptions
  }

  @ActionHandler(ShowErrorNotification) // handle action synchronously
  showErrorNotificationHandler(action: ShowErrorNotification): void {
    this.notifications.error(action.text);
  }

  @ActionHandler(LoggableAction) // handle abstract action
  loggableActionHandler(action: LoggableAction): void {
    console.log(action);
  }

  @ActionHandler(DetailsSuccess, ListSuccess) // handle multiple actions
  successHandler(action: DetailsSuccess | ListSuccess): void {
    // update signal value
    payloadSignal.set(action.payload);

    // update subject value
    this.payload$.next(action.payload);

    // update plain value - may require change detection triggering
    this.payload = action.payload;
    this.cdr.markForCheck();
  }

  @AsyncActionHandler(SignOut) // handle action asynchronously
  signOutHandler(handle$: Observable<SignOut>): Observable<unknown> {
    return handle$.pipe(
      mergeMap((action: SignOut) => {
        return this.httpClient.post('/sign-out').pipe(
          // optionally handle result
          tap((response) => {
            console.log(response);
          }),
          // don't forget to handle errors,
          // or action handler will be stopped after the first one occurs
          catchError((error) => {
            console.error(error);
            return EMPTY;
          }),
        );
      })
    );
  }
}
```

> Decorators use `takeUntilDestroyed()` operator under the hood and will unsubscribe on destroy
> (**all pending async actions, like http requests, will be cancelled**).

## 3. Dispatch Actions

### 3.1 `Actions.dispatch()` method:

```ts
import { Actions } from "ngx-action";

Actions.dispatch(new SignOut());
Actions.dispatch(new DetailsSuccess("details"), new ListSuccess("list"));
```

### 3.2 rxjs operators:

**dispatchOnSuccess** - dispatch actions when source observable emits.

```ts
Actions.onAction(Action).pipe(
  mergeMap((action: Action) => this.httpCLient.get(...).pipe(
    dispatchOnSuccess((result) => new ActionSuccess(result.data)),
    // dispatchOnSuccess((result) => [new ActionSuccess(result.data), new ActionSuccess()]),
  )),
  takeUntilDestroyed(),
).subscribe();
```

**dispatchOnError** - dispatch actions when source observable throws an error.
It won't rethrow the error, so use `catchError` instead if you want to add custom error handling.

```ts
Actions.onAction(Action).pipe(
  mergeMap((action: Action) => this.httpCLient.get(...).pipe(
    dispatchOnError((error: unknown) => new LogError(error)),
    // dispatchOnError((result) => [new LogError(error), new LogError(error)]),
  )),
  takeUntilDestroyed(),
).subscribe();
```

# Techniques

## 1. Prevent services tree-shaking

> If you extract some action handlers into services,
> and don't inject those services anywhere in the app,
> Angular compiler will remove them from the bundle.
> Provide such services using `ActionsModule` to avoid this,
> or directly inject services when above technique not applicable.

```ts
import { ActionHandler, AsyncActionHandler, initActionHandlers } from 'ngx-action';

@Injectable()
export class TreeShakeableService {
  constructor() {
      initActionHandlers(this);
  }

  @ActionHandler(...)
  // ...
}
```

### 1.1 At NgModule level

```ts
import { ActionsModule } from "ngx-action";

@NgModule({
  providers: [
    // use ActionsModule.provide() to prevent tree-shaking
    ActionsModule.provide([TreeShakeableService]),
  ],
})
export class FeatureModule {}
```

### 1.2 At Component level

`ActionsModule` not applicable here (neither with standard nor with standalone components),
so inject them directly.

```ts
@Component({
  providers: [TreeShakeableService], // <-- provide service
})
export class FeatureComponent {
  constructor(
    public service: TreeShakeableService, // <-- inject service to prevent tree-shaking
  ) {}
}
```

### 1.3 When providing via route provider

```ts
import { importProvidersFrom } from "@angular/core";
import { ActionsModule } from "ngx-action";

export const routes: Routes = [
  {
    path: "",
    component: SomeComponent,
    // use importProvidersFrom() with ActionsModule.provide() to prevent tree-shaking
    providers: [importProvidersFrom(ActionsModule.provide([TreeShakeableService]))],
  },
];
```

## 2. Inheritance

> Action handlers inheritance works similar to native inheritance:
> child methods will override parent methods with the same name (but you can call them using `super`).

```ts
@Directive()
abstract class Parent {
  @ActionHandler(Action)
  parentOne() {
    console.log('parent 1');
  }

  @ActionHandler(Action)
  parentTwo() {
    console.log('parent 2');
  }

  @ActionHandler(Action)
  parentThree() {
    console.log('parent 3');
  }
}

@Component(...)
class Child extends Parent {
  constructor() {
    super();
    initActionHandlers(this);

    Actions.dispatch(new Action());
    // parent 3 // parent parentThree()
    // child 1 // child parentOne()
    // parent 2 // child super.parentTwo()
    // child 2 // child parentTwo()
    // child 3 // child childThree()
  }

  @ActionHandler(Action)
  parentOne() {
    console.log('child 1');
  }

  @ActionHandler(Action)
  parentTwo() {
    super.parentTwo(); // super call
    console.log('child 2');
  }

  @ActionHandler(Action)
  childThree() {
    console.log('child 3');
  }
}
```
