import { useState, useEffect } from 'react';
import { TreeSelect } from 'antd';
import type { Organization } from '../../types/org.types';
import type { OrgLevel } from '../../types/org.types';

interface TreeNode {
  title: string;
  value: string;
  key: string;
  children?: TreeNode[];
}

function buildTree(orgs: Organization[]): TreeNode[] {
  const countyNodes: TreeNode[] = [];
  const townMap = new Map<string, TreeNode[]>();
  const villageMap = new Map<string, TreeNode[]>();

  for (const org of orgs) {
    const node: TreeNode = { title: org.name, value: org.id, key: org.id };
    if (org.level === ('COUNTY' as OrgLevel)) {
      countyNodes.push(node);
    } else if (org.level === ('TOWN' as OrgLevel)) {
      if (org.parentId) {
        if (!townMap.has(org.parentId)) townMap.set(org.parentId, []);
        townMap.get(org.parentId)!.push(node);
      }
    } else if (org.level === ('VILLAGE' as OrgLevel)) {
      if (org.parentId) {
        if (!villageMap.has(org.parentId)) villageMap.set(org.parentId, []);
        villageMap.get(org.parentId)!.push(node);
      }
    }
  }

  for (const county of countyNodes) {
    county.children = townMap.get(county.value) || [];
    for (const town of county.children) {
      town.children = villageMap.get(town.value) || [];
    }
  }

  return countyNodes;
}

interface OrgTreeSelectProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
}

export default function OrgTreeSelect({ value, onChange, placeholder }: OrgTreeSelectProps) {
  const [treeData, setTreeData] = useState<TreeNode[]>([]);

  useEffect(() => {
    fetch('/api/v1/orgs')
      .then((res) => res.json())
      .then((data: Organization[]) => {
        setTreeData(buildTree(data));
      })
      .catch(() => {
        setTreeData([]);
      });
  }, []);

  return (
    <TreeSelect
      value={value}
      onChange={onChange}
      treeData={treeData}
      placeholder={placeholder || '请选择机构'}
      allowClear
      showSearch
      filterTreeNode={(input, node) => (node.title as string)?.includes(input)}
      style={{ width: '100%' }}
    />
  );
}
