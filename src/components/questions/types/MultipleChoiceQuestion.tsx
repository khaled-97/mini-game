'use client'
import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MultipleChoiceQuestion as MultipleChoiceQuestionType } from '@/types/question'
import { isRichContent, QuestionItem } from '@/utils/questionContent'
import RichContent from '../RichContent'
import { soundManager } from '@/utils/soundManager'

interface Props {
  question: MultipleChoiceQuestionType
  onAnswer: (answer: { correct: boolean; answer: string[] }) => void
  onNext: () => void
  onSkip?: () => void
}

function getItemContent(item: QuestionItem): string {
  return isRichContent(item) ? item.content : item
}

export default function MultipleChoiceQuestion({ question, onAnswer, onNext, onSkip }: Props) {
  const [selectedAnswers, setSelectedAnswers] = useState<Set<string>>(new Set())
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const handleOptionClick = useCallback((option: QuestionItem) => {
    if (hasSubmitted) return

    const optionContent = getItemContent(option)
    setSelectedAnswers(prev => {
      const newAnswers = new Set(prev)
      if (question.multiSelect) {
        // Toggle selection for multi-select
        if (newAnswers.has(optionContent)) {
          newAnswers.delete(optionContent)
        } else {
          newAnswers.add(optionContent)
        }
      } else {
        // Single selection
        newAnswers.clear()
        newAnswers.add(optionContent)
      }
      return newAnswers
    })
    soundManager.play('click')

    // Vibrate on mobile devices
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50)
    }
  }, [hasSubmitted, question.multiSelect])

  const handleSubmit = useCallback(() => {
    const correct = question.correctAnswers.length === selectedAnswers.size &&
      question.correctAnswers.every(answer => selectedAnswers.has(getItemContent(answer)))

    setIsCorrect(correct)
    setHasSubmitted(true)
    onAnswer({
      correct,
      answer: Array.from(selectedAnswers)
    })
    soundManager.play(correct ? 'correct' : 'incorrect')

    // Vibrate on mobile devices
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(correct ? [100] : [50, 50, 50])
    }
  }, [question.correctAnswers, selectedAnswers, onAnswer])

  return (
    <div className="space-y-8">
      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-semibold text-primary mb-2">
          {question.question}
        </h2>
        {question.multiSelect && (
          <p className="text-muted-foreground">
            Select all that apply
          </p>
        )}
      </motion.div>

      {/* Options */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 sm:grid-cols-2 gap-4"
      >
        {question.options.map((option, index) => (
          <motion.button
            key={index}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            whileHover={!hasSubmitted ? { scale: 1.02 } : {}}
            whileTap={!hasSubmitted ? { scale: 0.98 } : {}}
            onClick={() => handleOptionClick(option)}
            disabled={hasSubmitted}
            className={`p-4 rounded-lg border-2 text-left transition-all duration-200 touch-manipulation
              ${hasSubmitted ? 'cursor-default' : 'hover:border-primary hover:bg-primary/5'}
              ${selectedAnswers.has(getItemContent(option)) ? 'border-primary bg-primary/5' : 'border-gray-200'}
              ${hasSubmitted && question.correctAnswers.includes(getItemContent(option)) ? 'border-success bg-success-muted' : ''}
              ${hasSubmitted && selectedAnswers.has(getItemContent(option)) && !question.correctAnswers.includes(getItemContent(option)) ? 'border-error bg-error-muted' : ''}
              disabled:cursor-default
            `}
          >
            <RichContent content={option} />
          </motion.button>
        ))}
      </motion.div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {!hasSubmitted ? (
          <>
            {selectedAnswers.size > 0 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="px-6 py-3 bg-primary text-white rounded-full font-medium"
              >
                Check Answer
              </motion.button>
            )}
            {onSkip && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSkip}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full font-medium"
              >
                Skip
              </motion.button>
            )}
          </>
        ) : (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            className="px-6 py-3 bg-primary text-white rounded-full font-medium"
          >
            Next Question
          </motion.button>
        )}
      </div>

      {/* Results */}
      {hasSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-lg text-center ${
            isCorrect ? 'bg-success-muted text-success-emphasis' : 'bg-error-muted text-error-emphasis'
          }`}
        >
          {isCorrect ? (
            <p>Correct! {question.explanation}</p>
          ) : (
            <div>
              <p className="mb-4">Not quite. The correct answer{question.correctAnswers.length > 1 ? 's are' : ' is'}:</p>
              {question.correctAnswers.map((answer, index) => (
                <div key={index} className="mb-2">
                  <RichContent content={answer} />
                </div>
              ))}
              {question.explanation && (
                <p className="mt-4 text-sm text-muted-foreground dark:text-muted-foreground/90">{question.explanation}</p>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
