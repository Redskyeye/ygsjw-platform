'use client';

import { BatchFileProcessor } from '@/components/efficiency/BatchFileProcessor';

export default function EfficiencyPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <BatchFileProcessor />
    </div>
  );
}

export const metadata = {
  title: '批量文件处理系统 | Epic AI',
  description: '高效的文件上传、管理和预览工具，支持多种文件格式',
};