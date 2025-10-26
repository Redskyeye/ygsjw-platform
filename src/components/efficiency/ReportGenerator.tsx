'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  FileText,
  Download,
  Eye,
  Settings,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  FileSpreadsheet,
  FileImage,
  Code,
  Printer
} from 'lucide-react';
import {
  ReportData,
  ReportTemplate,
  ReportGenerationOptions,
  ReportGenerationState
} from '@/types/efficiency';
import { reportService } from '@/lib/efficiency/reportService';
import {
  exportToPDF,
  exportToDOCX,
  exportToHTML,
  exportToJSON,
  printElement
} from '@/utils/exportUtils';
import { ReportPreview } from './ReportPreview';

interface ReportGeneratorProps {
  reportData: ReportData;
  onReportGenerated?: (reportUrl: string) => void;
  className?: string;
}

export function ReportGenerator({
  reportData,
  onReportGenerated,
  className
}: ReportGeneratorProps) {
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>('standard');
  const [format, setFormat] = useState<'pdf' | 'docx' | 'html' | 'json'>('pdf');
  const [options, setOptions] = useState({
    includeRawData: false,
    includeCharts: true,
    includeRecommendations: true,
    includeActionPlan: true
  });
  const [generationState, setGenerationState] = useState<ReportGenerationState>({
    isGenerating: false,
    progress: 0,
    currentStep: '准备中...'
  });
  const [showPreview, setShowPreview] = useState(false);
  const [previewData, setPreviewData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const reportRef = useRef<HTMLDivElement>(null);

  // 加载模板
  useEffect(() => {
    const loadedTemplates = reportService.getDefaultTemplates();
    setTemplates(loadedTemplates);
  }, []);

  // 生成预览
  const handleGeneratePreview = async () => {
    try {
      setError(null);
      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) {
        throw new Error('未找到选定的模板');
      }

      const preview = await reportService.generatePreview(reportData, template);
      setPreviewData(preview);
      setShowPreview(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : '生成预览失败');
    }
  };

  // 生成报告
  const handleGenerateReport = async () => {
    try {
      setError(null);
      setGenerationState({
        isGenerating: true,
        progress: 0,
        currentStep: '准备生成报告...'
      });

      const generationOptions: ReportGenerationOptions = {
        templateId: selectedTemplate,
        format,
        ...options
      };

      const { taskId } = await reportService.generateReport(
        reportData,
        generationOptions,
        (state) => {
          setGenerationState(state);
          if (state.reportUrl && !state.isGenerating) {
            onReportGenerated?.(state.reportUrl);
          }
        }
      );

    } catch (err) {
      setError(err instanceof Error ? err.message : '生成报告失败');
      setGenerationState({
        isGenerating: false,
        progress: 0,
        currentStep: '错误',
        error: err instanceof Error ? err.message : '未知错误'
      });
    }
  };

  // 取消生成
  const handleCancelGeneration = () => {
    if (generationState.taskId) {
      reportService.cancelReportGeneration(generationState.taskId);
      setGenerationState({
        isGenerating: false,
        progress: 0,
        currentStep: '已取消'
      });
    }
  };

  // 直接导出（使用客户端工具）
  const handleDirectExport = async (exportFormat: 'pdf' | 'docx' | 'html') => {
    try {
      setError(null);

      const template = templates.find(t => t.id === selectedTemplate);
      if (!template) {
        throw new Error('未找到选定的模板');
      }

      const preview = await reportService.generatePreview(reportData, template);

      switch (exportFormat) {
        case 'pdf':
          if (reportRef.current) {
            await exportToPDF('report-content', `${reportData.title}.pdf`);
          }
          break;
        case 'docx':
          await exportToDOCX({
            title: reportData.title,
            sections: preview.sections
          }, `${reportData.title}.docx`);
          break;
        case 'html':
          exportToHTML({
            title: reportData.title,
            sections: preview.sections,
            styling: template.styling
          }, `${reportData.title}.html`);
          break;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '导出失败');
    }
  };

  // 打印报告
  const handlePrint = () => {
    if (reportRef.current) {
      printElement('report-content');
    }
  };

  const currentTemplate = templates.find(t => t.id === selectedTemplate);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            报告生成器
          </CardTitle>
          <CardDescription>
            配置并生成效率分析报告
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* 模板选择 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">报告模板</Label>
            <Select value={selectedTemplate} onValueChange={setSelectedTemplate}>
              <SelectTrigger>
                <SelectValue placeholder="选择报告模板" />
              </SelectTrigger>
              <SelectContent>
                {templates.map(template => (
                  <SelectItem key={template.id} value={template.id}>
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4" />
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {template.description}
                        </div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* 导出格式 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">导出格式</Label>
            <RadioGroup value={format} onValueChange={(value) => setFormat(value as any)}>
              <div className="grid grid-cols-2 gap-4">
                <Label
                  htmlFor="pdf"
                  className="flex items-center gap-2 cursor-pointer rounded-md border p-3 hover:bg-accent"
                >
                  <RadioGroupItem value="pdf" id="pdf" />
                  <FileText className="w-4 h-4" />
                  <span>PDF</span>
                </Label>
                <Label
                  htmlFor="docx"
                  className="flex items-center gap-2 cursor-pointer rounded-md border p-3 hover:bg-accent"
                >
                  <RadioGroupItem value="docx" id="docx" />
                  <FileSpreadsheet className="w-4 h-4" />
                  <span>Word文档</span>
                </Label>
                <Label
                  htmlFor="html"
                  className="flex items-center gap-2 cursor-pointer rounded-md border p-3 hover:bg-accent"
                >
                  <RadioGroupItem value="html" id="html" />
                  <FileImage className="w-4 h-4" />
                  <span>HTML网页</span>
                </Label>
                <Label
                  htmlFor="json"
                  className="flex items-center gap-2 cursor-pointer rounded-md border p-3 hover:bg-accent"
                >
                  <RadioGroupItem value="json" id="json" />
                  <Code className="w-4 h-4" />
                  <span>JSON数据</span>
                </Label>
              </div>
            </RadioGroup>
          </div>

          <Separator />

          {/* 包含选项 */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">包含内容</Label>
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="charts"
                  checked={options.includeCharts}
                  onCheckedChange={(checked) =>
                    setOptions(prev => ({ ...prev, includeCharts: !!checked }))
                  }
                />
                <Label htmlFor="charts" className="text-sm">
                  包含图表
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recommendations"
                  checked={options.includeRecommendations}
                  onCheckedChange={(checked) =>
                    setOptions(prev => ({ ...prev, includeRecommendations: !!checked }))
                  }
                />
                <Label htmlFor="recommendations" className="text-sm">
                  包含改进建议
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="action-plan"
                  checked={options.includeActionPlan}
                  onCheckedChange={(checked) =>
                    setOptions(prev => ({ ...prev, includeActionPlan: !!checked }))
                  }
                />
                <Label htmlFor="action-plan" className="text-sm">
                  包含行动计划
                </Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="raw-data"
                  checked={options.includeRawData}
                  onCheckedChange={(checked) =>
                    setOptions(prev => ({ ...prev, includeRawData: !!checked }))
                  }
                />
                <Label htmlFor="raw-data" className="text-sm">
                  包含原始数据
                </Label>
              </div>
            </div>
          </div>

          <Separator />

          {/* 模板预览 */}
          {currentTemplate && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">模板预览</Label>
              <div className="rounded-md border p-4 bg-muted/50">
                <div className="font-medium mb-2">{currentTemplate.name}</div>
                <div className="text-sm text-muted-foreground mb-3">
                  {currentTemplate.description}
                </div>
                <div className="flex flex-wrap gap-1">
                  {currentTemplate.sections.map(section => (
                    <Badge key={section.id} variant="secondary" className="text-xs">
                      {section.name}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 错误提示 */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-destructive/10 text-destructive">
              <XCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {/* 生成进度 */}
          {generationState.isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>{generationState.currentStep}</span>
                <span>{generationState.progress}%</span>
              </div>
              <Progress value={generationState.progress} className="h-2" />
            </div>
          )}

          {/* 操作按钮 */}
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={handleGeneratePreview}
              variant="outline"
              size="sm"
              disabled={generationState.isGenerating}
            >
              <Eye className="w-4 h-4 mr-2" />
              预览报告
            </Button>

            <Button
              onClick={handleGenerateReport}
              disabled={generationState.isGenerating}
              size="sm"
            >
              {generationState.isGenerating ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  生成中...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  生成报告
                </>
              )}
            </Button>

            {generationState.isGenerating && (
              <Button
                onClick={handleCancelGeneration}
                variant="destructive"
                size="sm"
              >
                取消生成
              </Button>
            )}

            <Button
              onClick={handlePrint}
              variant="outline"
              size="sm"
              disabled={!previewData}
            >
              <Printer className="w-4 h-4 mr-2" />
              打印
            </Button>

            <Button
              onClick={() => handleDirectExport('pdf')}
              variant="outline"
              size="sm"
              disabled={!previewData}
            >
              <FileText className="w-4 h-4 mr-2" />
              导出PDF
            </Button>

            <Button
              onClick={() => handleDirectExport('docx')}
              variant="outline"
              size="sm"
              disabled={!previewData}
            >
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              导出Word
            </Button>

            <Button
              onClick={() => handleDirectExport('html')}
              variant="outline"
              size="sm"
              disabled={!previewData}
            >
              <FileImage className="w-4 h-4 mr-2" />
              导出HTML
            </Button>
          </div>

          {/* 生成完成提示 */}
          {generationState.reportUrl && !generationState.isGenerating && (
            <div className="flex items-center gap-2 p-3 rounded-md bg-green-50 text-green-700">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm">报告生成成功！</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 预览模态框 */}
      {showPreview && previewData && (
        <ReportPreview
          previewData={previewData}
          template={currentTemplate}
          onClose={() => setShowPreview(false)}
        />
      )}

      {/* 隐藏的报告内容（用于打印和PDF导出） */}
      {previewData && (
        <div id="report-content" ref={reportRef} className="hidden">
          <div className="document">
            <header className="header">
              <h1>{reportData.title}</h1>
              <p>生成日期：{new Date().toLocaleDateString('zh-CN')}</p>
            </header>
            <main className="content">
              {previewData.sections.map((section: any) => (
                <div key={section.id} className="section">
                  <h2>{section.name}</h2>
                  <div>{section.content}</div>
                </div>
              ))}
            </main>
            <footer className="footer">
              <p>© 2024 AI效率分析系统</p>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}