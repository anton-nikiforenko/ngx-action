import { Observable, of, throwError } from 'rxjs';
import { Actions }                    from '../actions';
import { dispatchOnSuccess }          from './dispatch-on-success';

class SuccessAction {}
class SuccessAction2 {}

it('should dispatch an action', () => {
  const source$ = of(1);
  const spy = jasmine.createSpy();
  Actions.onAction(SuccessAction).subscribe(spy);
  const action = new SuccessAction();

  source$.pipe(dispatchOnSuccess(() => action)).subscribe();

  expect(spy).toHaveBeenCalledWith(action);
  expect(spy).toHaveBeenCalledTimes(1);
});

it('should dispatch multiple actions', () => {
  const source$ = of(1);
  const spy = jasmine.createSpy();
  Actions.onAction(SuccessAction, SuccessAction2).subscribe(spy);
  const action = new SuccessAction();
  const action2 = new SuccessAction2();

  source$.pipe(dispatchOnSuccess(() => [action, action2])).subscribe();

  expect(spy).toHaveBeenCalledWith(action);
  expect(spy).toHaveBeenCalledWith(action2);
  expect(spy).toHaveBeenCalledTimes(2);
});

it(`shouldn't dispatch an action on source error`, () => {
  const source$ = throwError(() => new Error('error'));
  const spy = jasmine.createSpy();
  Actions.onAction(SuccessAction).subscribe(spy);
  const action = new SuccessAction();

  source$.pipe(dispatchOnSuccess(() => action)).subscribe({
    error: () => {},
  });

  expect(spy).toHaveBeenCalledTimes(0);
});
