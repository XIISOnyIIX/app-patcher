import { DoorDashProvider } from './DoorDashProvider';
import { GrubHubProvider } from './GrubHubProvider';
import { UberEatsProvider } from './UberEatsProvider';
import { BaseProvider } from '../core/BaseProvider';

export class ProviderRegistry {
  private providers: Map<string, BaseProvider> = new Map();

  registerProvider(provider: BaseProvider): void {
    this.providers.set(provider.getName(), provider);
  }

  getProvider(name: string): BaseProvider | undefined {
    return this.providers.get(name);
  }

  getAllProviders(): BaseProvider[] {
    return Array.from(this.providers.values());
  }

  getEnabledProviders(): BaseProvider[] {
    return this.getAllProviders().filter((p) => p.isEnabled());
  }
}

export function createDefaultProviders(): BaseProvider[] {
  return [new UberEatsProvider(), new DoorDashProvider(), new GrubHubProvider()];
}

export { UberEatsProvider, DoorDashProvider, GrubHubProvider };
