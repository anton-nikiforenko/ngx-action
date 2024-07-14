import { Component, Directive, Injectable } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActionHandler } from './action-handler';
import { Actions } from './actions';
import { initActionHandlers } from './init-action-handlers';

const componentActionHandlerSpy = jest.fn();
const componentMultipleActionHandlerSpy = jest.fn();
const componentParentOverwrittenActionHandlerSpy = jest.fn();
const componentChildOverwrittenActionHandlerSpy = jest.fn();

const directiveActionHandlerSpy = jest.fn();
const directiveMultipleActionHandlerSpy = jest.fn();
const directiveParentOverwrittenActionHandlerSpy = jest.fn();
const directiveChildOverwrittenActionHandlerSpy = jest.fn();

const serviceActionHandlerSpy = jest.fn();
const serviceMultipleActionHandlerSpy = jest.fn();
const serviceParentOverwrittenActionHandlerSpy = jest.fn();
const serviceChildOverwrittenActionHandlerSpy = jest.fn();

class SyncAction {}
class SyncAction2 {}

// ---------- Component ----------
@Component({ selector: 'any', template: '' })
class ParentComponent {
  @ActionHandler(SyncAction)
  public overwrittenActionHandler(action: SyncAction): void {
    componentParentOverwrittenActionHandlerSpy(action);
  }
}

@Component({ selector: 'selector', template: '' })
class ChildComponent extends ParentComponent {
  constructor() {
    super();
    initActionHandlers(this);
  }

  @ActionHandler(SyncAction)
  public syncActionHandler(action: SyncAction): void {
    componentActionHandlerSpy(action);
  }

  @ActionHandler(SyncAction, SyncAction2)
  public multipleActionHandler(action: SyncAction | SyncAction2): void {
    componentMultipleActionHandlerSpy(action);
  }

  @ActionHandler(SyncAction)
  public override overwrittenActionHandler(action: SyncAction): void {
    componentChildOverwrittenActionHandlerSpy(action);
  }
}

// ---------- Directive ----------
@Directive()
class ParentDirective {
  @ActionHandler(SyncAction)
  public overwrittenActionHandler(action: SyncAction): void {
    directiveParentOverwrittenActionHandlerSpy(action);
  }
}

@Directive({ selector: '[directive]' })
class ChildDirective extends ParentDirective {
  constructor() {
    super();
    initActionHandlers(this);
  }

  @ActionHandler(SyncAction)
  public syncActionHandler(action: SyncAction): void {
    directiveActionHandlerSpy(action);
  }

  @ActionHandler(SyncAction, SyncAction2)
  public multipleActionHandler(action: SyncAction | SyncAction2): void {
    directiveMultipleActionHandlerSpy(action);
  }

  @ActionHandler(SyncAction)
  public override overwrittenActionHandler(action: SyncAction): void {
    directiveChildOverwrittenActionHandlerSpy(action);
  }
}

@Component({
  selector: 'directive-container',
  template: '<div directive></div>',
})
export class DirectiveContainer {}

// ---------- Service ----------
class ParentService {
  @ActionHandler(SyncAction)
  public overwrittenActionHandler(action: SyncAction): void {
    serviceParentOverwrittenActionHandlerSpy(action);
  }
}

@Injectable()
class ChildService extends ParentService {
  constructor() {
    super();
    initActionHandlers(this);
  }

  @ActionHandler(SyncAction)
  public syncActionHandler(action: SyncAction): void {
    serviceActionHandlerSpy(action);
  }

  @ActionHandler(SyncAction, SyncAction2)
  public multipleActionHandler(action: SyncAction | SyncAction2): void {
    serviceMultipleActionHandlerSpy(action);
  }

  @ActionHandler(SyncAction)
  public override overwrittenActionHandler(action: SyncAction): void {
    serviceChildOverwrittenActionHandlerSpy(action);
  }
}

@Component({
  selector: 'service-container',
  template: '',
  providers: [ChildService],
})
export class ServiceContainer {
  constructor(public service: ChildService) {}
}

describe('should subscribe to action -', () => {
  it('component', () => {
    TestBed.configureTestingModule({
      declarations: [ChildComponent],
    });
    TestBed.createComponent(ChildComponent);
    const action = new SyncAction();

    Actions.dispatch(action);

    expect(componentActionHandlerSpy).toHaveBeenCalledWith(action);
    expect(componentActionHandlerSpy).toHaveBeenCalledTimes(1);
  });

  it('directive', () => {
    TestBed.configureTestingModule({
      declarations: [ChildDirective, DirectiveContainer],
    });
    TestBed.createComponent(DirectiveContainer);
    const action = new SyncAction();

    Actions.dispatch(action);

    expect(directiveActionHandlerSpy).toHaveBeenCalledWith(action);
    expect(directiveActionHandlerSpy).toHaveBeenCalledTimes(1);
  });

  it('service', () => {
    TestBed.configureTestingModule({
      declarations: [ServiceContainer],
    });
    TestBed.createComponent(ServiceContainer);
    const action = new SyncAction();

    Actions.dispatch(action);

    expect(serviceActionHandlerSpy).toHaveBeenCalledWith(action);
    expect(serviceActionHandlerSpy).toHaveBeenCalledTimes(1);
  });
});

describe('should subscribe to multiple actions -', () => {
  it('component', () => {
    TestBed.configureTestingModule({
      declarations: [ChildComponent],
    });
    TestBed.createComponent(ChildComponent);
    const action = new SyncAction();
    const action2 = new SyncAction2();

    Actions.dispatch(action);
    Actions.dispatch(action2);

    expect(componentMultipleActionHandlerSpy).toHaveBeenCalledWith(action);
    expect(componentMultipleActionHandlerSpy).toHaveBeenCalledWith(action2);
    expect(componentMultipleActionHandlerSpy).toHaveBeenCalledTimes(2);
  });

  it('directive', () => {
    TestBed.configureTestingModule({
      declarations: [ChildDirective, DirectiveContainer],
    });
    TestBed.createComponent(DirectiveContainer);
    const action = new SyncAction();
    const action2 = new SyncAction2();

    Actions.dispatch(action);
    Actions.dispatch(action2);

    expect(directiveMultipleActionHandlerSpy).toHaveBeenCalledWith(action);
    expect(directiveMultipleActionHandlerSpy).toHaveBeenCalledWith(action2);
    expect(directiveMultipleActionHandlerSpy).toHaveBeenCalledTimes(2);
  });

  it('service', () => {
    TestBed.configureTestingModule({
      declarations: [ServiceContainer],
    });
    TestBed.createComponent(ServiceContainer);
    const action = new SyncAction();
    const action2 = new SyncAction2();

    Actions.dispatch(action);
    Actions.dispatch(action2);

    expect(serviceMultipleActionHandlerSpy).toHaveBeenCalledWith(action);
    expect(serviceMultipleActionHandlerSpy).toHaveBeenCalledWith(action2);
    expect(serviceMultipleActionHandlerSpy).toHaveBeenCalledTimes(2);
  });
});

describe('should unsubscribe on destroy of', () => {
  it('component', () => {
    TestBed.configureTestingModule({
      declarations: [ChildComponent],
    });
    const component = TestBed.createComponent(ChildComponent);
    const action = new SyncAction();

    component.destroy();
    Actions.dispatch(action);

    expect(componentActionHandlerSpy).toHaveBeenCalledTimes(0);
  });

  it('directive', () => {
    TestBed.configureTestingModule({
      declarations: [ChildDirective, DirectiveContainer],
    });
    const component = TestBed.createComponent(DirectiveContainer);
    const action = new SyncAction();

    component.destroy();
    Actions.dispatch(action);

    expect(directiveActionHandlerSpy).toHaveBeenCalledTimes(0);
  });

  it('service', () => {
    TestBed.configureTestingModule({
      declarations: [ServiceContainer],
    });
    const component = TestBed.createComponent(ServiceContainer);
    const action = new SyncAction();

    component.destroy();
    Actions.dispatch(action);

    expect(serviceActionHandlerSpy).toHaveBeenCalledTimes(0);
  });
});

describe('should override parent action handler with the same name -', () => {
  it('component', () => {
    TestBed.configureTestingModule({
      declarations: [ChildComponent],
    });
    TestBed.createComponent(ChildComponent);
    const action = new SyncAction();

    Actions.dispatch(action);

    expect(componentParentOverwrittenActionHandlerSpy).toHaveBeenCalledTimes(0);
    expect(componentChildOverwrittenActionHandlerSpy).toHaveBeenCalledWith(
      action,
    );
    expect(componentChildOverwrittenActionHandlerSpy).toHaveBeenCalledTimes(1);
  });

  it('directive', () => {
    TestBed.configureTestingModule({
      declarations: [ChildDirective, DirectiveContainer],
    });
    TestBed.createComponent(DirectiveContainer);
    const action = new SyncAction();

    Actions.dispatch(action);

    expect(directiveParentOverwrittenActionHandlerSpy).toHaveBeenCalledTimes(0);
    expect(directiveChildOverwrittenActionHandlerSpy).toHaveBeenCalledWith(
      action,
    );
    expect(directiveChildOverwrittenActionHandlerSpy).toHaveBeenCalledTimes(1);
  });

  it('service', () => {
    TestBed.configureTestingModule({
      declarations: [ServiceContainer],
    });
    TestBed.createComponent(ServiceContainer);
    const action = new SyncAction();

    Actions.dispatch(action);

    expect(serviceParentOverwrittenActionHandlerSpy).toHaveBeenCalledTimes(0);
    expect(serviceChildOverwrittenActionHandlerSpy).toHaveBeenCalledWith(
      action,
    );
    expect(serviceChildOverwrittenActionHandlerSpy).toHaveBeenCalledTimes(1);
  });
});
