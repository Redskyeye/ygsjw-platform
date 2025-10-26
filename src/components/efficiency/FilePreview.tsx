'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Download,
  ZoomIn,
  ZoomOut,
  RotateCw,
  ChevronLeft,
  ChevronRight,
  FileText,
  Image as ImageIcon,
  FileCode,
  Archive,
  Eye,
  EyeOff,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  FileInfo,
  formatFileSize,
  isImageFile,
  isDocumentFile,
  isTextFile,
  isArchiveFile,
  createPreviewUrl,
  revokePreviewUrl,
} from '@/utils/fileValidation';

interface FilePreviewProps {
  file: FileInfo | null;
  isOpen: boolean;
  onClose: () => void;
  onDownload?: (file: FileInfo) => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
  className?: string;
}

interface PreviewState {
  zoom: number;
  rotation: number;
  showRawContent: boolean;
}

export function FilePreview({
  file,
  isOpen,
  onClose,
  onDownload,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
  className,
}: FilePreviewProps) {
  const [previewState, setPreviewState] = useState<PreviewState>({
    zoom: 1,
    rotation: 0,
    showRawContent: false,
  });
  const [textContent, setTextContent] = useState<string>('');
  const [imageError, setImageError] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // 处理文件变化
  useEffect(() => {
    if (file) {
      // 重置预览状态
      setPreviewState({
        zoom: 1,
        rotation: 0,
        showRawContent: false,
      });
      setImageError(false);

      // 清理之前的预览URL
      if (previewUrl) {
        revokePreviewUrl(previewUrl);
        setPreviewUrl(null);
      }

      // 处理文本文件内容
      if (isTextFile(file)) {
        loadTextContent(file);
      } else {
        setTextContent('');
      }

      // 处理图片预览
      if (isImageFile(file)) {
        const url = createPreviewUrl(file);
        setPreviewUrl(url);
      }
    } else {
      // 清理资源
      if (previewUrl) {
        revokePreviewUrl(previewUrl);
        setPreviewUrl(null);
      }
      setTextContent('');
    }
  }, [file]);

  // 清理预览URL
  useEffect(() => {
    return () => {
      if (previewUrl) {
        revokePreviewUrl(previewUrl);
      }
    };
  }, [previewUrl]);

  // 加载文本文件内容
  const loadTextContent = async (fileInfo: FileInfo) => {
    try {
      const text = await fileInfo.file.text();
      setTextContent(text);
    } catch (error) {
      console.error('Failed to load text content:', error);
      setTextContent('无法加载文件内容');
    }
  };

  // 缩放控制
  const handleZoomIn = () => {
    setPreviewState(prev => ({ ...prev, zoom: Math.min(prev.zoom + 0.25, 3) }));
  };

  const handleZoomOut = () => {
    setPreviewState(prev => ({ ...prev, zoom: Math.max(prev.zoom - 0.25, 0.25) }));
  };

  const handleResetZoom = () => {
    setPreviewState(prev => ({ ...prev, zoom: 1, rotation: 0 }));
  };

  // 旋转控制
  const handleRotate = () => {
    setPreviewState(prev => ({ ...prev, rotation: (prev.rotation + 90) % 360 }));
  };

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (hasPrevious) onPrevious?.();
          break;
        case 'ArrowRight':
          if (hasNext) onNext?.();
          break;
        case '+':
        case '=':
          handleZoomIn();
          break;
        case '-':
        case '_':
          handleZoomOut();
          break;
        case '0':
          handleResetZoom();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasPrevious, hasNext, onClose, onPrevious, onNext]);

  if (!file) return null;

  // 获取文件图标
  const getFileIcon = () => {
    const iconClass = 'h-6 w-6';
    if (isImageFile(file)) return <ImageIcon className={iconClass} />;
    if (isDocumentFile(file)) return <FileText className={iconClass} />;
    if (isTextFile(file)) return <FileCode className={iconClass} />;
    if (isArchiveFile(file)) return <Archive className={iconClass} />;
    return <FileText className={iconClass} />;
  };

  // 渲染图片预览
  const renderImagePreview = () => {
    if (!previewUrl || imageError) {
      return (
        <div className="flex flex-col items-center justify-center h-96 text-gray-500">
          <ImageIcon className="h-16 w-16 mb-4" />
          <p>无法预览图片</p>
        </div>
      );
    }

    return (
      <div className="flex items-center justify-center overflow-auto">
        <img
          ref={imageRef}
          src={previewUrl}
          alt={file.name}
          className="max-w-full max-h-96 object-contain transition-transform"
          style={{
            transform: `scale(${previewState.zoom}) rotate(${previewState.rotation}deg)`,
          }}
          onError={() => setImageError(true)}
        />
      </div>
    );
  };

  // 渲染文本预览
  const renderTextPreview = () => {
    return (
      <Tabs value={previewState.showRawContent ? 'raw' : 'formatted'} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="formatted" onClick={() => setPreviewState(prev => ({ ...prev, showRawContent: false }))}>
            格式化
          </TabsTrigger>
          <TabsTrigger value="raw" onClick={() => setPreviewState(prev => ({ ...prev, showRawContent: true }))}>
            原始内容
          </TabsTrigger>
        </TabsList>
        <TabsContent value="formatted" className="mt-4">
          <ScrollArea className="h-96 w-full rounded border">
            <div className="p-4">
              <pre className="text-sm whitespace-pre-wrap font-mono">
                {textContent}
              </pre>
            </div>
          </ScrollArea>
        </TabsContent>
        <TabsContent value="raw" className="mt-4">
          <ScrollArea className="h-96 w-full rounded border">
            <div className="p-4">
              <code className="text-xs font-mono text-gray-600">
                {textContent}
              </code>
            </div>
          </ScrollArea>
        </TabsContent>
      </Tabs>
    );
  };

  // 渲染文档预览
  const renderDocumentPreview = () => {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <FileText className="h-16 w-16 mb-4" />
        <p className="text-lg font-medium mb-2">无法预览此文档类型</p>
        <p className="text-sm">请下载文件后使用相应软件打开</p>
      </div>
    );
  };

  // 渲染压缩文件预览
  const renderArchivePreview = () => {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-gray-500">
        <Archive className="h-16 w-16 mb-4" />
        <p className="text-lg font-medium mb-2">压缩文件预览</p>
        <p className="text-sm">下载并解压后查看内容</p>
      </div>
    );
  };

  // 根据文件类型渲染预览内容
  const renderPreviewContent = () => {
    if (isImageFile(file)) {
      return renderImagePreview();
    } else if (isTextFile(file)) {
      return renderTextPreview();
    } else if (isDocumentFile(file)) {
      return renderDocumentPreview();
    } else if (isArchiveFile(file)) {
      return renderArchivePreview();
    } else {
      return renderDocumentPreview();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={cn('max-w-4xl w-full h-[80vh] flex flex-col', className)}>
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3 flex-1 min-w-0">
              {getFileIcon()}
              <div className="flex-1 min-w-0">
                <DialogTitle className="truncate">{file.name}</DialogTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="secondary">{file.category}</Badge>
                  <span className="text-sm text-gray-500">{formatFileSize(file.size)}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* 导航按钮 */}
              {hasPrevious && (
                <Button variant="outline" size="sm" onClick={onPrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
              )}
              {hasNext && (
                <Button variant="outline" size="sm" onClick={onNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              )}

              {/* 下载按钮 */}
              {onDownload && (
                <Button variant="outline" size="sm" onClick={() => onDownload(file)}>
                  <Download className="h-4 w-4" />
                </Button>
              )}

              {/* 关闭按钮 */}
              <Button variant="outline" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* 图片控制工具栏 */}
        {isImageFile(file) && previewUrl && !imageError && (
          <div className="flex items-center justify-center space-x-2 pb-4 border-b">
            <Button variant="outline" size="sm" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm font-medium min-w-[3rem] text-center">
              {Math.round(previewState.zoom * 100)}%
            </span>
            <Button variant="outline" size="sm" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleRotate}>
              <RotateCw className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={handleResetZoom}>
              重置
            </Button>
          </div>
        )}

        {/* 预览内容区域 */}
        <div className="flex-1 overflow-hidden">
          <Card className="h-full">
            <CardContent className="p-0 h-full">
              {renderPreviewContent()}
            </CardContent>
          </Card>
        </div>

        {/* 文件信息 */}
        <div className="flex-shrink-0 pt-4 border-t">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">文件名:</span>
              <span className="ml-2 text-gray-600">{file.name}</span>
            </div>
            <div>
              <span className="font-medium">文件大小:</span>
              <span className="ml-2 text-gray-600">{formatFileSize(file.size)}</span>
            </div>
            <div>
              <span className="font-medium">文件类型:</span>
              <span className="ml-2 text-gray-600">{file.type}</span>
            </div>
            <div>
              <span className="font-medium">上传时间:</span>
              <span className="ml-2 text-gray-600">
                {new Date(file.uploadedAt).toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}