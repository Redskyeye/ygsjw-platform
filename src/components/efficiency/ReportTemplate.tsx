'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Plus,
  Trash2,
  GripVertical,
  Settings,
  Palette,
  Type,
  Layout,
  Eye,
  Save,
  Copy,
  Edit
} from 'lucide-react';
import {
  ReportTemplate,
  ReportSection,
  TemplateStyling,
  SectionConfig
} from '@/types/efficiency';

interface ReportTemplateBuilderProps {
  template?: ReportTemplate;
  onSave?: (template: ReportTemplate) => void;
  trigger?: React.ReactNode;
}

export function ReportTemplateBuilder({
  template,
  onSave,
  trigger
}: ReportTemplateBuilderProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('content');
  const [previewMode, setPreviewMode] = useState(false);

  const [currentTemplate, setCurrentTemplate] = useState<ReportTemplate>(
    template || {
      id: `template_${Date.now()}`,
      name: '新模板',
      description: '',
      layout: 'standard',
      sections: [
        {
          id: 'executive',
          name: '执行摘要',
          type: 'summary',
          order: 1,
          visible: true,
          config: { title: '执行摘要' }
        }
      ],
      styling: {
        theme: 'professional',
        primaryColor: '#2563eb',
        secondaryColor: '#64748b',
        fontFamily: 'Inter, sans-serif',
        header: {
          title: '效率分析报告',
          showDate: true,
          showAuthor: true
        },
        footer: {
          text: '© 2024 AI效率分析系统',
          showPageNumbers: true
        }
      }
    }
  );

  // 添加新章节
  const addSection = (type: ReportSection['type']) => {
    const newSection: ReportSection = {
      id: `section_${Date.now()}`,
      name: `新${getSectionTypeName(type)}`,
      type,
      order: currentTemplate.sections.length + 1,
      visible: true,
      config: { title: `新${getSectionTypeName(type)}` }
    };

    setCurrentTemplate(prev => ({
      ...prev,
      sections: [...prev.sections, newSection]
    }));
  };

  // 删除章节
  const removeSection = (sectionId: string) => {
    setCurrentTemplate(prev => ({
      ...prev,
      sections: prev.sections.filter(s => s.id !== sectionId)
    }));
  };

  // 更新章节
  const updateSection = (sectionId: string, updates: Partial<ReportSection>) => {
    setCurrentTemplate(prev => ({
      ...prev,
      sections: prev.sections.map(s =>
        s.id === sectionId ? { ...s, ...updates } : s
      )
    }));
  };

  // 移动章节
  const moveSection = (sectionId: string, direction: 'up' | 'down') => {
    const sections = [...currentTemplate.sections];
    const index = sections.findIndex(s => s.id === sectionId);

    if (direction === 'up' && index > 0) {
      [sections[index], sections[index - 1]] = [sections[index - 1], sections[index]];
    } else if (direction === 'down' && index < sections.length - 1) {
      [sections[index], sections[index + 1]] = [sections[index + 1], sections[index]];
    }

    setCurrentTemplate(prev => ({ ...prev, sections }));
  };

  // 更新样式
  const updateStyling = (updates: Partial<TemplateStyling>) => {
    setCurrentTemplate(prev => ({
      ...prev,
      styling: { ...prev.styling, ...updates }
    }));
  };

  // 保存模板
  const handleSave = () => {
    onSave?.(currentTemplate);
    setOpen(false);
  };

  // 复制模板
  const duplicateTemplate = () => {
    const duplicated = {
      ...currentTemplate,
      id: `template_${Date.now()}`,
      name: `${currentTemplate.name} (副本)`
    };
    setCurrentTemplate(duplicated);
  };

  const getSectionTypeName = (type: ReportSection['type']) => {
    const names = {
      summary: '摘要',
      chart: '图表',
      table: '表格',
      text: '文本',
      custom: '自定义'
    };
    return names[type] || type;
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm">
            <Layout className="w-4 h-4 mr-2" />
            自定义模板
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>报告模板编辑器</span>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={duplicateTemplate}
              >
                <Copy className="w-4 h-4 mr-2" />
                复制
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewMode(!previewMode)}
              >
                <Eye className="w-4 h-4 mr-2" />
                {previewMode ? '编辑' : '预览'}
              </Button>
            </div>
          </DialogTitle>
          <DialogDescription>
            自定义报告模板的结构和样式
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="content">内容结构</TabsTrigger>
            <TabsTrigger value="style">样式设置</TabsTrigger>
            <TabsTrigger value="settings">基本设置</TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-4">
            {/* 章节列表 */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">报告章节</Label>
                <div className="flex gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSection('summary')}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    摘要
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSection('chart')}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    图表
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSection('table')}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    表格
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSection('text')}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    文本
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => addSection('custom')}
                  >
                    <Plus className="w-3 h-3 mr-1" />
                    自定义
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                {currentTemplate.sections
                  .sort((a, b) => a.order - b.order)
                  .map((section, index) => (
                    <Card key={section.id} className="p-3">
                      <div className="flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-move" />
                        <Checkbox
                          checked={section.visible}
                          onCheckedChange={(checked) =>
                            updateSection(section.id, { visible: !!checked })
                          }
                        />
                        <div className="flex-1">
                          <Input
                            value={section.name}
                            onChange={(e) =>
                              updateSection(section.id, { name: e.target.value })
                            }
                            className="h-8"
                          />
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {getSectionTypeName(section.type)}
                        </Badge>
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSection(section.id, 'up')}
                            disabled={index === 0}
                          >
                            ↑
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSection(section.id, 'down')}
                            disabled={index === currentTemplate.sections.length - 1}
                          >
                            ↓
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => removeSection(section.id)}
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>

                      {/* 章节配置 */}
                      {section.type === 'chart' && (
                        <div className="mt-3 pl-7 space-y-2">
                          <div className="flex items-center gap-2">
                            <Label className="text-xs">图表类型：</Label>
                            <Select
                              value={section.config.chartType || 'bar'}
                              onValueChange={(value) =>
                                updateSection(section.id, {
                                  config: { ...section.config, chartType: value as any }
                                })
                              }
                            >
                              <SelectTrigger className="w-32 h-7">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="bar">柱状图</SelectItem>
                                <SelectItem value="line">折线图</SelectItem>
                                <SelectItem value="pie">饼图</SelectItem>
                                <SelectItem value="radar">雷达图</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      )}

                      {section.type === 'custom' && (
                        <div className="mt-3 pl-7">
                          <Textarea
                            placeholder="自定义内容模板"
                            value={section.config.customContent || ''}
                            onChange={(e) =>
                              updateSection(section.id, {
                                config: { ...section.config, customContent: e.target.value }
                              })
                            }
                            className="min-h-[60px] text-sm"
                          />
                        </div>
                      )}
                    </Card>
                  ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4">
            <div className="grid grid-cols-2 gap-6">
              {/* 主题设置 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Palette className="w-4 h-4" />
                  <Label className="text-sm font-medium">主题设置</Label>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">主题风格</Label>
                    <Select
                      value={currentTemplate.styling.theme}
                      onValueChange={(value: any) => updateStyling({ theme: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="professional">专业</SelectItem>
                        <SelectItem value="modern">现代</SelectItem>
                        <SelectItem value="light">浅色</SelectItem>
                        <SelectItem value="dark">深色</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-xs">主色调</Label>
                    <Input
                      type="color"
                      value={currentTemplate.styling.primaryColor}
                      onChange={(e) => updateStyling({ primaryColor: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label className="text-xs">辅助色</Label>
                    <Input
                      type="color"
                      value={currentTemplate.styling.secondaryColor}
                      onChange={(e) => updateStyling({ secondaryColor: e.target.value })}
                    />
                  </div>

                  <div>
                    <Label className="text-xs">字体</Label>
                    <Select
                      value={currentTemplate.styling.fontFamily}
                      onValueChange={(value) => updateStyling({ fontFamily: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter, sans-serif">Inter</SelectItem>
                        <SelectItem value="Times New Roman, serif">Times New Roman</SelectItem>
                        <SelectItem value="Arial, sans-serif">Arial</SelectItem>
                        <SelectItem value="Microsoft YaHei, sans-serif">微软雅黑</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 页眉页脚设置 */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-4 h-4" />
                  <Label className="text-sm font-medium">页眉页脚</Label>
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-xs">报告标题</Label>
                    <Input
                      value={currentTemplate.styling.header?.title || ''}
                      onChange={(e) =>
                        updateStyling({
                          header: {
                            ...currentTemplate.styling.header,
                            title: e.target.value
                          }
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label className="text-xs">副标题</Label>
                    <Input
                      value={currentTemplate.styling.header?.subtitle || ''}
                      onChange={(e) =>
                        updateStyling({
                          header: {
                            ...currentTemplate.styling.header,
                            subtitle: e.target.value
                          }
                        })
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-date"
                        checked={currentTemplate.styling.header?.showDate ?? true}
                        onCheckedChange={(checked) =>
                          updateStyling({
                            header: {
                              ...currentTemplate.styling.header,
                              showDate: !!checked
                            }
                          })
                        }
                      />
                      <Label htmlFor="show-date" className="text-xs">显示日期</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-author"
                        checked={currentTemplate.styling.header?.showAuthor ?? true}
                        onCheckedChange={(checked) =>
                          updateStyling({
                            header: {
                              ...currentTemplate.styling.header,
                              showAuthor: !!checked
                            }
                          })
                        }
                      />
                      <Label htmlFor="show-author" className="text-xs">显示作者</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="show-page-numbers"
                        checked={currentTemplate.styling.footer?.showPageNumbers ?? true}
                        onCheckedChange={(checked) =>
                          updateStyling({
                            footer: {
                              ...currentTemplate.styling.footer,
                              showPageNumbers: !!checked
                            }
                          })
                        }
                      />
                      <Label htmlFor="show-page-numbers" className="text-xs">显示页码</Label>
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">页脚文本</Label>
                    <Input
                      value={currentTemplate.styling.footer?.text || ''}
                      onChange={(e) =>
                        updateStyling({
                          footer: {
                            ...currentTemplate.styling.footer,
                            text: e.target.value
                          }
                        })
                      }
                    />
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label className="text-sm font-medium">模板名称</Label>
                <Input
                  value={currentTemplate.name}
                  onChange={(e) =>
                    setCurrentTemplate(prev => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="输入模板名称"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">模板描述</Label>
                <Textarea
                  value={currentTemplate.description}
                  onChange={(e) =>
                    setCurrentTemplate(prev => ({ ...prev, description: e.target.value }))
                  }
                  placeholder="描述此模板的用途和特点"
                  rows={3}
                />
              </div>

              <div>
                <Label className="text-sm font-medium">布局类型</Label>
                <Select
                  value={currentTemplate.layout}
                  onValueChange={(value: any) =>
                    setCurrentTemplate(prev => ({ ...prev, layout: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="standard">标准</SelectItem>
                    <SelectItem value="detailed">详细</SelectItem>
                    <SelectItem value="summary">摘要</SelectItem>
                    <SelectItem value="custom">自定义</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <Separator className="mt-6" />

        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            取消
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            保存模板
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// 模板选择器组件
interface ReportTemplateSelectorProps {
  selectedTemplateId?: string;
  onTemplateSelect: (templateId: string) => void;
  templates: ReportTemplate[];
}

export function ReportTemplateSelector({
  selectedTemplateId,
  onTemplateSelect,
  templates
}: ReportTemplateSelectorProps) {
  const selectedTemplate = templates.find(t => t.id === selectedTemplateId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {templates.map(template => (
        <Card
          key={template.id}
          className={`cursor-pointer transition-all hover:shadow-md ${
            selectedTemplateId === template.id
              ? 'ring-2 ring-primary border-primary'
              : ''
          }`}
          onClick={() => onTemplateSelect(template.id)}
        >
          <CardHeader className="pb-2">
            <CardTitle className="text-base">{template.name}</CardTitle>
            <CardDescription className="text-xs">
              {template.description}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>布局：{template.layout}</span>
                <span>{template.sections.length} 个章节</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {template.sections.slice(0, 3).map(section => (
                  <Badge key={section.id} variant="secondary" className="text-xs">
                    {section.name}
                  </Badge>
                ))}
                {template.sections.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.sections.length - 3}
                  </Badge>
                )}
              </div>
              <div
                className="h-2 rounded-full"
                style={{ backgroundColor: template.styling.primaryColor }}
              />
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}