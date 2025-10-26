export interface Question {
  id: string;
  content: string;
  category: 'accuracy' | 'completeness' | 'clarification' | 'additional';
  aiSuggestion?: string;
  userAnswer?: string;
  confirmed: boolean;
  notes?: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ConfirmationState {
  questions: Question[];
  overallProgress: number;
  lastSaved?: Date;
  isCompleted: boolean;
  submittedAt?: Date;
}

export interface AnalysisResult {
  id: string;
  title: string;
  summary: string;
  confidence: number;
  keyFindings: string[];
  suggestedActions: string[];
  questions: Question[];
}

export interface ConfirmationHandlers {
  confirmQuestion: (questionId: string, confirmed: boolean) => void;
  updateAnswer: (questionId: string, answer: string) => void;
  addNote: (questionId: string, note: string) => void;
  confirmAll: () => void;
  submitConfirmation: () => void;
  saveDraft: () => void;
  loadDraft: () => void;
}

export type KeyboardShortcuts = {
  confirm: string;
  reject: string;
  next: string;
  previous: string;
  save: string;
  submit: string;
};