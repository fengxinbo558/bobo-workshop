import type { BoboApi } from '../shared/contracts';

declare global {
  interface Window {
    bobo: BoboApi;
  }
}

export {};
