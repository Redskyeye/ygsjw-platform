'use client'

import React, { useState, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card'
import { Badge } from '../ui/badge'
import { Button } from '../ui/button'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ComposedChart
} from 'recharts'
import {
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  LineChartIcon,
  AreaChartIcon,
  Calendar,
  Filter
} from 'lucide-react'

interface DataItem {
  label: string
  value: number
  trend: 'up' | 'down' | 'stable'
}

interface DataVisualizationProps {
  data: DataItem[]
  className?: string
}

const DataVisualization: React.FC<DataVisualizationProps> = ({
  data,
  className = ''
}) => {
  const [chartType, setChartType] = useState<'line' | 'area' | 'bar' | 'composed'>('area')
  const [timeRange, setTimeRange] = useState<'all' | 'week' | 'month' | 'quarter'>('all')

  // 生成模拟趋势数据
  const trendData = useMemo(() => {
    return data.map((item, index) => {
      const baseValue = item.value
      const variation = Math.random() * 20 - 10 // ±10的变化
      const trendMultiplier = item.trend === 'up' ? 1.2 : item.trend === 'down' ? 0.8 : 1

      return {
        name: item.label,
        current: baseValue,
        previous: baseValue * trendMultiplier + variation,
        average: baseValue * 1.1,
        trend: item.trend
      }
    })
  }, [data])

  // 时间线数据（用于更详细的趋势展示）
  const timelineData = useMemo(() => {
    const periods = ['1月', '2月', '3月', '4月', '5月', '6月']
    return periods.map((period, index) => {
      const baseMultiplier = 1 + (index * 0.1)
      return {
        period,
        ...data.reduce((acc, item, itemIndex) => {
          const trendValue = item.trend === 'up' ? 1.5 : item.trend === 'down' ? 0.7 : 1
          acc[item.label] = Math.round(item.value * baseMultiplier * trendValue * (0.8 + Math.random() * 0.4))
          return acc
        }, {} as Record<string, number>)
      }
    })
  }, [data])

  // 统计信息
  const stats = useMemo(() => {
    const total = data.reduce((sum, item) => sum + item.value, 0)
    const average = total / data.length
    const upTrends = data.filter(item => item.trend === 'up').length
    const downTrends = data.filter(item => item.trend === 'down').length
    const stableTrends = data.filter(item => item.trend === 'stable').length

    return {
      total,
      average,
      upTrends,
      downTrends,
      stableTrends
    }
  }, [data])

  const chartTypes = [
    { id: 'line', label: '折线图', icon: LineChartIcon },
    { id: 'area', label: '面积图', icon: AreaChartIcon },
    { id: 'bar', label: '柱状图', icon: BarChart3 },
    { id: 'composed', label: '组合图', icon: BarChart3 }
  ] as const

  const timeRanges = [
    { id: 'all', label: '全部' },
    { id: 'quarter', label: '本季度' },
    { id: 'month', label: '本月' },
    { id: 'week', label: '本周' }
  ] as const

  // 自定义Tooltip
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="font-semibold text-gray-900 dark:text-white">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 头部控制 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            数据分析
          </h3>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* 时间范围选择 */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {timeRanges.map((range) => (
              <button
                key={range.id}
                onClick={() => setTimeRange(range.id)}
                className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                  timeRange === range.id
                    ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                {range.label}
              </button>
            ))}
          </div>

          {/* 图表类型选择 */}
          <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
            {chartTypes.map((type) => {
              const Icon = type.icon
              return (
                <button
                  key={type.id}
                  onClick={() => setChartType(type.id)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    chartType === type.id
                      ? 'bg-white dark:bg-gray-700 text-blue-600 shadow-sm'
                      : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{type.label}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">总计</p>
                <p className="text-xl font-bold text-gray-900 dark:text-white">
                  {stats.total.toFixed(0)}
                </p>
              </div>
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
                <BarChart3 className="w-5 h-5 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">平均</p>
                <p className="text-xl font-bold text-green-600">
                  {stats.average.toFixed(1)}
                </p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">上升</p>
                <p className="text-xl font-bold text-green-600">{stats.upTrends}</p>
              </div>
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">下降</p>
                <p className="text-xl font-bold text-red-600">{stats.downTrends}</p>
              </div>
              <div className="w-10 h-10 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <TrendingDown className="w-5 h-5 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-gray-600 dark:text-gray-400">稳定</p>
                <p className="text-xl font-bold text-yellow-600">{stats.stableTrends}</p>
              </div>
              <div className="w-10 h-10 bg-yellow-100 dark:bg-yellow-900/20 rounded-full flex items-center justify-center">
                <Minus className="w-5 h-5 text-yellow-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 主图表 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            数据趋势分析
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-96">
            <ResponsiveContainer width="100%" height="100%">
              {chartType === 'line' && (
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="current"
                    stroke="#3B82F6"
                    strokeWidth={2}
                    name="当前值"
                    dot={{ fill: '#3B82F6', r: 4 }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="previous"
                    stroke="#10B981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="历史值"
                    dot={{ fill: '#10B981', r: 3 }}
                  />
                </LineChart>
              )}

              {chartType === 'area' && (
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Area
                    type="monotone"
                    dataKey="current"
                    stackId="1"
                    stroke="#3B82F6"
                    fill="#3B82F6"
                    fillOpacity={0.6}
                    name="当前值"
                  />
                  <Area
                    type="monotone"
                    dataKey="average"
                    stackId="2"
                    stroke="#10B981"
                    fill="#10B981"
                    fillOpacity={0.4}
                    name="平均值"
                  />
                </AreaChart>
              )}

              {chartType === 'bar' && (
                <BarChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="current" fill="#3B82F6" name="当前值" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="previous" fill="#10B981" name="历史值" radius={[8, 8, 0, 0]} />
                </BarChart>
              )}

              {chartType === 'composed' && (
                <ComposedChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend />
                  <Bar dataKey="previous" fill="#E5E7EB" name="历史值" radius={[8, 8, 0, 0]} />
                  <Line
                    type="monotone"
                    dataKey="current"
                    stroke="#3B82F6"
                    strokeWidth={3}
                    name="当前值"
                    dot={{ fill: '#3B82F6', r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="average"
                    stroke="#10B981"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                    name="平均值"
                  />
                </ComposedChart>
              )}
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* 详细数据表格 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            数据明细
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    指标名称
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    当前值
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    历史值
                  </th>
                  <th className="text-center py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    趋势
                  </th>
                  <th className="text-right py-3 px-4 font-semibold text-gray-900 dark:text-white">
                    变化率
                  </th>
                </tr>
              </thead>
              <tbody>
                {trendData.map((item, index) => {
                  const changeRate = ((item.current - item.previous) / item.previous * 100).toFixed(1)
                  const isPositive = parseFloat(changeRate) > 0

                  return (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                    >
                      <td className="py-3 px-4 font-medium text-gray-900 dark:text-white">
                        {item.name}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-900 dark:text-white">
                        {item.current.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-right text-gray-600 dark:text-gray-400">
                        {item.previous.toFixed(1)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          variant={
                            item.trend === 'up' ? 'default' :
                            item.trend === 'down' ? 'destructive' : 'secondary'
                          }
                          className="flex items-center gap-1 mx-auto w-fit"
                        >
                          {item.trend === 'up' && <TrendingUp className="w-3 h-3" />}
                          {item.trend === 'down' && <TrendingDown className="w-3 h-3" />}
                          {item.trend === 'stable' && <Minus className="w-3 h-3" />}
                          {item.trend === 'up' ? '上升' : item.trend === 'down' ? '下降' : '稳定'}
                        </Badge>
                      </td>
                      <td className={`py-3 px-4 text-right font-medium ${
                        isPositive ? 'text-green-600' : parseFloat(changeRate) < 0 ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {isPositive ? '+' : ''}{changeRate}%
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default DataVisualization