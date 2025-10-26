import {
  ReportData,
  ReportTemplate,
  ReportGenerationOptions,
  ReportGenerationState,
  ReportPreviewData,
  AnalysisData,
  DiagnosisData,
  Recommendation,
  ReportSection
} from '@/types/efficiency';

export class ReportService {
  private static instance: ReportService;
  private generationCallbacks: Map<string, (state: ReportGenerationState) => void> = new Map();

  static getInstance(): ReportService {
    if (!ReportService.instance) {
      ReportService.instance = new ReportService();
    }
    return ReportService.instance;
  }

  // 获取默认报告模板
  getDefaultTemplates(): ReportTemplate[] {
    return [
      {
        id: 'standard',
        name: '标准报告',
        description: '包含所有分析结果的标准效率报告',
        layout: 'standard',
        sections: [
          { id: 'executive', name: '执行摘要', type: 'summary', order: 1, visible: true, config: { title: '执行摘要' } },
          { id: '4d-analysis', name: '4D分析', type: 'chart', order: 2, visible: true, config: { title: '4D分析结果', showCharts: true, chartType: 'radar' } },
          { id: 'metrics', name: '性能指标', type: 'table', order: 3, visible: true, config: { title: '详细性能指标' } },
          { id: 'diagnosis', name: '问题诊断', type: 'text', order: 4, visible: true, config: { title: '问题诊断结果' } },
          { id: 'recommendations', name: '改进建议', type: 'custom', order: 5, visible: true, config: { title: '改进建议' } },
          { id: 'action-plan', name: '行动计划', type: 'custom', order: 6, visible: true, config: { title: '行动计划' } }
        ],
        styling: {
          theme: 'professional',
          primaryColor: '#2563eb',
          secondaryColor: '#64748b',
          fontFamily: 'Inter, sans-serif',
          header: {
            title: '效率分析报告',
            subtitle: 'AI赋能职业规划师平台',
            showDate: true,
            showAuthor: true
          },
          footer: {
            text: '© 2024 AI赋能职业规划师平台',
            showPageNumbers: true,
            showSignature: false
          }
        }
      },
      {
        id: 'summary',
        name: '摘要报告',
        description: '简洁的执行摘要报告',
        layout: 'summary',
        sections: [
          { id: 'executive', name: '执行摘要', type: 'summary', order: 1, visible: true, config: { title: '执行摘要' } },
          { id: 'key-findings', name: '关键发现', type: 'chart', order: 2, visible: true, config: { title: '关键发现', showCharts: true } },
          { id: 'top-recommendations', name: '重点建议', type: 'custom', order: 3, visible: true, config: { title: '前三项改进建议' } }
        ],
        styling: {
          theme: 'modern',
          primaryColor: '#059669',
          secondaryColor: '#94a3b8',
          fontFamily: 'Inter, sans-serif'
        }
      },
      {
        id: 'detailed',
        name: '详细报告',
        description: '包含所有数据和详细分析的完整报告',
        layout: 'detailed',
        sections: [
          { id: 'executive', name: '执行摘要', type: 'summary', order: 1, visible: true, config: { title: '执行摘要' } },
          { id: 'methodology', name: '分析方法', type: 'text', order: 2, visible: true, config: { title: '分析方法论' } },
          { id: '4d-analysis', name: '4D分析', type: 'chart', order: 3, visible: true, config: { title: '4D分析结果', showCharts: true } },
          { id: 'detailed-metrics', name: '详细指标', type: 'table', order: 4, visible: true, config: { title: '所有性能指标' } },
          { id: 'trends', name: '趋势分析', type: 'chart', order: 5, visible: true, config: { title: '趋势分析', showCharts: true, chartType: 'line' } },
          { id: 'diagnosis', name: '问题诊断', type: 'text', order: 6, visible: true, config: { title: '问题诊断' } },
          { id: 'root-cause', name: '根因分析', type: 'text', order: 7, visible: true, config: { title: '根本原因分析' } },
          { id: 'impact', name: '影响评估', type: 'chart', order: 8, visible: true, config: { title: '影响评估', showCharts: true, chartType: 'pie' } },
          { id: 'recommendations', name: '改进建议', type: 'custom', order: 9, visible: true, config: { title: '详细改进建议' } },
          { id: 'action-plan', name: '行动计划', type: 'custom', order: 10, visible: true, config: { title: '具体行动计划' } },
          { id: 'appendix', name: '附录', type: 'custom', order: 11, visible: true, config: { title: '原始数据附录' } }
        ],
        styling: {
          theme: 'professional',
          primaryColor: '#1e40af',
          secondaryColor: '#475569',
          fontFamily: 'Times New Roman, serif'
        }
      }
    ];
  }

  // 生成报告预览
  async generatePreview(reportData: ReportData, template: ReportTemplate): Promise<ReportPreviewData> {
    const sections = await Promise.all(
      template.sections
        .filter(section => section.visible)
        .map(section => this.generateSectionPreview(section, reportData))
    );

    return {
      sections,
      metadata: {
        title: reportData.title,
        author: 'AI效率分析系统',
        createdAt: new Date(),
        totalPages: sections.length,
        version: '1.0'
      }
    };
  }

  // 生成章节预览
  private async generateSectionPreview(section: ReportSection, reportData: ReportData): Promise<any> {
    const { type, config } = section;

    switch (type) {
      case 'summary':
        return {
          id: section.id,
          name: section.name,
          content: reportData.executiveSummary,
          type: 'summary',
          order: section.order
        };

      case 'chart':
        return {
          id: section.id,
          name: section.name,
          content: this.generateChartData(section, reportData),
          type: 'chart',
          order: section.order,
          chartType: config.chartType || 'bar'
        };

      case 'table':
        return {
          id: section.id,
          name: section.name,
          content: this.generateTableData(section, reportData),
          type: 'table',
          order: section.order
        };

      case 'text':
        return {
          id: section.id,
          name: section.name,
          content: this.generateTextContent(section, reportData),
          type: 'text',
          order: section.order
        };

      case 'custom':
        return {
          id: section.id,
          name: section.name,
          content: this.generateCustomContent(section, reportData),
          type: 'custom',
          order: section.order
        };

      default:
        return {
          id: section.id,
          name: section.name,
          content: '',
          type: 'text',
          order: section.order
        };
    }
  }

  // 生成图表数据
  private generateChartData(section: ReportSection, reportData: ReportData): any {
    const { chartType } = section.config;

    switch (section.id) {
      case '4d-analysis':
        return {
          labels: ['领域(Domain)', '诊断(Diagnosis)', '方向(Direction)', '发展(Development)'],
          datasets: [{
            label: '4D分析得分',
            data: [
              reportData.analysisData.fourDAnalysis.domain || 0,
              reportData.analysisData.fourDAnalysis.diagnosis || 0,
              reportData.analysisData.fourDAnalysis.direction || 0,
              reportData.analysisData.fourDAnalysis.development || 0
            ],
            backgroundColor: ['rgba(37, 99, 235, 0.5)', 'rgba(16, 185, 129, 0.5)', 'rgba(251, 146, 60, 0.5)', 'rgba(147, 51, 234, 0.5)']
          }]
        };

      case 'trends':
        return {
          labels: reportData.analysisData.trends.map(t => t.period),
          datasets: [{
            label: '效率趋势',
            data: reportData.analysisData.trends.map(t => t.value),
            borderColor: 'rgb(59, 130, 246)',
            backgroundColor: 'rgba(59, 130, 246, 0.1)',
            tension: 0.4
          }]
        };

      case 'impact':
        return {
          labels: ['财务影响', '运营影响', '客户影响', '战略影响'],
          datasets: [{
            data: [
              reportData.diagnosisData.impact.financial,
              reportData.diagnosisData.impact.operational,
              reportData.diagnosisData.impact.customer,
              reportData.diagnosisData.impact.strategic
            ],
            backgroundColor: ['#ef4444', '#f59e0b', '#10b981', '#3b82f6']
          }]
        };

      default:
        return {
          labels: [],
          datasets: []
        };
    }
  }

  // 生成表格数据
  private generateTableData(section: ReportSection, reportData: ReportData): any {
    switch (section.id) {
      case 'metrics':
        return {
          headers: ['指标', '得分', '评级'],
          rows: [
            ['生产效率', `${reportData.analysisData.metrics.productivity}%`, this.getGrade(reportData.analysisData.metrics.productivity)],
            ['质量得分', `${reportData.analysisData.metrics.qualityScore}%`, this.getGrade(reportData.analysisData.metrics.qualityScore)],
            ['时间效率', `${reportData.analysisData.metrics.timeEfficiency}%`, this.getGrade(reportData.analysisData.metrics.timeEfficiency)],
            ['成本效率', `${reportData.analysisData.metrics.costEfficiency}%`, this.getGrade(reportData.analysisData.metrics.costEfficiency)],
            ['错误率', `${reportData.analysisData.metrics.errorRate}%`, this.getGrade(100 - reportData.analysisData.metrics.errorRate)],
            ['满意度', `${reportData.analysisData.metrics.satisfactionScore}%`, this.getGrade(reportData.analysisData.metrics.satisfactionScore)],
            ['利用率', `${reportData.analysisData.metrics.utilizationRate}%`, this.getGrade(reportData.analysisData.metrics.utilizationRate)]
          ]
        };

      case 'detailed-metrics':
        return {
          headers: ['维度', '得分', '说明'],
          rows: [
            ['效率', `${reportData.analysisData.detailedAnalysis.efficiency}/100`, '工作效率评估'],
            ['效果', `${reportData.analysisData.detailedAnalysis.effectiveness}/100`, '目标达成度'],
            ['质量', `${reportData.analysisData.detailedAnalysis.quality}/100`, '工作质量评估'],
            ['速度', `${reportData.analysisData.detailedAnalysis.speed}/100`, '响应速度评估'],
            ['成本优化', `${reportData.analysisData.detailedAnalysis.costOptimization}/100`, '成本控制能力'],
            ['资源利用', `${reportData.analysisData.detailedAnalysis.resourceUtilization}/100`, '资源使用效率'],
            ['创新', `${reportData.analysisData.detailedAnalysis.innovation}/100`, '创新能力评估'],
            ['客户满意度', `${reportData.analysisData.detailedAnalysis.customerSatisfaction}/100`, '客户满意度水平']
          ]
        };

      default:
        return {
          headers: [],
          rows: []
        };
    }
  }

  // 生成文本内容
  private generateTextContent(section: ReportSection, reportData: ReportData): string {
    switch (section.id) {
      case 'methodology':
        return `
本报告采用4D分析法（Domain领域、Diagnosis诊断、Direction方向、Development发展），
结合两阶段分析模型，对服务效率进行全面评估。

分析方法包括：
1. 数据收集与整理
2. 4D维度分析
3. 性能指标计算
4. 问题识别与诊断
5. 根因分析
6. 改进建议制定
        `.trim();

      case 'diagnosis':
        return `
识别出的问题：
${reportData.diagnosisData.problems.map(p => `- ${p.name} (${p.severity})`).join('\n')}

主要影响：
- 财务影响：${reportData.diagnosisData.impact.financial}%
- 运营影响：${reportData.diagnosisData.impact.operational}%
- 客户影响：${reportData.diagnosisData.impact.customer}%
- 战略影响：${reportData.diagnosisData.impact.strategic}%
        `.trim();

      case 'root-cause':
        return `
根本原因分析：

${reportData.diagnosisData.rootCauses.map(rc => `
问题：${rc.problemId}
根本原因：${rc.cause}
影响因素：
${rc.contributingFactors.map(f => `- ${f}`).join('\n')}
证据：
${rc.evidence.map(e => `- ${e}`).join('\n')}
`).join('\n')}
        `.trim();

      default:
        return '内容生成中...';
    }
  }

  // 生成自定义内容
  private generateCustomContent(section: ReportSection, reportData: ReportData): string {
    switch (section.id) {
      case 'recommendations':
        return `
改进建议：

${reportData.recommendations.map(r => `
## ${r.title}
**优先级：** ${r.priority} | **投入：** ${r.effort} | **影响：** ${r.impact}
**时间线：** ${r.timeline}

${r.description}

预期成果：${r.expectedOutcome}
所需资源：${r.resources.join(', ')}
`).join('\n')}
        `.trim();

      case 'action-plan':
        const highPriority = reportData.recommendations.filter(r => r.priority === 'high').slice(0, 3);
        return `
行动计划（优先级排序）：

${highPriority.map((r, index) => `
### 步骤 ${index + 1}：${r.title}
- **时间线：** ${r.timeline}
- **负责人：** 待分配
- **关键行动：**
  1. 实施改进措施
  2. 监控进展
  3. 评估效果
  4. 持续优化
- **成功指标：** ${r.expectedOutcome}
`).join('\n')}
        `.trim();

      case 'top-recommendations':
        const top3 = reportData.recommendations
          .sort((a, b) => {
            const scoreA = this.getPriorityScore(a.priority) * this.getImpactScore(a.impact);
            const scoreB = this.getPriorityScore(b.priority) * this.getImpactScore(b.impact);
            return scoreB - scoreA;
          })
          .slice(0, 3);

        return `
前三项重点建议：

${top3.map((r, index) => `
${index + 1}. **${r.title}** (${r.priority}优先级)
   ${r.description}
   预期影响：${r.impact}
`).join('\n')}
        `.trim();

      case 'key-findings':
        return `
关键发现：

1. **综合评分：** ${reportData.analysisData.fourDAnalysis.overallScore}/100
2. **主要优势：** ${reportData.analysisData.fourDAnalysis.strengths.join(', ')}
3. **待改进领域：** ${reportData.analysisData.fourDAnalysis.weaknesses.join(', ')}
4. **发展机会：** ${reportData.analysisData.fourDAnalysis.opportunities.join(', ')}
5. **潜在威胁：** ${reportData.analysisData.fourDAnalysis.threats.join(', ')}
        `.trim();

      case 'appendix':
        return `
原始数据附录：

- 服务类别：${reportData.serviceCategory.name}
- 分析日期：${reportData.createdAt.toLocaleDateString('zh-CN')}
- 数据来源：AI效率分析系统
- 分析版本：v1.0

详细数据请参考原始分析文件。
        `.trim();

      default:
        return '自定义内容生成中...';
    }
  }

  // 生成完整报告
  async generateReport(
    reportData: ReportData,
    options: ReportGenerationOptions,
    onProgress?: (state: ReportGenerationState) => void
  ): Promise<{ taskId: string }> {
    const taskId = `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 保存进度回调
    if (onProgress) {
      this.generationCallbacks.set(taskId, onProgress);
    }

    // 启动异步报告生成
    this.processReportGeneration(taskId, reportData, options);

    return { taskId };
  }

  // 处理报告生成（异步）
  private async processReportGeneration(
    taskId: string,
    reportData: ReportData,
    options: ReportGenerationOptions
  ): Promise<void> {
    const updateProgress = (progress: number, step: string) => {
      const callback = this.generationCallbacks.get(taskId);
      if (callback) {
        callback({
          isGenerating: true,
          progress,
          currentStep: step,
          taskId
        });
      }
    };

    try {
      // 步骤1：准备数据
      updateProgress(10, '准备报告数据...');
      await this.delay(500);

      // 步骤2：生成模板
      updateProgress(20, '应用报告模板...');
      const template = this.getDefaultTemplates().find(t => t.id === options.templateId) || this.getDefaultTemplates()[0];
      await this.delay(500);

      // 步骤3：生成内容
      updateProgress(40, '生成报告内容...');
      const reportContent = await this.generateFullReportContent(reportData, template, options);
      await this.delay(1000);

      // 步骤4：格式化报告
      updateProgress(70, `格式化为${options.format.toUpperCase()}格式...`);
      let reportUrl: string;

      switch (options.format) {
        case 'pdf':
          reportUrl = await this.generatePDF(reportContent, template);
          break;
        case 'docx':
          reportUrl = await this.generateDOCX(reportContent, template);
          break;
        case 'html':
          reportUrl = await this.generateHTML(reportContent, template);
          break;
        case 'json':
          reportUrl = await this.generateJSON(reportData, template);
          break;
        default:
          throw new Error(`不支持的格式：${options.format}`);
      }

      await this.delay(500);

      // 步骤5：完成
      updateProgress(100, '报告生成完成！');

      const callback = this.generationCallbacks.get(taskId);
      if (callback) {
        callback({
          isGenerating: false,
          progress: 100,
          currentStep: '完成',
          reportUrl,
          taskId
        });
      }

      // 清理回调
      this.generationCallbacks.delete(taskId);

    } catch (error) {
      const callback = this.generationCallbacks.get(taskId);
      if (callback) {
        callback({
          isGenerating: false,
          progress: 0,
          currentStep: '错误',
          error: error instanceof Error ? error.message : '生成报告时发生未知错误',
          taskId
        });
      }
      this.generationCallbacks.delete(taskId);
    }
  }

  // 生成完整报告内容
  private async generateFullReportContent(
    reportData: ReportData,
    template: ReportTemplate,
    options: ReportGenerationOptions
  ): Promise<any> {
    const sections = [];

    for (const section of template.sections) {
      if (!section.visible) continue;

      const sectionData = await this.generateSectionPreview(section, reportData);
      sections.push(sectionData);
    }

    return {
      metadata: {
        title: reportData.title,
        subtitle: template.styling.header?.subtitle || '效率分析报告',
        author: 'AI效率分析系统',
        createdAt: reportData.createdAt,
        updatedAt: reportData.updatedAt,
        version: '1.0',
        logo: template.styling.logo
      },
      sections,
      styling: template.styling,
      options
    };
  }

  // 生成PDF（模拟）
  private async generatePDF(content: any, template: ReportTemplate): Promise<string> {
    // 实际实现应使用pdf-lib或jspdf等库
    // 这里返回模拟的URL
    return `/api/reports/download/${Date.now()}.pdf`;
  }

  // 生成DOCX（模拟）
  private async generateDOCX(content: any, template: ReportTemplate): Promise<string> {
    // 实际实现应使用docx库
    return `/api/reports/download/${Date.now()}.docx`;
  }

  // 生成HTML
  private async generateHTML(content: any, template: ReportTemplate): Promise<string> {
    const html = `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${content.metadata.title}</title>
    <style>
        body {
            font-family: ${template.styling.fontFamily};
            color: #333;
            line-height: 1.6;
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        .header {
            text-align: center;
            margin-bottom: 40px;
            padding-bottom: 20px;
            border-bottom: 2px solid ${template.styling.primaryColor};
        }
        .header h1 {
            color: ${template.styling.primaryColor};
            margin-bottom: 10px;
        }
        .section {
            margin-bottom: 30px;
        }
        .section h2 {
            color: ${template.styling.primaryColor};
            margin-bottom: 15px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
        }
        th, td {
            border: 1px solid #ddd;
            padding: 12px;
            text-align: left;
        }
        th {
            background-color: ${template.styling.primaryColor};
            color: white;
        }
        .footer {
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px solid #ddd;
            text-align: center;
            color: #666;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${content.metadata.title}</h1>
        <p>${content.metadata.subtitle}</p>
        <p>生成日期：${content.metadata.createdAt.toLocaleDateString('zh-CN')}</p>
    </div>

    ${content.sections.map((section: any) => `
    <div class="section">
        <h2>${section.name}</h2>
        <div>${this.renderSectionContent(section)}</div>
    </div>
    `).join('')}

    <div class="footer">
        <p>${template.styling.footer?.text || '© 2024 AI效率分析系统'}</p>
    </div>
</body>
</html>`;

    // 保存HTML文件并返回URL
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    return url;
  }

  // 生成JSON
  private async generateJSON(reportData: ReportData, template: ReportTemplate): Promise<string> {
    const json = JSON.stringify({
      metadata: {
        title: reportData.title,
        createdAt: reportData.createdAt,
        template: template.name
      },
      data: reportData
    }, null, 2);

    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    return url;
  }

  // 渲染章节内容
  private renderSectionContent(section: any): string {
    switch (section.type) {
      case 'text':
      case 'custom':
        return `<div style="white-space: pre-line;">${section.content}</div>`;

      case 'summary':
        return `<div class="summary">${section.content}</div>`;

      case 'table':
        if (!section.content.headers || !section.content.rows) {
          return '<p>暂无数据</p>';
        }
        return `
        <table>
          <thead>
            <tr>
              ${section.content.headers.map((h: string) => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${section.content.rows.map((row: string[]) =>
              `<tr>${row.map(cell => `<td>${cell}</td>`).join('')}</tr>`
            ).join('')}
          </tbody>
        </table>`;

      case 'chart':
        return `<div class="chart-placeholder">
          <p>图表：${section.name}</p>
          <p>图表类型：${section.chartType}</p>
        </div>`;

      default:
        return '<p>内容加载中...</p>';
    }
  }

  // 获取评级
  private getGrade(score: number): string {
    if (score >= 90) return '优秀';
    if (score >= 80) return '良好';
    if (score >= 70) return '中等';
    if (score >= 60) return '及格';
    return '不及格';
  }

  // 获取优先级分数
  private getPriorityScore(priority: string): number {
    switch (priority) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  // 获取影响分数
  private getImpactScore(impact: string): number {
    switch (impact) {
      case 'high': return 3;
      case 'medium': return 2;
      case 'low': return 1;
      default: return 0;
    }
  }

  // 延迟函数
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  // 通过N8N webhook生成报告
  async generateReportViaWebhook(
    reportData: ReportData,
    options: ReportGenerationOptions
  ): Promise<{ webhookUrl: string; taskId: string }> {
    const taskId = `webhook_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // 准备webhook数据
    const webhookData = {
      taskId,
      reportData: {
        ...reportData,
        createdAt: reportData.createdAt.toISOString(),
        updatedAt: reportData.updatedAt.toISOString()
      },
      options,
      webhookUrl: `${process.env.NEXT_PUBLIC_API_URL}/api/reports/webhook/complete`
    };

    // 调用N8N webhook
    const response = await fetch(`${process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL}/efficiency-report`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.N8N_WEBHOOK_TOKEN}`
      },
      body: JSON.stringify(webhookData)
    });

    if (!response.ok) {
      throw new Error('Failed to trigger report generation via webhook');
    }

    const result = await response.json();

    return {
      webhookUrl: result.webhookUrl,
      taskId
    };
  }

  // 取消报告生成
  cancelReportGeneration(taskId: string): void {
    const callback = this.generationCallbacks.get(taskId);
    if (callback) {
      callback({
        isGenerating: false,
        progress: 0,
        currentStep: '已取消',
        error: '用户取消了报告生成',
        taskId
      });
      this.generationCallbacks.delete(taskId);
    }
  }
}

// 导出单例实例
export const reportService = ReportService.getInstance();