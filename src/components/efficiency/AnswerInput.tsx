import React, { useState, useEffect, useRef } from 'react';
import { Question } from '@/types/confirmation';

interface AnswerInputProps {
  question: Question;
  onAnswerChange: (questionId: string, answer: string) => void;
  onNoteChange: (questionId: string, note: string) => void;
  onConfirmationChange: (questionId: string, confirmed: boolean) => void;
  className?: string;
}

const AnswerInput: React.FC<AnswerInputProps> = ({
  question,
  onAnswerChange,
  onNoteChange,
  onConfirmationChange,
  className = ''
}) => {
  const [answer, setAnswer] = useState(question.userAnswer || '');
  const [note, setNote] = useState(question.notes || '');
  const [isEditing, setIsEditing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setAnswer(question.userAnswer || '');
    setNote(question.notes || '');
  }, [question.userAnswer, question.notes]);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(
        textareaRef.current.value.length,
        textareaRef.current.value.length
      );
    }
  }, [isEditing]);

  const handleAnswerChange = (value: string) => {
    setAnswer(value);
    onAnswerChange(question.id, value);
  };

  const handleNoteChange = (value: string) => {
    setNote(value);
    onNoteChange(question.id, value);
  };

  const handleConfirm = (confirmed: boolean) => {
    onConfirmationChange(question.id, confirmed);
  };

  const getCategoryColor = (category: Question['category']) => {
    switch (category) {
      case 'accuracy':
        return 'text-red-600 bg-red-50 border-red-200';
      case 'completeness':
        return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'clarification':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'additional':
        return 'text-green-600 bg-green-50 border-green-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const getPriorityIcon = (priority: Question['priority']) => {
    switch (priority) {
      case 'high':
        return '🔴 高优先级';
      case 'medium':
        return '🟡 中优先级';
      case 'low':
        return '🟢 低优先级';
      default:
        return '⚪ 未设置';
    }
  };

  const getCategoryLabel = (category: Question['category']) => {
    switch (category) {
      case 'accuracy':
        return '准确性确认';
      case 'completeness':
        return '完整性确认';
      case 'clarification':
        return '澄清说明';
      case 'additional':
        return '补充信息';
      default:
        return '其他';
    }
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-6 ${className}`}>
      {/* 问题头部 */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium">{getPriorityIcon(question.priority)}</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getCategoryColor(question.category)}`}>
            {getCategoryLabel(question.category)}
          </span>
          {question.confirmed && (
            <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
              ✓ 已确认
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">问题 ID: {question.id}</span>
        </div>
      </div>

      {/* 问题内容 */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">{question.content}</h3>

        {question.aiSuggestion && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="text-sm font-medium text-blue-900 mb-2">AI 分析建议：</h4>
            <p className="text-blue-800">{question.aiSuggestion}</p>
          </div>
        )}
      </div>

      {/* 回答输入区域 */}
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            您的回答 *
          </label>
          <textarea
            ref={textareaRef}
            value={answer}
            onChange={(e) => handleAnswerChange(e.target.value)}
            onFocus={() => setIsEditing(true)}
            onBlur={() => setIsEditing(false)}
            placeholder="请输入您的回答或确认意见..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={4}
          />
          <div className="flex justify-between items-center mt-1">
            <span className="text-xs text-gray-500">
              {answer.length} 字符
            </span>
            <div className="text-xs text-gray-400">
              Ctrl+Enter 快速确认
            </div>
          </div>
        </div>

        {/* 备注输入 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            补充备注
          </label>
          <textarea
            value={note}
            onChange={(e) => handleNoteChange(e.target.value)}
            placeholder="如有其他需要说明的内容，请在此输入..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            rows={3}
          />
          <div className="text-xs text-gray-500 mt-1">
            {note.length} 字符
          </div>
        </div>

        {/* 确认按钮 */}
        <div className="flex gap-3 pt-4 border-t border-gray-200">
          <button
            onClick={() => handleConfirm(true)}
            disabled={!answer.trim()}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              answer.trim()
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            ✓ 确认准确
          </button>
          <button
            onClick={() => handleConfirm(false)}
            disabled={!answer.trim()}
            className={`flex-1 px-4 py-2 rounded-lg font-medium transition-colors ${
              answer.trim()
                ? 'bg-red-600 text-white hover:bg-red-700'
                : 'bg-gray-100 text-gray-400 cursor-not-allowed'
            }`}
          >
            ✗ 需要修正
          </button>
          <button
            onClick={() => {
              handleAnswerChange('');
              handleNoteChange('');
              handleConfirmationChange(false);
            }}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
          >
            清空
          </button>
        </div>

        {/* 快捷键提示 */}
        <div className="text-xs text-gray-400 border-t border-gray-100 pt-2">
          <div className="flex justify-between">
            <span>快捷键：Ctrl+Enter 确认 | Ctrl+S 保存草稿</span>
            <span>自动保存已启用</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnswerInput;