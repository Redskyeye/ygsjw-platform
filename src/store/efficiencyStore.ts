import React, { createContext, useContext, useReducer, ReactNode } from 'react';
import {
  ServiceCategory,
  CategorySelectorState,
  ReportData,
  ReportTemplate,
  ReportGenerationState
} from '@/types/efficiency';

interface EfficiencyContextType {
  state: CategorySelectorState;
  dispatch: React.Dispatch<EfficiencyAction>;
  reportState?: ReportGenerationState;
  currentReport?: ReportData;
  templates?: ReportTemplate[];
}

type EfficiencyAction =
  | { type: 'SELECT_CATEGORY'; payload: ServiceCategory }
  | { type: 'CLEAR_SELECTION' }
  | { type: 'TOGGLE_EXPANDED' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_RECOMMENDED_CATEGORIES'; payload: ServiceCategory[] }
  | { type: 'RESET_STATE' }
  | { type: 'SET_REPORT_STATE'; payload: ReportGenerationState }
  | { type: 'SET_CURRENT_REPORT'; payload: ReportData }
  | { type: 'SET_TEMPLATES'; payload: ReportTemplate[] };

const initialState: CategorySelectorState = {
  selectedCategory: null,
  isExpanded: false,
  searchQuery: '',
  recommendedCategories: []
};

function efficiencyReducer(state: CategorySelectorState, action: EfficiencyAction): CategorySelectorState {
  switch (action.type) {
    case 'SELECT_CATEGORY':
      return {
        ...state,
        selectedCategory: action.payload,
        isExpanded: false
      };

    case 'CLEAR_SELECTION':
      return {
        ...state,
        selectedCategory: null
      };

    case 'TOGGLE_EXPANDED':
      return {
        ...state,
        isExpanded: !state.isExpanded
      };

    case 'SET_SEARCH_QUERY':
      return {
        ...state,
        searchQuery: action.payload
      };

    case 'SET_RECOMMENDED_CATEGORIES':
      return {
        ...state,
        recommendedCategories: action.payload
      };

    case 'RESET_STATE':
      return initialState;

    case 'SET_REPORT_STATE':
      return state; // 报告状态单独管理

    case 'SET_CURRENT_REPORT':
      return state; // 报告数据单独管理

    case 'SET_TEMPLATES':
      return state; // 模板数据单独管理

    default:
      return state;
  }
}

const EfficiencyContext = createContext<EfficiencyContextType | undefined>(undefined);

interface EfficiencyProviderProps {
  children: ReactNode;
}

export function EfficiencyProvider({ children }: EfficiencyProviderProps) {
  const [state, dispatch] = useReducer(efficiencyReducer, initialState);

  const value = {
    state,
    dispatch
  };

  return (
    <EfficiencyContext.Provider value={value}>
      {children}
    </EfficiencyContext.Provider>
  );
}

export function useEfficiencyStore() {
  const context = useContext(EfficiencyContext);
  if (context === undefined) {
    throw new Error('useEfficiencyStore must be used within an EfficiencyProvider');
  }
  return context;
}

// Action creators
export const efficiencyActions = {
  selectCategory: (category: ServiceCategory) => ({
    type: 'SELECT_CATEGORY' as const,
    payload: category
  }),

  clearSelection: () => ({
    type: 'CLEAR_SELECTION' as const
  }),

  toggleExpanded: () => ({
    type: 'TOGGLE_EXPANDED' as const
  }),

  setSearchQuery: (query: string) => ({
    type: 'SET_SEARCH_QUERY' as const,
    payload: query
  }),

  setRecommendedCategories: (categories: ServiceCategory[]) => ({
    type: 'SET_RECOMMENDED_CATEGORIES' as const,
    payload: categories
  }),

  resetState: () => ({
    type: 'RESET_STATE' as const
  })
};

// Custom hooks for specific operations
export function useCategorySelection() {
  const { state, dispatch } = useEfficiencyStore();

  const selectCategory = (category: ServiceCategory) => {
    dispatch(efficiencyActions.selectCategory(category));
  };

  const clearSelection = () => {
    dispatch(efficiencyActions.clearSelection());
  };

  return {
    selectedCategory: state.selectedCategory,
    selectCategory,
    clearSelection
  };
}

export function useSearchAndRecommendations() {
  const { state, dispatch } = useEfficiencyStore();

  const setSearchQuery = (query: string) => {
    dispatch(efficiencyActions.setSearchQuery(query));
  };

  const setRecommendedCategories = (categories: ServiceCategory[]) => {
    dispatch(efficiencyActions.setRecommendedCategories(categories));
  };

  return {
    searchQuery: state.searchQuery,
    recommendedCategories: state.recommendedCategories,
    setSearchQuery,
    setRecommendedCategories
  };
}

export function useExpandedState() {
  const { state, dispatch } = useEfficiencyStore();

  const toggleExpanded = () => {
    dispatch(efficiencyActions.toggleExpanded());
  };

  return {
    isExpanded: state.isExpanded,
    toggleExpanded
  };
}