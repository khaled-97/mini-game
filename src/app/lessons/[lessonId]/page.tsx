'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import type { Question, QuestionResponse } from '@/types/question'
import QuestionComponent from '@/components/questions/QuestionComponent'
import useGameStore from '@/store/useGameStore'
import { soundManager } from '@/utils/soundManager'
import {questions} from '@/data/questions'
import { useParams } from 'next/navigation'

// Helper function to get questions for a specific lesson
const getLessonQuestions = (lessonId: string): Question[] => {
  // Extract topic from lessonId (e.g., 'algebra-1' -> 'algebra')
  const topic = lessonId.split('-')[0]
  
  // Get all questions for the topic
  const topicQuestions = questions[topic] || []
  
  // Filter questions based on difficulty for this lesson
  // Lesson 1: difficulty 1-2, Lesson 2: difficulty 2-3, Lesson 3: difficulty 3-4
  const lessonNumber = parseInt(lessonId.split('-')[1]) || 1
  const minDifficulty = lessonNumber
  const maxDifficulty = lessonNumber + 1
  
  return topicQuestions.filter(q => 
    q.difficulty >= minDifficulty && q.difficulty <= maxDifficulty
  )
}

import LessonComplete from '@/components/lessons/LessonComplete'
import Loading, { LoadingStates, LoadingOverlay } from '@/components/ui/loading'

export default function LessonPage() {
  const router = useRouter()
  const params = useParams()
  const lessonId = params?.lessonId as string
  
  // Get questions and handle invalid lesson ID
  const lessonQuestions = getLessonQuestions(lessonId)
  if (!lessonId || lessonQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Lesson Not Found</h2>
          <p className="text-muted-foreground mb-8">This lesson doesn't exist or has no questions.</p>
          <button
            onClick={() => router.push('/topics')}
            className="px-6 py-3 bg-primary text-white rounded-full font-medium"
          >
            Back to Topics
          </button>
        </div>
      </div>
    )
  }

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [responses, setResponses] = useState<QuestionResponse[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [startTime, setStartTime] = useState(Date.now())

  useEffect(() => {
    // Reset start time when question changes
    setStartTime(Date.now())
  }, [currentQuestionIndex])

  useEffect(() => {
    // Simulate loading questions from API
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  const addXP = useGameStore((state) => state.addXP)
  const incrementStreak = useGameStore((state) => state.incrementStreak)
  const resetStreak = useGameStore((state) => state.resetStreak)

  const handleQuestionAnswer = (answer: { correct: boolean; answer: string[] }) => {
    const currentQuestion = lessonQuestions[currentQuestionIndex]
    if (!currentQuestion) return

    const timeTaken = Date.now() - startTime
    const response: QuestionResponse = {
      questionId: currentQuestion.id,
      correct: answer.correct,
      userAnswer: answer.answer,
      timeTaken,
      points: answer.correct ? currentQuestion.points : 0,
    }

    setResponses([...responses, response])
    
    if (answer.correct) {
      incrementStreak()
      addXP(currentQuestion.points)
      // Bonus XP for maintaining streak
      const streak = useGameStore.getState().streak
      if (streak > 0 && streak % 5 === 0) {
        addXP(50)
        soundManager.play('streak')
      }
    } else {
      resetStreak()
    }
  }

  const handleNext = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      if (currentQuestionIndex < lessonQuestions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1)
      } else {
        soundManager.play('levelUp')
        setIsComplete(true)
      }
      setIsTransitioning(false)
    }, 1000)
  }

  const handleSkip = () => {
    const currentQuestion = lessonQuestions[currentQuestionIndex]
    if (!currentQuestion) return

    const response: QuestionResponse = {
      questionId: currentQuestion.id,
      correct: false,
      userAnswer: [],
      timeTaken: Date.now() - startTime,
      points: 0,
      skipped: true
    }

    setResponses([...responses, response])
    resetStreak()
    handleNext()
  }

  const handleContinue = () => {
    router.push('/topics')
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <LoadingStates />
      </div>
    )
  }

  if (isComplete) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <LessonComplete
          responses={responses}
          totalQuestions={lessonQuestions.length}
          onContinue={handleContinue}
        />
      </div>
    )
  }

  // Get current question and handle invalid index
  const currentQuestion = lessonQuestions[currentQuestionIndex]
  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Question Not Found</h2>
          <p className="text-muted-foreground mb-8">Unable to load this question.</p>
          <button
            onClick={() => router.push('/topics')}
            className="px-6 py-3 bg-primary text-white rounded-full font-medium"
          >
            Back to Topics
          </button>
        </div>
      </div>
    )
  }

  const progress = ((currentQuestionIndex + 1) / lessonQuestions.length) * 100

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Progress bar */}
      <div className="fixed top-0 left-0 w-full h-2 bg-muted">
        <motion.div
          className="h-full bg-primary"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
        />
      </div>

      {isTransitioning && <LoadingOverlay />}
      <div className="max-w-4xl mx-auto mt-8">
        {/* Question counter */}
        <div className="text-sm text-muted-foreground mb-8">
          Question {currentQuestionIndex + 1} of {lessonQuestions.length}
        </div>

        {/* Current question */}
        <AnimatePresence mode="wait">
          <QuestionComponent
            key={currentQuestion.id}
            question={currentQuestion}
            onAnswer={handleQuestionAnswer}
            onNext={handleNext}
            onSkip={handleSkip}
          />
        </AnimatePresence>
      </div>
    </div>
  )
}
