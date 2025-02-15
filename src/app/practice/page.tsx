'use client'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import PracticeMode from '@/components/questions/PracticeMode'
import { questions } from '@/data/questions'
import { Question } from '@/types/question'

// Helper function to flatten questions from all topics
const getAllQuestions = (): Question[] => {
  const allQuestions: Question[] = []
  try {
    Object.values(questions).forEach(topicQuestions => {
      allQuestions.push(...topicQuestions)
    })
  } catch (error) {
    console.error('Error getting questions:', error)
  }
  return allQuestions
}

export default function PracticePage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [allQuestions, setAllQuestions] = useState<Question[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Simulate loading questions
    const timer = setTimeout(() => {
      try {
        const questions = getAllQuestions()
        if (questions.length === 0) {
          setError('No practice questions available.')
        } else {
          setAllQuestions(questions)
        }
      } catch (error) {
        setError('Failed to load practice questions.')
        console.error('Error loading questions:', error)
      } finally {
        setIsLoading(false)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Practice Mode...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    )
  }

  if (error || allQuestions.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">
            {error || 'No Questions Available'}
          </h2>
          <p className="text-muted-foreground mb-8">
            {error ? 'Please try again later.' : 'Check back soon for new questions!'}
          </p>
          <button
            onClick={() => router.push('/')}
            className="px-6 py-3 bg-primary text-white rounded-full font-medium"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-primary mb-8">Practice Mode</h1>
        <p className="text-muted-foreground mb-8">
          Practice questions will adapt to your skill level. Get three correct answers in a row to increase difficulty!
        </p>
        <PracticeMode questions={allQuestions} />
      </div>
    </div>
  )
}
