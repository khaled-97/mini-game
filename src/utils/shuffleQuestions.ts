import { 
  Question,
  MultipleChoiceQuestion,
  LineMatchQuestion,
  QuickTapQuestion,
  OrderQuestion,
  StepOrderQuestion
} from '@/types/question'
import { QuestionItem, isRichContent } from '@/utils/questionContent'
import { shuffleArray } from './shuffleArray'

// Type guards
function isMultipleChoice(q: Question): q is MultipleChoiceQuestion {
  return q.type === 'multiple-choice'
}

function isLineMatch(q: Question): q is LineMatchQuestion {
  return q.type === 'line-match'
}

function isQuickTap(q: Question): q is QuickTapQuestion {
  return q.type === 'quick-tap'
}

function isOrder(q: Question): q is OrderQuestion {
  return q.type === 'order'
}

function isStepOrder(q: Question): q is StepOrderQuestion {
  return q.type === 'step-order'
}

// Get content from QuestionItem
function getContent(item: QuestionItem): string {
  return isRichContent(item) ? item.content : item
}

// Shuffle multiple choice options while preserving correct answers
function shuffleMultipleChoice(question: MultipleChoiceQuestion): MultipleChoiceQuestion {
  const options = [...question.options]
  const shuffledOptions = shuffleArray(options)

  // Create a mapping of old indices to new indices
  const indexMap = options.reduce((map, item, index) => {
    map[index] = shuffledOptions.indexOf(item)
    return map
  }, {} as Record<number, number>)

  // Update correctAnswers to match new indices
  const newCorrectAnswers = question.correctAnswers.map(answer => {
    const oldIndex = options.findIndex(opt => getContent(opt) === answer)
    return getContent(shuffledOptions[indexMap[oldIndex]])
  })

  return {
    ...question,
    options: shuffledOptions,
    correctAnswers: newCorrectAnswers
  }
}

// Shuffle line match items while preserving connections
function shuffleLineMatch(question: LineMatchQuestion): LineMatchQuestion {
  const leftItems = [...question.leftItems]
  const rightItems = [...question.rightItems]
  const connections = [...question.correctConnections]

  // Shuffle both arrays
  const shuffledLeft = shuffleArray(leftItems)
  const shuffledRight = shuffleArray(rightItems)

  // Create mappings of old indices to new indices
  const leftMap = leftItems.reduce((map, item, index) => {
    map[index] = shuffledLeft.indexOf(item)
    return map
  }, {} as Record<number, number>)

  const rightMap = rightItems.reduce((map, item, index) => {
    map[index] = shuffledRight.indexOf(item)
    return map
  }, {} as Record<number, number>)

  // Update connections to match new indices
  const newConnections = connections.map(conn => ({
    from: leftMap[conn.from],
    to: rightMap[conn.to]
  }))

  return {
    ...question,
    leftItems: shuffledLeft,
    rightItems: shuffledRight,
    correctConnections: newConnections
  }
}

// Shuffle quick tap items while preserving correct/incorrect status
function shuffleQuickTap(question: QuickTapQuestion): QuickTapQuestion {
  return {
    ...question,
    items: shuffleArray([...question.items])
  }
}

// Shuffle order question numbers
function shuffleOrder(question: OrderQuestion): OrderQuestion {
  return {
    ...question,
    numbers: shuffleArray([...question.numbers])
  }
}

// Shuffle step order steps while preserving correct order
function shuffleStepOrder(question: StepOrderQuestion): StepOrderQuestion {
  const steps = [...question.steps]
  const correctOrder = [...question.correctOrder]
  const shuffledSteps = shuffleArray(steps)

  // Create mapping of old indices to new indices
  const indexMap = steps.reduce((map, step, index) => {
    map[index] = shuffledSteps.indexOf(step)
    return map
  }, {} as Record<number, number>)

  // Update correctOrder to match new indices
  const newCorrectOrder = correctOrder.map(index => indexMap[index])

  return {
    ...question,
    steps: shuffledSteps,
    correctOrder: newCorrectOrder
  }
}

// Main function to shuffle all questions
export function shuffleQuestions(questions: Record<string, Question[]>): Record<string, Question[]> {
  const shuffled: Record<string, Question[]> = {}

  for (const [topic, topicQuestions] of Object.entries(questions)) {
    shuffled[topic] = topicQuestions.map(q => {
      if (isMultipleChoice(q)) return shuffleMultipleChoice(q)
      if (isLineMatch(q)) return shuffleLineMatch(q)
      if (isQuickTap(q)) return shuffleQuickTap(q)
      if (isOrder(q)) return shuffleOrder(q)
      if (isStepOrder(q)) return shuffleStepOrder(q)
      return q
    })
  }

  return shuffled
}
