---
created: 2025-10-26T08:00:00Z
last_updated: 2025-10-26T08:00:00Z
version: 1.0
author: Claude Code PM System
---

import {
  ParsedResume,
  OptimizedResume,
  OptimizationRecord,
  OptimizationConfig,
  EvaluationReport,
  VersionComparison
} from '../../types/optimizer';

/**
 * 优化历史管理器
 * 管理简历优化历史、版本对比和恢复功能
 */
export class OptimizationHistory {
  private records: Map<string, OptimizationRecord[]> = new Map();
  private maxVersionsPerResume: number = 10;

  async saveOptimization(
    originalId: string,
    optimizedResume: OptimizedResume,
    config: OptimizationConfig,
    evaluation: EvaluationReport
  ): Promise<OptimizationRecord> {
    const record: OptimizationRecord = {
      id: this.generateId(),
      originalId,
      timestamp: new Date(),
      config,
      result: optimizedResume,
      evaluation,
      version: await this.getNextVersion(originalId)
    };

    // 获取或创建记录列表
    const records = this.records.get(originalId) || [];

    // 添加新记录
    records.push(record);

    // 限制版本数量
    if (records.length > this.maxVersionsPerResume) {
      records.shift(); // 删除最旧的版本
    }

    // 保存记录
    this.records.set(originalId, records);

    // 持久化到存储（实际实现）
    await this.persistRecord(record);

    return record;
  }

  async getOptimizationHistory(originalId: string): Promise<OptimizationRecord[]> {
    // 从内存获取
    let records = this.records.get(originalId) || [];

    // 如果内存中没有，从存储加载
    if (records.length === 0) {
      records = await this.loadRecords(originalId);
      this.records.set(originalId, records);
    }

    // 按时间倒序排列
    return records.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  async getOptimizationRecord(recordId: string): Promise<OptimizationRecord | null> {
    // 遍历所有记录查找
    for (const [_, records] of this.records.entries()) {
      const record = records.find(r => r.id === recordId);
      if (record) return record;
    }

    // 如果内存中没有，从存储查找
    return await this.loadRecord(recordId);
  }

  async compareVersions(
    version1Id: string,
    version2Id: string
  ): Promise<VersionComparison> {
    const [version1, version2] = await Promise.all([
      this.getOptimizationRecord(version1Id),
      this.getOptimizationRecord(version2Id)
    ]);

    if (!version1 || !version2) {
      throw new Error('版本不存在');
    }

    if (version1.originalId !== version2.originalId) {
      throw new Error('只能比较同一简历的不同版本');
    }

    const comparison: VersionComparison = {
      version1: {
        id: version1.id,
        timestamp: version1.timestamp,
        score: version1.evaluation.overallScore
      },
      version2: {
        id: version2.id,
        timestamp: version2.timestamp,
        score: version2.evaluation.overallScore
      },
      differences: await this.analyzeDifferences(version1.result, version2.result),
      improvements: this.identifyImprovements(version1, version2),
      regressions: this.identifyRegressions(version1, version2)
    };

    return comparison;
  }

  async restoreVersion(originalId: string, versionId: string): Promise<OptimizedResume> {
    const record = await this.getOptimizationRecord(versionId);

    if (!record) {
      throw new Error('版本不存在');
    }

    if (record.originalId !== originalId) {
      throw new Error('版本不属于指定简历');
    }

    // 创建恢复记录
    await this.createRestoreRecord(originalId, versionId);

    return record.result;
  }

  async deleteVersion(originalId: string, versionId: string): Promise<void> {
    const records = this.records.get(originalId) || [];
    const index = records.findIndex(r => r.id === versionId);

    if (index === -1) {
      throw new Error('版本不存在');
    }

    // 从内存删除
    records.splice(index, 1);
    this.records.set(originalId, records);

    // 从存储删除
    await this.deleteRecordFromStorage(versionId);
  }

  async getOptimizationStatistics(originalId: string): Promise<{
    totalVersions: number;
    averageScore: number;
    bestVersion: OptimizationRecord | null;
    recentActivity: OptimizationRecord[];
    scoreProgression: Array<{ date: Date; score: number }>;
    optimizationFrequency: Record<string, number>;
  }> {
    const records = await this.getOptimizationHistory(originalId);

    if (records.length === 0) {
      return {
        totalVersions: 0,
        averageScore: 0,
        bestVersion: null,
        recentActivity: [],
        scoreProgression: [],
        optimizationFrequency: {}
      };
    }

    // 计算平均分
    const averageScore = Math.round(
      records.reduce((sum, r) => sum + r.evaluation.overallScore, 0) / records.length
    );

    // 找出最佳版本
    const bestVersion = records.reduce((best, current) =>
      current.evaluation.overallScore > best.evaluation.overallScore ? current : best
    );

    // 最近活动
    const recentActivity = records.slice(0, 5);

    // 分数进展
    const scoreProgression = records
      .sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      .map(r => ({
        date: r.timestamp,
        score: r.evaluation.overallScore
      }));

    // 优化频率
    const optimizationFrequency = records.reduce((freq, record) => {
      const mode = record.config.mode;
      freq[mode] = (freq[mode] || 0) + 1;
      return freq;
    }, {} as Record<string, number>);

    return {
      totalVersions: records.length,
      averageScore,
      bestVersion,
      recentActivity,
      scoreProgression,
      optimizationFrequency
    };
  }

  async getOptimizationTimeline(originalId: string): Promise<{
    versions: Array<{
      id: string;
      version: number;
      timestamp: Date;
      mode: string;
      score: number;
      improvements: string[];
      changes: string[];
    }>;
    milestones: Array<{
      date: Date;
      type: 'best_score' | 'mode_change' | 'major_improvement';
      description: string;
    }>;
  }> {
    const records = await this.getOptimizationHistory(originalId);
    const versions = records.map(record => ({
      id: record.id,
      version: record.version,
      timestamp: record.timestamp,
      mode: record.config.mode,
      score: record.evaluation.overallScore,
      improvements: record.optimization.improvements,
      changes: this.summarizeChanges(record)
    }));

    // 识别里程碑
    const milestones = this.identifyMilestones(records);

    return { versions, milestones };
  }

  async exportOptimizationHistory(
    originalId: string,
    format: 'json' | 'pdf' | 'excel' = 'json'
  ): Promise<string | Buffer> {
    const records = await this.getOptimizationHistory(originalId);
    const statistics = await this.getOptimizationStatistics(originalId);

    const exportData = {
      resumeId: originalId,
      exportDate: new Date(),
      statistics,
      versions: records.map(r => ({
        id: r.id,
        version: r.version,
        timestamp: r.timestamp,
        config: r.config,
        score: r.evaluation.overallScore,
        improvements: r.optimization.improvements,
        appliedStrategies: r.optimization.appliedStrategies
      }))
    };

    switch (format) {
      case 'json':
        return JSON.stringify(exportData, null, 2);
      case 'pdf':
        return await this.generatePDFExport(exportData);
      case 'excel':
        return await this.generateExcelExport(exportData);
      default:
        throw new Error(`不支持的导出格式: ${format}`);
    }
  }

  async cleanupOldVersions(): Promise<{
    deletedCount: number;
    freedSpace: number;
  }> {
    let deletedCount = 0;
    let freedSpace = 0;

    for (const [originalId, records] of this.records.entries()) {
      if (records.length > this.maxVersionsPerResume) {
        const toDelete = records.slice(0, records.length - this.maxVersionsPerResume);

        for (const record of toDelete) {
          await this.deleteRecordFromStorage(record.id);
          deletedCount++;
          freedSpace += this.estimateRecordSize(record);
        }

        // 更新内存
        this.records.set(originalId, records.slice(-this.maxVersionsPerResume));
      }
    }

    return { deletedCount, freedSpace };
  }

  // 私有方法

  private generateId(): string {
    return `opt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private async getNextVersion(originalId: string): Promise<number> {
    const records = this.records.get(originalId) || [];
    const versions = records.map(r => r.version);
    return versions.length > 0 ? Math.max(...versions) + 1 : 1;
  }

  private async persistRecord(record: OptimizationRecord): Promise<void> {
    // 实际实现会保存到数据库
    console.log(`保存优化记录: ${record.id}`);
  }

  private async loadRecords(originalId: string): Promise<OptimizationRecord[]> {
    // 实际实现会从数据库加载
    return [];
  }

  private async loadRecord(recordId: string): Promise<OptimizationRecord | null> {
    // 实际实现会从数据库加载
    return null;
  }

  private async deleteRecordFromStorage(recordId: string): Promise<void> {
    // 实际实现会从数据库删除
    console.log(`删除优化记录: ${recordId}`);
  }

  private async analyzeDifferences(
    version1: OptimizedResume,
    version2: OptimizedResume
  ): Promise<any[]> {
    const differences = [];

    // 分析章节差异
    const sections = ['experience', 'projects', 'education', 'skills'];

    for (const section of sections) {
      const diff = this.compareSection(
        version1[section as keyof OptimizedResume],
        version2[section as keyof OptimizedResume],
        section
      );
      if (diff) differences.push(diff);
    }

    // 分析优化策略差异
    if (version1.optimization.appliedStrategies !== version2.optimization.appliedStrategies) {
      differences.push({
        type: 'strategies',
        before: version1.optimization.appliedStrategies,
        after: version2.optimization.appliedStrategies
      });
    }

    return differences;
  }

  private compareSection(
    section1: any,
    section2: any,
    sectionName: string
  ): any | null {
    if (JSON.stringify(section1) === JSON.stringify(section2)) {
      return null;
    }

    return {
      type: 'section',
      name: sectionName,
      before: section1,
      after: section2
    };
  }

  private identifyImprovements(
    version1: OptimizationRecord,
    version2: OptimizationRecord
  ): string[] {
    const improvements = [];

    // 分数提升
    if (version2.evaluation.overallScore > version1.evaluation.overallScore) {
      improvements.push(
        `总体评分提升${version2.evaluation.overallScore - version1.evaluation.overallScore}分`
      );
    }

    // 维度提升
    const dimensions = [
      'contentQuality',
      'keywordMatch',
      'readability',
      'professionalism'
    ] as const;

    dimensions.forEach(dim => {
      const score1 = version1.evaluation.dimensions[dim].score;
      const score2 = version2.evaluation.dimensions[dim].score;

      if (score2 > score1) {
        improvements.push(
          `${this.getDimensionName(dim)}提升${score2 - score1}分`
        );
      }
    });

    // 新增的改进
    version2.optimization.improvements.forEach(imp => {
      if (!version1.optimization.improvements.includes(imp)) {
        improvements.push(imp);
      }
    });

    return improvements;
  }

  private identifyRegressions(
    version1: OptimizationRecord,
    version2: OptimizationRecord
  ): string[] {
    const regressions = [];

    // 分数下降
    if (version2.evaluation.overallScore < version1.evaluation.overallScore) {
      regressions.push(
        `总体评分下降${version1.evaluation.overallScore - version2.evaluation.overallScore}分`
      );
    }

    return regressions;
  }

  private getDimensionName(dimension: string): string {
    const names = {
      contentQuality: '内容质量',
      keywordMatch: '关键词匹配',
      readability: '可读性',
      professionalism: '专业性'
    };
    return names[dimension as keyof typeof names] || dimension;
  }

  private async createRestoreRecord(
    originalId: string,
    versionId: string
  ): Promise<void> {
    const restoreRecord = {
      id: this.generateId(),
      originalId,
      restoredFrom: versionId,
      timestamp: new Date(),
      action: 'restore'
    };

    await this.persistRestoreRecord(restoreRecord);
  }

  private async persistRestoreRecord(record: any): Promise<void> {
    // 保存恢复记录
    console.log(`保存恢复记录: ${record.id}`);
  }

  private summarizeChanges(record: OptimizationRecord): string[] {
    const changes = [];

    // 根据模式生成变更摘要
    switch (record.config.mode) {
      case 'fresh_graduate':
        changes.push('优化了应届生模式');
        break;
      case 'experienced':
        changes.push('优化了有经验模式');
        break;
      case 'career_change':
        changes.push('优化了转行模式');
        break;
      case 'english':
        changes.push('生成了英文简历');
        break;
      case 'content_beautify':
        changes.push('美化了内容');
        break;
    }

    // 添加主要改进
    changes.push(...record.optimization.improvements.slice(0, 2));

    return changes;
  }

  private identifyMilestones(records: OptimizationRecord[]): Array<{
    date: Date;
    type: 'best_score' | 'mode_change' | 'major_improvement';
    description: string;
  }> {
    const milestones = [];

    if (records.length === 0) return milestones;

    // 最高分里程碑
    const bestScore = Math.max(...records.map(r => r.evaluation.overallScore));
    const bestRecord = records.find(r => r.evaluation.overallScore === bestScore);
    if (bestRecord) {
      milestones.push({
        date: bestRecord.timestamp,
        type: 'best_score' as const,
        description: `达到最高评分: ${bestScore}分`
      });
    }

    // 模式变更里程碑
    let lastMode = records[records.length - 1].config.mode;
    for (let i = records.length - 2; i >= 0; i--) {
      if (records[i].config.mode !== lastMode) {
        milestones.push({
          date: records[i].timestamp,
          type: 'mode_change' as const,
          description: `切换到${records[i].config.mode}模式`
        });
        lastMode = records[i].config.mode;
      }
    }

    // 重大改进里程碑（分数提升超过10分）
    for (let i = records.length - 1; i > 0; i--) {
      const scoreDiff = records[i].evaluation.overallScore - records[i - 1].evaluation.overallScore;
      if (scoreDiff >= 10) {
        milestones.push({
          date: records[i].timestamp,
          type: 'major_improvement' as const,
          description: `重大改进: 评分提升${scoreDiff}分`
        });
      }
    }

    return milestones.sort((a, b) => b.date.getTime() - a.date.getTime());
  }

  private async generatePDFExport(data: any): Promise<Buffer> {
    // 实际实现会使用PDF生成库
    return Buffer.from('PDF export data');
  }

  private async generateExcelExport(data: any): Promise<Buffer> {
    // 实际实现会使用Excel生成库
    return Buffer.from('Excel export data');
  }

  private estimateRecordSize(record: OptimizationRecord): number {
    // 估算记录大小（字节）
    return JSON.stringify(record).length * 2; // 简化估算
  }
}