import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

async function bootstrap() {
  const { startMockWorker } = await import('./mock/browser');
  await startMockWorker();

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
  );
}

bootstrap();
