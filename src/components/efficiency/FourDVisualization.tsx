'use client'

import React, { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Button } from '../ui/button'
import { Badge } from '../ui/badge'
import { Progress } from '../ui/progress'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts'
import {
  Download,
  TrendingUp,
  Activity,
  Target,
  Compass,
  ChevronRight,
  Eye,
  BarChart3
} from 'lucide-react'
import { FourDData, calculateOverallScore, exportChartAsImage } from '@/utils/chartUtils'
import DimensionChart from './DimensionChart'
import DataVisualization from './DataVisualization'
import DiagnosisCard from './DiagnosisCard'

interface FourDVisualizationProps {
  data: FourDData
  className?: string
  showExport?: boolean
  theme?: 'light' | 'dark'
}

const FourDVisualization: React.FC<FourDVisualizationProps> = ({
  data,
  className = '',
  showExport = true,
  theme = 'light'
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'dimensions' | 'data' | 'diagnosis' | 'direction'>('overview')
  const [isExporting, setIsExporting] = useState(false)
  const exportRef = useRef<HTMLDivElement>(null)

  const overallScore = calculateOverallScore(data)

  // 雷达图数据
  const radarData = [
    { subject: '维度分析', value: data.dimensions.reduce((sum, d) => sum + d.value, 0) / data.dimensions.length, fullMark: 100 },
    { subject: '数据分析', value: data.data.reduce((sum, d) => sum + d.value, 0) / data.data.length, fullMark: 100 },
    { subject: '诊断结果', value: Math.max(0, 100 - data.diagnosis.filter(d => d.severity === 'high').length * 20), fullMark: 100 },
    { subject: '方向建议', value: data.direction.length > 0 ? 80 : 60, fullMark: 100 }
  ]

  // 趋势数据
  const trendData = data.data.map(item => ({
    name: item.label,
    value: item.value,
    trend: item.trend
  }))

  const handleExport = async () => {
    if (!exportRef.current) return

    setIsExporting(true)
    try {
      await exportChartAsImage(exportRef.current, '4D-analysis-report.png')
    } finally {
      setIsExporting(false)
    }
  }

  const tabs = [
    { id: 'overview', label: '总览', icon: BarChart3 },
    { id: 'dimensions', label: '维度', icon: Target },
    { id: 'data', label: '数据', icon: TrendingUp },
    { id: 'diagnosis', label: '诊断', icon: Activity },
    { id: 'direction', label: '方向', icon: Compass }
  ] as const

  return (
    <div className={`w-full space-y-6 ${className}`}>
      {/* 头部区域 */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            4D分析可视化
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            多维度综合分析报告
          </p>
        </div>

        {showExport && (
          <Button
            onClick={handleExport}
            disabled={isExporting}
            variant="outline"
            className="flex items-center gap-2"
          >
            <Download className="w-4 h-4" />
            {isExporting ? '导出中...' : '导出报告'}
          </Button>
        )}
      </div>

      {/* 综合评分 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                综合评分
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                基于四个维度的综合评估
              </p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {overallScore}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400">
                分 / 100分
              </div>
            </div>
          </div>
          <Progress
            value={overallScore}
            className="mt-4 h-2"
            indicatorClassName={
              overallScore >= 80 ? 'bg-green-500' :
              overallScore >= 60 ? 'bg-yellow-500' : 'bg-red-500'
            }
          />
        </CardContent>
      </Card>

      {/* 标签页导航 */}
      <div className="flex space-x-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setActiveTab(tab.id)}
              className="flex items-center gap-2 flex-1"
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">{tab.label}</span>
            </Button>
          )
        })}
      </div>

      {/* 内容区域 */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          ref={exportRef}
        >
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* 雷达图 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="w-5 h-5" />
                    4D雷达图
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <RadarChart data={radarData}>
                      <PolarGrid strokeDasharray="3 3" />
                      <PolarAngleAxis dataKey="subject" />
                      <PolarRadiusAxis
                        angle={90}
                        domain={[0, 100]}
                        tick={{ fontSize: 12 }}
                      />
                      <Radar
                        name="4D分析"
                        dataKey="value"
                        stroke="#3B82F6"
                        fill="#3B82F6"
                        fillOpacity={0.6}
                      />
                    </RadarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 趋势图 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="w-5 h-5" />
                    数据趋势
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={trendData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Area
                        type="monotone"
                        dataKey="value"
                        stroke="#10B981"
                        fill="#10B981"
                        fillOpacity={0.6}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* 快速统计 */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>快速统计</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                        {data.dimensions.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        分析维度
                      </div>
                    </div>
                    <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                        {data.data.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        数据指标
                      </div>
                    </div>
                    <div className="text-center p-4 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                        {data.diagnosis.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        诊断结果
                      </div>
                    </div>
                    <div className="text-center p-4 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                      <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                        {data.direction.length}
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        改进方向
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {activeTab === 'dimensions' && (
            <DimensionChart data={data.dimensions} />
          )}

          {activeTab === 'data' && (
            <DataVisualization data={data.data} />
          )}

          {activeTab === 'diagnosis' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {data.diagnosis.map((diagnosis, index) => (
                <DiagnosisCard key={index} diagnosis={diagnosis} />
              ))}
            </div>
          )}

          {activeTab === 'direction' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Compass className="w-5 h-5" />
                  改进方向时间线
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {data.direction.map((direction, index) => (
                    <div key={index} className="flex items-start gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-purple-100 dark:bg-purple-900/20 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold text-purple-600 dark:text-purple-400">
                          {index + 1}
                        </span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h4 className="font-semibold text-gray-900 dark:text-white">
                            {direction.step}
                          </h4>
                          <Badge variant="outline">
                            优先级 {direction.priority}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                          时间线: {direction.timeline}
                        </p>
                        <div className="flex flex-wrap gap-1 mt-2">
                          {direction.resources.map((resource, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {resource}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}

export default FourDVisualization