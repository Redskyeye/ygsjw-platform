# 4D分析可视化系统

这是一个完整的4D分析可视化组件系统，用于展示多维度分析结果。

## 功能特性

### 1. 四个维度的全面展示
- **维度分析 (Dimensions)**: 展示分析的维度和角度
- **数据分析 (Data)**: 数据图表和统计展示
- **诊断结果 (Diagnosis)**: 问题识别和诊断展示
- **方向建议 (Direction)**: 改进方向和建议展示

### 2. 丰富的可视化图表
- 雷达图展示4D维度
- 柱状图、折线图、面积图
- 饼图和组合图
- 进度条显示各项指标

### 3. 交互式功能
- 多标签页切换
- 图表类型切换
- 展开式详情
- 响应式设计

### 4. 高级特性
- 支持深色模式
- 动画效果 (framer-motion)
- 导出报告功能
- 综合评分计算

## 组件结构

```
src/components/efficiency/
├── FourDVisualization.tsx    # 4D可视化主组件
├── DimensionChart.tsx        # 维度图表组件
├── DataVisualization.tsx     # 数据可视化组件
├── DiagnosisCard.tsx         # 诊断卡片组件
└── README.md                 # 说明文档

src/utils/
└── chartUtils.ts             # 图表工具函数
```

## 使用方法

### 基本用法

```tsx
import FourDVisualization from '@/components/efficiency/FourDVisualization'
import { FourDData } from '@/utils/chartUtils'

const data: FourDData = {
  dimensions: [
    { name: '技术能力', value: 85, description: '...' },
    { name: '项目管理', value: 72, description: '...' }
  ],
  data: [
    { label: '代码质量', value: 88, trend: 'up' },
    { label: '交付效率', value: 75, trend: 'up' }
  ],
  diagnosis: [
    {
      issue: '文档更新不及时',
      severity: 'high',
      impact: 85,
      recommendation: '建立自动化文档生成流程...'
    }
  ],
  direction: [
    {
      step: '建立完善的文档管理体系',
      priority: 1,
      timeline: '2-4周',
      resources: ['技术文档工具', '文档管理员']
    }
  ]
}

export default function Page() {
  return (
    <FourDVisualization
      data={data}
      showExport={true}
      theme="light"
    />
  )
}
```

### 单独使用子组件

```tsx
import DimensionChart from '@/components/efficiency/DimensionChart'
import DataVisualization from '@/components/efficiency/DataVisualization'
import DiagnosisCard from '@/components/efficiency/DiagnosisCard'

// 使用维度图表
<DimensionChart data={dimensionsData} />

// 使用数据可视化
<DataVisualization data={dataItems} />

// 使用诊断卡片
{diagnosisData.map((item, index) => (
  <DiagnosisCard key={index} diagnosis={item} />
))}
```

## 数据结构

### FourDData 接口

```typescript
interface FourDData {
  dimensions: {
    name: string      // 维度名称
    value: number     // 评分 (0-100)
    description: string // 维度描述
  }[]
  data: {
    label: string     // 数据标签
    value: number     // 数值
    trend: 'up' | 'down' | 'stable' // 趋势
  }[]
  diagnosis: {
    issue: string     // 问题描述
    severity: 'high' | 'medium' | 'low' // 严重程度
    impact: number    // 影响程度 (0-100)
    recommendation: string // 推荐方案
  }[]
  direction: {
    step: string      // 改进步骤
    priority: number  // 优先级
    timeline: string  // 时间线
    resources: string[] // 所需资源
  }[]
}
```

## 依赖包

- `recharts`: 图表库
- `framer-motion`: 动画库
- `@radix-ui/react-progress`: 进度条组件
- `lucide-react`: 图标库

## 自定义配置

### 主题配置

在 `chartUtils.ts` 中可以自定义主题颜色：

```typescript
export const fourDTheme = {
  colors: {
    dimensions: colors.blue,   // 维度 - 蓝色
    data: colors.green,        // 数据 - 绿色
    diagnosis: colors.orange,  // 诊断 - 橙色
    direction: colors.purple,  // 方向 - 紫色
  }
}
```

### 动画配置

```typescript
export const animationConfig = {
  duration: 1500,
  easing: 'easeInOutQuart',
  delay: (context: any) => context.dataIndex * 100,
}
```

## 响应式设计

组件完全支持响应式设计，在不同屏幕尺寸下自动调整布局：

- **移动设备**: 单列布局，简化图表
- **平板设备**: 两列布局，适中的图表尺寸
- **桌面设备**: 多列布局，完整功能展示

## 示例页面

访问 `/efficiency-demo` 查看完整的演示页面，包含所有功能和交互效果。

## 性能优化

- 使用 React.memo 优化组件渲染
- 图表数据缓存和虚拟化
- 动画性能优化
- 懒加载和代码分割

## 浏览器兼容性

- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## 更新日志

### v1.0.0 (2025-10-26)
- ✅ 完整的4D可视化系统
- ✅ 多种图表类型支持
- ✅ 响应式设计
- ✅ 深色模式支持
- ✅ 导出功能
- ✅ 动画效果
- ✅ TypeScript 支持

## 技术要求

- React 18+
- Next.js 14+
- TypeScript
- Tailwind CSS
- Recharts 图表库
- Framer Motion 动画库

## 注意事项

1. 确保项目已安装所需的依赖包
2. 组件需要运行在客户端环境（使用 'use client' 指令）
3. 建议在生产环境中启用代码分割
4. 大数据量时建议使用虚拟化优化