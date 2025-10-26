/**
 * 面试Webhook状态监控组件
 * 实时跟踪双Webhook处理进度
 */

'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatusResponse, TaskStatus } from '@/types/interview-webhook';
import { Loader2, CheckCircle, XCircle, Clock, RefreshCw, Download, Eye } from 'lucide-react';

interface WebhookStatusMonitorProps {
  sessionId: string;
  onCompleted?: (result: any) => void;
  onError?: (error: string) => void;
  className?: string;
  pollInterval?: number;
}

interface StatusStep {
  id: string;
  label: string;
  description: string;
  status: 'pending' | 'active' | 'completed' | 'error';
  progress: number;
}

export const WebhookStatusMonitor: React.FC<WebhookStatusMonitorProps> = ({
  sessionId,
  onCompleted,
  onError,
  className,
  pollInterval = 2000
}) => {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('parse');
  const [steps, setSteps] = useState<StatusStep[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // 定义处理步骤
  const parseSteps: StatusStep[] = [
    { id: 'validate', label: '验证数据', description: '验证输入数据格式', status: 'pending', progress: 0 },
    { id: 'parse-resume', label: '解析简历', description: '提取简历关键信息', status: 'pending', progress: 0 },
    { id: 'analyze-match', label: '分析匹配度', description: '评估职位匹配程度', status: 'pending', progress: 0 },
    { id: 'identify-skills', label: '识别技能差距', description: '分析技能缺失', status: 'pending', progress: 0 },
    { id: 'generate-guide', label: '生成准备指南', description: '创建面试准备建议', status: 'pending', progress: 0 },
    { id: 'complete', label: '解析完成', description: '分析完成，准备生成辅导材料', status: 'pending', progress: 0 }
  ];

  const coachSteps: StatusStep[] = [
    { id: 'prepare', label: '准备生成', description: '准备生成辅导材料', status: 'pending', progress: 0 },
    { id: 'generate-guide', label: '生成指南', description: '创建详细面试指南', status: 'pending', progress: 0 },
    { id: 'build-questions', label: '构建题库', description: '生成常见问题库', status: 'pending', progress: 0 },
    { id: 'design-mock', label: '设计模拟面试', description: '创建模拟面试流程', status: 'pending', progress: 0 },
    { id: 'create-plan', label: '制定计划', description: '生成学习行动计划', status: 'pending', progress: 0 },
    { id: 'complete', label: '生成完成', description: '所有辅导材料已生成', status: 'pending', progress: 0 }
  ];

  // 获取状态
  const fetchStatus = useCallback(async () => {
    try {
      const response = await fetch(`/api/webhook/interview/status?sessionId=${sessionId}`);

      if (!response.ok) {
        throw new Error(`Failed to fetch status: ${response.status}`);
      }

      const data: StatusResponse = await response.json();
      setStatus(data);
      setError(null);

      // 更新步骤状态
      updateSteps(data);

      // 处理完成或失败
      if (data.status === 'completed' && data.data) {
        onCompleted?.(data.data);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      } else if (data.status === 'failed' && data.error) {
        onError?.(data.error);
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
      }

    } catch (err) {
      console.error('Failed to fetch status:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch status');
    } finally {
      setLoading(false);
    }
  }, [sessionId, onCompleted, onError]);

  // 更新步骤状态
  const updateSteps = (data: StatusResponse) => {
    const currentSteps = activeTab === 'parse' ? [...parseSteps] : [...coachSteps];
    const progress = data.progress || 0;
    const message = data.message || '';

    // 根据进度更新步骤
    const activeIndex = Math.floor((progress / 100) * (currentSteps.length - 1));

    currentSteps.forEach((step, index) => {
      if (index < activeIndex) {
        step.status = 'completed';
        step.progress = 100;
      } else if (index === activeIndex) {
        step.status = 'active';
        step.progress = progress % (100 / currentSteps.length) * currentSteps.length;
      } else {
        step.status = 'pending';
        step.progress = 0;
      }
    });

    setSteps(currentSteps);
  };

  // 初始加载和轮询
  useEffect(() => {
    fetchStatus();

    intervalRef.current = setInterval(() => {
      fetchStatus();
    }, pollInterval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchStatus, pollInterval]);

  // 刷新状态
  const handleRefresh = () => {
    setLoading(true);
    fetchStatus();
  };

  // 获取状态图标
  const getStatusIcon = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'processing':
      case 'retrying':
        return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  // 获取状态颜色
  const getStatusColor = (status: TaskStatus) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'failed':
        return 'text-red-600 bg-red-50';
      case 'processing':
        return 'text-blue-600 bg-blue-50';
      case 'retrying':
        return 'text-orange-600 bg-orange-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  if (loading && !status) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">加载状态中...</span>
        </CardContent>
      </Card>
    );
  }

  if (error && !status) {
    return (
      <Card className={className}>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <XCircle className="h-8 w-8 text-red-500 mb-2" />
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={handleRefresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            重试
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              面试辅导处理状态
              {status && getStatusIcon(status.status)}
            </CardTitle>
            <CardDescription>
              会话ID: {sessionId}
            </CardDescription>
          </div>
          <div className="flex items-center gap-2">
            {status && (
              <Badge className={getStatusColor(status.status)}>
                {status.status === 'pending' && '等待中'}
                {status.status === 'processing' && '处理中'}
                {status.status === 'retrying' && '重试中'}
                {status.status === 'completed' && '已完成'}
                {status.status === 'failed' && '失败'}
              </Badge>
            )}
            <Button onClick={handleRefresh} variant="outline" size="sm">
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {status && (
          <>
            {/* 总体进度 */}
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">总体进度</span>
                <span className="text-sm text-gray-500">{status.progress}%</span>
              </div>
              <Progress value={status.progress} className="h-2" />
              {status.message && (
                <p className="text-sm text-gray-600 mt-2">{status.message}</p>
              )}
            </div>

            {/* 分阶段标签页 */}
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="parse">信息解析</TabsTrigger>
                <TabsTrigger value="coach">辅导生成</TabsTrigger>
              </TabsList>

              <TabsContent value="parse" className="mt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">面试信息解析</h3>
                  <div className="space-y-3">
                    {steps.map((step) => (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          step.status === 'completed' ? 'bg-green-100' :
                          step.status === 'active' ? 'bg-blue-100' :
                          step.status === 'error' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          {step.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {step.status === 'active' && <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />}
                          {step.status === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                          {step.status === 'pending' && <Clock className="h-4 w-4 text-gray-400" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{step.label}</span>
                            <span className="text-xs text-gray-500">{step.progress}%</span>
                          </div>
                          <p className="text-xs text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="coach" className="mt-4">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">辅导材料生成</h3>
                  <div className="space-y-3">
                    {coachSteps.map((step) => (
                      <div key={step.id} className="flex items-center gap-3">
                        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                          step.status === 'completed' ? 'bg-green-100' :
                          step.status === 'active' ? 'bg-blue-100' :
                          step.status === 'error' ? 'bg-red-100' : 'bg-gray-100'
                        }`}>
                          {step.status === 'completed' && <CheckCircle className="h-4 w-4 text-green-600" />}
                          {step.status === 'active' && <Loader2 className="h-4 w-4 text-blue-600 animate-spin" />}
                          {step.status === 'error' && <XCircle className="h-4 w-4 text-red-600" />}
                          {step.status === 'pending' && <Clock className="h-4 w-4 text-gray-400" />}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-sm font-medium">{step.label}</span>
                            <span className="text-xs text-gray-500">{step.progress}%</span>
                          </div>
                          <p className="text-xs text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* 错误信息 */}
            {status.error && (
              <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-600">{status.error}</p>
              </div>
            )}

            {/* 操作按钮 */}
            {status.status === 'completed' && status.data && (
              <div className="mt-6 flex gap-2">
                <Button size="sm">
                  <Eye className="h-4 w-4 mr-2" />
                  查看结果
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  下载材料
                </Button>
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default WebhookStatusMonitor;