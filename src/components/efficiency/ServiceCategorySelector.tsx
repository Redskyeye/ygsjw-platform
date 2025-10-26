import React, { useState, useEffect, useMemo } from 'react';
import { Search, Sparkles, ChevronDown, ChevronUp, Grid3X3, List } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CategoryCard } from './CategoryCard';
import { cn } from '@/lib/utils';
import {
  ServiceCategory,
  ServiceCategorySelectorProps,
  SERVICE_CATEGORIES,
  getPopularCategories,
  searchCategories,
  getRecommendedCategories
} from '@/types/efficiency';

export function ServiceCategorySelector({
  onCategorySelect,
  initialCategory,
  showRecommended = true,
  allowSearch = true,
  maxRecommended = 3,
  variant = 'grid',
  className
}: ServiceCategorySelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // 初始化选中的类别
  useEffect(() => {
    if (initialCategory) {
      const category = Object.values(SERVICE_CATEGORIES).find(c => c.id === initialCategory);
      if (category) {
        setSelectedCategory(category);
      }
    }
  }, [initialCategory]);

  // 获取推荐的类别
  const recommendedCategories = useMemo(() => {
    if (!showRecommended) return [];
    return getRecommendedCategories(searchQuery).slice(0, maxRecommended);
  }, [searchQuery, showRecommended, maxRecommended]);

  // 获取搜索结果
  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    return searchCategories(searchQuery);
  }, [searchQuery]);

  // 获取所有类别（用于展开视图）
  const allCategories = useMemo(() => {
    return Object.values(SERVICE_CATEGORIES);
  }, []);

  // 获取显示的类别
  const displayCategories = useMemo(() => {
    if (searchQuery.trim()) {
      return searchResults;
    }
    if (!isExpanded) {
      return recommendedCategories.length > 0 ? recommendedCategories : getPopularCategories();
    }
    return allCategories;
  }, [searchQuery, isExpanded, recommendedCategories, searchResults, allCategories]);

  const handleCategorySelect = (category: ServiceCategory) => {
    setSelectedCategory(category);
    onCategorySelect?.(category);
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setIsExpanded(true); // 搜索时自动展开
  };

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
    if (!isExpanded) {
      setSearchQuery(''); // 展开时清除搜索
    }
  };

  const handleLearnMore = (category: ServiceCategory) => {
    // 这里可以打开一个模态框或导航到详情页
    console.log('了解更多:', category.name);
    // TODO: 实现详情展示功能
  };

  const cardVariant = variant === 'list' ? 'compact' : 'default';

  return (
    <div className={cn('w-full max-w-6xl mx-auto space-y-6', className)}>
      {/* 头部标题 */}
      <div className="text-center space-y-2">
        <h2 className="text-2xl font-bold text-foreground">
          选择AI服务类别
        </h2>
        <p className="text-muted-foreground">
          根据您的需求选择最适合的AI服务类型，我们将为您提供专业的解决方案
        </p>
      </div>

      {/* 搜索栏 */}
      {allowSearch && (
        <div className="relative max-w-md mx-auto">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索服务类别..."
            value={searchQuery}
            onChange={handleSearchChange}
            className="pl-10 pr-4"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchQuery('')}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 px-2"
            >
              清除
            </Button>
          )}
        </div>
      )}

      {/* 推荐提示 */}
      {showRecommended && !searchQuery && recommendedCategories.length > 0 && !isExpanded && (
        <Alert className="max-w-2xl mx-auto">
          <Sparkles className="h-4 w-4" />
          <AlertDescription>
            基于您的需求，我们为您推荐以下服务类别
          </AlertDescription>
        </Alert>
      )}

      {/* 搜索结果提示 */}
      {searchQuery && (
        <div className="text-center space-y-2">
          <p className="text-sm text-muted-foreground">
            找到 {searchResults.length} 个相关服务类别
          </p>
          {searchResults.length === 0 && (
            <p className="text-sm text-muted-foreground">
              没有找到匹配的结果，请尝试其他关键词
            </p>
          )}
        </div>
      )}

      {/* 视图模式切换 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Badge variant="outline" className="text-xs">
            共 {allCategories.length} 个服务类别
          </Badge>
          {selectedCategory && (
            <Badge variant="secondary" className="text-xs">
              已选择: {selectedCategory.name}
            </Badge>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className="h-8 px-3"
          >
            <Grid3X3 className="h-3 w-3 mr-1" />
            网格
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-8 px-3"
          >
            <List className="h-3 w-3 mr-1" />
            列表
          </Button>
        </div>
      </div>

      {/* 类别卡片网格 */}
      <div className={cn(
        'gap-4',
        viewMode === 'grid'
          ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          : 'flex flex-col space-y-3'
      )}>
        {displayCategories.map((category) => (
          <CategoryCard
            key={category.id}
            category={category}
            isSelected={selectedCategory?.id === category.id}
            isRecommended={recommendedCategories.some(c => c.id === category.id)}
            onSelect={handleCategorySelect}
            onLearnMore={handleLearnMore}
            variant={cardVariant}
          />
        ))}
      </div>

      {/* 展开/收起按钮 */}
      {!searchQuery && allCategories.length > recommendedCategories.length && (
        <div className="flex justify-center pt-4">
          <Button
            variant="outline"
            onClick={toggleExpanded}
            className="flex items-center space-x-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                <span>收起</span>
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                <span>查看全部服务类别</span>
              </>
            )}
          </Button>
        </div>
      )}

      {/* 选中状态显示 */}
      {selectedCategory && (
        <div className="mt-6 p-4 rounded-lg bg-muted/50 border">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-semibold text-sm">已选择服务</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {selectedCategory.name} - {selectedCategory.description}
              </p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategory(null)}
            >
              重新选择
            </Button>
          </div>
        </div>
      )}

      {/* 空状态 */}
      {displayCategories.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto w-12 h-12 rounded-lg bg-muted flex items-center justify-center mb-4">
            <Search className="h-6 w-6 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold mb-2">没有找到匹配的服务类别</h3>
          <p className="text-muted-foreground mb-4">
            请尝试其他搜索词或浏览所有服务类别
          </p>
          <Button variant="outline" onClick={() => setSearchQuery('')}>
            清除搜索
          </Button>
        </div>
      )}
    </div>
  );
}

export default ServiceCategorySelector;