import type { ReactNode } from 'react';
import { Empty, Table } from 'antd';
import type { TableProps } from 'antd';
import type { PaginatedResult } from '../../types/common.types';

interface DataTableProps<T> extends Omit<TableProps<T>, 'pagination'> {
  loading?: boolean;
  pagination?: PaginatedResult<T> | null | false;
  onPageChange?: (page: number, pageSize: number) => void;
  emptyDescription?: ReactNode;
}

export default function DataTable<T extends object = object>({
  loading,
  pagination,
  onPageChange,
  emptyDescription,
  ...tableProps
}: DataTableProps<T>) {
  const paginationConfig = pagination
    ? {
        current: pagination.page,
        pageSize: pagination.pageSize,
        total: pagination.total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total: number) => `共 ${total} 条`,
        onChange: onPageChange,
      }
    : pagination === false ? false : undefined;

  return (
    <Table<T>
      loading={loading}
      pagination={paginationConfig}
      bordered
      size="middle"
      locale={{
        emptyText: <Empty description={emptyDescription || '暂无数据'} />,
      }}
      style={{ borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}
      {...tableProps}
    />
  );
}
