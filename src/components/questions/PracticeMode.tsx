'use client'
import { useState, useCallback, useEffect } from 'react'
import { Question } from '@/types/question'
import QuestionComponent from './QuestionComponent'
import { motion, AnimatePresence } from 'framer-motion'
import logger from '@/utils/logger'

interface Props {
  questions: Question[]
}

export default function PracticeMode({ questions }: Props) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)
  const [showFeedback, setShowFeedback] = useState(false)
  const [isComplete, setIsComplete] = useState(false)

  const currentQuestion = questions[currentQuestionIndex]

  const handleAnswer = useCallback((response: { correct: boolean; answer: string[] }) => {
    if (!currentQuestion) return
    
    logger.info('PracticeMode', 'Answer submitted', {
      questionId: currentQuestion.id,
      correct: response.correct,
      answer: response.answer
    })

    setIsCorrect(response.correct)
    setShowFeedback(true)

    // Update score and streak
    if (response.correct) {
      setScore(prev => prev + (currentQuestion.points || 10) * Math.max(1, streak))
      setStreak(prev => prev + 1)
    } else {
      setStreak(0)
    }
  }, [currentQuestion, streak])

  const handleNext = useCallback(() => {
    logger.info('PracticeMode', 'Next question requested', {
      currentIndex: currentQuestionIndex,
      totalQuestions: questions.length
    })
    
    setShowFeedback(false)
    
    if (currentQuestionIndex + 1 < questions.length) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      setIsComplete(true)
    }
  }, [currentQuestionIndex, questions.length])

  // Reset state when questions change
  useEffect(() => {
    logger.info('PracticeMode', 'Questions updated', { count: questions.length })
    setCurrentQuestionIndex(0)
    setScore(0)
    setStreak(0)
    setShowFeedback(false)
    setIsComplete(false)
  }, [questions])

  if (isComplete) {
    return (
      <div className="text-center py-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-bold text-primary">Practice Complete!</h2>
          <p className="text-xl text-muted-foreground">
            Final Score: {score}
          </p>
          <p className="text-lg text-muted-foreground">
            Best Streak: {streak}
          </p>
          <button
            onClick={() => window.location.href = '/topics'}
            className="px-6 py-3 bg-primary text-white rounded-full font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform"
          >
            Back to Topics
          </button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Score and Streak Display */}
      <div className="flex justify-between items-center mb-8">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="text-2xl font-bold text-primary"
        >
          Score: {score}
        </motion.div>
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className={`text-xl font-medium ${streak > 0 ? 'text-success/70' : 'text-muted-foreground'}`}
        >
          Streak: {streak} 🔥
        </motion.div>
      </div>

      {/* Question Area */}
      <AnimatePresence mode="wait">
        {currentQuestion ? (
          <motion.div
            key={currentQuestion.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            <QuestionComponent
              question={currentQuestion}
              onAnswer={handleAnswer}
              onNext={handleNext}
            />
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-8"
          >
            <h2 className="text-2xl font-bold mb-4">Loading Questions...</h2>
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Progress Indicator */}
      <div className="mt-8 flex items-center justify-center gap-2">
        {questions.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-colors ${
              index === currentQuestionIndex ? 'bg-primary' :
              index < currentQuestionIndex ? 'bg-green-500' :
              'bg-gray-200'
            }`}
          />
        ))}
      </div>

      {/* Global Feedback Message */}
      <AnimatePresence>
        {showFeedback && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className={`fixed bottom-8 left-1/2 -translate-x-1/2 p-4 rounded-lg text-center text-white shadow-lg ${
              isCorrect ? 'bg-green-500' : 'bg-red-500'
            }`}
          >
            <p className="text-lg font-medium ">
              {isCorrect ? 
                `Correct! ${streak > 1 ? `${streak}x Streak! 🔥` : '🎉'}` : 
                'Try again! 💪'
              }
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
