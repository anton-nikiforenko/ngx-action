import {
  Component,
  Directive,
  OnInit,
  Pipe,
  PipeTransform,
} from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActionHandler } from './action-handler';
import { initActionHandlers } from './init-action-handlers';

it('should throw an error when used inside incorrect class', () => {
  expect(() => {
    @Pipe({ name: 'testPipe' })
    class TestPipe implements PipeTransform {
      constructor() {
        initActionHandlers(this);
      }

      transform(value: number): number {
        return 2;
      }
    }

    @Component({ selector: 'component', template: '{{1 | testPipe}}' })
    class TestComponent {}

    TestBed.configureTestingModule({
      declarations: [TestPipe, TestComponent],
    });
    TestBed.createComponent(TestComponent);
  }).toThrow(
    new Error(
      'initActionHandlers(this) should be used inside class decorated with @Component(), @Directive(), or @Injectable().',
    ),
  );
});

it('should throw an error when called twice', () => {
  expect(() => {
    @Component({ selector: 'component', template: '' })
    class TestComponent {
      constructor() {
        initActionHandlers(this);
        initActionHandlers(this);
      }
    }

    TestBed.configureTestingModule({
      declarations: [TestComponent],
    });
    TestBed.createComponent(TestComponent);
  }).toThrow(
    new Error(
      'Method initActionHandlers(this) should be called only once - inside the deepest child class.',
    ),
  );
});

it('should throw an error when called inside both parent and child class', () => {
  expect(() => {
    @Directive()
    class ParentComponent {
      constructor() {
        initActionHandlers(this);
      }
    }

    @Component({ selector: 'component', template: '' })
    class ChildComponent extends ParentComponent {
      constructor() {
        super();
        initActionHandlers(this);
      }
    }

    TestBed.configureTestingModule({
      declarations: [ChildComponent],
    });
    TestBed.createComponent(ChildComponent);
  }).toThrow(
    new Error(
      'Method initActionHandlers(this) should be called only once - inside the deepest child class.',
    ),
  );
});

it('should throw an error when called outside of constructor', () => {
  expect(() => {
    class Action {}

    @Component({ selector: 'component', template: '' })
    class TestComponent implements OnInit {
      ngOnInit(): void {
        initActionHandlers(this);
      }

      @ActionHandler(Action)
      actionHandler(): void {}
    }

    TestBed.configureTestingModule({
      declarations: [TestComponent],
    });

    const component = TestBed.createComponent(TestComponent);
    component.detectChanges();
  }).toThrow(
    new Error('initActionHandlers(this) should be called inside constructor'),
  );
});
