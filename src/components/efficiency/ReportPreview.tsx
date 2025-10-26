'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Printer,
  Share,
  ZoomIn,
  ZoomOut,
  Maximize2,
  FileText,
  BarChart3,
  Table,
  PenTool
} from 'lucide-react';
import { ReportPreviewData, ReportTemplate } from '@/types/efficiency';
import { exportToPDF, printElement } from '@/utils/exportUtils';

interface ReportPreviewProps {
  previewData: ReportPreviewData;
  template?: ReportTemplate;
  onClose: () => void;
  className?: string;
}

export function ReportPreview({
  previewData,
  template,
  onClose,
  className
}: ReportPreviewProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [zoomLevel, setZoomLevel] = useState(100);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const totalPages = previewData.sections.length;
  const currentSection = previewData.sections[currentPage];

  // 获取章节图标
  const getSectionIcon = (type: string) => {
    switch (type) {
      case 'summary':
        return <FileText className="w-4 h-4" />;
      case 'chart':
        return <BarChart3 className="w-4 h-4" />;
      case 'table':
        return <Table className="w-4 h-4" />;
      case 'custom':
      case 'text':
        return <PenTool className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  // 渲染章节内容
  const renderSectionContent = (section: any) => {
    switch (section.type) {
      case 'text':
      case 'summary':
      case 'custom':
        return (
          <div
            className="prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: section.content.replace(/\n/g, '<br>') }}
          />
        );

      case 'table':
        if (!section.content?.headers || !section.content?.rows) {
          return <p className="text-muted-foreground">暂无数据</p>;
        }
        return (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border border-gray-200">
              <thead>
                <tr className="bg-gray-50">
                  {section.content.headers.map((header: string, index: number) => (
                    <th
                      key={index}
                      className="border border-gray-200 px-4 py-2 text-left font-medium"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {section.content.rows.map((row: string[], rowIndex: number) => (
                  <tr key={rowIndex} className={rowIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    {row.map((cell, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="border border-gray-200 px-4 py-2 text-sm"
                      >
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );

      case 'chart':
        return (
          <div className="bg-muted/50 rounded-lg p-8 text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">图表：{section.name}</p>
            <p className="text-sm text-muted-foreground mt-2">
              图表类型：{section.chartType || '柱状图'}
            </p>
          </div>
        );

      default:
        return <p className="text-muted-foreground">内容加载中...</p>;
    }
  };

  // 导出功能
  const handleExport = async () => {
    if (contentRef.current) {
      try {
        await exportToPDF('report-preview-content', '报告预览.pdf');
      } catch (error) {
        console.error('导出失败:', error);
      }
    }
  };

  // 打印功能
  const handlePrint = () => {
    if (contentRef.current) {
      printElement('report-preview-content');
    }
  };

  // 分享功能
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: previewData.metadata.title,
          text: '查看这份效率分析报告',
          url: window.location.href
        });
      } catch (error) {
        console.error('分享失败:', error);
      }
    } else {
      // 复制链接到剪贴板
      navigator.clipboard.writeText(window.location.href);
    }
  };

  // 缩放控制
  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 10, 50));
  };

  const handleResetZoom = () => {
    setZoomLevel(100);
  };

  // 页面导航
  const handlePrevPage = () => {
    setCurrentPage(prev => Math.max(prev - 1, 0));
  };

  const handleNextPage = () => {
    setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  };

  // 键盘快捷键
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') handlePrevPage();
      if (e.key === 'ArrowRight') handleNextPage();
      if (e.key === 'Escape') onClose();
      if (e.ctrlKey || e.metaKey) {
        if (e.key === '=') handleZoomIn();
        if (e.key === '-') handleZoomOut();
        if (e.key === '0') handleResetZoom();
        if (e.key === 'p') {
          e.preventDefault();
          handlePrint();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, totalPages]);

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className={`max-w-6xl h-[90vh] flex flex-col ${className}`}>
        <DialogHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>报告预览</DialogTitle>
              <DialogDescription>
                {previewData.metadata.title} - {previewData.metadata.author}
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomOut}
                disabled={zoomLevel <= 50}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-sm font-medium min-w-[60px] text-center">
                {zoomLevel}%
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={handleZoomIn}
                disabled={zoomLevel >= 200}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFullscreen(!isFullscreen)}
              >
                <Maximize2 className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* 工具栏 */}
        <div className="flex items-center justify-between px-6 py-3 border-b bg-muted/50">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 0}
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              上一页
            </Button>
            <span className="text-sm text-muted-foreground">
              第 {currentPage + 1} 页，共 {totalPages} 页
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages - 1}
            >
              下一页
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="w-4 h-4 mr-2" />
              导出PDF
            </Button>
            <Button variant="outline" size="sm" onClick={handlePrint}>
              <Printer className="w-4 h-4 mr-2" />
              打印
            </Button>
            <Button variant="outline" size="sm" onClick={handleShare}>
              <Share className="w-4 h-4 mr-2" />
              分享
            </Button>
          </div>
        </div>

        {/* 预览内容 */}
        <div className="flex-1 overflow-hidden">
          <ScrollArea className="h-full">
            <div
              ref={contentRef}
              id="report-preview-content"
              className="p-8 transition-transform duration-200"
              style={{
                transform: `scale(${zoomLevel / 100})`,
                transformOrigin: 'top center',
                width: isFullscreen ? '100%' : '210mm',
                minHeight: '297mm',
                margin: '0 auto',
                backgroundColor: 'white',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            >
              {/* 报告头部 */}
              <div
                className="text-center mb-8 pb-6 border-b-2"
                style={{ borderColor: template?.styling.primaryColor || '#2563eb' }}
              >
                <h1
                  className="text-3xl font-bold mb-2"
                  style={{ color: template?.styling.primaryColor || '#2563eb' }}
                >
                  {previewData.metadata.title}
                </h1>
                <p className="text-lg text-muted-foreground mb-2">
                  {template?.styling.header?.subtitle || '效率分析报告'}
                </p>
                <div className="flex items-center justify-center gap-4 text-sm text-muted-foreground">
                  {template?.styling.header?.showDate !== false && (
                    <span>生成日期：{previewData.metadata.createdAt.toLocaleDateString('zh-CN')}</span>
                  )}
                  {template?.styling.header?.showAuthor !== false && (
                    <span>作者：{previewData.metadata.author}</span>
                  )}
                </div>
              </div>

              {/* 当前章节 */}
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  {getSectionIcon(currentSection.type)}
                  <h2
                    className="text-2xl font-semibold"
                    style={{ color: template?.styling.primaryColor || '#2563eb' }}
                  >
                    {currentSection.name}
                  </h2>
                  <Badge variant="secondary" className="text-xs">
                    第 {currentPage + 1} 页
                  </Badge>
                </div>

                <div className="min-h-[400px]">
                  {renderSectionContent(currentSection)}
                </div>
              </div>

              {/* 报告底部 */}
              <div className="mt-12 pt-6 border-t text-center text-sm text-muted-foreground">
                <p>
                  {template?.styling.footer?.text || '© 2024 AI效率分析系统'}
                </p>
                {template?.styling.footer?.showPageNumbers !== false && (
                  <p className="mt-2">第 {currentPage + 1} 页 / 共 {totalPages} 页</p>
                )}
              </div>
            </div>
          </ScrollArea>
        </div>

        {/* 页面缩略图导航 */}
        <div className="flex-shrink-0 p-4 border-t bg-muted/50">
          <div className="flex gap-2 overflow-x-auto pb-2">
            {previewData.sections.map((section, index) => (
              <button
                key={section.id}
                onClick={() => setCurrentPage(index)}
                className={`flex-shrink-0 p-2 rounded-lg border transition-all ${
                  currentPage === index
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:bg-muted'
                }`}
              >
                <div className="w-16 h-20 bg-background rounded flex flex-col items-center justify-center gap-1">
                  {getSectionIcon(section.type)}
                  <span className="text-xs truncate w-full text-center">
                    {section.name}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 简化的预览卡片组件
interface ReportPreviewCardProps {
  previewData: ReportPreviewData;
  onPreview?: () => void;
  className?: string;
}

export function ReportPreviewCard({
  previewData,
  onPreview,
  className
}: ReportPreviewCardProps) {
  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>报告预览</span>
          <Button variant="outline" size="sm" onClick={onPreview}>
            查看完整报告
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-muted-foreground">标题：</span>
              <span className="font-medium">{previewData.metadata.title}</span>
            </div>
            <div>
              <span className="text-muted-foreground">页数：</span>
              <span className="font-medium">{previewData.metadata.totalPages}</span>
            </div>
            <div>
              <span className="text-muted-foreground">作者：</span>
              <span className="font-medium">{previewData.metadata.author}</span>
            </div>
            <div>
              <span className="text-muted-foreground">版本：</span>
              <span className="font-medium">{previewData.metadata.version}</span>
            </div>
          </div>

          <Separator />

          <div>
            <h4 className="text-sm font-medium mb-2">包含章节：</h4>
            <div className="flex flex-wrap gap-1">
              {previewData.sections.map(section => (
                <Badge key={section.id} variant="secondary" className="text-xs">
                  {section.name}
                </Badge>
              ))}
            </div>
          </div>

          <div className="text-xs text-muted-foreground">
            生成时间：{previewData.metadata.createdAt.toLocaleString('zh-CN')}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}