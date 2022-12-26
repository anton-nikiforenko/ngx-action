import { Inject, InjectionToken, Injector, ModuleWithProviders, NgModule, Provider } from '@angular/core';

const SERVICES: InjectionToken<Provider[]> = new InjectionToken<Provider[]>('SERVICES');
const INJECTED_SERVICES: InjectionToken<Provider[][]> = new InjectionToken<Provider[][]>('INJECTED_SERVICES');

@NgModule()
export class ActionsModule {
  constructor(
    @Inject(INJECTED_SERVICES) injectedServices: Provider[][],
  ) {
  }

  public static provide(services: Provider[]): ModuleWithProviders<ActionsModule> {
    return {
      ngModule: ActionsModule,
      providers: [
        services,
        {
          provide: SERVICES,
          multi: true,
          useValue: services,
        },
        {
          provide: INJECTED_SERVICES,
          multi: true,
          deps: [
            Injector,
            SERVICES,
          ],
          useFactory: injectedServicesFactory,
        },
      ],
    };
  }
}

function injectedServicesFactory(
  injector: Injector,
  services: Provider[][],
): Provider[] {
  return services.flat().map((service: Provider) => injector.get(service));
}
