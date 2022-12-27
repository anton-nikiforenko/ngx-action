import { Component, Directive, Pipe, PipeTransform } from '@angular/core';
import { TestBed }                                   from '@angular/core/testing';
import { initActionHandlers }                        from './init-action-handlers';
import { WithActionHandlers }                        from './with-action-handlers';

it('should throw an error when used inside incorrect class', () => {
  expect(() => {
    @Pipe({name: 'pipe'})
    class PipeWithActionHandlers implements PipeTransform {
      constructor() {
        initActionHandlers(this);
      }

      transform(value: any): any {
      }
    }

    @Component({selector: 'component', template: '{{1 | pipe}}'})
    class TestComponent {}

    TestBed.configureTestingModule({
      declarations: [PipeWithActionHandlers, TestComponent],
    }).compileComponents();
    TestBed.createComponent(TestComponent);
  }).toThrow(new Error('initActionHandlers(this) should be used inside class decorated with @Component(), @Directive(), or @Injectable().'));
});

it('should throw an error when used without decorator', () => {
  expect(() => {
    @Component({selector: 'component', template: ''})
    class ComponentWithActionHandlers {
      constructor() {
        initActionHandlers(this);
      }
    }

    TestBed.configureTestingModule({
      declarations: [ComponentWithActionHandlers],
    }).compileComponents();
    TestBed.createComponent(ComponentWithActionHandlers);
  }).toThrow(new Error('initActionHandlers(this) should be used inside class decorated with @WithActionHandlers().'));
});

it('should throw an error when called twice', () => {
  expect(() => {
    @WithActionHandlers()
    @Component({selector: 'component', template: ''})
    class ComponentWithActionHandlers {
      constructor() {
        initActionHandlers(this);
        initActionHandlers(this);
      }
    }

    TestBed.configureTestingModule({
      declarations: [ComponentWithActionHandlers],
    }).compileComponents();
    TestBed.createComponent(ComponentWithActionHandlers);
  }).toThrow(new Error('Method initActionHandlers(this) should be called only once - inside the deepest child class.'));
});

it('should throw an error when called inside both parent and child class', () => {
  expect(() => {
    @Directive()
    class ParentComponentWithActionHandlers {
      constructor() {
        initActionHandlers(this);
      }
    }

    @WithActionHandlers()
    @Component({selector: 'component', template: ''})
    class ComponentWithActionHandlers extends ParentComponentWithActionHandlers {
      constructor() {
        super();
        initActionHandlers(this);
      }
    }

    TestBed.configureTestingModule({
      declarations: [ComponentWithActionHandlers],
    }).compileComponents();
    TestBed.createComponent(ComponentWithActionHandlers);
  }).toThrow(new Error('Method initActionHandlers(this) should be called only once - inside the deepest child class.'));
});
