'use client'
import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { QuickTapQuestion as QuickTapQuestionType } from '@/types/question'
import { isRichContent } from '@/utils/questionContent'
import RichContent from '../RichContent'
import { soundManager } from '@/utils/soundManager'

interface Props {
  question: QuickTapQuestionType
  onAnswer: (answer: { correct: boolean; answer: string[] }) => void
  onNext: () => void
}

export default function QuickTapQuestion({ question, onAnswer, onNext }: Props) {
  const [timeLeft, setTimeLeft] = useState(question.timeLimit)
  const [correctTaps, setCorrectTaps] = useState(0)
  const [incorrectTaps, setIncorrectTaps] = useState(0)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [tappedItems, setTappedItems] = useState<Set<number>>(new Set())
  const [isPaused, setIsPaused] = useState(false)

  // Timer
  useEffect(() => {
    if (hasSubmitted || timeLeft <= 0 || isPaused) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleTimeUp()
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, hasSubmitted, isPaused])

  // Handle time up
  const handleTimeUp = useCallback(() => {
    if (hasSubmitted) return

    const correct = correctTaps >= question.minCorrect
    setIsCorrect(correct)
    setHasSubmitted(true)
    onAnswer({
      correct,
      answer: Array.from(tappedItems).map(index => 
        isRichContent(question.items[index].text) 
          ? question.items[index].text.content 
          : question.items[index].text as string
      )
    })
    soundManager.play(correct ? 'correct' : 'incorrect')

    // Vibrate on mobile devices
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(correct ? [100] : [50, 50, 50])
    }
  }, [question, correctTaps, tappedItems, hasSubmitted, onAnswer])

  // Handle item tap
  const handleTap = useCallback((index: number, isCorrect: boolean) => {
    if (hasSubmitted || timeLeft <= 0) return

    setTappedItems(prev => new Set([...prev, index]))
    
    if (isCorrect) {
      setCorrectTaps(prev => prev + 1)
      soundManager.play('click')

      // Check if all correct items have been tapped
      const totalCorrectItems = question.items.filter(item => item.isCorrect).length
      if (correctTaps + 1 === totalCorrectItems) {
        setIsPaused(true)
      }
    } else {
      setIncorrectTaps(prev => prev + 1)
      // Optional: Play error sound
    }

    // Vibrate on mobile devices
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(isCorrect ? [50] : [20])
    }
  }, [hasSubmitted, timeLeft, correctTaps, question.items])

  const handleConfirm = useCallback(() => {
    handleTimeUp()
  }, [handleTimeUp])

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
        <p className="text-muted-foreground">
          Tap {question.minCorrect} correct items before time runs out!
        </p>
      </motion.div>

      {/* Timer and Score */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div className="p-4 rounded-lg bg-muted">
          <div className="text-2xl font-bold text-primary">{timeLeft}s</div>
          <div className="text-sm text-muted-foreground">Time Left</div>
        </div>
        <div className="p-4 rounded-lg bg-green-50">
          <div className="text-2xl font-bold text-green-600">{correctTaps}</div>
          <div className="text-sm text-green-600">Correct</div>
        </div>
        <div className="p-4 rounded-lg bg-red-50">
          <div className="text-2xl font-bold text-red-600">{incorrectTaps}</div>
          <div className="text-sm text-red-600">Incorrect</div>
        </div>
      </div>

      {/* Items Grid */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 sm:grid-cols-3 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {question.items.map((item, index) => {
            const isItemTapped = tappedItems.has(index)
            const showResult = hasSubmitted && isItemTapped

            return (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                whileHover={!hasSubmitted && !isItemTapped ? { scale: 1.05 } : {}}
                whileTap={!hasSubmitted && !isItemTapped ? { scale: 0.95 } : {}}
                onClick={() => handleTap(index, item.isCorrect)}
                disabled={hasSubmitted || isItemTapped}
                className={`p-4 rounded-xl border-2 transition-all duration-200 touch-manipulation
                  ${!hasSubmitted && !isItemTapped ? 'hover:border-primary hover:bg-primary/5' : ''}
                  ${isItemTapped ? 'cursor-default' : 'cursor-pointer'}
                  ${showResult && item.isCorrect ? 'border-green-500 bg-green-50' : ''}
                  ${showResult && !item.isCorrect ? 'border-red-500 bg-red-50' : ''}
                  ${!showResult && isItemTapped ? 'border-gray-300 bg-gray-50' : 'border-gray-200'}
                  disabled:cursor-default
                `}
              >
                <div className="text-center">
                  <RichContent content={item.text} />
                  {showResult && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`block mt-2 text-xl ${
                        item.isCorrect ? 'text-green-500' : 'text-red-500'
                      }`}
                    >
                      {item.isCorrect ? '✓' : '✗'}
                    </motion.span>
                  )}
                </div>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {/* Confirm Button */}
      {isPaused && !hasSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleConfirm}
            className="px-6 py-3 bg-primary text-white rounded-full font-medium"
          >
            Confirm Answers
          </motion.button>
        </motion.div>
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
          <h3 className="text-xl font-semibold mb-2">
            {isCorrect ? 'Great job!' : 'Time\'s up!'}
          </h3>
          <p>
            You got {correctTaps} correct {correctTaps === 1 ? 'tap' : 'taps'} and{' '}
            {incorrectTaps} incorrect {incorrectTaps === 1 ? 'tap' : 'taps'}.
          </p>
          {question.explanation && (
            <p className="mt-4 text-sm opacity-90">{question.explanation}</p>
          )}
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            className="mt-4 px-6 py-3 bg-primary text-white rounded-full font-medium"
          >
            Next Question
          </motion.button>
        </motion.div>
      )}
    </div>
  )
}
