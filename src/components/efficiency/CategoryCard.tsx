import React from 'react';
import {
  BarChart3,
  PenTool,
  Image,
  Mic,
  Code2,
  Languages,
  MessageCircleQuestion,
  Star,
  TrendingUp,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { ServiceCategory, CategoryCardProps } from '@/types/efficiency';

// 图标映射
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  'BarChart3': BarChart3,
  'PenTool': PenTool,
  'Image': Image,
  'Mic': Mic,
  'Code2': Code2,
  'Languages': Languages,
  'MessageCircleQuestion': MessageCircleQuestion
};

// 颜色映射
const colorClasses: Record<string, { bg: string; text: string; border: string; hover: string }> = {
  blue: {
    bg: 'bg-blue-50 dark:bg-blue-950',
    text: 'text-blue-700 dark:text-blue-300',
    border: 'border-blue-200 dark:border-blue-800',
    hover: 'hover:bg-blue-100 dark:hover:bg-blue-900'
  },
  purple: {
    bg: 'bg-purple-50 dark:bg-purple-950',
    text: 'text-purple-700 dark:text-purple-300',
    border: 'border-purple-200 dark:border-purple-800',
    hover: 'hover:bg-purple-100 dark:hover:bg-purple-900'
  },
  green: {
    bg: 'bg-green-50 dark:bg-green-950',
    text: 'text-green-700 dark:text-green-300',
    border: 'border-green-200 dark:border-green-800',
    hover: 'hover:bg-green-100 dark:hover:bg-green-900'
  },
  orange: {
    bg: 'bg-orange-50 dark:bg-orange-950',
    text: 'text-orange-700 dark:text-orange-300',
    border: 'border-orange-200 dark:border-orange-800',
    hover: 'hover:bg-orange-100 dark:hover:bg-orange-900'
  },
  red: {
    bg: 'bg-red-50 dark:bg-red-950',
    text: 'text-red-700 dark:text-red-300',
    border: 'border-red-200 dark:border-red-800',
    hover: 'hover:bg-red-100 dark:hover:bg-red-900'
  },
  indigo: {
    bg: 'bg-indigo-50 dark:bg-indigo-950',
    text: 'text-indigo-700 dark:text-indigo-300',
    border: 'border-indigo-200 dark:border-indigo-800',
    hover: 'hover:bg-indigo-100 dark:hover:bg-indigo-900'
  },
  teal: {
    bg: 'bg-teal-50 dark:bg-teal-950',
    text: 'text-teal-700 dark:text-teal-300',
    border: 'border-teal-200 dark:border-teal-800',
    hover: 'hover:bg-teal-100 dark:hover:bg-teal-900'
  }
};

export function CategoryCard({
  category,
  isSelected,
  isRecommended,
  onSelect,
  onLearnMore,
  variant = 'default'
}: CategoryCardProps) {
  const IconComponent = iconMap[category.icon] || MessageCircleQuestion;
  const colors = colorClasses[category.color] || colorClasses.blue;

  const handleCardClick = () => {
    onSelect(category);
  };

  const handleLearnMore = (e: React.MouseEvent) => {
    e.stopPropagation();
    onLearnMore?.(category);
  };

  const renderCompactVariant = () => (
    <div
      className={cn(
        'p-4 rounded-lg border-2 cursor-pointer transition-all duration-200',
        colors.bg,
        colors.border,
        colors.hover,
        isSelected && 'ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400'
      )}
      onClick={handleCardClick}
    >
      <div className="flex items-center space-x-3">
        <div className={cn('p-2 rounded-lg', colors.text)}>
          <IconComponent className="h-5 w-5" />
        </div>
        <div className="flex-1">
          <h3 className={cn('font-semibold text-sm', colors.text)}>
            {category.name}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
            {category.description}
          </p>
        </div>
        {isSelected && (
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
        )}
      </div>
    </div>
  );

  const renderDetailedVariant = () => (
    <Card
      className={cn(
        'cursor-pointer transition-all duration-200 hover:shadow-lg',
        colors.bg,
        colors.border,
        isSelected && 'ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400'
      )}
      onClick={handleCardClick}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={cn('p-2 rounded-lg', colors.text)}>
              <IconComponent className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className={cn('text-lg', colors.text)}>
                {category.name}
              </CardTitle>
              {isRecommended && (
                <div className="flex items-center space-x-1 mt-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  <span className="text-xs text-yellow-600 dark:text-yellow-400">
                    推荐服务
                  </span>
                </div>
              )}
            </div>
          </div>
          {isSelected && (
            <div className="w-3 h-3 bg-blue-500 rounded-full" />
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <CardDescription className="text-sm leading-relaxed">
          {category.description}
        </CardDescription>

        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            核心功能
          </h4>
          <div className="flex flex-wrap gap-1">
            {category.features.slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
            {category.features.length > 3 && (
              <Badge variant="outline" className="text-xs">
                +{category.features.length - 3}
              </Badge>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            应用示例
          </h4>
          <div className="text-xs text-muted-foreground space-y-1">
            {category.examples.slice(0, 2).map((example, index) => (
              <div key={index} className="flex items-center space-x-1">
                <div className="w-1 h-1 rounded-full bg-muted-foreground" />
                <span>{example}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3" />
            <span>热门服务</span>
          </div>

          {onLearnMore && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLearnMore}
              className="h-6 px-2 text-xs"
            >
              <Info className="h-3 w-3 mr-1" />
              了解更多
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );

  const renderDefaultVariant = () => (
    <div
      className={cn(
        'p-6 rounded-xl border-2 cursor-pointer transition-all duration-200 hover:shadow-md',
        colors.bg,
        colors.border,
        colors.hover,
        isSelected && 'ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400'
      )}
      onClick={handleCardClick}
    >
      <div className="flex flex-col space-y-4">
        <div className="flex items-center justify-between">
          <div className={cn('p-3 rounded-lg', colors.text)}>
            <IconComponent className="h-6 w-6" />
          </div>
          {isRecommended && (
            <Badge variant="secondary" className="text-xs">
              <Star className="h-3 w-3 mr-1 fill-yellow-400 text-yellow-400" />
              推荐
            </Badge>
          )}
        </div>

        <div>
          <h3 className={cn('font-semibold text-base', colors.text)}>
            {category.name}
          </h3>
          <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
            {category.description}
          </p>
        </div>

        <div className="flex flex-wrap gap-1">
          {category.features.slice(0, 2).map((feature, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {feature}
            </Badge>
          ))}
          {category.features.length > 2 && (
            <Badge variant="outline" className="text-xs">
              +{category.features.length - 2}
            </Badge>
          )}
        </div>

        {isSelected && (
          <div className="flex items-center justify-center py-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full" />
          </div>
        )}
      </div>
    </div>
  );

  switch (variant) {
    case 'compact':
      return renderCompactVariant();
    case 'detailed':
      return renderDetailedVariant();
    default:
      return renderDefaultVariant();
  }
}