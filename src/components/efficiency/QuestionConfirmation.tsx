import React, { useState, useEffect, useCallback } from 'react';
import { Question, ConfirmationState, AnalysisResult } from '@/types/confirmation';
import QuestionList from './QuestionList';
import AnswerInput from './AnswerInput';
import ConfirmationActions from './ConfirmationActions';

interface QuestionConfirmationProps {
  analysisResult: AnalysisResult;
  onConfirmationComplete: (result: ConfirmationState) => void;
  className?: string;
}

const QuestionConfirmation: React.FC<QuestionConfirmationProps> = ({
  analysisResult,
  onConfirmationComplete,
  className = ''
}) => {
  const [state, setState] = useState<ConfirmationState>({
    questions: analysisResult.questions || [],
    overallProgress: 0,
    isCompleted: false
  });

  const [selectedQuestionId, setSelectedQuestionId] = useState<string>('');
  const [autoSaveTimer, setAutoSaveTimer] = useState<NodeJS.Timeout | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'detail' | 'split'>('split');

  
  // 计算进度
  const calculateProgress = useCallback((questions: Question[]) => {
    const completedCount = questions.filter(q => q.confirmed).length;
    return questions.length > 0 ? (completedCount / questions.length) * 100 : 0;
  }, []);

  // 自动保存
  const saveDraft = useCallback(async () => {
    try {
      const draftData = {
        ...state,
        lastSaved: new Date()
      };
      localStorage.setItem('confirmation-draft', JSON.stringify(draftData));
      setState(prev => ({ ...prev, lastSaved: new Date() }));
    } catch (error) {
      console.error('保存草稿失败:', error);
    }
  }, [state]);

  // 加载草稿
  const loadDraft = useCallback(() => {
    try {
      const draftData = localStorage.getItem('confirmation-draft');
      if (draftData) {
        const parsed = JSON.parse(draftData);
        setState({
          ...parsed,
          lastSaved: new Date(parsed.lastSaved)
        });
        return true;
      }
    } catch (error) {
      console.error('加载草稿失败:', error);
    }
    return false;
  }, []);

  // 导出数据
  const exportData = useCallback(() => {
    const exportData = {
      analysisResult,
      confirmationState: state,
      exportTime: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json'
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `confirmation-${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [analysisResult, state]);

  // 更新问题
  const updateQuestion = useCallback((questionId: string, updates: Partial<Question>) => {
    setState(prev => {
      const updatedQuestions = prev.questions.map(q =>
        q.id === questionId ? { ...q, ...updates } : q
      );
      const progress = calculateProgress(updatedQuestions);
      return {
        ...prev,
        questions: updatedQuestions,
        overallProgress: progress
      };
    });
  }, [calculateProgress]);

  // 更新答案
  const updateAnswer = useCallback((questionId: string, answer: string) => {
    updateQuestion(questionId, { userAnswer: answer });
  }, [updateQuestion]);

  // 更新备注
  const updateNote = useCallback((questionId: string, note: string) => {
    updateQuestion(questionId, { notes: note });
  }, [updateQuestion]);

  // 更新确认状态
  const updateConfirmation = useCallback((questionId: string, confirmed: boolean) => {
    updateQuestion(questionId, { confirmed });
  }, [updateQuestion]);

  // 全部确认
  const confirmAll = useCallback(() => {
    setState(prev => {
      const updatedQuestions = prev.questions.map(q => ({
        ...q,
        confirmed: true,
        userAnswer: q.userAnswer || q.aiSuggestion || '确认无误'
      }));
      return {
        ...prev,
        questions: updatedQuestions,
        overallProgress: 100
      };
    });
  }, []);

  // 提交确认
  const submitConfirmation = useCallback(async () => {
    const finalState = {
      ...state,
      isCompleted: true,
      submittedAt: new Date()
    };

    setState(finalState);

    // 清除草稿
    localStorage.removeItem('confirmation-draft');

    // 通知父组件
    onConfirmationComplete(finalState);
  }, [state, onConfirmationComplete]);

  // 选择问题
  const selectQuestion = useCallback((questionId: string) => {
    setSelectedQuestionId(questionId);
  }, []);

  // 键盘事件处理
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 's':
            e.preventDefault();
            saveDraft();
            break;
          case 'a':
            e.preventDefault();
            confirmAll();
            break;
          case 'l':
            e.preventDefault();
            loadDraft();
            break;
          case 'enter':
            e.preventDefault();
            submitConfirmation();
            break;
        }
      } else {
        const currentQuestion = state.questions.find(q => q.id === selectedQuestionId);
        const currentIndex = state.questions.findIndex(q => q.id === selectedQuestionId);

        switch (e.key) {
          case 'ArrowDown':
            if (currentIndex < state.questions.length - 1) {
              selectQuestion(state.questions[currentIndex + 1].id);
            }
            break;
          case 'ArrowUp':
            if (currentIndex > 0) {
              selectQuestion(state.questions[currentIndex - 1].id);
            }
            break;
          case 'Enter':
            if (currentQuestion && !e.shiftKey) {
              updateConfirmation(currentQuestion.id, true);
            }
            break;
          case 'Escape':
            if (currentQuestion) {
              updateConfirmation(currentQuestion.id, false);
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedQuestionId, state.questions, saveDraft, confirmAll, loadDraft, submitConfirmation, updateConfirmation, selectQuestion]);

  // 自动保存
  useEffect(() => {
    if (autoSaveTimer) {
      clearTimeout(autoSaveTimer);
    }

    const timer = setTimeout(() => {
      saveDraft();
    }, 5000); // 5秒后自动保存

    setAutoSaveTimer(timer);

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [state.questions, saveDraft]);

  // 初始化选择第一个问题
  useEffect(() => {
    if (state.questions.length > 0 && !selectedQuestionId) {
      setSelectedQuestionId(state.questions[0].id);
    }
  }, [state.questions, selectedQuestionId]);

  const selectedQuestion = state.questions.find(q => q.id === selectedQuestionId);
  const completedCount = state.questions.filter(q => q.confirmed).length;
  const pendingCount = state.questions.filter(q => !q.confirmed).length;

  return (
    <div className={`max-w-7xl mx-auto p-6 ${className}`}>
      {/* 头部信息 */}
      <div className="mb-8">
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">问题确认系统</h1>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600">{analysisResult.confidence}%</div>
              <div className="text-sm text-gray-600">AI 置信度</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600">{completedCount}</div>
              <div className="text-sm text-gray-600">已确认</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-600">{pendingCount}</div>
              <div className="text-sm text-gray-600">待处理</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600">{state.overallProgress.toFixed(0)}%</div>
              <div className="text-sm text-gray-600">总进度</div>
            </div>
          </div>

          <div className="flex gap-2 flex-wrap">
            {[
              { value: 'split', label: '分屏视图', icon: '📱' },
              { value: 'list', label: '列表视图', icon: '📋' },
              { value: 'detail', label: '详情视图', icon: '📝' }
            ].map(({ value, label, icon }) => (
              <button
                key={value}
                onClick={() => setViewMode(value as 'list' | 'detail' | 'split')}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  viewMode === value
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {icon} {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 主要内容区域 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 左侧：问题列表 */}
        {(viewMode === 'list' || viewMode === 'split') && (
          <div className={viewMode === 'split' ? 'lg:col-span-1' : 'lg:col-span-3'}>
            <QuestionList
              questions={state.questions}
              onQuestionUpdate={updateQuestion}
              onQuestionSelect={selectQuestion}
              selectedQuestionId={selectedQuestionId}
            />
          </div>
        )}

        {/* 中间：问题详情 */}
        {(viewMode === 'detail' || viewMode === 'split') && selectedQuestion && (
          <div className={viewMode === 'split' ? 'lg:col-span-1' : 'lg:col-span-3'}>
            <AnswerInput
              question={selectedQuestion}
              onAnswerChange={updateAnswer}
              onNoteChange={updateNote}
              onConfirmationChange={updateConfirmation}
            />
          </div>
        )}

        {/* 右侧：操作面板 */}
        {(viewMode === 'split') && (
          <div className="lg:col-span-1">
            <ConfirmationActions
              state={state}
              onSaveDraft={saveDraft}
              onSubmit={submitConfirmation}
              onConfirmAll={confirmAll}
              onLoadDraft={loadDraft}
              onExportData={exportData}
            />
          </div>
        )}
      </div>

      {/* 底部操作区域（非分屏模式） */}
      {viewMode !== 'split' && (
        <div className="mt-6">
          <ConfirmationActions
            state={state}
            onSaveDraft={saveDraft}
            onSubmit={submitConfirmation}
            onConfirmAll={confirmAll}
            onLoadDraft={loadDraft}
            onExportData={exportData}
          />
        </div>
      )}

      {/* 状态提示 */}
      {state.isCompleted && (
        <div className="fixed bottom-4 right-4 bg-green-600 text-white px-6 py-3 rounded-lg shadow-lg">
          ✓ 确认已完成并提交
        </div>
      )}
    </div>
  );
};

export default QuestionConfirmation;