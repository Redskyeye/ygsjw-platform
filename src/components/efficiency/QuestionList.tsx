import React, { useState } from 'react';
import { Question } from '@/types/confirmation';

interface QuestionListProps {
  questions: Question[];
  onQuestionUpdate: (questionId: string, updates: Partial<Question>) => void;
  onQuestionSelect: (questionId: string) => void;
  selectedQuestionId?: string;
  className?: string;
}

const QuestionList: React.FC<QuestionListProps> = ({
  questions,
  onQuestionUpdate,
  onQuestionSelect,
  selectedQuestionId,
  className = ''
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'confirmed' | 'high-priority'>('all');

  const filteredQuestions = questions.filter(question => {
    switch (filter) {
      case 'pending':
        return !question.confirmed;
      case 'confirmed':
        return question.confirmed;
      case 'high-priority':
        return question.priority === 'high';
      default:
        return true;
    }
  });

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
        return '🔴';
      case 'medium':
        return '🟡';
      case 'low':
        return '🟢';
      default:
        return '⚪';
    }
  };

  const completedCount = questions.filter(q => q.confirmed).length;
  const progressPercentage = questions.length > 0 ? (completedCount / questions.length) * 100 : 0;

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 进度统计 */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <div className="flex justify-between items-center mb-2">
          <h3 className="text-lg font-semibold text-gray-900">问题确认进度</h3>
          <span className="text-sm text-gray-500">
            {completedCount} / {questions.length} 已完成
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
          />
        </div>
      </div>

      {/* 筛选器 */}
      <div className="flex gap-2 flex-wrap">
        {[
          { value: 'all', label: '全部', count: questions.length },
          { value: 'pending', label: '待确认', count: questions.filter(q => !q.confirmed).length },
          { value: 'confirmed', label: '已确认', count: questions.filter(q => q.confirmed).length },
          { value: 'high-priority', label: '高优先级', count: questions.filter(q => q.priority === 'high').length }
        ].map(({ value, label, count }) => (
          <button
            key={value}
            onClick={() => setFilter(value as 'all' | 'pending' | 'confirmed' | 'high-priority')}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filter === value
                ? 'bg-blue-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {label} ({count})
          </button>
        ))}
      </div>

      {/* 问题列表 */}
      <div className="space-y-3">
        {filteredQuestions.map((question) => (
          <div
            key={question.id}
            onClick={() => onQuestionSelect(question.id)}
            className={`border rounded-lg p-4 cursor-pointer transition-all ${
              selectedQuestionId === question.id
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
            } ${question.confirmed ? 'bg-green-50' : ''}`}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getPriorityIcon(question.priority)}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getCategoryColor(question.category)}`}>
                    {question.category === 'accuracy' && '准确性'}
                    {question.category === 'completeness' && '完整性'}
                    {question.category === 'clarification' && '澄清'}
                    {question.category === 'additional' && '补充'}
                  </span>
                  {question.confirmed && (
                    <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                      ✓ 已确认
                    </span>
                  )}
                </div>

                <h4 className="font-medium text-gray-900 mb-2">{question.content}</h4>

                {question.aiSuggestion && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 mb-2">
                    <p className="text-sm text-blue-800">
                      <span className="font-medium">AI建议：</span>
                      {question.aiSuggestion}
                    </p>
                  </div>
                )}

                {question.userAnswer && (
                  <div className="bg-green-50 border border-green-200 rounded p-2 mb-2">
                    <p className="text-sm text-green-800">
                      <span className="font-medium">您的回答：</span>
                      {question.userAnswer}
                    </p>
                  </div>
                )}

                {question.notes && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded p-2">
                    <p className="text-sm text-yellow-800">
                      <span className="font-medium">备注：</span>
                      {question.notes}
                    </p>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 mt-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuestionUpdate(question.id, { confirmed: true });
                }}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  question.confirmed
                    ? 'bg-green-100 text-green-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-green-100 hover:text-green-800'
                }`}
              >
                ✓ 确认
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onQuestionUpdate(question.id, { confirmed: false });
                }}
                className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                  !question.confirmed && question.userAnswer
                    ? 'bg-red-100 text-red-800'
                    : 'bg-gray-100 text-gray-700 hover:bg-red-100 hover:text-red-800'
                }`}
              >
                ✗ 需要修改
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredQuestions.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>没有找到符合条件的问题</p>
        </div>
      )}
    </div>
  );
};

export default QuestionList;