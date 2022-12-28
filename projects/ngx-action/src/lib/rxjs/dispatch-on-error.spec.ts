import { Observable, of, throwError } from 'rxjs';
import { Actions }                    from '../actions';
import { dispatchOnError }            from './dispatch-on-error';

class ErrorAction {}

it('should dispatch an action on source error', () => {
  const source$: Observable<never> = throwError(() => new Error('error'));
  const spy: jasmine.Spy = jasmine.createSpy();
  Actions.onAction(ErrorAction).subscribe(spy);
  const action: ErrorAction= new ErrorAction();

  source$.pipe(dispatchOnError(() => action)).subscribe({
    error: () => {},
  });

  expect(spy).toHaveBeenCalledWith(action);
  expect(spy).toHaveBeenCalledTimes(1);
});

it(`shouldn't rethrow source error`, () => {
  const source$: Observable<never> = throwError(() => new Error('error'));
  const spy: jasmine.Spy = jasmine.createSpy();

  source$.pipe(dispatchOnError(() => new ErrorAction())).subscribe({
    error: spy,
  });

  expect(spy).toHaveBeenCalledTimes(0);
});

it(`shouldn't dispatch an action if source doesn't emit an error`, () => {
  const source$: Observable<number> = of(1);
  const spy: jasmine.Spy = jasmine.createSpy();
  Actions.onAction(ErrorAction).subscribe(spy);
  const action: ErrorAction = new ErrorAction();

  source$.pipe(dispatchOnError(() => action)).subscribe();

  expect(spy).toHaveBeenCalledTimes(0);
});
