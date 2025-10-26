'use client';

import React, { useCallback, useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, AlertCircle, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { cn } from '@/lib/utils';
import {
  validateFileList,
  createFileInfo,
  formatFileSize,
  getSupportedTypesString,
  FILE_LIMITS,
  FileInfo,
  ValidationResult,
} from '@/utils/fileValidation';

interface BatchFileUploaderProps {
  onFilesAdd: (files: FileInfo[]) => void;
  onFilesRemove: (fileIds: string[]) => void;
  existingFiles?: FileInfo[];
  maxFiles?: number;
  maxSize?: number;
  className?: string;
  disabled?: boolean;
}

interface UploadProgress {
  [fileId: string]: number;
}

export function BatchFileUploader({
  onFilesAdd,
  onFilesRemove,
  existingFiles = [],
  maxFiles = FILE_LIMITS.MAX_FILE_COUNT,
  maxSize = FILE_LIMITS.MAX_FILE_SIZE,
  className,
  disabled = false,
}: BatchFileUploaderProps) {
  const [uploadProgress, setUploadProgress] = useState<UploadProgress>({});
  const [validationError, setValidationError] = useState<string | null>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // 模拟上传进度
  const simulateUploadProgress = useCallback((files: FileInfo[]) => {
    const initialProgress: UploadProgress = {};
    files.forEach(file => {
      initialProgress[file.id] = 0;
    });
    setUploadProgress(initialProgress);

    const interval = setInterval(() => {
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        let allComplete = true;

        Object.keys(newProgress).forEach(fileId => {
          if (newProgress[fileId] < 100) {
            newProgress[fileId] = Math.min(100, newProgress[fileId] + Math.random() * 15);
            allComplete = false;
          }
        });

        if (allComplete) {
          clearInterval(interval);
          setTimeout(() => setUploadProgress({}), 1000);
        }

        return newProgress;
      });
    }, 200);
  }, []);

  // 处理文件验证
  const handleValidation = useCallback((files: File[]): ValidationResult | null => {
    const validation = validateFileList(files, existingFiles);

    if (!validation.isValid) {
      setValidationError(validation.error || '文件验证失败');
      setTimeout(() => setValidationError(null), 5000);
      return null;
    }

    setValidationError(null);
    return validation;
  }, [existingFiles]);

  // 处理文件选择
  const handleFilesSelect = useCallback((files: File[]) => {
    if (disabled || files.length === 0) return;

    const validation = handleValidation(files);
    if (!validation) return;

    // 创建文件信息
    const fileInfos = files.map(file => createFileInfo(file));

    // 开始上传（模拟）
    simulateUploadProgress(fileInfos);

    // 添加文件到列表
    setTimeout(() => {
      onFilesAdd(fileInfos);
    }, 1500);
  }, [disabled, handleValidation, simulateUploadProgress, onFilesAdd]);

  // Dropzone 配置
  const { getRootProps, getInputProps, isDragActive: isDropzoneActive } = useDropzone({
    onDrop: handleFilesSelect,
    multiple: true,
    disabled,
    maxSize,
    noClick: true, // 禁用自动点击，使用自定义按钮
  });

  // 处理拖拽状态
  React.useEffect(() => {
    setIsDragActive(isDropzoneActive);
  }, [isDropzoneActive]);

  // 手动选择文件
  const handleManualSelect = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  // 处理输入框文件变化
  const handleInputChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      handleFilesSelect(Array.from(files));
    }
    // 重置输入框
    event.target.value = '';
  }, [handleFilesSelect]);

  // 计算总进度
  const totalProgress = Object.keys(uploadProgress).length > 0
    ? Object.values(uploadProgress).reduce((sum, progress) => sum + progress, 0) / Object.keys(uploadProgress).length
    : 0;

  const canAddMoreFiles = existingFiles.length < maxFiles;
  const remainingSlots = maxFiles - existingFiles.length;

  return (
    <div className={cn('space-y-4', className)}>
      {/* 验证错误提示 */}
      {validationError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{validationError}</AlertDescription>
        </Alert>
      )}

      {/* 上传区域 */}
      <Card>
        <CardContent className="p-6">
          <div
            {...getRootProps()}
            className={cn(
              'border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors',
              isDragActive
                ? 'border-primary bg-primary/5'
                : 'border-gray-300 hover:border-gray-400',
              disabled && 'opacity-50 cursor-not-allowed'
            )}
          >
            <input {...getInputProps()} ref={fileInputRef} onChange={handleInputChange} />

            <div className="space-y-4">
              {/* 上传图标 */}
              <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                {uploadProgress && Object.keys(uploadProgress).length > 0 ? (
                  <div className="relative">
                    <Upload className="h-6 w-6 text-primary" />
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full" />
                  </div>
                ) : (
                  <Upload className="h-6 w-6 text-primary" />
                )}
              </div>

              {/* 提示文本 */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">
                  {isDragActive ? '松开以上传文件' : '拖拽文件到此处'}
                </h3>
                <p className="text-sm text-gray-500">
                  或者点击下方按钮选择文件
                </p>
              </div>

              {/* 文件限制信息 */}
              <div className="text-xs text-gray-400 space-y-1">
                <p>支持格式: {getSupportedTypesString()}</p>
                <p>
                  文件大小: 最大 {formatFileSize(maxSize)} |
                  文件数量: 最多 {maxFiles} 个
                </p>
                {remainingSlots > 0 && remainingSlots < maxFiles && (
                  <p>剩余可上传: {remainingSlots} 个文件</p>
                )}
              </div>

              {/* 上传按钮 */}
              <Button
                onClick={handleManualSelect}
                disabled={disabled || !canAddMoreFiles}
                className="mt-4"
              >
                <FileText className="h-4 w-4 mr-2" />
                选择文件
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 上传进度 */}
      {Object.keys(uploadProgress).length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">上传进度</span>
                <span className="text-sm text-gray-500">
                  {Math.round(totalProgress)}%
                </span>
              </div>

              <Progress value={totalProgress} className="h-2" />

              {totalProgress === 100 && (
                <div className="flex items-center text-sm text-green-600">
                  <CheckCircle className="h-4 w-4 mr-1" />
                  上传完成
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 快速操作 */}
      {existingFiles.length > 0 && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">已上传文件</h4>
                <p className="text-xs text-gray-500">
                  {existingFiles.length} / {maxFiles} 个文件
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const allFileIds = existingFiles.map(f => f.id);
                  onFilesRemove(allFileIds);
                }}
                disabled={disabled}
              >
                <X className="h-4 w-4 mr-1" />
                清空所有
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}