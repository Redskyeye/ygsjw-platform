'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  FileText,
  Download,
  Eye,
  Settings,
  Loader2,
  CheckCircle,
  XCircle,
  AlertCircle,
  Database,
  BarChart3,
  Search,
  CheckSquare,
  FileSpreadsheet
} from 'lucide-react';
import { ReportGenerator } from './ReportGenerator';
import { ReportTemplateBuilder } from './ReportTemplate';
import { ReportData, ReportTemplate } from '@/types/efficiency';
import { reportService } from '@/lib/efficiency/reportService';

interface ReportIntegrationProps {
  className?: string;
}

export function ReportIntegration({ className }: ReportIntegrationProps) {
  const [activeTab, setActiveTab] = useState('generator');
  const [reportData, setReportData] = useState<ReportData | null>(null);
  const [isGeneratingSample, setIsGeneratingSample] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);

  // 初始化示例数据
  useEffect(() => {
    generateSampleReportData();
    setTemplates(reportService.getDefaultTemplates());
  }, []);

  // 生成示例报告数据
  const generateSampleReportData = async () => {
    setIsGeneratingSample(true);
    setGenerationStatus('loading');
    setGenerationProgress(0);

    try {
      // 模拟数据生成过程
      await new Promise(resolve => setTimeout(resolve, 500));
      setGenerationProgress(20);

      const sampleData: ReportData = {
        id: `report_${Date.now()}`,
        title: '2024年Q1效率分析报告',
        createdAt: new Date(),
        updatedAt: new Date(),
        serviceCategory: {
          id: 'data-analysis',
          name: '数据分析服务',
          description: '提供智能数据处理、统计分析、预测建模等服务',
          icon: 'BarChart3',
          color: 'blue',
          features: ['数据清洗', '统计分析', '预测建模'],
          examples: ['销售数据分析', '用户行为分析'],
          popular: true
        },
        analysisData: {
          fourDAnalysis: {
            domain: '85',
            diagnosis: '78',
            direction: '82',
            development: '88',
            overallScore: 83,
            strengths: ['技术能力强', '团队协作好', '创新能力突出'],
            weaknesses: ['文档不够完善', '响应速度有待提升'],
            opportunities: ['市场扩张', '新技术应用'],
            threats: ['竞争加剧', '人才流失']
          },
          detailedAnalysis: {
            efficiency: 85,
            effectiveness: 82,
            quality: 88,
            speed: 75,
            costOptimization: 79,
            resourceUtilization: 86,
            innovation: 90,
            customerSatisfaction: 84
          },
          metrics: {
            productivity: 85,
            qualityScore: 88,
            timeEfficiency: 75,
            costEfficiency: 79,
            errorRate: 5,
            satisfactionScore: 84,
            utilizationRate: 86
          },
          trends: [
            { period: '2024-01', value: 78, category: '效率', change: 0 },
            { period: '2024-02', value: 82, category: '效率', change: 5.1 },
            { period: '2024-03', value: 85, category: '效率', change: 3.7 }
          ]
        },
        diagnosisData: {
          problems: [
            {
              id: 'p1',
              name: '文档更新不及时',
              description: '技术文档未能跟上产品迭代速度',
              severity: 'medium',
              category: '流程',
              frequency: 5,
              impact: 30
            },
            {
              id: 'p2',
              name: '响应时间过长',
              description: '客户问题响应时间超过SLA要求',
              severity: 'high',
              category: '服务',
              frequency: 8,
              impact: 45
            }
          ],
          rootCauses: [
            {
              problemId: 'p1',
              cause: '缺乏文档管理流程',
              contributingFactors: ['人员变动频繁', '优先级低'],
              evidence: ['文档审核记录', '团队反馈']
            }
          ],
          impact: {
            financial: 25,
            operational: 35,
            customer: 40,
            strategic: 20,
            overall: 30
          },
          priority: {
            urgent: ['响应时间过长'],
            important: ['文档更新不及时'],
            medium: [],
            low: []
          }
        },
        recommendations: [
          {
            id: 'r1',
            title: '建立文档管理制度',
            description: '制定文档更新流程，明确责任人，定期审核',
            category: '流程优化',
            priority: 'high',
            effort: 'medium',
            impact: 'high',
            timeline: '1个月',
            resources: ['技术文档', '项目经理'],
            expectedOutcome: '文档更新及时率达到95%以上',
            status: 'pending'
          },
          {
            id: 'r2',
            title: '优化客服响应流程',
            description: '引入智能客服系统，建立分级响应机制',
            category: '服务改进',
            priority: 'high',
            effort: 'high',
            impact: 'high',
            timeline: '2个月',
            resources: ['客服团队', '技术支持', '预算'],
            expectedOutcome: '响应时间缩短50%',
            status: 'pending'
          },
          {
            id: 'r3',
            title: '定期技能培训',
            description: '组织专业技能培训，提升团队整体能力',
            category: '人员发展',
            priority: 'medium',
            effort: 'medium',
            impact: 'medium',
            timeline: '3个月',
            resources: ['培训预算', '培训师'],
            expectedOutcome: '团队技能评分提升15%',
            status: 'pending'
          }
        ],
        executiveSummary: `
本报告对2024年Q1的服务效率进行了全面分析。整体效率评分为83分，表现良好。
主要优势包括技术能力强、团队协作好和创新能力突出。
需要改进的领域主要集中在文档管理和响应速度方面。
建议优先实施文档管理制度和客服响应流程优化，预计可将整体效率提升至90分以上。
        `.trim()
      };

      setGenerationProgress(50);
      await new Promise(resolve => setTimeout(resolve, 500));
      setGenerationProgress(80);

      setReportData(sampleData);
      setGenerationProgress(100);
      setGenerationStatus('success');

      setTimeout(() => {
        setGenerationStatus('idle');
        setGenerationProgress(0);
      }, 2000);

    } catch (error) {
      setGenerationStatus('error');
      setErrorMessage('生成示例数据失败');
      console.error('生成示例数据失败:', error);
    } finally {
      setIsGeneratingSample(false);
    }
  };

  // 处理报告生成完成
  const handleReportGenerated = (reportUrl: string) => {
    console.log('报告生成成功:', reportUrl);
    // 可以在这里添加成功提示或其他处理
  };

  // 处理模板保存
  const handleTemplateSave = (template: ReportTemplate) => {
    setTemplates(prev => [...prev, template]);
    console.log('模板已保存:', template);
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 标题和描述 */}
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">报告生成集成系统</h1>
        <p className="text-muted-foreground">
          整合所有分析模块，生成专业的效率分析报告
        </p>
      </div>

      {/* 状态提示 */}
      {generationStatus === 'loading' && (
        <Alert>
          <Loader2 className="h-4 w-4 animate-spin" />
          <AlertTitle>正在生成示例数据</AlertTitle>
          <AlertDescription>
            <Progress value={generationProgress} className="mt-2" />
            <p className="text-sm mt-1">进度: {generationProgress}%</p>
          </AlertDescription>
        </Alert>
      )}

      {generationStatus === 'success' && (
        <Alert>
          <CheckCircle className="h-4 w-4 text-green-600" />
          <AlertTitle>示例数据生成成功</AlertTitle>
          <AlertDescription>
            已成功生成完整的效率分析示例数据，可以开始生成报告。
          </AlertDescription>
        </Alert>
      )}

      {generationStatus === 'error' && (
        <Alert variant="destructive">
          <XCircle className="h-4 w-4" />
          <AlertTitle>生成失败</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {/* 主要内容 */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="generator">报告生成器</TabsTrigger>
          <TabsTrigger value="template">模板管理</TabsTrigger>
          <TabsTrigger value="integration">集成展示</TabsTrigger>
          <TabsTrigger value="data">数据查看</TabsTrigger>
        </TabsList>

        {/* 报告生成器 */}
        <TabsContent value="generator" className="space-y-4">
          {reportData ? (
            <ReportGenerator
              reportData={reportData}
              onReportGenerated={handleReportGenerated}
            />
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <FileText className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">需要先生成示例数据</p>
                <Button onClick={generateSampleReportData} disabled={isGeneratingSample}>
                  {isGeneratingSample ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      生成中...
                    </>
                  ) : (
                    '生成示例数据'
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* 模板管理 */}
        <TabsContent value="template" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">报告模板</h2>
            <ReportTemplateBuilder onSave={handleTemplateSave} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {templates.map(template => (
              <Card key={template.id}>
                <CardHeader>
                  <CardTitle className="text-base">{template.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {template.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>布局: {template.layout}</span>
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
                      className="h-2 rounded-full mt-2"
                      style={{ backgroundColor: template.styling.primaryColor }}
                    />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* 集成展示 */}
        <TabsContent value="integration" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 服务类别模块 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  服务类别
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  智能识别和分析AI服务类别
                </p>
                <Badge variant="secondary">数据分析服务</Badge>
              </CardContent>
            </Card>

            {/* 批量文件处理 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4" />
                  批量文件处理
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  高效处理多文件数据
                </p>
                <Badge variant="secondary">已处理 15 个文件</Badge>
              </CardContent>
            </Card>

            {/* 4D分析 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <BarChart3 className="w-4 h-4" />
                  4D分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  多维度深度分析
                </p>
                <Badge variant="secondary">综合评分: 83</Badge>
              </CardContent>
            </Card>

            {/* 两阶段分析 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  两阶段分析
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  深度问题诊断
                </p>
                <Badge variant="secondary">识别 2 个问题</Badge>
              </CardContent>
            </Card>

            {/* 问题确认 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <CheckSquare className="w-4 h-4" />
                  问题确认
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  AI辅助问题验证
                </p>
                <Badge variant="secondary">准确率 95%</Badge>
              </CardContent>
            </Card>

            {/* 报告生成 */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  报告生成
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">
                  整合所有分析结果
                </p>
                <Badge variant="secondary">支持多格式导出</Badge>
              </CardContent>
            </Card>
          </div>

          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>系统集成说明</AlertTitle>
            <AlertDescription>
              报告生成系统已成功整合所有分析模块，能够自动收集和整合来自各个模块的数据，
              生成包含执行摘要、4D分析结果、详细数据、问题诊断和改进建议的完整报告。
            </AlertDescription>
          </Alert>
        </TabsContent>

        {/* 数据查看 */}
        <TabsContent value="integration" className="space-y-4">
          {reportData ? (
            <div className="space-y-4">
              {/* 基本信息卡片 */}
              <Card>
                <CardHeader>
                  <CardTitle>报告基本信息</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">报告标题</p>
                      <p className="font-medium">{reportData.title}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">服务类别</p>
                      <p className="font-medium">{reportData.serviceCategory.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">创建时间</p>
                      <p className="font-medium">{reportData.createdAt.toLocaleDateString('zh-CN')}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">综合评分</p>
                      <p className="font-medium">{reportData.analysisData.fourDAnalysis.overallScore}/100</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 4D分析结果 */}
              <Card>
                <CardHeader>
                  <CardTitle>4D分析结果</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600">
                        {reportData.analysisData.fourDAnalysis.domain}
                      </div>
                      <p className="text-sm text-muted-foreground">领域(Domain)</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600">
                        {reportData.analysisData.fourDAnalysis.diagnosis}
                      </div>
                      <p className="text-sm text-muted-foreground">诊断(Diagnosis)</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-orange-600">
                        {reportData.analysisData.fourDAnalysis.direction}
                      </div>
                      <p className="text-sm text-muted-foreground">方向(Direction)</p>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600">
                        {reportData.analysisData.fourDAnalysis.development}
                      </div>
                      <p className="text-sm text-muted-foreground">发展(Development)</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 改进建议 */}
              <Card>
                <CardHeader>
                  <CardTitle>改进建议</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {reportData.recommendations.map(rec => (
                      <div key={rec.id} className="p-3 rounded-lg border">
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{rec.title}</h4>
                          <div className="flex gap-1">
                            <Badge variant={rec.priority === 'high' ? 'destructive' : 'secondary'}>
                              {rec.priority}
                            </Badge>
                            <Badge variant="outline">{rec.impact}</Badge>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">{rec.description}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Database className="w-12 h-12 text-muted-foreground mb-4" />
                <p className="text-muted-foreground mb-4">暂无数据</p>
                <Button onClick={generateSampleReportData} disabled={isGeneratingSample}>
                  生成示例数据
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}