import { Observable, of, throwError } from 'rxjs';
import { Actions }                    from '../actions';
import { dispatchOnError }            from './dispatch-on-error';

class ErrorAction {}
class ErrorAction2 {}

it('should dispatch an action on source error', () => {
  const source$ = throwError(() => new Error('error'));
  const spy = jasmine.createSpy();
  Actions.onAction(ErrorAction).subscribe(spy);
  const action = new ErrorAction();

  source$.pipe(dispatchOnError(() => action)).subscribe({
    error: () => {},
  });

  expect(spy).toHaveBeenCalledWith(action);
  expect(spy).toHaveBeenCalledTimes(1);
});

it('should dispatch multiple actions on source error', () => {
  const source$ = throwError(() => new Error('error'));
  const spy = jasmine.createSpy();
  Actions.onAction(ErrorAction, ErrorAction2).subscribe(spy);
  const action = new ErrorAction();
  const action2 = new ErrorAction2();

  source$.pipe(dispatchOnError(() => [action, action2])).subscribe({
    error: () => {},
  });

  expect(spy).toHaveBeenCalledWith(action);
  expect(spy).toHaveBeenCalledWith(action2);
  expect(spy).toHaveBeenCalledTimes(2);
});

it(`shouldn't rethrow source error`, () => {
  const source$ = throwError(() => new Error('error'));
  const spy = jasmine.createSpy();

  source$.pipe(dispatchOnError(() => new ErrorAction())).subscribe({
    error: spy,
  });

  expect(spy).toHaveBeenCalledTimes(0);
});

it(`shouldn't dispatch an action if source doesn't emit an error`, () => {
  const source$ = of(1);
  const spy = jasmine.createSpy();
  Actions.onAction(ErrorAction).subscribe(spy);
  const action = new ErrorAction();

  source$.pipe(dispatchOnError(() => action)).subscribe();

  expect(spy).toHaveBeenCalledTimes(0);
});
