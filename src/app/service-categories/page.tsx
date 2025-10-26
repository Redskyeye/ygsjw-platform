'use client';

import React, { useState } from 'react';
import { EfficiencyProvider } from '@/store/efficiencyStore';
import ServiceCategorySelector from '@/components/efficiency/ServiceCategorySelector';
import { ServiceCategory } from '@/types/efficiency';

export default function ServiceCategoriesPage() {
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);

  const handleCategorySelect = (category: ServiceCategory) => {
    setSelectedCategory(category);
    console.log('选择了服务类别:', category);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8 px-4">
        <EfficiencyProvider>
          <div className="space-y-8">
            {/* 页面标题 */}
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold text-foreground">
                AI服务类别选择
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                选择适合您需求的AI服务类型，体验智能化的解决方案
              </p>
            </div>

            {/* 服务类别选择器 */}
            <ServiceCategorySelector
              onCategorySelect={handleCategorySelect}
              showRecommended={true}
              allowSearch={true}
              maxRecommended={3}
              variant="grid"
            />

            {/* 选中结果展示 */}
            {selectedCategory && (
              <div className="mt-12 p-6 rounded-xl bg-card border-2 border-border">
                <h2 className="text-2xl font-bold mb-4">已选择的服务类别</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-semibold text-lg mb-2">{selectedCategory.name}</h3>
                    <p className="text-muted-foreground mb-4">{selectedCategory.description}</p>

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-medium text-sm mb-2">核心功能</h4>
                        <ul className="space-y-1">
                          {selectedCategory.features.map((feature, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="font-medium text-sm mb-2">应用示例</h4>
                        <ul className="space-y-1">
                          {selectedCategory.examples.map((example, index) => (
                            <li key={index} className="text-sm text-muted-foreground flex items-center">
                              <div className="w-1.5 h-1.5 rounded-full bg-secondary mr-2" />
                              {example}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-center">
                    <div className="text-center space-y-4">
                      <div className="w-16 h-16 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-2xl">✨</span>
                      </div>
                      <div>
                        <h4 className="font-semibold">准备开始使用</h4>
                        <p className="text-sm text-muted-foreground mt-1">
                          您已选择 {selectedCategory.name}，点击下方按钮开始体验
                        </p>
                      </div>
                      <button className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors">
                        开始使用
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 功能说明 */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center space-y-3 p-6 rounded-lg bg-muted/50">
                <div className="w-12 h-12 mx-auto bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🎯</span>
                </div>
                <h3 className="font-semibold">智能推荐</h3>
                <p className="text-sm text-muted-foreground">
                  基于您的需求智能推荐最适合的服务类别
                </p>
              </div>

              <div className="text-center space-y-3 p-6 rounded-lg bg-muted/50">
                <div className="w-12 h-12 mx-auto bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                  <span className="text-xl">🔍</span>
                </div>
                <h3 className="font-semibold">快速搜索</h3>
                <p className="text-sm text-muted-foreground">
                  通过关键词快速找到所需的服务类型
                </p>
              </div>

              <div className="text-center space-y-3 p-6 rounded-lg bg-muted/50">
                <div className="w-12 h-12 mx-auto bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                  <span className="text-xl">📱</span>
                </div>
                <h3 className="font-semibold">响应式设计</h3>
                <p className="text-sm text-muted-foreground">
                  完美适配各种设备，随时随地使用
                </p>
              </div>
            </div>
          </div>
        </EfficiencyProvider>
      </div>
    </div>
  );
}