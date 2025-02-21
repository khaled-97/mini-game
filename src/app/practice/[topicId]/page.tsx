'use client'
import { useEffect, useState, use } from 'react'
import { useRouter } from 'next/navigation'
import PracticeMode from '@/components/questions/PracticeMode'
import { questions } from '@/data/questions'
import { Question } from '@/types/question'
import { shuffleQuestions } from '@/utils/shuffleQuestions'
import logger from '@/utils/logger'
import { WelcomeMessage } from '@/components/WelcomeMessage'

export default function TopicPracticePage({
  params,
}: {
  params: Promise<{ topicId: string }>
}) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(true)
  const [topicQuestions, setTopicQuestions] = useState<Question[]>([])
  const [error, setError] = useState<string | null>(null)
  const { topicId } = use(params)

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        // Get and shuffle questions for this topic
        const shuffledQuestions = shuffleQuestions({ [topicId]: questions[topicId] })
        const topicData = shuffledQuestions[topicId]
        
        logger.info('PracticePage', 'Loading topic questions', {
          topicId,
          questionCount: topicData?.length || 0
        })

        if (!topicData || topicData.length === 0) {
          const errorMsg = `No questions available for ${topicId}.`
          logger.error('PracticePage', errorMsg)
          setError(errorMsg)
        } else {
          // Verify question IDs and structure
          const validQuestions = topicData.filter(q => {
            if (!q.id || !q.type || !q.difficulty) {
              logger.warn('PracticePage', 'Invalid question found', { question: q })
              return false
            }
            return true
          })

          if (validQuestions.length === 0) {
            const errorMsg = 'No valid questions found for this topic.'
            logger.error('PracticePage', errorMsg)
            setError(errorMsg)
          } else {
            logger.info('PracticePage', 'Questions loaded successfully', {
              validCount: validQuestions.length,
              totalCount: topicData.length
            })
            setTopicQuestions(validQuestions)
          }
        }
      } catch (error) {
        const errorMsg = 'Failed to load topic questions.'
        logger.error('PracticePage', errorMsg, { error })
        setError(errorMsg)
        console.error('Error loading questions:', error)
      } finally {
        setIsLoading(false)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [topicId])

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Questions...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto dark:opacity-80"></div>
        </div>
      </div>
    )
  }

  if (error || topicQuestions.length === 0) {
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
            onClick={() => {
              logger.info('PracticePage', 'Navigating back to topics')
              router.push('/topics')
            }}
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium"
          >
            Back to Topics
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto p-6">
        <WelcomeMessage 
          message="Answer questions correctly to increase your score and build a streak!" 
          duration={3000}
        />
        <PracticeMode questions={topicQuestions} />
      </div>
    </div>
  )
}
