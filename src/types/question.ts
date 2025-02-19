import { QuestionItem } from '@/utils/questionContent'

export type QuestionType = 'multiple-choice' | 'drag-drop' | 'graph' | 'order' | 'fill-blank' | 'line-match' | 'quick-tap' | 'type-in' | 'graph-plot' | 'slider-input'

export interface BaseQuestion {
  id: string
  type: QuestionType
  difficulty: number
  points: number
}

export interface MultipleChoiceQuestion extends BaseQuestion {
  type: 'multiple-choice'
  question: string
  options: QuestionItem[]
  correctAnswers: string[]
  multiSelect?: boolean
  explanation?: string
}

export interface DragDropQuestion extends BaseQuestion {
  type: 'drag-drop'
  question: string
  items: QuestionItem[]
  dropZones: Array<{
    id: string
    correctItemId: string
    placeholder?: string
  }>
  correctOrder: string[]
  explanation?: string
}

export interface GraphQuestion extends BaseQuestion {
  type: 'graph'
  question: string
  correctPoints: { x: number; y: number }[]
  gridConfig: {
    xMin: number
    xMax: number
    yMin: number
    yMax: number
    showGrid: boolean
  }
  explanation?: string
}

export interface OrderQuestion extends BaseQuestion {
  type: 'order'
  question: string
  correctOrder: string[]
  explanation?: string
  // For number ordering
  numbers?: number[]
  // For step ordering
  initialEquation?: string
  steps?: Array<{
    text: string
    equation: string
    explanation?: string
  }>
}

export interface FillBlankQuestion extends BaseQuestion {
  type: 'fill-blank'
  question: string
  blanks: Array<{
    id: string
    answer: string
    position: number
    acceptableAnswers?: string[] // Alternative correct answers
  }>
  explanation?: string
}

export interface LineMatchQuestion extends BaseQuestion {
  type: 'line-match'
  question: string
  leftItems: QuestionItem[]
  rightItems: QuestionItem[]
  correctConnections: Array<{from: number, to: number}>
  explanation?: string
}

export interface QuickTapQuestion extends BaseQuestion {
  type: 'quick-tap'
  question: string
  items: Array<{
    text: QuestionItem
    isCorrect: boolean
  }>
  timeLimit: number // in seconds
  minCorrect: number // minimum number of correct taps needed
  explanation?: string
}

export interface TypeInQuestion extends BaseQuestion {
  type: 'type-in'
  question: string
  correctAnswer: string
  acceptableAnswers?: string[] // Alternative correct answers
  caseSensitive?: boolean
  validation?: {
    type: 'number' | 'text' | 'formula'
    min?: number
    max?: number
    precision?: number // For numbers, how many decimal places to check
    pattern?: string // Regex pattern for text validation
    integer?: boolean // For numbers, whether to require whole numbers
    tolerance?: number // for numbers, (acceptable range = correctAnswer ± tolerance)
  }
  explanation?: string
}

export interface GraphPlotQuestion extends BaseQuestion {
  type: 'graph-plot'
  question: string
  plotType: 'function' | 'inequality'
  correctFunction: string // e.g., "x^2 + 2x + 1" or "2x + y > 4"
  gridConfig: {
    xMin: number
    xMax: number
    yMin: number
    yMax: number
    showGrid: boolean
    showAxis: boolean
    step: number
  }
  checkPoints?: Array<{x: number, y: number}> // Points to verify the function passes through
  explanation?: string
}

export interface SliderInputQuestion extends BaseQuestion {
  type: 'slider-input'
  question: string
  min: number
  max: number
  correctAnswer: number
  tolerance?: number // Acceptable range = correctAnswer ± tolerance
  unit?: string // e.g., "°" for angles
  explanation?: string
  scenario?: string // Optional scenario text
}

export type Question =
  | MultipleChoiceQuestion
  | DragDropQuestion
  | GraphQuestion
  | OrderQuestion
  | FillBlankQuestion
  | LineMatchQuestion
  | QuickTapQuestion
  | TypeInQuestion
  | GraphPlotQuestion
  | SliderInputQuestion

export interface QuestionResponse {
  questionId: string
  correct: boolean
  userAnswer: any
  timeTaken: number
  points: number
  skipped?: boolean
}
