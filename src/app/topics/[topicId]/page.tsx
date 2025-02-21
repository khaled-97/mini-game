'use client'
import { use } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { questions } from '@/data/questions'
import { topics } from '@/data/topics'
import logger from '@/utils/logger'

export default function TopicDetailsPage({
  params,
}: {
  params: Promise<{ topicId: string }>
}) {
  const router = useRouter()
  const { topicId } = use(params)
  const topic = topics.find(t => t.id === topicId)
  const topicQuestions = questions[topicId] || []
  const hasQuestions = topicQuestions.length > 0
  const maxDifficulty = hasQuestions 
    ? Math.max(...topicQuestions.map(q => q.difficulty))
    : 0

  logger.info('TopicDetailsPage', 'Rendering topic details', {
    topicId,
    hasQuestions,
    questionCount: topicQuestions.length,
    maxDifficulty
  })

  if (!topic) {
    logger.error('TopicDetailsPage', 'Topic not found', { topicId })
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">Topic Not Found</h2>
          <button
            onClick={() => router.push('/topics')}
            className="px-6 py-3 bg-primary text-black rounded-full font-medium"
          >
            Back to Topics
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <button
            onClick={() => router.push('/topics')}
            className="text-primary hover:text-primary/80"
          >
            ← Back
          </button>
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-primary"
          >
            {topic.name}
          </motion.h1>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-xl shadow-lg border-2 border-transparent hover:border-primary transition-all duration-200 ${
              hasQuestions ? 'hover:scale-[1.02]' : ''
            }`}
          >
            <div className="flex items-start gap-4">
              <div
                className={`w-12 h-12 ${topic.color} rounded-lg flex items-center justify-center text-white text-2xl font-bold`}
              >
                {topic.icon}
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-primary mb-2">
                  {topic.name}
                </h2>
                <p className="text-muted-foreground text-sm mb-4">
                  {topic.description}
                </p>
                {hasQuestions ? (
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-muted-foreground">
                      {topicQuestions.length} questions
                    </div>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4].map(level => (
                        <div
                          key={level}
                          className={`w-2 h-2 rounded-full ${
                            level <= maxDifficulty
                              ? 'bg-primary'
                              : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Coming soon
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {hasQuestions && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <Link
                href={`/practice/${topicId}`}
                className="inline-block px-6 py-3 bg-primary text-white rounded-full font-medium hover:scale-[1.02] active:scale-[0.98] transition-transform"
              >
                Start Practice
              </Link>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  )
}
