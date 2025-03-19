'use client'
import { Question } from '@/types/question'
import { motion } from 'framer-motion'
import { logger } from '@/utils/logger'

// Import all question type components
import DragDropQuestion from './types/DragDropQuestion'
import MultipleChoiceQuestion from './types/MultipleChoiceQuestion'
import GraphQuestion from './types/GraphQuestion'
import OrderQuestion from './types/OrderQuestion'
import FillBlankQuestion from './types/FillBlankQuestion'
import LineMatchQuestion from './types/LineMatchQuestion'
import QuickTapQuestion from './types/QuickTapQuestion'
import TypeInQuestion from './types/TypeInQuestion'
import GraphPlotQuestion from './types/GraphPlotQuestion'
import SliderInputQuestion from './types/SliderInputQuestion'

interface Props {
  question: Question
  onAnswer: (response: { correct: boolean; answer: string[] }) => void
  onNext: () => void
  onSkip?: () => void
}

export default function QuestionComponent({ question, onAnswer, onNext, onSkip }: Props) {
  // Log when a question is rendered
  logger.info('QuestionComponent', 'Rendering question', {
    type: question.type,
    difficulty: question.difficulty
  })
  
  // Render the appropriate question component based on type
  const renderQuestion = () => {
    switch (question.type) {
      case 'drag-drop':
        return (
          <DragDropQuestion
            question={question}
            onAnswer={onAnswer}
            onNext={onNext}
            onSkip={onSkip}
          />
        )
      case 'multiple-choice':
        return (
          <MultipleChoiceQuestion
            question={question}
            onAnswer={onAnswer}
            onNext={onNext}
            onSkip={onSkip}
          />
        )
      case 'graph':
        return (
          <GraphQuestion
            question={question}
            onAnswer={onAnswer}
            onNext={onNext}
            onSkip={onSkip}
          />
        )
      case 'order':
        return (
          <OrderQuestion
            question={question}
            onAnswer={onAnswer}
            onNext={onNext}
            onSkip={onSkip}
          />
        )
      case 'fill-blank':
        return (
          <FillBlankQuestion
            question={question}
            onAnswer={onAnswer}
            onNext={onNext}
            onSkip={onSkip}
          />
        )
      case 'line-match':
        return (
          <LineMatchQuestion
            question={question}
            onAnswer={onAnswer}
            onNext={onNext}
            onSkip={onSkip}
          />
        )
      case 'quick-tap':
        return (
          <QuickTapQuestion
            question={question}
            onAnswer={onAnswer}
            onNext={onNext}
            onSkip={onSkip}
          />
        )
      case 'type-in':
        return (
          <TypeInQuestion
            question={question}
            onAnswer={onAnswer}
            onNext={onNext}
            onSkip={onSkip}
          />
        )
      case 'graph-plot':
        return (
          <GraphPlotQuestion
            question={question}
            onAnswer={onAnswer}
            onNext={onNext}
            onSkip={onSkip}
          />
        )
      case 'slider-input':
        return (
          <SliderInputQuestion
            question={question}
            onAnswer={onAnswer}
            onNext={onNext}
            userAnswer={undefined}
          />
        )
      default:
        const unknownQuestion = question as Question;
        return (
          <div className="text-center text-red-500">
            Unknown question type: {unknownQuestion.type}
          </div>
        )
    }
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Difficulty Indicator */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-4 flex items-center gap-2"
      >
        <span className="text-sm text-gray-500">Difficulty:</span>
        <div className="flex gap-1">
          {[1, 2, 3, 4].map(level => (
            <div
              key={level}
              className={`w-2 h-2 rounded-full ${
                level <= question.difficulty
                  ? 'bg-primary'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      </motion.div>

      {/* Question */}
      <div className="bg-background rounded-xl shadow-lg p-6">
        {renderQuestion()}
      </div>
    </div>
  )
}
