'use client'

import React from 'react'
import FourDVisualization from '@/components/efficiency/FourDVisualization'
import { FourDData } from '@/utils/chartUtils'

// 模拟4D分析数据
const mockData: FourDData = {
  dimensions: [
    {
      name: '技术能力',
      value: 85,
      description: '包括编程技能、架构设计、代码质量等技术层面的综合能力评估'
    },
    {
      name: '项目管理',
      value: 72,
      description: '项目规划、进度控制、资源协调等管理能力的评估'
    },
    {
      name: '团队协作',
      value: 78,
      description: '沟通能力、团队合作、知识分享等协作能力的评估'
    },
    {
      name: '创新能力',
      value: 68,
      description: '问题解决、创新思维、技术前瞻性等创新能力的评估'
    },
    {
      name: '学习能力',
      value: 92,
      description: '新技术学习、知识更新、持续改进等学习能力的评估'
    }
  ],
  data: [
    {
      label: '代码质量',
      value: 88,
      trend: 'up'
    },
    {
      label: '交付效率',
      value: 75,
      trend: 'up'
    },
    {
      label: '问题解决',
      value: 82,
      trend: 'stable'
    },
    {
      label: '文档完整性',
      value: 65,
      trend: 'down'
    },
    {
      label: '测试覆盖率',
      value: 79,
      trend: 'up'
    },
    {
      label: '响应时间',
      value: 71,
      trend: 'stable'
    }
  ],
  diagnosis: [
    {
      issue: '文档更新不及时，影响团队知识传递',
      severity: 'high',
      impact: 85,
      recommendation: '建立自动化文档生成流程，定期审核和更新技术文档，指定专人负责文档维护。建议在每次代码提交时自动生成相关文档更新。'
    },
    {
      issue: '代码审查覆盖率不足',
      severity: 'medium',
      impact: 65,
      recommendation: '实施强制性代码审查制度，每个PR至少需要两人审查。建立代码质量检查清单，提高团队代码质量意识。'
    },
    {
      issue: '测试自动化程度有待提升',
      severity: 'medium',
      impact: 58,
      recommendation: '增加单元测试和集成测试覆盖率，建立持续集成流水线，实施测试驱动开发(TDD)实践。'
    },
    {
      issue: '项目进度管理需要优化',
      severity: 'low',
      impact: 42,
      recommendation: '引入敏捷开发方法，定期进行项目回顾，优化任务分配和进度跟踪机制。'
    }
  ],
  direction: [
    {
      step: '建立完善的文档管理体系',
      priority: 1,
      timeline: '2-4周',
      resources: ['技术文档工具', '文档管理员', '自动化脚本']
    },
    {
      step: '实施代码质量管控流程',
      priority: 2,
      timeline: '3-6周',
      resources: ['代码审查工具', '质量检查工具', '团队培训']
    },
    {
      step: '提升测试自动化水平',
      priority: 3,
      timeline: '4-8周',
      resources: ['测试框架', 'CI/CD工具', '测试工程师']
    },
    {
      step: '优化项目管理流程',
      priority: 4,
      timeline: '6-10周',
      resources: ['项目管理工具', '敏捷教练', '流程顾问']
    },
    {
      step: '建立持续改进机制',
      priority: 5,
      timeline: '持续进行',
      resources: ['度量工具', '改进委员会', '定期回顾会议']
    }
  ]
}

export default function EfficiencyDemoPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* 页面头部 */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            4D分析可视化系统
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            基于4D分析框架的全面可视化展示，包括维度分析、数据展示、诊断结果和改进方向
          </p>
        </div>

        {/* 4D可视化组件 */}
        <FourDVisualization
          data={mockData}
          showExport={true}
          className="mb-8"
        />

        {/* 页面说明 */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
            功能说明
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                📊 维度分析
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                多维度能力评估，支持柱状图、雷达图、饼图等多种展示方式
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                📈 数据分析
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                详细的数据趋势分析，支持折线图、面积图、柱状图等多种图表类型
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                🔍 诊断结果
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                问题识别和优先级分析，提供详细的改进建议和解决方案
              </p>
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                🧭 改进方向
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                时间线形式的改进计划，明确优先级和资源配置
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}