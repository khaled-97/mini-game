'use client'
import { useState, useCallback } from 'react'
import { Question } from '@/types/question'
import { motion, AnimatePresence } from 'framer-motion'

// Import all question type components
import DragDropQuestion from './types/DragDropQuestion'
import MultipleChoiceQuestion from './types/MultipleChoiceQuestion'
import GraphQuestion from './types/GraphQuestion'
import OrderQuestion from './types/OrderQuestion'
import FillBlankQuestion from './types/FillBlankQuestion'
import LineMatchQuestion from './types/LineMatchQuestion'
import QuickTapQuestion from './types/QuickTapQuestion'
import TypeInQuestion from './types/TypeInQuestion'
import StepOrderQuestion from './types/StepOrderQuestion'
import GraphPlotQuestion from './types/GraphPlotQuestion'

interface Props {
  question: Question
  onAnswer: (response: { correct: boolean; answer: string[] }) => void
  onNext: () => void
  onSkip?: () => void
}

export default function QuestionComponent({ question, onAnswer, onNext, onSkip }: Props) {
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
      case 'step-order':
        return (
          <StepOrderQuestion
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
      default:
        return (
          <div className="text-center text-red-500">
            Unknown question type: {(question as any).type}
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
      <div className="bg-white rounded-xl shadow-lg p-6">
        {renderQuestion()}
      </div>
    </div>
  )
}
