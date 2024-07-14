import { Actions } from './actions';

class FirstAction {}
class SecondAction {}
class ThirdAction {}

it('should dispatch action', () => {
  const spy = jest.fn();
  const action = new FirstAction();
  Actions.onAction(FirstAction).subscribe(spy);

  Actions.dispatch(action);

  expect(spy).toHaveBeenCalledWith(action);
  expect(spy).toHaveBeenCalledTimes(1);
});

it('should dispatch multiple actions', () => {
  const spy = jest.fn();
  const action = new FirstAction();
  const action2 = new FirstAction();
  Actions.onAction(FirstAction).subscribe(spy);

  Actions.dispatch(action, action2);

  expect(spy).toHaveBeenCalledWith(action);
  expect(spy).toHaveBeenCalledWith(action2);
  expect(spy).toHaveBeenCalledTimes(2);
});

it('should subscribe to specific action', () => {
  const spy = jest.fn();
  const firstAction = new FirstAction();
  const secondAction = new SecondAction();
  Actions.onAction(FirstAction).subscribe(spy);

  Actions.dispatch(firstAction);
  Actions.dispatch(firstAction);
  Actions.dispatch(secondAction);

  expect(spy).toHaveBeenCalledWith(firstAction);
  expect(spy).toHaveBeenCalledTimes(2);
});

it('should subscribe to multiple actions', () => {
  const spy = jest.fn();
  const firstAction = new FirstAction();
  const secondAction = new SecondAction();
  const thirdAction = new ThirdAction();
  Actions.onAction(FirstAction, SecondAction).subscribe(spy);

  Actions.dispatch(firstAction);
  Actions.dispatch(secondAction);
  Actions.dispatch(thirdAction);

  expect(spy).toHaveBeenCalledWith(firstAction);
  expect(spy).toHaveBeenCalledWith(secondAction);
  expect(spy).toHaveBeenCalledTimes(2);
});
