import { Actions } from './actions';

class FirstAction {}
class SecondAction {}

it('should dispatch action', () => {
  const spy: jasmine.Spy = jasmine.createSpy();
  const action: FirstAction = new FirstAction();
  Actions.onAction(FirstAction).subscribe(spy);

  Actions.dispatch(action);

  expect(spy).toHaveBeenCalledWith(action);
  expect(spy).toHaveBeenCalledTimes(1);
});

it('should subscribe on specific action', () => {
  const spy: jasmine.Spy = jasmine.createSpy();
  const firstAction: FirstAction = new FirstAction();
  const secondAction: SecondAction = new SecondAction();
  Actions.onAction(FirstAction).subscribe(spy);

  Actions.dispatch(firstAction);
  Actions.dispatch(firstAction);
  Actions.dispatch(secondAction);

  expect(spy).toHaveBeenCalledWith(firstAction);
  expect(spy).toHaveBeenCalledTimes(2);
});
