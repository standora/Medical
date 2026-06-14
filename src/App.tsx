import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, App as AntApp } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import { router } from './routes';
import { ANT_THEME } from './theme/design-tokens';
import ErrorBoundary from './components/common/ErrorBoundary';
import './App.css';

export default function App() {
  return (
    <ErrorBoundary>
      <ConfigProvider
        locale={zhCN}
        theme={ANT_THEME}
      >
        <AntApp>
          <RouterProvider router={router} />
        </AntApp>
      </ConfigProvider>
    </ErrorBoundary>
  );
}
