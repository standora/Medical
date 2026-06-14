import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

const isProduction = import.meta.env.PROD;
// In production (GitHub Pages serving from /docs), mockServiceWorker.js is at /Medical/mockServiceWorker.js
// In development, Vite serves it at the root
const serviceWorkerUrl = isProduction ? '/Medical/mockServiceWorker.js' : '/mockServiceWorker.js';

export const worker = setupWorker(...handlers);

export async function startMockWorker() {
  // Clear any stale MSW service worker registrations (e.g. from a previous run
  // with a different scope) before starting fresh
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const reg of registrations) {
      if (reg.scope.includes('/Medical/') || reg.active?.scriptURL?.includes('mockServiceWorker')) {
        await reg.unregister();
      }
    }
  }

  const startOptions: Parameters<typeof worker.start>[0] = {
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: serviceWorkerUrl,
    },
  };

  // In production (GitHub Pages), the service worker needs a /Medical/ scope
  // because the app is served at /Medical/. In development it's at root (/).
  if (isProduction) {
    startOptions.serviceWorker!.options = {
      scope: '/Medical/',
    };
  }

  return worker.start(startOptions);
}
