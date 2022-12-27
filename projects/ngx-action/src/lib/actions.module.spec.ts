import { Injectable, NgModule } from '@angular/core';
import { TestBed }              from '@angular/core/testing';
import { ActionsModule }        from './actions.module';

@Injectable()
class Service {
  public static isInitialized: boolean = false;

  constructor() {
    Service.isInitialized = true;
  }

  public static resetIsInitialized(): void {
    Service.isInitialized = false;
  }
}

@NgModule({
  providers: [Service],
})
export class DefaultProvider {
}

@NgModule({
  imports: [
    ActionsModule.provide([Service]),
  ]
})
export class ActionsModuleProvider {
}

it('service removed from bundle when provided using default syntax', () => {
  Service.resetIsInitialized();

  TestBed.configureTestingModule({
    imports: [DefaultProvider],
  });
  TestBed.inject(DefaultProvider)

  expect(Service.isInitialized).toEqual(false);
});

it('service not removed from bundle when library module used', () => {
  Service.resetIsInitialized();

  TestBed.configureTestingModule({
    imports: [ActionsModuleProvider]
  });
  TestBed.inject(ActionsModuleProvider)

  expect(Service.isInitialized).toEqual(true);
});
