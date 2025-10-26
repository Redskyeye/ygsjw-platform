/**
 * N8N工作流客户端
 * 用于管理和执行面试辅导自动化工作流
 */

import { N8NWorkflowConfig, N8NExecutionData, WebhookType } from '@/types/interview-webhook';

export class N8NClient {
  private baseUrl: string;
  private apiKey: string;
  private timeout: number;

  constructor(config: { baseUrl: string; apiKey: string; timeout?: number }) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '');
    this.apiKey = config.apiKey;
    this.timeout = config.timeout || 30000;
  }

  /**
   * 触发面试信息解析工作流
   */
  async triggerInterviewParsing(sessionId: string, data: any): Promise<N8NExecutionData> {
    const workflowId = 'interview-parse-workflow';

    return this.executeWorkflow(workflowId, {
      sessionId,
      webhookType: 'interview-parse' as WebhookType,
      triggerData: data,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 触发面试辅导生成工作流
   */
  async triggerCoachingGeneration(sessionId: string, parsedData: any): Promise<N8NExecutionData> {
    const workflowId = 'coaching-generate-workflow';

    return this.executeWorkflow(workflowId, {
      sessionId,
      webhookType: 'coaching-generate' as WebhookType,
      parsedData,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * 执行工作流
   */
  private async executeWorkflow(workflowId: string, data: any): Promise<N8NExecutionData> {
    const url = `${this.baseUrl}/api/v1/workflows/${workflowId}/execute`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': this.apiKey,
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          data: [data],
          runData: {},
          startNodes: [],
          destinationNodes: [],
          pinData: {}
        }),
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        throw new Error(`N8N API error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Failed to execute N8N workflow:', error);
      throw error;
    }
  }

  /**
   * 获取工作流执行状态
   */
  async getExecutionStatus(executionId: string): Promise<N8NExecutionData> {
    const url = `${this.baseUrl}/api/v1/executions/${executionId}`;

    try {
      const response = await fetch(url, {
        headers: {
          'X-N8N-API-KEY': this.apiKey,
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        throw new Error(`Failed to get execution status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to get execution status:', error);
      throw error;
    }
  }

  /**
   * 取消工作流执行
   */
  async cancelExecution(executionId: string): Promise<void> {
    const url = `${this.baseUrl}/api/v1/executions/${executionId}/cancel`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'X-N8N-API-KEY': this.apiKey
        },
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        throw new Error(`Failed to cancel execution: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to cancel execution:', error);
      throw error;
    }
  }

  /**
   * 获取工作流列表
   */
  async getWorkflows(activeOnly: boolean = true): Promise<N8NWorkflowConfig[]> {
    const url = new URL(`${this.baseUrl}/api/v1/workflows`);
    if (activeOnly) {
      url.searchParams.append('active', 'true');
    }

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'X-N8N-API-KEY': this.apiKey,
          'Accept': 'application/json'
        },
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        throw new Error(`Failed to get workflows: ${response.status}`);
      }

      const result = await response.json();
      return result.data;
    } catch (error) {
      console.error('Failed to get workflows:', error);
      throw error;
    }
  }

  /**
   * 创建或更新工作流
   */
  async saveWorkflow(workflow: N8NWorkflowConfig): Promise<N8NWorkflowConfig> {
    const url = workflow.workflowId
      ? `${this.baseUrl}/api/v1/workflows/${workflow.workflowId}`
      : `${this.baseUrl}/api/v1/workflows`;

    const method = workflow.workflowId ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-N8N-API-KEY': this.apiKey,
          'Accept': 'application/json'
        },
        body: JSON.stringify(workflow),
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        throw new Error(`Failed to save workflow: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Failed to save workflow:', error);
      throw error;
    }
  }

  /**
   * 删除工作流
   */
  async deleteWorkflow(workflowId: string): Promise<void> {
    const url = `${this.baseUrl}/api/v1/workflows/${workflowId}`;

    try {
      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'X-N8N-API-KEY': this.apiKey
        },
        signal: AbortSignal.timeout(this.timeout)
      });

      if (!response.ok) {
        throw new Error(`Failed to delete workflow: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to delete workflow:', error);
      throw error;
    }
  }

  /**
   * 测试工作流连接
   */
  async testConnection(): Promise<boolean> {
    try {
      const url = `${this.baseUrl}/rest/health-check`;
      const response = await fetch(url, {
        headers: {
          'X-N8N-API-KEY': this.apiKey
        },
        signal: AbortSignal.timeout(5000)
      });

      return response.ok;
    } catch (error) {
      console.error('N8N connection test failed:', error);
      return false;
    }
  }
}

// 导出单例实例
export const n8nClient = new N8NClient({
  baseUrl: process.env.N8N_BASE_URL || 'http://localhost:5678',
  apiKey: process.env.N8N_API_KEY || '',
  timeout: parseInt(process.env.N8N_TIMEOUT || '30000')
});