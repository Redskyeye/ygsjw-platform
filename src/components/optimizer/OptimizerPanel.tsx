---
created: 2025-10-26T08:00:00Z
last_updated: 2025-10-26T08:00:00Z
version: 1.0
author: Claude Code PM System
---

'use client';

import React, { useState, useCallback } from 'react';
import { Card, Button, Select, Tabs, Tab, Badge, Alert } from '@/components/ui';
import {
  OptimizationMode,
  OptimizeRequest,
  OptimizeResponse,
  OptimizationSuggestion
} from '@/types/optimizer';

interface OptimizerPanelProps {
  resumeId: string;
  onOptimized: (result: OptimizeResponse) => void;
  onError: (error: string) => void;
}

export const OptimizerPanel: React.FC<OptimizerPanelProps> = ({
  resumeId,
  onOptimized,
  onError
}) => {
  const [mode, setMode] = useState<OptimizationMode>(OptimizationMode.FRESH_GRADUATE);
  const [isOptimizing, setIsOptimizing] = useState(false);
  const [activeTab, setActiveTab] = useState('config');
  const [suggestions, setSuggestions] = useState<OptimizationSuggestion[]>([]);
  const [preview, setPreview] = useState<any>(null);

  const modes = [
    { value: OptimizationMode.FRESH_GRADUATE, label: '应届生模式', description: '突出教育背景和项目经验' },
    { value: OptimizationMode.EXPERIENCED, label: '有经验模式', description: '突出工作成就和专业深度' },
    { value: OptimizationMode.CAREER_CHANGE, label: '转行模式', description: '突出可转移技能' },
    { value: OptimizationMode.ENGLISH, label: '英文简历', description: '生成英文版简历' },
    { value: OptimizationMode.CONTENT_BEAUTIFY, label: '内容美化', description: '优化语言和表达' }
  ];

  const handleOptimize = useCallback(async () => {
    if (!resumeId) {
      onError('请先上传或创建简历');
      return;
    }

    setIsOptimizing(true);

    try {
      const request: OptimizeRequest = {
        resumeId,
        config: {
          mode,
          language: mode === OptimizationMode.ENGLISH ? 'en' : 'zh',
          targetRole: '', // 可以从表单获取
          industry: '', // 可以从表单获取
          experienceLevel: 'entry' // 可以根据简历自动判断
        }
      };

      const response = await fetch('/api/optimizer/optimize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(request)
      });

      const result: OptimizeResponse = await response.json();

      if (result.success) {
        onOptimized(result);
        setSuggestions(result.data?.suggestions || []);
        setActiveTab('suggestions');
      } else {
        onError(result.error || '优化失败');
      }
    } catch (error) {
      onError('网络错误，请稍后重试');
    } finally {
      setIsOptimizing(false);
    }
  }, [resumeId, mode, onOptimized, onError]);

  const handlePreview = useCallback(async () => {
    if (!resumeId) return;

    try {
      const response = await fetch('/api/optimizer/optimize', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          resumeId,
          config: {
            mode,
            language: mode === OptimizationMode.ENGLISH ? 'en' : 'zh'
          }
        })
      });

      const result = await response.json();

      if (result.success) {
        setPreview(result.data);
        setActiveTab('preview');
      }
    } catch (error) {
      onError('预览失败');
    }
  }, [resumeId, mode, onError]);

  const renderConfigTab = () => (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium mb-2">选择优化模式</label>
        <div className="grid gap-3">
          {modes.map((m) => (
            <div
              key={m.value}
              className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                mode === m.value
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setMode(m.value)}
            >
              <div className="font-medium">{m.label}</div>
              <div className="text-sm text-gray-500 mt-1">{m.description}</div>
            </div>
          ))}
        </div>
      </div>

      {mode === OptimizationMode.FRESH_GRADUATE && (
        <FreshGraduateConfig />
      )}

      {mode === OptimizationMode.EXPERIENCED && (
        <ExperiencedConfig />
      )}

      {mode === OptimizationMode.CAREER_CHANGE && (
        <CareerChangeConfig />
      )}

      {mode === OptimizationMode.ENGLISH && (
        <EnglishConfig />
      )}

      {mode === OptimizationMode.CONTENT_BEAUTIFY && (
        <BeautifyConfig />
      )}

      <div className="flex gap-3">
        <Button
          onClick={handlePreview}
          variant="outline"
          className="flex-1"
          disabled={isOptimizing}
        >
          预览效果
        </Button>
        <Button
          onClick={handleOptimize}
          className="flex-1"
          disabled={isOptimizing}
          loading={isOptimizing}
        >
          开始优化
        </Button>
      </div>
    </div>
  );

  const renderSuggestionsTab = () => (
    <div className="space-y-4">
      {suggestions.length === 0 ? (
        <Alert>
          暂无优化建议，请先进行优化
        </Alert>
      ) : (
        suggestions.map((suggestion, index) => (
          <SuggestionCard
            key={index}
            suggestion={suggestion}
            onApply={() => {
              // 应用建议
            }}
          />
        ))
      )}
    </div>
  );

  const renderPreviewTab = () => (
    <div className="space-y-4">
      {preview ? (
        <div>
          <h3 className="font-medium mb-3">优化预览</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="mb-3">
              <span className="text-sm text-gray-500">预估评分： </span>
              <Badge className="ml-2">{preview.estimatedScore}分</Badge>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-sm">主要变化：</h4>
              {preview.changes.map((change: any, index: number) => (
                <div key={index} className="text-sm text-gray-600">
                  • {change.description}
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <Alert>
          点击"预览效果"查看优化预览
        </Alert>
      )}
    </div>
  );

  return (
    <Card className="w-full">
      <div className="p-6">
        <h2 className="text-xl font-semibold mb-6">简历优化</h2>

        <Tabs value={activeTab} onChange={setActiveTab}>
          <Tab value="config" label="配置" />
          <Tab value="suggestions" label="建议" badge={suggestions.length} />
          <Tab value="preview" label="预览" />
        </Tabs>

        <div className="mt-6">
          {activeTab === 'config' && renderConfigTab()}
          {activeTab === 'suggestions' && renderSuggestionsTab()}
          {activeTab === 'preview' && renderPreviewTab()}
        </div>
      </div>
    </Card>
  );
};

// 配置组件
const FreshGraduateConfig: React.FC = () => (
  <div className="space-y-4">
    <h3 className="font-medium">应届生配置</h3>
    <div className="grid grid-cols-2 gap-4">
      <label className="flex items-center">
        <input type="checkbox" className="mr-2" defaultChecked />
        突出实习经历
      </label>
      <label className="flex items-center">
        <input type="checkbox" className="mr-2" defaultChecked />
        强调项目经验
      </label>
      <label className="flex items-center">
        <input type="checkbox" className="mr-2" defaultChecked />
        显示GPA
      </label>
      <label className="flex items-center">
        <input type="checkbox" className="mr-2" defaultChecked />
        包含相关课程
      </label>
    </div>
  </div>
);

const ExperiencedConfig: React.FC = () => (
  <div className="space-y-4">
    <h3 className="font-medium">有经验配置</h3>
    <div className="grid grid-cols-2 gap-4">
      <label className="flex items-center">
        <input type="checkbox" className="mr-2" defaultChecked />
        突出工作成就
      </label>
      <label className="flex items-center">
        <input type="checkbox" className="mr-2" defaultChecked />
        量化结果
      </label>
      <label className="flex items-center">
        <input type="checkbox" className="mr-2" defaultChecked />
        强调领导力
      </label>
      <label className="flex items-center">
        <input type="checkbox" className="mr-2" />
        突出专业领域
      </label>
    </div>
    <div>
      <label className="block text-sm mb-1">工作年限</label>
      <input type="number" className="w-full px-3 py-2 border rounded" placeholder="输入工作年限" />
    </div>
  </div>
);

const CareerChangeConfig: React.FC = () => (
  <div className="space-y-4">
    <h3 className="font-medium">转行配置</h3>
    <div>
      <label className="block text-sm mb-1">目标职位</label>
      <input type="text" className="w-full px-3 py-2 border rounded" placeholder="输入目标职位" />
    </div>
    <div className="grid grid-cols-2 gap-4">
      <label className="flex items-center">
        <input type="checkbox" className="mr-2" defaultChecked />
        隐藏不相关经验
      </label>
      <label className="flex items-center">
        <input type="checkbox" className="mr-2" defaultChecked />
        解释转行原因
      </label>
    </div>
  </div>
);

const EnglishConfig: React.FC = () => (
  <div className="space-y-4">
    <h3 className="font-medium">英文简历配置</h3>
    <div>
      <label className="block text-sm mb-1">翻译风格</label>
      <select className="w-full px-3 py-2 border rounded">
        <option value="professional">Professional</option>
        <option value="formal">Formal</option>
        <option value="casual">Casual</option>
      </select>
    </div>
    <div className="grid grid-cols-2 gap-4">
      <label className="flex items-center">
        <input type="checkbox" className="mr-2" defaultChecked />
        适配西方文化
      </label>
      <label className="flex items-center">
        <input type="checkbox" className="mr-2" />
        使用英制单位
      </label>
    </div>
    <div>
      <label className="block text-sm mb-1">日期格式</label>
      <select className="w-full px-3 py-2 border rounded">
        <option value="Month Year">Month Year</option>
        <option value="mm/dd/yyyy">MM/DD/YYYY</option>
        <option value="YYYY">YYYY</option>
      </select>
    </div>
  </div>
);

const BeautifyConfig: React.FC = () => (
  <div className="space-y-4">
    <h3 className="font-medium">内容美化配置</h3>
    <div>
      <label className="block text-sm mb-1">语言风格</label>
      <select className="w-full px-3 py-2 border rounded">
        <option value="professional">专业</option>
        <option value="dynamic">活力</option>
        <option value="conservative">保守</option>
      </select>
    </div>
    <div>
      <label className="block text-sm mb-1">影响程度</label>
      <select className="w-full px-3 py-2 border rounded">
        <option value="quantitative">量化</option>
        <option value="qualitative">定性</option>
        <option value="balanced">平衡</option>
      </select>
    </div>
    <div>
      <label className="block text-sm mb-1">详细程度</label>
      <select className="w-full px-3 py-2 border rounded">
        <option value="concise">简洁</option>
        <option value="standard">标准</option>
        <option value="detailed">详细</option>
      </select>
    </div>
  </div>
);

// 建议卡片组件
const SuggestionCard: React.FC<{
  suggestion: OptimizationSuggestion;
  onApply: () => void;
}> = ({ suggestion, onApply }) => (
  <div className="border rounded-lg p-4">
    <div className="flex items-start justify-between mb-2">
      <div className="flex items-center gap-2">
        <Badge
          variant={
            suggestion.priority === 'high' ? 'destructive' :
            suggestion.priority === 'medium' ? 'default' : 'secondary'
          }
        >
          {suggestion.priority === 'high' ? '高优先级' :
           suggestion.priority === 'medium' ? '中优先级' : '低优先级'}
        </Badge>
        <h4 className="font-medium">{suggestion.title}</h4>
      </div>
    </div>

    <p className="text-sm text-gray-600 mb-3">{suggestion.description}</p>

    {suggestion.example && (
      <div className="bg-gray-50 p-3 rounded mb-3">
        <div className="text-sm">
          <div className="text-red-600 mb-1">修改前：{suggestion.example.before}</div>
          <div className="text-green-600">修改后：{suggestion.example.after}</div>
        </div>
      </div>
    )}

    <div className="flex items-center justify-between">
      <span className="text-xs text-gray-500">影响：{suggestion.impact}</span>
      <Button size="sm" onClick={onApply}>
        {suggestion.actionText}
      </Button>
    </div>
  </div>
);