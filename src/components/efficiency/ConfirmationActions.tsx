import React, { useState } from 'react';
import { ConfirmationState } from '@/types/confirmation';

interface ConfirmationActionsProps {
  state: ConfirmationState;
  onSaveDraft: () => void;
  onSubmit: () => void;
  onConfirmAll: () => void;
  onLoadDraft: () => void;
  onExportData: () => void;
  className?: string;
}

const ConfirmationActions: React.FC<ConfirmationActionsProps> = ({
  state,
  onSaveDraft,
  onSubmit,
  onConfirmAll,
  onLoadDraft,
  onExportData,
  className = ''
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showExportMenu, setShowExportMenu] = useState(false);

  const handleSubmit = async () => {
    if (isSubmitting) return;

    // 验证是否所有问题都已确认
    const unconfirmedQuestions = state.questions.filter(q => !q.confirmed);
    if (unconfirmedQuestions.length > 0) {
      const confirmed = confirm(
        `还有 ${unconfirmedQuestions.length} 个问题未确认，确定要提交吗？\n未确认的问题将被标记为"需要修正"。`
      );
      if (!confirmed) return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveDraft = async () => {
    if (isSaving) return;

    setIsSaving(true);
    try {
      await onSaveDraft();
      // 显示保存成功提示
      setTimeout(() => setIsSaving(false), 1000);
    } catch (error) {
      setIsSaving(false);
    }
  };

  const handleConfirmAll = () => {
    const unconfirmedQuestions = state.questions.filter(q => !q.confirmed);
    if (unconfirmedQuestions.length === 0) {
      alert('所有问题都已确认！');
      return;
    }

    const confirmed = confirm(
      `确定要确认所有 ${unconfirmedQuestions.length} 个未确认的问题吗？\n这将把当前AI建议作为最终答案。`
    );
    if (confirmed) {
      onConfirmAll();
    }
  };

  const formatLastSaved = (date?: Date) => {
    if (!date) return '未保存';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / (1000 * 60));

    if (minutes < 1) return '刚刚保存';
    if (minutes < 60) return `${minutes}分钟前保存`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}小时前保存`;
    return date.toLocaleDateString('zh-CN');
  };

  const completedCount = state.questions.filter(q => q.confirmed).length;
  const progressPercentage = state.questions.length > 0 ? (completedCount / state.questions.length) * 100 : 0;
  const canSubmit = state.questions.length > 0 && completedCount > 0;

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* 状态概览 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">操作面板</h3>

        {/* 进度信息 */}
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{progressPercentage.toFixed(0)}%</div>
            <div className="text-sm text-blue-800">完成进度</div>
            <div className="text-xs text-blue-600 mt-1">
              {completedCount} / {state.questions.length} 已确认
            </div>
          </div>
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {formatLastSaved(state.lastSaved)}
            </div>
            <div className="text-sm text-green-800">上次保存</div>
            {state.lastSaved && (
              <div className="text-xs text-green-600 mt-1">
                {state.lastSaved.toLocaleString('zh-CN')}
              </div>
            )}
          </div>
        </div>

        {/* 进度条 */}
        <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
          <div
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
        <div className="flex justify-between text-xs text-gray-500">
          <span>开始</span>
          <span>完成</span>
        </div>
      </div>

      {/* 主要操作按钮 */}
      <div className="space-y-3">
        {/* 提交按钮 */}
        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isSubmitting}
          className={`w-full px-4 py-3 rounded-lg font-medium transition-all transform ${
            canSubmit && !isSubmitting
              ? 'bg-blue-600 text-white hover:bg-blue-700 hover:scale-[1.02] shadow-lg'
              : 'bg-gray-100 text-gray-400 cursor-not-allowed'
          }`}
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              提交中...
            </span>
          ) : (
            `提交确认 (${completedCount}/${state.questions.length})`
          )}
        </button>

        {/* 批量操作 */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={handleConfirmAll}
            disabled={state.questions.length === 0 || completedCount === state.questions.length}
            className="px-4 py-2 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
          >
            ✓ 全部确认
          </button>
          <button
            onClick={handleSaveDraft}
            disabled={isSaving}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
          >
            {isSaving ? '保存中...' : '💾 保存草稿'}
          </button>
        </div>

        {/* 辅助操作 */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={onLoadDraft}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            📂 加载草稿
          </button>

          {/* 导出菜单 */}
          <div className="relative">
            <button
              onClick={() => setShowExportMenu(!showExportMenu)}
              className="w-full px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              📤 导出
            </button>
            {showExportMenu && (
              <div className="absolute bottom-full left-0 mb-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                <button
                  onClick={() => {
                    onExportData();
                    setShowExportMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  导出为 JSON
                </button>
                <button
                  onClick={() => {
                    // 导出为 CSV
                    setShowExportMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  导出为 CSV
                </button>
                <button
                  onClick={() => {
                    // 打印预览
                    setShowExportMenu(false);
                  }}
                  className="w-full px-3 py-2 text-left text-sm hover:bg-gray-50 transition-colors"
                >
                  打印预览
                </button>
              </div>
            )}
          </div>

          <button
            onClick={() => window.print()}
            className="px-3 py-2 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            🖨️ 打印
          </button>
        </div>
      </div>

      {/* 状态说明 */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="text-sm text-gray-600 space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>进行中 - {state.questions.filter(q => !q.confirmed).length} 个问题待处理</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>已完成 - {completedCount} 个问题已确认</span>
          </div>
          {state.isCompleted && (
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
              <span>已提交 - {state.submittedAt?.toLocaleString('zh-CN')}</span>
            </div>
          )}
        </div>
      </div>

      {/* 快捷键提示 */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg">
        <h4 className="text-sm font-medium text-gray-700 mb-2">键盘快捷键</h4>
        <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
          <div>Ctrl + S: 保存草稿</div>
          <div>Ctrl + Enter: 提交确认</div>
          <div>Ctrl + A: 全部确认</div>
          <div>Ctrl + L: 加载草稿</div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationActions;