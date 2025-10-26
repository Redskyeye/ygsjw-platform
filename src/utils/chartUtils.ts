/**
 * 图表工具函数
 * 为4D分析可视化系统提供通用的图表配置和工具函数
 */

import { colors } from 'tailwindcss/colors'

// 4D分析主题配置
export const fourDTheme = {
  colors: {
    dimensions: colors.blue,   // 维度 - 蓝色
    data: colors.green,        // 数据 - 绿色
    diagnosis: colors.orange,  // 诊断 - 橙色
    direction: colors.purple,  // 方向 - 紫色
  },
  gradients: {
    dimensions: ['#3B82F6', '#1D4ED8'],
    data: ['#10B981', '#059669'],
    diagnosis: ['#F97316', '#EA580C'],
    direction: ['#A855F7', '#9333EA'],
  }
}

// 雷达图配置
export const radarChartConfig = {
  grid: {
    stroke: '#E5E7EB',
    strokeWidth: 1,
  },
  angleAxis: {
    type: 'category',
    data: ['维度', '数据', '诊断', '方向'],
    tickLine: {
      lineStyle: {
        stroke: '#9CA3AF',
      },
    },
    axisLine: {
      lineStyle: {
        stroke: '#9CA3AF',
      },
    },
  },
  radiusAxis: {
    axisLine: {
      lineStyle: {
        stroke: '#9CA3AF',
      },
    },
    splitLine: {
      lineStyle: {
        stroke: '#E5E7EB',
      },
    },
    splitArea: {
      show: true,
      areaStyle: {
        color: ['rgba(59, 130, 246, 0.05)', 'rgba(16, 185, 129, 0.05)'],
      },
    },
  },
}

// 通用图表样式
export const commonChartStyles = {
  responsive: true,
  maintainAspectRatio: false,
  fontFamily: 'Inter, system-ui, sans-serif',
  fontSize: 12,
  fontWeight: 400,
}

// 渐变色生成器
export const createGradient = (ctx: CanvasRenderingContext2D, colors: string[], area: any) => {
  const gradient = ctx.createLinearGradient(0, area.bottom, 0, area.top)
  colors.forEach((color, index) => {
    gradient.addColorStop(index / (colors.length - 1), color)
  })
  return gradient
}

// 格式化数字
export const formatNumber = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(1)}K`
  }
  return value.toString()
}

// 格式化百分比
export const formatPercentage = (value: number): string => {
  return `${(value * 100).toFixed(1)}%`
}

// 动画配置
export const animationConfig = {
  duration: 1500,
  easing: 'easeInOutQuart',
  delay: (context: any) => context.dataIndex * 100,
}

// 深色模式配置
export const darkModeConfig = {
  background: 'rgba(17, 24, 39, 0.8)',
  text: '#F3F4F6',
  grid: '#374151',
  border: '#4B5563',
}

// 浅色模式配置
export const lightModeConfig = {
  background: 'rgba(255, 255, 255, 0.9)',
  text: '#111827',
  grid: '#E5E7EB',
  border: '#D1D5DB',
}

// 4D数据类型定义
export interface FourDData {
  dimensions: {
    name: string
    value: number
    description: string
  }[]
  data: {
    label: string
    value: number
    trend: 'up' | 'down' | 'stable'
  }[]
  diagnosis: {
    issue: string
    severity: 'high' | 'medium' | 'low'
    impact: number
    recommendation: string
  }[]
  direction: {
    step: string
    priority: number
    timeline: string
    resources: string[]
  }[]
}

// 计算综合评分
export const calculateOverallScore = (data: FourDData): number => {
  const dimensionsAvg = data.dimensions.reduce((sum, d) => sum + d.value, 0) / data.dimensions.length
  const dataAvg = data.data.reduce((sum, d) => sum + d.value, 0) / data.data.length
  const diagnosisScore = Math.max(0, 100 - data.diagnosis.filter(d => d.severity === 'high').length * 20)
  const directionScore = data.direction.length > 0 ? 80 : 60

  return Math.round((dimensionsAvg * 0.3 + dataAvg * 0.3 + diagnosisScore * 0.2 + directionScore * 0.2))
}

// 导出图表为图片
export const exportChartAsImage = async (chartRef: HTMLDivElement, filename: string): Promise<void> => {
  if (!chartRef) return

  try {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const rect = chartRef.getBoundingClientRect()
    canvas.width = rect.width * 2 // 高清输出
    canvas.height = rect.height * 2
    ctx.scale(2, 2)

    // 使用html2canvas或其他库来实现截图功能
    // 这里需要根据实际使用的库来调整
    console.log('导出图表:', filename)
  } catch (error) {
    console.error('导出图表失败:', error)
  }
}

// 响应式断点配置
export const responsiveBreakpoints = {
  sm: 640,
  md: 768,
  lg: 1024,
  xl: 1280,
  '2xl': 1536,
}

// 图表尺寸计算
export const getChartDimensions = (containerWidth: number) => {
  const width = Math.min(containerWidth - 32, 800)
  const height = Math.max(300, width * 0.6)

  return { width, height }
}