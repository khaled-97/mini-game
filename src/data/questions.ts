import { Question } from '@/types/question'
import { createMathContent } from '@/utils/questionContent'
import { shuffleArray } from '@/utils/shuffleArray'

interface TopicQuestions {
  [topicId: string]: Question[]
}

function createMultipleChoice(
  id: string,
  difficulty: number,
  points: number,
  question: string,
  options: string[],
  correctAnswers: string[],
  explanation: string
): Question {
  return {
    id,
    type: 'multiple-choice',
    difficulty,
    points,
    question,
    options: shuffleArray(options),
    correctAnswers,
    explanation
  }
}

function createDragDrop(
  id: string,
  difficulty: number,
  points: number,
  question: string,
  items: string[],
  dropZones: { id: string; correctItemId: string; placeholder: string }[],
  explanation: string
): Question {
  const shuffledItems = shuffleArray(items)
  return {
    id,
    type: 'drag-drop',
    difficulty,
    points,
    question,
    items: shuffledItems.map(item => createMathContent(item)),
    dropZones: dropZones.map((zone, index) => ({
      ...zone,
      correctItemId: `item-${shuffledItems.indexOf(items[parseInt(zone.correctItemId.split('-')[1])])}`
    })),
    correctOrder: items,
    explanation
  }
}

function createLineMatch(
  id: string,
  difficulty: number,
  points: number,
  question: string,
  leftItems: string[],
  rightItems: string[],
  explanation: string
): Question {
  const shuffledLeft = shuffleArray([...leftItems])
  const shuffledRight = shuffleArray([...rightItems])
  const correctConnections = shuffledLeft.map((_, index) => ({
    from: index,
    to: shuffledRight.findIndex(item => rightItems[leftItems.indexOf(shuffledLeft[index])] === item)
  }))

  return {
    id,
    type: 'line-match',
    difficulty,
    points,
    question,
    leftItems: shuffledLeft,
    rightItems: shuffledRight,
    correctConnections,
    explanation
  }
}

export const questions: TopicQuestions = {
  'algebra': [
    // Previous algebra questions remain the same...
  ],
  'geometry': [
    // Previous geometry questions remain the same...
  ]
}

export default questions
