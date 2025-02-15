'use client'
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FillBlankQuestion as FillBlankQuestionType } from '@/types/question'
import { soundManager } from '@/utils/soundManager'

interface Props {
  question: FillBlankQuestionType
  onAnswer: (answer: { correct: boolean; answer: string[] }) => void
  onNext: () => void
  onSkip?: () => void
}

interface BlankInputProps {
  id: string
  position: number
  value: string
  onChange: (id: string, value: string) => void
  onEnter: () => void
  isCorrect?: boolean
  hasSubmitted: boolean
  nextBlankId?: string
  acceptableAnswers?: string[]
}

function BlankInput({ 
  id, 
  position, 
  value, 
  onChange, 
  onEnter,
  isCorrect,
  hasSubmitted,
  nextBlankId,
  acceptableAnswers
}: BlankInputProps) {
  const inputRef = useRef<HTMLInputElement>(null)

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      if (nextBlankId) {
        // Focus next blank
        const nextInput = document.querySelector(`input[data-blank-id="${nextBlankId}"]`) as HTMLInputElement
        if (nextInput) {
          nextInput.focus()
        }
      } else {
        // Last blank, submit answer
        onEnter()
      }
    }
  }, [nextBlankId, onEnter])

  return (
    <div className="relative inline-block">
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={(e) => onChange(id, e.target.value)}
        onKeyPress={handleKeyPress}
        disabled={hasSubmitted}
        data-blank-id={id}
        className={`w-24 sm:w-32 p-2 text-center rounded-lg border-2 transition-all duration-200
          ${!hasSubmitted ? 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2' : ''}
          ${hasSubmitted && isCorrect ? 'border-green-500 bg-green-50' : ''}
          ${hasSubmitted && !isCorrect ? 'border-red-500 bg-red-50' : ''}
          disabled:cursor-not-allowed
        `}
        placeholder={`Blank ${position + 1}`}
      />
      {hasSubmitted && !isCorrect && acceptableAnswers && (
        <div className="absolute left-0 right-0 mt-1 text-xs text-red-600">
          Possible answers: {acceptableAnswers.join(', ')}
        </div>
      )}
    </div>
  )
}

export default function FillBlankQuestion({ question, onAnswer, onNext }: Props) {
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize empty answers
  useEffect(() => {
    const initialAnswers: Record<string, string> = {}
    question.blanks.forEach(blank => {
      initialAnswers[blank.id] = ''
    })
    setAnswers(initialAnswers)
  }, [question.blanks])

  // Focus first blank on mount
  useEffect(() => {
    const firstInput = document.querySelector('input[type="text"]') as HTMLInputElement
    if (firstInput) {
      firstInput.focus()
    }
  }, [])

  const handleAnswerChange = useCallback((id: string, value: string) => {
    setAnswers(prev => ({
      ...prev,
      [id]: value
    }))
  }, [])

  const isAnswerCorrect = useCallback((blankId: string, answer: string) => {
    const blank = question.blanks.find(b => b.id === blankId)
    if (!blank) return false

    // Check against main answer and acceptable alternatives
    const mainAnswer = blank.answer.toLowerCase()
    const userAnswer = answer.trim().toLowerCase()
    
    if (userAnswer === mainAnswer) return true

    // Check acceptable alternatives if they exist
    if (blank.acceptableAnswers) {
      return blank.acceptableAnswers.some(alt => 
        userAnswer === alt.toLowerCase()
      )
    }

    return false
  }, [question.blanks])

  const handleSubmit = useCallback(() => {
    // Check if all blanks are filled
    const hasEmptyAnswers = question.blanks.some(blank => !answers[blank.id].trim())
    if (hasEmptyAnswers) {
      setError('Please fill in all blanks')
      return
    }

    // Check answers
    const correct = question.blanks.every(blank => 
      isAnswerCorrect(blank.id, answers[blank.id])
    )

    setIsCorrect(correct)
    setHasSubmitted(true)
    setError(null)
    onAnswer({
      correct,
      answer: question.blanks.map(blank => answers[blank.id])
    })
    soundManager.play(correct ? 'correct' : 'incorrect')

    // Vibrate on mobile devices
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(correct ? [100] : [50, 50, 50])
    }
  }, [question.blanks, answers, isAnswerCorrect, onAnswer])

  // Split question text into parts with blanks
  const questionParts = question.question.split(/\{(\d+)\}/).map((part, index) => {
    const blankIndex = parseInt(part)
    if (!isNaN(blankIndex)) {
      const blank = question.blanks.find(b => b.position === blankIndex)
      if (blank) {
        const nextBlank = question.blanks.find(b => b.position === blankIndex + 1)
        return (
          <BlankInput
            key={blank.id}
            id={blank.id}
            position={blankIndex}
            value={answers[blank.id] || ''}
            onChange={handleAnswerChange}
            onEnter={handleSubmit}
            isCorrect={hasSubmitted ? isAnswerCorrect(blank.id, answers[blank.id]) : undefined}
            hasSubmitted={hasSubmitted}
            nextBlankId={nextBlank?.id}
            acceptableAnswers={blank.acceptableAnswers}
          />
        )
      }
    }
    return <span key={index}>{part}</span>
  })

  return (
    <div className="space-y-8">
      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-semibold text-primary mb-2">
          Fill in the blanks
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-2 text-lg">
          {questionParts}
        </div>
      </motion.div>

      {/* Error Message */}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="text-center text-red-500"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>

      {/* Submit/Next Button */}
      {!hasSubmitted ? (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-full font-medium"
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
          className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-full font-medium"
        >
          Next Question
        </motion.button>
      )}

      {/* Results */}
      {hasSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-lg text-center ${
            isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {isCorrect ? (
            <p>Correct! {question.explanation}</p>
          ) : (
            <div>
              <p className="mb-4">Not quite. Here are the correct answers:</p>
              <div className="space-y-2">
                {question.blanks.map((blank, index) => (
                  <div key={blank.id}>
                    <span className="font-medium">Blank {index + 1}:</span>{' '}
                    {blank.answer}
                    {blank.acceptableAnswers && blank.acceptableAnswers.length > 0 && (
                      <span className="text-sm">
                        {' '}(also accepted: {blank.acceptableAnswers.join(', ')})
                      </span>
                    )}
                  </div>
                ))}
              </div>
              {question.explanation && (
                <p className="mt-4 text-sm opacity-90">{question.explanation}</p>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
