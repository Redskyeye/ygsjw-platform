'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import { Progress } from '../ui/progress'
import {
  AlertTriangle,
  CheckCircle,
  Info,
  AlertCircle,
  ChevronDown,
  ChevronUp,
  Lightbulb,
  TrendingUp,
  Target,
  Clock
} from 'lucide-react'

interface DiagnosisData {
  issue: string
  severity: 'high' | 'medium' | 'low'
  impact: number
  recommendation: string
}

interface DiagnosisCardProps {
  diagnosis: DiagnosisData
  className?: string
}

const DiagnosisCard: React.FC<DiagnosisCardProps> = ({
  diagnosis,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(false)

  // 根据严重程度获取颜色和图标
  const getSeverityConfig = (severity: string) => {
    switch (severity) {
      case 'high':
        return {
          color: 'red',
          icon: AlertTriangle,
          label: '高优先级',
          bgClass: 'bg-red-50 dark:bg-red-900/20',
          borderClass: 'border-red-200 dark:border-red-800',
          badgeClass: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
        }
      case 'medium':
        return {
          color: 'yellow',
          icon: AlertCircle,
          label: '中优先级',
          bgClass: 'bg-yellow-50 dark:bg-yellow-900/20',
          borderClass: 'border-yellow-200 dark:border-yellow-800',
          badgeClass: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400'
        }
      case 'low':
        return {
          color: 'green',
          icon: Info,
          label: '低优先级',
          bgClass: 'bg-green-50 dark:bg-green-900/20',
          borderClass: 'border-green-200 dark:border-green-800',
          badgeClass: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
        }
      default:
        return {
          color: 'gray',
          icon: Info,
          label: '未知',
          bgClass: 'bg-gray-50 dark:bg-gray-900/20',
          borderClass: 'border-gray-200 dark:border-gray-800',
          badgeClass: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
        }
    }
  }

  const severityConfig = getSeverityConfig(diagnosis.severity)
  const SeverityIcon = severityConfig.icon

  // 影响程度级别
  const getImpactLevel = (impact: number) => {
    if (impact >= 80) return { label: '严重影响', color: 'red' }
    if (impact >= 60) return { label: '中等影响', color: 'yellow' }
    if (impact >= 40) return { label: '轻微影响', color: 'blue' }
    return { label: '影响较小', color: 'green' }
  }

  const impactLevel = getImpactLevel(diagnosis.impact)

  // 推荐解决方案分类
  const solutionCategories = [
    {
      icon: Target,
      title: '立即行动',
      items: diagnosis.severity === 'high' ? ['优先处理', '资源调配', '风险评估'] : []
    },
    {
      icon: TrendingUp,
      title: '持续改进',
      items: diagnosis.severity !== 'low' ? ['监控跟踪', '定期评估', '优化调整'] : ['持续观察']
    },
    {
      icon: Clock,
      title: '长期规划',
      items: ['预防措施', '制度建设', '培训提升']
    }
  ].filter(category => category.items.length > 0)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={{ y: -2 }}
      className={className}
    >
      <Card className={`h-full transition-all duration-200 hover:shadow-lg ${severityConfig.borderClass} ${severityConfig.bgClass}`}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 bg-${severityConfig.color}-100 dark:bg-${severityConfig.color}-900/20 rounded-full flex items-center justify-center`}>
                <SeverityIcon className={`w-4 h-4 text-${severityConfig.color}-600 dark:text-${severityConfig.color}-400`} />
              </div>
              <div>
                <Badge className={severityConfig.badgeClass}>
                  {severityConfig.label}
                </Badge>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  影响程度: {impactLevel.label}
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
              className="h-8 w-8 p-0"
            >
              {isExpanded ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-0">
          {/* 问题标题 */}
          <h3 className="font-semibold text-gray-900 dark:text-white mb-3 line-clamp-2">
            {diagnosis.issue}
          </h3>

          {/* 影响程度进度条 */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-600 dark:text-gray-400">影响程度</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {diagnosis.impact}%
              </span>
            </div>
            <Progress
              value={diagnosis.impact}
              className="h-2"
              indicatorClassName={
                diagnosis.impact >= 80 ? 'bg-red-500' :
                diagnosis.impact >= 60 ? 'bg-yellow-500' :
                diagnosis.impact >= 40 ? 'bg-blue-500' : 'bg-green-500'
              }
            />
          </div>

          {/* 推荐方案预览 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                推荐方案
              </span>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-3">
              {diagnosis.recommendation}
            </p>
          </div>

          {/* 展开的详细信息 */}
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              {/* 详细推荐方案 */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                    详细建议
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {diagnosis.recommendation}
                  </p>
                </div>

                {/* 解决方案分类 */}
                <div className="space-y-3">
                  <h4 className="font-medium text-gray-900 dark:text-white">
                    行动计划
                  </h4>
                  {solutionCategories.map((category, index) => {
                    const Icon = category.icon
                    return (
                      <div key={index} className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Icon className="w-4 h-4 text-blue-600" />
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {category.title}
                          </span>
                        </div>
                        <div className="ml-6 space-y-1">
                          {category.items.map((item, itemIndex) => (
                            <div key={itemIndex} className="flex items-center gap-2">
                              <CheckCircle className="w-3 h-3 text-green-600" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {item}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )
                  })}
                </div>

                {/* 预期效果 */}
                <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <TrendingUp className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-blue-900 dark:text-blue-400">
                      预期效果
                    </span>
                  </div>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    实施上述建议后，预计影响程度可降低
                    <span className="font-semibold">
                      {Math.round(diagnosis.impact * 0.7)}%
                    </span>
                    ，整体效率提升
                    <span className="font-semibold">
                      {Math.round(100 - diagnosis.impact * 0.3)}%
                    </span>
                  </p>
                </div>

                {/* 时间线建议 */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-gray-600" />
                    <span className="text-sm font-medium text-gray-900 dark:text-white">
                      建议时间线
                    </span>
                  </div>
                  <div className="ml-6 space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">立即处理</span>
                      <span className="text-gray-900 dark:text-white">1-3天</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">中期改进</span>
                      <span className="text-gray-900 dark:text-white">1-2周</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">长期优化</span>
                      <span className="text-gray-900 dark:text-white">1-3个月</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* 快速操作按钮 */}
          <div className="flex gap-2 mt-4 pt-3 border-t border-gray-200 dark:border-gray-700">
            <Button size="sm" variant="outline" className="flex-1">
              查看详情
            </Button>
            <Button size="sm" className="flex-1">
              立即处理
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default DiagnosisCard