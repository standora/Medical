import { useState, useCallback } from 'react';
import { Select } from 'antd';
import type { DrugCatalog } from '../../types/drug.types';

interface DrugSelectProps {
  value?: string;
  onChange?: (value: string, option: DrugCatalog) => void;
  placeholder?: string;
}

export default function DrugSelect({ value, onChange, placeholder }: DrugSelectProps) {
  const [options, setOptions] = useState<DrugCatalog[]>([]);
  const [fetching, setFetching] = useState(false);

  const handleSearch = useCallback((keyword: string) => {
    if (!keyword) {
      setOptions([]);
      return;
    }
    setFetching(true);
    fetch(`/api/v1/catalogs?keyword=${encodeURIComponent(keyword)}&pageSize=20`)
      .then((res) => res.json())
      .then((data) => {
        setOptions(data.items ?? []);
      })
      .catch(() => {
        setOptions([]);
      })
      .finally(() => {
        setFetching(false);
      });
  }, []);

  return (
    <Select
      value={value}
      placeholder={placeholder || '请搜索药品'}
      showSearch={{ filterOption: false }}
      onSearch={handleSearch}
      loading={fetching}
      onChange={(val, _option) => {
        const drug = options.find((d) => d.id === val);
        if (drug && onChange) {
          onChange(val, drug);
        }
      }}
      options={options.map((d) => ({
        label: `${d.genericName}（${d.specification}）`,
        value: d.id,
      }))}
      allowClear
      style={{ width: '100%' }}
    />
  );
}
