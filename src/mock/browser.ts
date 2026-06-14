import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

const isProduction = import.meta.env.PROD;
// In production (GitHub Pages serving from /docs), mockServiceWorker.js is at /Medical/mockServiceWorker.js
// In development, Vite serves it at the root
const serviceWorkerUrl = isProduction ? '/Medical/mockServiceWorker.js' : '/mockServiceWorker.js';

export const worker = setupWorker(...handlers);

export async function startMockWorker() {
  return worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: {
      url: serviceWorkerUrl,
      options: {
        scope: '/Medical/',
      },
    },
  });
}
