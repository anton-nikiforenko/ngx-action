import { Component, Directive, Injectable } from '@angular/core';
import { ComponentFixture, TestBed }        from '@angular/core/testing';
import { Observable, tap }                  from 'rxjs';
import { ActionHandler }                    from './action-handler';
import { Actions }                          from './actions';
import { AsyncActionHandler }               from './async-action-handler';
import { initActionHandlers }               from './init-action-handlers';
import { WithActionHandlers }               from './with-action-handlers';

const componentActionHandlerSpy: jasmine.Spy = jasmine.createSpy();
const componentMultipleActionHandlerSpy: jasmine.Spy = jasmine.createSpy();
const componentParentOverwrittenActionHandlerSpy: jasmine.Spy = jasmine.createSpy();
const componentChildOverwrittenActionHandlerSpy: jasmine.Spy = jasmine.createSpy();

const directiveActionHandlerSpy: jasmine.Spy = jasmine.createSpy();
const directiveMultipleActionHandlerSpy: jasmine.Spy = jasmine.createSpy();
const directiveParentOverwrittenActionHandlerSpy: jasmine.Spy = jasmine.createSpy();
const directiveChildOverwrittenActionHandlerSpy: jasmine.Spy = jasmine.createSpy();

const serviceActionHandlerSpy: jasmine.Spy = jasmine.createSpy();
const serviceMultipleActionHandlerSpy: jasmine.Spy = jasmine.createSpy();
const serviceParentOverwrittenActionHandlerSpy: jasmine.Spy = jasmine.createSpy();
const serviceChildOverwrittenActionHandlerSpy: jasmine.Spy = jasmine.createSpy();

class AsyncAction {}
class AsyncAction2 {}

// ---------- Component ----------
@Component({selector: 'any', template: ''})
class ParentComponentWithActionHandlers {
  @AsyncActionHandler(AsyncAction)
  public overwrittenActionHandler(handle$: Observable<AsyncAction>): Observable<unknown> {
    return handle$.pipe(
      tap((action: AsyncAction) => {
        componentParentOverwrittenActionHandlerSpy(action);
      }),
    );
  }
}

@WithActionHandlers()
@Component({selector: 'selector', template: ''})
class ComponentWithActionHandlers extends ParentComponentWithActionHandlers {
  constructor() {
    super();
    initActionHandlers(this);
  }

  @AsyncActionHandler(AsyncAction)
  public syncActionHandler(handle$: Observable<AsyncAction>): Observable<unknown> {
    return handle$.pipe(
      tap((action: AsyncAction) => {
        componentActionHandlerSpy(action);
      }),
    );
  }

  @AsyncActionHandler(AsyncAction, AsyncAction2)
  public multipleActionHandler(handle$: Observable<AsyncAction | AsyncAction2>): Observable<unknown> {
    return handle$.pipe(
      tap((action: AsyncAction | AsyncAction2) => {
        componentMultipleActionHandlerSpy(action);
      }),
    );
  }

  @AsyncActionHandler(AsyncAction)
  public override overwrittenActionHandler(handle$: Observable<AsyncAction>): Observable<unknown> {
    return handle$.pipe(
      tap((action: AsyncAction) => {
        componentChildOverwrittenActionHandlerSpy(action);
      }),
    );
  }
}

// ---------- Directive ----------
@Directive()
class ParentDirectiveWithActionHandlers {
  @AsyncActionHandler(AsyncAction)
  public overwrittenActionHandler(handle$: Observable<AsyncAction>): Observable<unknown> {
    return handle$.pipe(
      tap((action: AsyncAction) => {
        directiveParentOverwrittenActionHandlerSpy(action);
      }),
    );
  }
}

@WithActionHandlers()
@Directive({selector: '[directive]'})
class DirectiveWithActionHandlers extends ParentDirectiveWithActionHandlers {
  constructor() {
    super();
    initActionHandlers(this);
  }

  @AsyncActionHandler(AsyncAction)
  public syncActionHandler(handle$: Observable<AsyncAction>): Observable<unknown> {
    return handle$.pipe(
      tap((action: AsyncAction) => {
        directiveActionHandlerSpy(action);
      }),
    );
  }

  @AsyncActionHandler(AsyncAction, AsyncAction2)
  public multipleActionHandler(handle$: Observable<AsyncAction | AsyncAction2>): Observable<unknown> {
    return handle$.pipe(
      tap((action: AsyncAction | AsyncAction2) => {
        directiveMultipleActionHandlerSpy(action);
      }),
    );
  }

  @AsyncActionHandler(AsyncAction)
  public override overwrittenActionHandler(handle$: Observable<AsyncAction>): Observable<unknown> {
    return handle$.pipe(
      tap((action: AsyncAction) => {
        directiveChildOverwrittenActionHandlerSpy(action);
      }),
    );
  }
}

@Component({selector: 'directive-container', template: '<div directive></div>'})
export class DirectiveContainer {}

// ---------- Service ----------
class ParentServiceWithActionHandlers {
  @AsyncActionHandler(AsyncAction)
  public overwrittenActionHandler(handle$: Observable<AsyncAction>): Observable<unknown> {
    return handle$.pipe(
      tap((action: AsyncAction) => {
        serviceParentOverwrittenActionHandlerSpy(action);
      }),
    );
  }
}

@WithActionHandlers()
@Injectable()
class ServiceWithActionHandlers extends ParentServiceWithActionHandlers {
  constructor() {
    super();
    initActionHandlers(this);
  }

  @AsyncActionHandler(AsyncAction)
  public syncActionHandler(handle$: Observable<AsyncAction>): Observable<unknown> {
    return handle$.pipe(
      tap((action: AsyncAction) => {
        serviceActionHandlerSpy(action);
      }),
    );
  }

  @AsyncActionHandler(AsyncAction, AsyncAction2)
  public multipleActionHandler(handle$: Observable<AsyncAction | AsyncAction2>): Observable<unknown> {
    return handle$.pipe(
      tap((action: AsyncAction | AsyncAction2) => {
        serviceMultipleActionHandlerSpy(action);
      }),
    );
  }

  @AsyncActionHandler(AsyncAction)
  public override overwrittenActionHandler(handle$: Observable<AsyncAction>): Observable<unknown> {
    return handle$.pipe(
      tap((action: AsyncAction) => {
        serviceChildOverwrittenActionHandlerSpy(action);
      }),
    );
  }
}

@Component({selector: 'service-container', template: '', providers: [ServiceWithActionHandlers]})
export class ServiceContainer {
  constructor(public service: ServiceWithActionHandlers) {
  }
}

describe('should subscribe to action -', () => {
  it('component', () => {
    componentActionHandlerSpy.calls.reset();
    TestBed.configureTestingModule({
      declarations: [ComponentWithActionHandlers],
    }).compileComponents();
    TestBed.createComponent(ComponentWithActionHandlers);
    const action: AsyncAction = new AsyncAction();

    Actions.dispatch(action);

    expect(componentActionHandlerSpy).toHaveBeenCalledWith(action);
    expect(componentActionHandlerSpy).toHaveBeenCalledTimes(1);
  });

  it('directive', () => {
    directiveActionHandlerSpy.calls.reset();
    TestBed.configureTestingModule({
      declarations: [DirectiveWithActionHandlers, DirectiveContainer],
    }).compileComponents();
    TestBed.createComponent(DirectiveContainer);
    const action: AsyncAction = new AsyncAction();

    Actions.dispatch(action);

    expect(directiveActionHandlerSpy).toHaveBeenCalledWith(action);
    expect(directiveActionHandlerSpy).toHaveBeenCalledTimes(1);
  });

  it('service', () => {
    serviceActionHandlerSpy.calls.reset();
    TestBed.configureTestingModule({
      declarations: [ServiceContainer],
    }).compileComponents();
    TestBed.createComponent(ServiceContainer);
    const action: AsyncAction = new AsyncAction();

    Actions.dispatch(action);

    expect(serviceActionHandlerSpy).toHaveBeenCalledWith(action);
    expect(serviceActionHandlerSpy).toHaveBeenCalledTimes(1);
  });
});

describe('should subscribe to multiple actions -', () => {
  it('component', () => {
    componentMultipleActionHandlerSpy.calls.reset();
    TestBed.configureTestingModule({
      declarations: [ComponentWithActionHandlers],
    }).compileComponents();
    TestBed.createComponent(ComponentWithActionHandlers);
    const action: AsyncAction = new AsyncAction();
    const action2: AsyncAction2 = new AsyncAction2();

    Actions.dispatch(action);
    Actions.dispatch(action2);

    expect(componentMultipleActionHandlerSpy).toHaveBeenCalledWith(action);
    expect(componentMultipleActionHandlerSpy).toHaveBeenCalledWith(action2);
    expect(componentMultipleActionHandlerSpy).toHaveBeenCalledTimes(2);
  });

  it('directive', () => {
    directiveMultipleActionHandlerSpy.calls.reset();
    TestBed.configureTestingModule({
      declarations: [DirectiveWithActionHandlers, DirectiveContainer],
    }).compileComponents();
    TestBed.createComponent(DirectiveContainer);
    const action: AsyncAction = new AsyncAction();
    const action2: AsyncAction2 = new AsyncAction2();

    Actions.dispatch(action);
    Actions.dispatch(action2);

    expect(directiveMultipleActionHandlerSpy).toHaveBeenCalledWith(action);
    expect(directiveMultipleActionHandlerSpy).toHaveBeenCalledWith(action2);
    expect(directiveMultipleActionHandlerSpy).toHaveBeenCalledTimes(2);
  });

  it('service', () => {
    serviceMultipleActionHandlerSpy.calls.reset();
    TestBed.configureTestingModule({
      declarations: [ServiceContainer],
    }).compileComponents();
    TestBed.createComponent(ServiceContainer);
    const action: AsyncAction = new AsyncAction();
    const action2: AsyncAction2 = new AsyncAction2();

    Actions.dispatch(action);
    Actions.dispatch(action2);

    expect(serviceMultipleActionHandlerSpy).toHaveBeenCalledWith(action);
    expect(serviceMultipleActionHandlerSpy).toHaveBeenCalledWith(action2);
    expect(serviceMultipleActionHandlerSpy).toHaveBeenCalledTimes(2);
  });
});

describe('should unsubscribe on destroy of', () => {
  it('component', () => {
    componentActionHandlerSpy.calls.reset();
    TestBed.configureTestingModule({
      declarations: [ComponentWithActionHandlers],
    }).compileComponents();
    const component: ComponentFixture<ComponentWithActionHandlers> = TestBed.createComponent(ComponentWithActionHandlers);
    const action: AsyncAction = new AsyncAction();

    component.destroy();
    Actions.dispatch(action);

    expect(componentActionHandlerSpy).toHaveBeenCalledTimes(0);
  });

  it('directive', () => {
    directiveActionHandlerSpy.calls.reset();
    TestBed.configureTestingModule({
      declarations: [DirectiveWithActionHandlers, DirectiveContainer],
    }).compileComponents();
    const component: ComponentFixture<DirectiveContainer> = TestBed.createComponent(DirectiveContainer);
    const action: AsyncAction = new AsyncAction();

    component.destroy();
    Actions.dispatch(action);

    expect(directiveActionHandlerSpy).toHaveBeenCalledTimes(0);
  });

  it('service', () => {
    serviceActionHandlerSpy.calls.reset();
    TestBed.configureTestingModule({
      declarations: [ServiceContainer],
    }).compileComponents();
    const component: ComponentFixture<ServiceContainer> = TestBed.createComponent(ServiceContainer);
    const action: AsyncAction = new AsyncAction();

    component.destroy();
    Actions.dispatch(action);

    expect(serviceActionHandlerSpy).toHaveBeenCalledTimes(0);
  });
});

describe('should override parent action handler with the same name -', () => {
  it('component', () => {
    componentParentOverwrittenActionHandlerSpy.calls.reset();
    componentChildOverwrittenActionHandlerSpy.calls.reset();
    TestBed.configureTestingModule({
      declarations: [ComponentWithActionHandlers],
    }).compileComponents();
    TestBed.createComponent(ComponentWithActionHandlers);
    const action: AsyncAction = new AsyncAction();

    Actions.dispatch(action);

    expect(componentParentOverwrittenActionHandlerSpy).toHaveBeenCalledTimes(0);
    expect(componentChildOverwrittenActionHandlerSpy).toHaveBeenCalledWith(action);
    expect(componentChildOverwrittenActionHandlerSpy).toHaveBeenCalledTimes(1);
  });

  it('directive', () => {
    directiveParentOverwrittenActionHandlerSpy.calls.reset();
    directiveChildOverwrittenActionHandlerSpy.calls.reset();
    TestBed.configureTestingModule({
      declarations: [DirectiveWithActionHandlers, DirectiveContainer],
    }).compileComponents();
    TestBed.createComponent(DirectiveContainer);
    const action: AsyncAction = new AsyncAction();

    Actions.dispatch(action);

    expect(directiveParentOverwrittenActionHandlerSpy).toHaveBeenCalledTimes(0);
    expect(directiveChildOverwrittenActionHandlerSpy).toHaveBeenCalledWith(action);
    expect(directiveChildOverwrittenActionHandlerSpy).toHaveBeenCalledTimes(1);
  });

  it('service', () => {
    serviceParentOverwrittenActionHandlerSpy.calls.reset();
    serviceChildOverwrittenActionHandlerSpy.calls.reset();
    TestBed.configureTestingModule({
      declarations: [ServiceContainer],
    }).compileComponents();
    TestBed.createComponent(ServiceContainer);
    const action: AsyncAction = new AsyncAction();

    Actions.dispatch(action);

    expect(serviceParentOverwrittenActionHandlerSpy).toHaveBeenCalledTimes(0);
    expect(serviceChildOverwrittenActionHandlerSpy).toHaveBeenCalledWith(action);
    expect(serviceChildOverwrittenActionHandlerSpy).toHaveBeenCalledTimes(1);
  });
});
