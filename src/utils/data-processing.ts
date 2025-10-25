/**
 * 数据处理工具函数
 */

// 数组分块
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

// 数组去重
export function unique<T>(array: T[], key?: keyof T): T[] {
  if (!key) {
    return [...new Set(array)];
  }

  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

// 数组排序
export function sortBy<T>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return direction === 'asc' ? -1 : 1;
    if (aVal > bVal) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

// 对象数组搜索
export function searchInArray<T>(
  array: T[],
  searchTerm: string,
  searchFields: (keyof T)[]
): T[] {
  if (!searchTerm.trim()) return array;

  const lowerSearchTerm = searchTerm.toLowerCase();

  return array.filter(item =>
    searchFields.some(field => {
      const value = item[field];
      return value && String(value).toLowerCase().includes(lowerSearchTerm);
    })
  );
}

// 分页处理
export function paginate<T>(
  array: T[],
  page: number,
  pageSize: number
): {
  data: T[];
  total: number;
  totalPages: number;
  currentPage: number;
} {
  const total = array.length;
  const totalPages = Math.ceil(total / pageSize);
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const data = array.slice(startIndex, endIndex);

  return {
    data,
    total,
    totalPages,
    currentPage: page,
  };
}

// 树形数据扁平化
export function flattenTree<T extends { children?: T[] }>(
  tree: T[],
  childrenKey: keyof T = 'children' as keyof T
): T[] {
  const result: T[] = [];

  const traverse = (nodes: T[]) => {
    nodes.forEach(node => {
      result.push(node);
      const children = node[childrenKey] as T[];
      if (children && children.length > 0) {
        traverse(children);
      }
    });
  };

  traverse(tree);
  return result;
}

// 扁平数据转树形
export function arrayToTree<T extends { id: string; parentId?: string }>(
  items: T[],
  rootParentId: string | null = null
): Array<T & { children: Array<T & { children: unknown[] }> }> {
  const tree: Array<T & { children: Array<T & { children: unknown[] }> }> = [];
  const map = new Map<
    string,
    T & { children: Array<T & { children: unknown[] }> }
  >();

  // 创建映射
  items.forEach(item => {
    map.set(item.id, { ...item, children: [] });
  });

  // 构建树
  items.forEach(item => {
    const node = map.get(item.id);
    if (node) {
      if (item.parentId === rootParentId) {
        tree.push(node);
      } else {
        const parent = map.get(item.parentId!);
        if (parent) {
          parent.children.push(node);
        }
      }
    }
  });

  return tree;
}
