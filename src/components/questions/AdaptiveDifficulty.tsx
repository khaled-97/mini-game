'use client'
import { useCallback, useEffect, useState } from 'react'
import { Question } from '@/types/question'

interface Props {
  questions: Question[]
  onQuestionSelect: (question: Question) => void
}

export default function AdaptiveDifficulty({ questions, onQuestionSelect }: Props) {
  const [correctStreak, setCorrectStreak] = useState(0)
  const [currentDifficulty, setCurrentDifficulty] = useState(1)
  const [answeredQuestions, setAnsweredQuestions] = useState<Set<string>>(new Set())
  const [lastAnswerTime, setLastAnswerTime] = useState(0)
  const [isAnswering, setIsAnswering] = useState(false)

  // Get available questions for current difficulty
  const getAvailableQuestions = useCallback(() => {
    if (!questions || questions.length === 0) return []

    // First try exact difficulty match
    const exactMatch = questions.filter(q => 
      q && q.difficulty === currentDifficulty && 
      q.id && !answeredQuestions.has(q.id)
    )
    
    if (exactMatch.length > 0) {
      return exactMatch
    }

    // If no exact matches, find closest difficulty
    const unansweredQuestions = questions.filter(q => !answeredQuestions.has(q.id))
    if (unansweredQuestions.length === 0) {
      // Reset if all questions answered
      setAnsweredQuestions(new Set())
      setCurrentDifficulty(1)
      setCorrectStreak(0)
      return questions.filter(q => q.difficulty === 1)
    }

    // Find questions with closest difficulty
    const difficulties = [...new Set(unansweredQuestions.map(q => q.difficulty))]
    const closest = difficulties.reduce((prev, curr) => 
      Math.abs(curr - currentDifficulty) < Math.abs(prev - currentDifficulty) ? curr : prev
    )
    
    return unansweredQuestions.filter(q => q.difficulty === closest)
  }, [questions, currentDifficulty, answeredQuestions])

  // Select next question
  const selectNextQuestion = useCallback(() => {
    const available = getAvailableQuestions()
    if (available.length > 0) {
      const nextQuestion = available[Math.floor(Math.random() * available.length)]
      if (nextQuestion && nextQuestion.id) {
        onQuestionSelect(nextQuestion)
      }
    }
  }, [getAvailableQuestions, onQuestionSelect])

  // Handle answer submission
  const handleAnswer = useCallback((isCorrect: boolean, questionId: string) => {
    // Prevent handling answers while already processing one
    if (isAnswering) return
    
    // Prevent rapid-fire answers (minimum 2 seconds between answers)
    const now = Date.now()
    if (now - lastAnswerTime < 2000) return
    
    setIsAnswering(true)
    setLastAnswerTime(now)

    // Mark question as answered
    setAnsweredQuestions(prev => new Set([...prev, questionId]))

    if (isCorrect) {
      // Increment streak and potentially increase difficulty
      setCorrectStreak(prev => {
        const newStreak = prev + 1
        // Increase difficulty after 3 correct answers
        if (newStreak >= 3) {
          setCurrentDifficulty(prev => Math.min(prev + 1, 4)) // Max difficulty is 4
          return 0 // Reset streak
        }
        return newStreak
      })
    } else {
      // Reset streak and potentially decrease difficulty
      setCorrectStreak(0)
      setCurrentDifficulty(prev => Math.max(prev - 1, 1)) // Min difficulty is 1
    }

    // Select next question after feedback is shown
    const timer = setTimeout(() => {
      selectNextQuestion()
      setIsAnswering(false)
    }, 3000) // Increased delay to ensure feedback is visible

    // Cleanup timer if component unmounts
    return () => clearTimeout(timer)
  }, [lastAnswerTime, isAnswering, selectNextQuestion])

  // Initialize first question
  useEffect(() => {
    if (questions.length > 0) {
      selectNextQuestion()
    }
  }, [questions, selectNextQuestion])

  // Listen for answer events from parent
  useEffect(() => {
    const handleQuestionAnswer = (event: CustomEvent<{ isCorrect: boolean; questionId: string }>) => {
      const { isCorrect, questionId } = event.detail
      handleAnswer(isCorrect, questionId)
    }

    // Use a more specific event type
    window.addEventListener('questionAnswered', handleQuestionAnswer as EventListener)
    
    return () => {
      window.removeEventListener('questionAnswered', handleQuestionAnswer as EventListener)
      // Cleanup any pending state
      setIsAnswering(false)
    }
  }, [handleAnswer])

  return null // This is a logic-only component
}
