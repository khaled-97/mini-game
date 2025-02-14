'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import questions from '@/data/questions'

const topics = [
  {
    id: 'algebra',
    name: 'Algebra',
    description: 'Learn equations, functions, and algebraic concepts',
    icon: '∑',
    color: 'bg-blue-500'
  },
  {
    id: 'geometry',
    name: 'Geometry',
    description: 'Explore shapes, areas, and spatial relationships',
    icon: '△',
    color: 'bg-green-500'
  },
  {
    id: 'calculus',
    name: 'Calculus',
    description: 'Master derivatives, integrals, and limits',
    icon: '∫',
    color: 'bg-purple-500'
  },
  {
    id: 'trigonometry',
    name: 'Trigonometry',
    description: 'Study angles, triangles, and trigonometric functions',
    icon: 'θ',
    color: 'bg-red-500'
  },
  {
    id: 'statistics',
    name: 'Statistics',
    description: 'Analyze data, probability, and statistical concepts',
    icon: 'σ',
    color: 'bg-yellow-500'
  },
  {
    id: 'logic',
    name: 'Logic',
    description: 'Practice logical reasoning and problem solving',
    icon: '⟹',
    color: 'bg-indigo-500'
  }
]

export default function TopicsPage() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-primary mb-8">Topics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {topics.map((topic, index) => {
            const topicQuestions = questions[topic.id] || []
            const hasQuestions = topicQuestions.length > 0

            return (
              <Link 
                key={topic.id}
                href={hasQuestions ? `/lessons/${topic.id}-1` : '#'}
                className={!hasQuestions ? 'cursor-not-allowed opacity-50' : ''}
              >
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-6 rounded-xl shadow-lg border-2 border-transparent hover:border-primary transition-all duration-200 ${
                    hasQuestions ? 'hover:scale-[1.02]' : ''
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-12 h-12 ${topic.color} rounded-lg flex items-center justify-center text-white text-2xl font-bold`}>
                      {topic.icon}
                    </div>
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-primary mb-2">
                        {topic.name}
                      </h2>
                      <p className="text-muted-foreground text-sm mb-4">
                        {topic.description}
                      </p>
                      {hasQuestions && (
                        <div className="flex items-center gap-4">
                          <div className="text-sm text-muted-foreground">
                            {topicQuestions.length} questions
                          </div>
                          <div className="flex gap-1">
                            {[1, 2, 3, 4].map(level => (
                              <div
                                key={level}
                                className={`w-2 h-2 rounded-full ${
                                  topicQuestions.some(q => q.difficulty >= level)
                                    ? 'bg-primary'
                                    : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}
                      {!hasQuestions && (
                        <div className="text-sm text-muted-foreground">
                          Coming soon
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>
            )
          })}
        </div>
      </div>
    </div>
  )
}
