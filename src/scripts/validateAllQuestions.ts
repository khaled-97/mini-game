import { validateQuestions } from '../utils/validateQuestions'
import { Question } from '@/types/question'
import questions from '../data/questions'

// Get all questions from all topics
const allQuestions: Question[] = Object.values(questions).reduce<Question[]>(
  (acc, topicQuestions) => [...acc, ...topicQuestions],
  []
)

// Run validation
const errors = validateQuestions(allQuestions)

// Print results
if (errors.length > 0) {
  console.error('❌ Found validation errors:')
  errors.forEach(error => console.error(`- ${error}`))
  process.exit(1)
} else {
  console.log('✅ All questions passed validation')
  
  // Print statistics
  const questionTypes = allQuestions.reduce<Record<string, number>>((acc, q) => {
    acc[q.type] = (acc[q.type] || 0) + 1
    return acc
  }, {})

  console.log('\nQuestion type distribution:')
  Object.entries(questionTypes).forEach(([type, count]) => {
    console.log(`${type}: ${count} questions`)
  })

  console.log('\nTotal questions:', allQuestions.length)
}
