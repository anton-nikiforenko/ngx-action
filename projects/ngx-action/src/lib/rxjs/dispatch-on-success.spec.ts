import { Observable, of, throwError } from 'rxjs';
import { Actions }                    from '../actions';
import { dispatchOnSuccess }          from './dispatch-on-success';

class SuccessAction {}

it('should dispatch an action on source success', () => {
  const source$: Observable<number> = of(1);
  const spy: jasmine.Spy = jasmine.createSpy();
  Actions.onAction(SuccessAction).subscribe(spy);
  const action: SuccessAction = new SuccessAction();

  source$.pipe(dispatchOnSuccess(() => action)).subscribe();

  expect(spy).toHaveBeenCalledWith(action);
  expect(spy).toHaveBeenCalledTimes(1);
});

it(`shouldn't dispatch an action on source error`, () => {
  const source$: Observable<never> = throwError(() => new Error('error'));
  const spy: jasmine.Spy = jasmine.createSpy();
  Actions.onAction(SuccessAction).subscribe(spy);
  const action: SuccessAction = new SuccessAction();

  source$.pipe(dispatchOnSuccess(() => action)).subscribe({
    error: () => {},
  });

  expect(spy).toHaveBeenCalledTimes(0);
});
