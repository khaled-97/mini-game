'use client'
import { useState, useCallback, useEffect } from 'react'
import { Question } from '@/types/question'
import QuestionComponent from './QuestionComponent'
import AdaptiveDifficulty from './AdaptiveDifficulty'
import { motion, AnimatePresence } from 'framer-motion'

interface Props {
  questions: Question[]
}

export default function PracticeMode({ questions }: Props) {
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)
  const [answered, setAnswered] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [score, setScore] = useState(0)
  const [streak, setStreak] = useState(0)

  const handleAnswer = useCallback((response: { correct: boolean; answer: string[] }) => {
    if (!currentQuestion) return
    
    setIsCorrect(response.correct)
    setAnswered(true)

    // Update score and streak
    if (response.correct) {
      setScore(prev => prev + (currentQuestion.points || 10) * Math.max(1, streak))
      setStreak(prev => prev + 1)
    } else {
      setStreak(0)
    }

    // Dispatch event for AdaptiveDifficulty
    const event = new CustomEvent('questionAnswered', {
      detail: {
        isCorrect: response.correct,
        questionId: currentQuestion.id
      }
    })
    window.dispatchEvent(event)

    // After 2 seconds, move to next question
    setTimeout(() => {
      setAnswered(false)
      setIsCorrect(false)
      // AdaptiveDifficulty will handle selecting the next question
    }, 2000)
  }, [currentQuestion, streak])

  const handleQuestionSelect = useCallback((question: Question) => {
    if (!question) return
    setCurrentQuestion(question)
    setAnswered(false)
    setIsCorrect(false)
  }, [])

  // Reset state when questions change
  useEffect(() => {
    setScore(0)
    setStreak(0)
    setAnswered(false)
    setIsCorrect(false)
  }, [questions])

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading practice questions...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <AdaptiveDifficulty
            questions={questions}
            onQuestionSelect={handleQuestionSelect}
          />
        </div>
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait">
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
            className={`text-xl font-medium ${streak > 0 ? 'text-green-500' : 'text-muted-foreground'}`}
          >
            Streak: {streak} 🔥
          </motion.div>
        </div>

        {/* Question */}
        <motion.div
          key={currentQuestion.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
        >
          <QuestionComponent
            question={currentQuestion}
            onAnswer={handleAnswer}
            onNext={() => {}}
          />
        </motion.div>

        {/* Adaptive Difficulty Controller */}
        <AdaptiveDifficulty
          questions={questions}
          onQuestionSelect={handleQuestionSelect}
        />

        {/* Feedback Message */}
        <AnimatePresence>
          {answered && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className={`mt-4 p-4 rounded-lg text-center text-white ${
                isCorrect ? 'bg-green-500' : 'bg-red-500'
              }`}
            >
              <p className="text-lg font-medium">
                {isCorrect ? 
                  `Correct! ${streak > 1 ? `${streak}x Streak! 🔥` : '🎉'}` : 
                  'Try again! 💪'
                }
              </p>
              {currentQuestion.explanation && (
                <p className="mt-2 text-sm opacity-90">
                  {currentQuestion.explanation}
                </p>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </AnimatePresence>
  )
}
