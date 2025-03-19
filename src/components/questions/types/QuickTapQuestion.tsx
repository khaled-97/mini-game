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
  onSkip?: () => void
}

export default function QuickTapQuestion({ question, onAnswer, onNext }: Props) {
  const [timeLeft, setTimeLeft] = useState(question.timeLimit)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [tappedItems, setTappedItems] = useState<Set<number>>(new Set())

  const handleSubmit = useCallback(() => {
    if (hasSubmitted) return

    // Count correct selections
    const correctSelections = Array.from(tappedItems).filter(
      index => question.items[index].isCorrect
    ).length

    const totalCorrectItems = question.items.filter(item => item.isCorrect).length
    const correct = correctSelections === totalCorrectItems && 
                   tappedItems.size === totalCorrectItems

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
  }, [question, tappedItems, hasSubmitted, onAnswer])

  // Timer
  useEffect(() => {
    if (hasSubmitted || timeLeft <= 0) return

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmit()
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [timeLeft, hasSubmitted, handleSubmit])

  // Handle item tap
  const handleTap = useCallback((index: number) => {
    if (hasSubmitted || timeLeft <= 0) return

    setTappedItems(prev => {
      const newSet = new Set(prev)
      if (newSet.has(index)) {
        newSet.delete(index)
      } else {
        newSet.add(index)
      }
      return newSet
    })
    
    soundManager.play('click')

    // Vibrate on mobile devices
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50)
    }
  }, [hasSubmitted, timeLeft])

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
          Tap all correct items before time runs out! (Tap again to deselect)
        </p>
      </motion.div>

      {/* Timer */}
      <div className="text-center">
        <div className="inline-block px-6 py-3 rounded-lg bg-muted">
          <div className="text-2xl font-bold text-primary">{timeLeft}s</div>
          <div className="text-sm text-muted-foreground">Time Left</div>
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
            const showResult = hasSubmitted

            return (
              <motion.button
                key={index}
                initial={{ opacity: 0}}
                animate={{ opacity: 1}}
                exit={{ opacity: 0}}
                whileHover={!hasSubmitted ? { scale: 1.02 } : {}}
                whileTap={!hasSubmitted ? { scale: 0.98 } : {}}
                onClick={() => handleTap(index)}
                disabled={hasSubmitted}
                className={`p-4 rounded-xl border-2 transition-all duration-200 touch-manipulation select-none
                  ${!hasSubmitted ? 'hover:border-primary hover:bg-primary/5 active:bg-primary/10 active:scale-[0.98]' : ''}
                  ${!showResult && isItemTapped ? 'border-primary bg-primary/5' : 'border-gray-200'}
                  ${showResult && item.isCorrect ? 'border-success bg-success-muted' : ''}
                  ${showResult && !item.isCorrect && isItemTapped ? 'border-error bg-error-muted' : ''}
                  disabled:cursor-default focus:outline-none focus:ring-2 focus:ring-primary/50
                `}
              >
                <div className="text-center">
                  <RichContent content={item.text} />
                  {showResult && (
                    <motion.span
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={` ${
                        item.isCorrect ? 'text-success-emphasis' : (isItemTapped ? 'text-error-emphasis' : 'text-gray-400')
                      }`}
                    >
                      {item.isCorrect ? ' ✓' : (isItemTapped ? ' ✗' : ' •')}
                    </motion.span>
                  )}
                </div>
              </motion.button>
            )
          })}
        </AnimatePresence>
      </motion.div>

      {/* Confirm Button */}
      {!hasSubmitted && tappedItems.size > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
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
            isCorrect ? 'bg-success-muted text-success-emphasis' : 'bg-error-muted text-error-emphasis'
          }`}
        >
          <h3 className="text-xl font-semibold mb-2">
            {isCorrect ? 'Great job!' : 'Not quite!'}
          </h3>
          {question.explanation && (
            <p className="mt-4 text-sm text-muted-foreground dark:text-muted-foreground/90">{question.explanation}</p>
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
