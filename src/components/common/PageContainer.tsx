import type { ReactNode } from 'react';
import PageHeader from './PageHeader';

interface PageContainerProps {
  title: string;
  description?: string;
  extra?: ReactNode;
  children: ReactNode;
}

export default function PageContainer({ title, description, extra, children }: PageContainerProps) {
  return (
    <div>
      <PageHeader title={title} description={description} extra={extra} />
      {children}
    </div>
  );
}
