'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BatchFileUploader } from './BatchFileUploader';
import { FileList } from './FileList';
import { FilePreview } from './FilePreview';
import { FileInfo } from '@/utils/fileValidation';

interface BatchFileProcessorProps {
  className?: string;
}

export function BatchFileProcessor({ className }: BatchFileProcessorProps) {
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [previewFile, setPreviewFile] = useState<FileInfo | null>(null);
  const [previewIndex, setPreviewIndex] = useState(-1);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  // 添加文件
  const handleFilesAdd = (newFiles: FileInfo[]) => {
    setFiles(prev => [...prev, ...newFiles]);
  };

  // 删除文件
  const handleFilesRemove = (fileIds: string[]) => {
    setFiles(prev => prev.filter(f => !fileIds.includes(f.id)));

    // 如果正在预览被删除的文件，关闭预览
    if (previewFile && fileIds.includes(previewFile.id)) {
      setIsPreviewOpen(false);
      setPreviewFile(null);
      setPreviewIndex(-1);
    }
  };

  // 重命名文件
  const handleFileRename = (fileId: string, newName: string) => {
    setFiles(prev => prev.map(file =>
      file.id === fileId
        ? { ...file, name: newName, file: new File([file.file], newName, { type: file.type }) }
        : file
    ));

    // 如果正在预览被重命名的文件，更新预览
    if (previewFile && previewFile.id === fileId) {
      setPreviewFile(prev => prev ? { ...prev, name: newName } : null);
    }
  };

  // 下载文件
  const handleFileDownload = (file: FileInfo) => {
    // 创建下载链接
    const url = URL.createObjectURL(file.file);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // 预览文件
  const handleFilePreview = (file: FileInfo) => {
    const index = files.findIndex(f => f.id === file.id);
    setPreviewIndex(index);
    setPreviewFile(file);
    setIsPreviewOpen(true);
  };

  // 下一个文件预览
  const handleNextPreview = () => {
    if (previewIndex < files.length - 1) {
      const nextIndex = previewIndex + 1;
      setPreviewIndex(nextIndex);
      setPreviewFile(files[nextIndex]);
    }
  };

  // 上一个文件预览
  const handlePreviousPreview = () => {
    if (previewIndex > 0) {
      const prevIndex = previewIndex - 1;
      setPreviewIndex(prevIndex);
      setPreviewFile(files[prevIndex]);
    }
  };

  const hasNext = previewIndex < files.length - 1;
  const hasPrevious = previewIndex > 0;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 头部信息 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">批量文件处理系统</CardTitle>
          <p className="text-gray-600">
            高效的文件上传、管理和预览工具，支持多种文件格式
          </p>
        </CardHeader>
      </Card>

      {/* 主要内容 */}
      <Tabs defaultValue="upload" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="upload">上传文件</TabsTrigger>
          <TabsTrigger value="manage">文件管理</TabsTrigger>
        </TabsList>

        <TabsContent value="upload" className="space-y-6">
          <BatchFileUploader
            onFilesAdd={handleFilesAdd}
            onFilesRemove={handleFilesRemove}
            existingFiles={files}
          />
        </TabsContent>

        <TabsContent value="manage" className="space-y-6">
          <FileList
            files={files}
            onFilesRemove={handleFilesRemove}
            onFileRename={handleFileRename}
            onFileDownload={handleFileDownload}
            onFilePreview={handleFilePreview}
            showPreview={true}
            showDownload={true}
          />
        </TabsContent>
      </Tabs>

      {/* 文件预览对话框 */}
      <FilePreview
        file={previewFile}
        isOpen={isPreviewOpen}
        onClose={() => {
          setIsPreviewOpen(false);
          setPreviewFile(null);
          setPreviewIndex(-1);
        }}
        onDownload={handleFileDownload}
        onNext={hasNext ? handleNextPreview : undefined}
        onPrevious={hasPrevious ? handlePreviousPreview : undefined}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
      />

      {/* 统计信息 */}
      {files.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">文件统计</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">{files.length}</div>
                <div className="text-sm text-gray-600">文件总数</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {files.filter(f => f.category === 'image').length}
                </div>
                <div className="text-sm text-gray-600">图片文件</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {files.filter(f => f.category === 'document').length}
                </div>
                <div className="text-sm text-gray-600">文档文件</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-primary">
                  {(files.reduce((sum, f) => sum + f.size, 0) / (1024 * 1024)).toFixed(1)} MB
                </div>
                <div className="text-sm text-gray-600">总大小</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}