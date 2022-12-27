import { Component, Directive, Injectable, OnDestroy, Pipe, PipeTransform, ViewChild } from '@angular/core';
import { ComponentFixture, TestBed }                                                   from '@angular/core/testing';
import { initActionHandlers }                                                          from './init-action-handlers';
import { WithActionHandlers }                                                          from './with-action-handlers';

it('should throw an error when applied to incorrect class', () => {
  expect(() => {
    @WithActionHandlers()
    @Pipe({name: 'pipe'})
    class PipeWithActionHandlers implements PipeTransform {
      transform(value: any): any {}
    }
  }).toThrow(new Error('@WithActionHandlers() decorator should be applied to class decorated with @Component(), @Directive(), or @Injectable().'));
});

it('should throw an error when applied twice', () => {
  expect(() => {
    @WithActionHandlers()
    @WithActionHandlers()
    @Directive({selector: 'directive'})
    class DirectiveWithActionHandlers {
      constructor() {
        initActionHandlers(this);
      }
    }
  }).toThrow(new Error('@WithActionHandlers() decorator should be applied only once - to the deepest child class.'));
});

it('should throw an error when applied to both parent and child class', () => {
  @WithActionHandlers()
  @Directive({selector: 'parentDirective'})
  class ParentDirectiveWithActionHandlers {
  }

  expect(() => {
    @WithActionHandlers()
    @Directive({selector: 'directive'})
    class DirectiveWithActionHandlers extends ParentDirectiveWithActionHandlers {
      constructor() {
        super();
        initActionHandlers(this);
      }
    }
  }).toThrow(new Error('@WithActionHandlers() decorator should be applied only once - to the deepest child class.'));
});


describe('should not throw errors when correctly applied to', () => {
  it('component', () => {
    expect(() => {
      @WithActionHandlers()
      @Component({selector: 'component', template: ''})
      class ComponentWithActionHandlers {
        constructor() {
          initActionHandlers(this);
        }
      }
    }).not.toThrow();
  });

  it('directive', () => {
    expect(() => {
      @WithActionHandlers()
      @Directive({selector: 'directive'})
      class DirectiveWithActionHandlers {
        constructor() {
          initActionHandlers(this);
        }
      }
    }).not.toThrow();
  });

  it('service', () => {
    expect(() => {
      @WithActionHandlers()
      @Injectable()
      class ServiceWithActionHandlers {
        constructor() {
          initActionHandlers(this);
        }
      }
    }).not.toThrow();
  });
});

describe('should call original class ngOnDestroy when applied to', () => {
  it('component', () => {
    @WithActionHandlers()
    @Component({selector: 'component', template: ''})
    class ComponentWithActionHandlers implements OnDestroy {
      ngOnDestroyCalled: boolean = false;

      constructor() {
        initActionHandlers(this);
      }

      ngOnDestroy(): void {
        this.ngOnDestroyCalled = true;
      }
    }

    TestBed.configureTestingModule({
      declarations: [ComponentWithActionHandlers]
    }).compileComponents();
    const component: ComponentFixture<ComponentWithActionHandlers> = TestBed.createComponent(ComponentWithActionHandlers);

    component.destroy();

    expect(component.componentInstance.ngOnDestroyCalled).toEqual(true);
  });

  it('directive', () => {
    @WithActionHandlers()
    @Directive({selector: '[directive]'})
    class DirectiveWithActionHandlers implements OnDestroy {
      ngOnDestroyCalled: boolean = false;

      constructor() {
        initActionHandlers(this);
      }

      ngOnDestroy(): void {
        this.ngOnDestroyCalled = true;
      }
    }

    @Component({selector: 'component', template: '<div directive></div>'})
    class TestComponent {
      @ViewChild(DirectiveWithActionHandlers)
      directiveWithActionHandlers!: DirectiveWithActionHandlers;
    }

    TestBed.configureTestingModule({
      declarations: [DirectiveWithActionHandlers, TestComponent],
    }).compileComponents();
    const component: ComponentFixture<TestComponent> = TestBed.createComponent(TestComponent);

    component.detectChanges();
    component.destroy();

    expect(component.componentInstance.directiveWithActionHandlers.ngOnDestroyCalled).toEqual(true);
  });

  it('service', () => {
    @WithActionHandlers()
    @Injectable()
    class ServiceWithActionHandlers implements OnDestroy {
      ngOnDestroyCalled: boolean = false;

      constructor() {
        initActionHandlers(this);
      }

      ngOnDestroy(): void {
        this.ngOnDestroyCalled = true;
      }
    }

    @Component({selector: 'component', template: '', providers: [ServiceWithActionHandlers]})
    class TestComponent {
      constructor(public serviceWithActionHandlers: ServiceWithActionHandlers) {}
    }

    TestBed.configureTestingModule({
      declarations: [TestComponent],
    }).compileComponents();
    const component: ComponentFixture<TestComponent> = TestBed.createComponent(TestComponent);

    component.detectChanges();
    component.destroy();

    expect(component.componentInstance.serviceWithActionHandlers.ngOnDestroyCalled).toEqual(true);
  });
});

describe(`should throw an error on destroy if helper method hasn't been called when applied to`, () => {
  it('component', () => {
    expect(() => {
      @WithActionHandlers()
      @Component({selector: 'component', template: ''})
      class ComponentWithActionHandlers {}

      TestBed.configureTestingModule({
        declarations: [ComponentWithActionHandlers]
      }).compileComponents();
      const component: ComponentFixture<ComponentWithActionHandlers> = TestBed.createComponent(ComponentWithActionHandlers);

      component.destroy();
    }).toThrow(new Error('initActionHandlers(this) should be called when decorator @WithActionHandlers() applied.'));
  });

  it('directive', () => {
    expect(() => {
      @WithActionHandlers()
      @Directive({selector: '[directive]'})
      class DirectiveWithActionHandlers {}

      @Component({selector: 'component', template: '<div directive></div>'})
      class TestComponent {}

      TestBed.configureTestingModule({
        declarations: [DirectiveWithActionHandlers, TestComponent]
      }).compileComponents();
      const component: ComponentFixture<TestComponent> = TestBed.createComponent(TestComponent);

      component.destroy();
    }).toThrow(new Error('initActionHandlers(this) should be called when decorator @WithActionHandlers() applied.'));
  });

  it('service', () => {
    expect(() => {
      @WithActionHandlers()
      @Injectable()
      class ServiceWithActionHandlers {}

      @Component({selector: 'component', template: '', providers: [ServiceWithActionHandlers]})
      class TestComponent {
        constructor(public serviceWithActionHandlers: ServiceWithActionHandlers) {}
      }

      TestBed.configureTestingModule({
        declarations: [TestComponent]
      }).compileComponents();
      const component: ComponentFixture<TestComponent> = TestBed.createComponent(TestComponent);

      component.destroy();
    }).toThrow(new Error('initActionHandlers(this) should be called when decorator @WithActionHandlers() applied.'));
  });
});
