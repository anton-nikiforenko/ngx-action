import { of, throwError }  from 'rxjs';
import { Actions }         from '../actions';
import { dispatchOnError } from './dispatch-on-error';

class ErrorAction {}

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

it('should rethrow source error', () => {
  const error = new Error('error');
  const source$ = throwError(() => error);
  const spy = jasmine.createSpy();

  source$.pipe(dispatchOnError(() => new ErrorAction())).subscribe({
    error: spy,
  });

  expect(spy).toHaveBeenCalledWith(error);
  expect(spy).toHaveBeenCalledTimes(1);
});

it(`shouldn't dispatch an action if source doesn't emit an error`, () => {
  const source$ = of(1);
  const spy = jasmine.createSpy();
  Actions.onAction(ErrorAction).subscribe(spy);
  const action = new ErrorAction();

  source$.pipe(dispatchOnError(() => action)).subscribe();

  expect(spy).toHaveBeenCalledTimes(0);
});
