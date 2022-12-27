import { Component, Directive, Injectable } from '@angular/core';
import { ComponentFixture, TestBed }        from '@angular/core/testing';
import { ActionHandler }                    from './action-handler';
import { Actions }                          from './actions';
import { initActionHandlers }               from './init-action-handlers';
import { WithActionHandlers }               from './with-action-handlers';

const componentActionHandlerSpy: jasmine.Spy = jasmine.createSpy();
const componentParentOverwrittenActionHandlerSpy: jasmine.Spy = jasmine.createSpy();
const componentChildOverwrittenActionHandlerSpy: jasmine.Spy = jasmine.createSpy();

const directiveActionHandlerSpy: jasmine.Spy = jasmine.createSpy();
const directiveParentOverwrittenActionHandlerSpy: jasmine.Spy = jasmine.createSpy();
const directiveChildOverwrittenActionHandlerSpy: jasmine.Spy = jasmine.createSpy();

const serviceActionHandlerSpy: jasmine.Spy = jasmine.createSpy();
const serviceParentOverwrittenActionHandlerSpy: jasmine.Spy = jasmine.createSpy();
const serviceChildOverwrittenActionHandlerSpy: jasmine.Spy = jasmine.createSpy();

class SyncAction {}

// ---------- Component ----------
@Component({selector: 'any', template: ''})
class ParentComponentWithActionHandlers {
  @ActionHandler(SyncAction)
  public overwrittenActionHandler(action: SyncAction): void {
    componentParentOverwrittenActionHandlerSpy(action);
  }
}

@WithActionHandlers()
@Component({selector: 'selector', template: ''})
class ComponentWithActionHandlers extends ParentComponentWithActionHandlers {
  constructor() {
    super();
    initActionHandlers(this);
  }

  @ActionHandler(SyncAction)
  public syncActionHandler(action: SyncAction): void {
    componentActionHandlerSpy(action);
  }

  @ActionHandler(SyncAction)
  public override overwrittenActionHandler(action: SyncAction): void {
    componentChildOverwrittenActionHandlerSpy(action);
  }
}

// ---------- Directive ----------
@Directive()
class ParentDirectiveWithActionHandlers {
  @ActionHandler(SyncAction)
  public overwrittenActionHandler(action: SyncAction): void {
    directiveParentOverwrittenActionHandlerSpy(action);
  }
}

@WithActionHandlers()
@Directive({selector: '[directive]'})
class DirectiveWithActionHandlers extends ParentDirectiveWithActionHandlers {
  constructor() {
    super();
    initActionHandlers(this);
  }

  @ActionHandler(SyncAction)
  public syncActionHandler(action: SyncAction): void {
    directiveActionHandlerSpy(action);
  }

  @ActionHandler(SyncAction)
  public override overwrittenActionHandler(action: SyncAction): void {
    directiveChildOverwrittenActionHandlerSpy(action);
  }
}

@Component({selector: 'directive-container', template: '<div directive></div>'})
export class DirectiveContainer {}

// ---------- Service ----------
class ParentServiceWithActionHandlers {
  @ActionHandler(SyncAction)
  public overwrittenActionHandler(action: SyncAction): void {
    serviceParentOverwrittenActionHandlerSpy(action);
  }
}

@WithActionHandlers()
@Injectable()
class ServiceWithActionHandlers extends ParentServiceWithActionHandlers {
  constructor() {
    super();
    initActionHandlers(this);
  }

  @ActionHandler(SyncAction)
  public syncActionHandler(action: SyncAction): void {
    serviceActionHandlerSpy(action);
  }

  @ActionHandler(SyncAction)
  public override overwrittenActionHandler(action: SyncAction): void {
    serviceChildOverwrittenActionHandlerSpy(action);
  }
}

@Component({selector: 'service-container', template: '', providers: [ServiceWithActionHandlers]})
export class ServiceContainer {
  constructor(public service: ServiceWithActionHandlers) {
  }
}

describe('should subscribe on action -', () => {
  it('component', () => {
    componentActionHandlerSpy.calls.reset();
    TestBed.configureTestingModule({
      declarations: [ComponentWithActionHandlers],
    }).compileComponents();
    TestBed.createComponent(ComponentWithActionHandlers);
    const action: SyncAction = new SyncAction();

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
    const action: SyncAction = new SyncAction();

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
    const action: SyncAction = new SyncAction();

    Actions.dispatch(action);

    expect(serviceActionHandlerSpy).toHaveBeenCalledWith(action);
    expect(serviceActionHandlerSpy).toHaveBeenCalledTimes(1);
  });
});

describe('should unsubscribe on destroy of', () => {
  it('component', () => {
    componentActionHandlerSpy.calls.reset();
    TestBed.configureTestingModule({
      declarations: [ComponentWithActionHandlers],
    }).compileComponents();
    const component: ComponentFixture<ComponentWithActionHandlers> = TestBed.createComponent(ComponentWithActionHandlers);
    const action: SyncAction = new SyncAction();

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
    const action: SyncAction = new SyncAction();

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
    const action: SyncAction = new SyncAction();

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
    const action: SyncAction = new SyncAction();

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
    const action: SyncAction = new SyncAction();

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
    const action: SyncAction = new SyncAction();

    Actions.dispatch(action);

    expect(serviceParentOverwrittenActionHandlerSpy).toHaveBeenCalledTimes(0);
    expect(serviceChildOverwrittenActionHandlerSpy).toHaveBeenCalledWith(action);
    expect(serviceChildOverwrittenActionHandlerSpy).toHaveBeenCalledTimes(1);
  });
});
