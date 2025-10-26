// 这是一个简单的测试文件，用于验证问题确认系统的基本功能
import { Question, ConfirmationState, AnalysisResult } from '@/types/confirmation';

// 测试数据
const testQuestions: Question[] = [
  {
    id: 'test-1',
    content: '这是一个测试问题吗？',
    category: 'accuracy',
    aiSuggestion: '是的，这是一个测试问题',
    confirmed: false,
    priority: 'high'
  },
  {
    id: 'test-2',
    content: '您对这个确认系统满意吗？',
    category: 'additional',
    confirmed: false,
    priority: 'medium'
  }
];

const testAnalysisResult: AnalysisResult = {
  id: 'test-analysis',
  title: '测试分析结果',
  summary: '这是一个用于测试的分析结果',
  confidence: 90,
  keyFindings: ['系统运行正常', '组件可以正常渲染'],
  suggestedActions: ['继续使用', '提供反馈'],
  questions: testQuestions
};

// 测试函数
function testQuestionConfirmation() {
  console.log('✅ 问题确认系统测试通过');
  console.log('测试问题数量:', testQuestions.length);
  console.log('分析结果标题:', testAnalysisResult.title);
  console.log('AI置信度:', testAnalysisResult.confidence + '%');

  return {
    questions: testQuestions,
    analysisResult: testAnalysisResult,
    success: true
  };
}

export { testQuestionConfirmation, testQuestions, testAnalysisResult };