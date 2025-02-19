'use client'
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { TypeInQuestion as TypeInQuestionType } from '@/types/question'
import { soundManager } from '@/utils/soundManager'

interface Props {
  question: TypeInQuestionType
  onAnswer: (answer: { correct: boolean; answer: string[] }) => void
  onNext: () => void
  onSkip?: () => void
}

export default function TypeInQuestion({ question, onAnswer, onNext }: Props) {
  const [answer, setAnswer] = useState('')
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Reset state when question changes
  useEffect(() => {
    setAnswer('')
    setHasSubmitted(false)
    setIsCorrect(false)
    setError(null)
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [question])

  const validateAnswer = useCallback((input: string): boolean => {
    // Normalize input and answers
    const normalizeValue = (value: string) => {
      let normalized = value.trim()
      if (!question.caseSensitive) {
        normalized = normalized.toLowerCase()
      }
      // Remove extra spaces
      normalized = normalized.replace(/\s+/g, ' ')
      return normalized
    }

    if (!question.validation) {
      // Simple string comparison if no validation rules
      const normalizedInput = normalizeValue(input)
      const correctAnswers = [
        question.correctAnswer,
        ...(question.acceptableAnswers || []),
      ].map(ans => normalizeValue(ans))
      return correctAnswers.includes(normalizedInput)
    }

    try {
      switch (question.validation.type) {
        case 'number': {
          const num = parseFloat(input)
          if (isNaN(num)) return false
          if (question.validation.integer && !Number.isInteger(num)) return false
          if (question.validation.min !== undefined && num < question.validation.min) return false
          if (question.validation.max !== undefined && num > question.validation.max) return false
          if (question.validation.precision !== undefined) {
            const decimalPlaces = input.includes('.') ? input.split('.')[1].length : 0
            if (decimalPlaces > question.validation.precision) return false
          }
          
          // Check against correct answer range or exact value
          const correctNum = parseFloat(question.correctAnswer)
          if (question.validation.tolerance !== undefined) {
            return Math.abs(num - correctNum) <= question.validation.tolerance
          } else {
            return num === correctNum
          }
        }
        case 'text': {
          const normalizedInput = normalizeValue(input)
          
          // If pattern is provided, check against pattern first
          if (question.validation.pattern) {
            const regex = new RegExp(question.validation.pattern)
            if (!regex.test(input)) return false
          }
          
          // Check normalized input against possible answers
          const correctAnswers = [
            question.correctAnswer,
            ...(question.acceptableAnswers || []),
          ].map(ans => normalizeValue(ans))
          return correctAnswers.includes(normalizedInput)
        }
        case 'formula': {
          // For formula validation, normalize both input and correct answer
          const normalizeFormula = (formula: string) => {
            return formula
              .replace(/\s+/g, '') // Remove all whitespace
              .toLowerCase()
              .replace(/\^/g, '**') // Convert ^ to ** for power
              .replace(/[×*]/g, '*') // Normalize multiplication
              .replace(/÷/g, '/') // Normalize division
              .replace(/(\d)([a-z])/g, '$1*$2') // Add * between number and variable
              .replace(/([a-z])(\d)/g, '$1*$2') // Add * between variable and number
              .replace(/\(\)/g, '') // Remove empty parentheses
              .replace(/\(\+/g, '(') // Remove + after opening parenthesis
              .replace(/\+\-/g, '-') // Normalize +- to just -
              .replace(/\-\+/g, '-') // Normalize -+ to just -
              .replace(/\-\-/g, '+') // Convert -- to +
          }

          const normalizedInput = normalizeFormula(input)
          const normalizedCorrect = normalizeFormula(question.correctAnswer)

          // Check main answer
          if (normalizedInput === normalizedCorrect) return true

          // Check acceptable alternatives
          if (question.acceptableAnswers) {
            return question.acceptableAnswers.some(alt => 
              normalizedInput === normalizeFormula(alt)
            )
          }

          return false
        }
        default:
          return false
      }
    } catch (error) {
      console.error('Validation error:', error)
      return false
    }
  }, [question])

  const handleSubmit = useCallback(() => {
    if (!answer.trim()) {
      setError('Please enter an answer')
      return
    }

    const correct = validateAnswer(answer.trim())
    setIsCorrect(correct)
    setHasSubmitted(true)
    setError(null)
    onAnswer({ correct, answer: [answer.trim()] })
    soundManager.play(correct ? 'correct' : 'incorrect')

    // Vibrate on mobile devices
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(correct ? [100] : [50, 50, 50])
    }
  }, [answer, validateAnswer, onAnswer])

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !hasSubmitted) {
      handleSubmit()
    }
  }, [hasSubmitted, handleSubmit])

  return (
    <div className="space-y-8">
      {/* Question */}
      <motion.h2
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-semibold text-primary select-none"
      >
        {question.question}
      </motion.h2>

      {/* Input */}
      <div className="space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative"
        >
          <input
            ref={inputRef}
            type={question.validation?.type === 'number' ? 'number' : 'text'}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={hasSubmitted}
            placeholder={getPlaceholder(question)}
            className={`w-full p-5 rounded-xl border-2 transition-all duration-200 touch-manipulation text-lg
              ${hasSubmitted && isCorrect ? 'border-green-500 bg-green-50 scale-[1.02]' : ''}
              ${hasSubmitted && !isCorrect ? 'border-red-500 bg-red-50 scale-[1.02]' : ''}
              ${!hasSubmitted ? 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2 active:border-primary active:bg-primary/5' : ''}
              disabled:cursor-not-allowed focus:outline-none
            `}
            step={question.validation?.type === 'number' ? 
              question.validation.precision ? 
                `0.${'0'.repeat(question.validation.precision-1)}1` : 
                '1' 
              : undefined}
            min={question.validation?.type === 'number' ? question.validation.min : undefined}
            max={question.validation?.type === 'number' ? question.validation.max : undefined}
            inputMode={question.validation?.type === 'number' ? 'decimal' : 'text'}
          />
          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute -bottom-6 left-0 text-sm text-red-500 select-none"
            >
              {error}
            </motion.p>
          )}
        </motion.div>
      </div>

      {/* Submit/Next Button */}
      {!hasSubmitted ? (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-full font-medium touch-manipulation select-none"
        >
          Check Answer
        </motion.button>
      ) : (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-full font-medium touch-manipulation select-none"
        >
          Next Question
        </motion.button>
      )}

      {/* Result */}
      {hasSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-lg select-none touch-manipulation ${
            isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {isCorrect ? (
            <p>Correct! {question.explanation}</p>
          ) : (
            <div>
              <p>Not quite. The correct answer is: {question.correctAnswer}</p>
              {question.explanation && (
                <p className="mt-2 text-sm opacity-90">{question.explanation}</p>
              )}
            </div>
          )}
        </motion.div>
      )}

      {/* Instructions */}
      {!hasSubmitted && (
        <motion.p className="text-center text-sm text-muted-foreground select-none touch-manipulation">
          {getInstructions(question)}
        </motion.p>
      )}
    </div>
  )
}

function getPlaceholder(question: TypeInQuestionType): string {
  if (question.validation?.type === 'number') {
    return `Enter a number${question.validation.integer ? ' (whole numbers only)' : ''}`
  }
  if (question.validation?.type === 'formula') {
    return 'Enter your formula'
  }
  return 'Type your answer'
}

function getInstructions(question: TypeInQuestionType): string {
  if (question.validation?.type === 'number') {
    const parts = []
    if (question.validation.min !== undefined) parts.push(`minimum: ${question.validation.min}`)
    if (question.validation.max !== undefined) parts.push(`maximum: ${question.validation.max}`)
    if (question.validation.precision !== undefined) parts.push(`${question.validation.precision} decimal places`)
    if (question.validation.integer) parts.push('whole numbers only')
    if (question.validation.tolerance !== undefined) parts.push(`±${question.validation.tolerance} tolerance`)
    return parts.length > 0 ? `Enter a number (${parts.join(', ')})` : 'Enter a number'
  }
  if (question.validation?.type === 'formula') {
    return 'Enter your formula using standard mathematical notation'
  }
  if (question.validation?.type === 'text' && question.validation.pattern) {
    return 'Enter your answer in the correct format'
  }
  return question.caseSensitive ? 'Case-sensitive answer required' : 'Type your answer'
}