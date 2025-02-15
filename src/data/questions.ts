import { Question } from '@/types/question'
import { createMathContent, createCodeContent } from '@/utils/questionContent'

interface TopicQuestions {
  [topicId: string]: Question[]
}

export const questions: TopicQuestions = {
  'algebra': [
    {
      id: 'fill-1',
      type: 'fill-blank',
      difficulty: 1,
      points: 15,
      question: 'If {0} + 5 = 12, then x = {1}',
      blanks: [
        { id: 'b1', answer: 'x', position: 0 },
        { id: 'b2', answer: '7', position: 1 }
      ],
      explanation: 'Subtract 5 from both sides: x = 12 - 5 = 7'
    },
    {
      id: 'quick-1',
      type: 'quick-tap',
      difficulty: 2,
      points: 20,
      question: 'Tap all expressions equal to 12!',
      items: [
        { text: '6 + 6', isCorrect: true },
        { text: '5 + 8', isCorrect: false },
        { text: '4 × 3', isCorrect: true },
        { text: '15 - 3', isCorrect: true },
        { text: '2 × 5', isCorrect: false },
        { text: '20 - 7', isCorrect: false }
      ],
      timeLimit: 15,
      minCorrect: 3,
      explanation: 'All expressions that evaluate to 12: 6 + 6 = 12, 4 × 3 = 12, 15 - 3 = 12'
    },
    {
      id: 'multi-1',
      type: 'multiple-choice',
      difficulty: 1,
      points: 10,
      question: 'Which equation represents "twice a number plus three equals thirteen"?',
      options: [
        '2x + 3 = 13',
        'x + 2 = 13',
        '2 + x = 13',
        '3x + 2 = 13'
      ],
      correctAnswers: ['2x + 3 = 13'],
      explanation: '"Twice a number" is 2x, "plus three" is + 3, "equals thirteen" is = 13'
    },
    {
      id: 'graph-1',
      type: 'graph',
      difficulty: 3,
      points: 25,
      question: 'Plot the vertex of the parabola y = x² - 4x + 3',
      correctPoints: [
        { x: 2, y: -1 }
      ],
      gridConfig: {
        xMin: -2,
        xMax: 6,
        yMin: -4,
        yMax: 4,
        showGrid: true
      },
      explanation: 'The vertex form is y = (x - 2)² - 1, so the vertex is at (2, -1)'
    },
    {
      id: 'plot-1',
      type: 'graph-plot',
      difficulty: 4,
      points: 30,
      question: 'Plot the quadratic function y = x² - 2x - 3',
      plotType: 'function',
      correctFunction: 'x^2 - 2*x - 3',
      gridConfig: {
        xMin: -4,
        xMax: 4,
        yMin: -6,
        yMax: 6,
        showGrid: true,
        showAxis: true,
        step: 1
      },
      checkPoints: [
        { x: -1, y: 0 },
        { x: 3, y: 0 },
        { x: 1, y: -4 }
      ],
      explanation: 'This parabola opens upward and crosses x-axis at x = -1 and x = 3'
    },
    {
      id: 'fill-2',
      type: 'fill-blank',
      difficulty: 2,
      points: 20,
      question: 'The vertex of y = x² - {0}x + 4 is at x = {1}',
      blanks: [
        { id: 'b1', answer: '6', position: 0 },
        { id: 'b2', answer: '3', position: 1 }
      ],
      explanation: 'For a quadratic function y = ax² + bx + c, the x-coordinate of the vertex is -b/(2a). Here, a = 1, b = -6, so x = 6/2 = 3'
    },
    {
      id: 'step-1',
      type: 'step-order',
      difficulty: 3,
      points: 25,
      question: 'Order the steps to solve: A train travels 240 miles in 4 hours. What is its speed?',
      initialEquation: 'speed = ?',
      steps: [
        {
          text: 'Identify the formula',
          equation: 'speed = distance ÷ time',
          explanation: 'Speed is distance divided by time'
        },
        {
          text: 'Insert values',
          equation: 'speed = 240 ÷ 4',
          explanation: 'Distance is 240 miles, time is 4 hours'
        },
        {
          text: 'Calculate',
          equation: 'speed = 60 mph',
          explanation: '240 divided by 4 equals 60'
        }
      ],
      correctOrder: [0, 1, 2],
      explanation: 'Follow the steps: formula → values → calculation'
    },
    {
      id: 'multi-2',
      type: 'multiple-choice',
      difficulty: 2,
      points: 20,
      question: 'A rectangle has a perimeter of 20 units and a width of 3 units. What is its length?',
      options: [
        '7 units',
        '8 units',
        '5 units',
        '10 units'
      ],
      correctAnswers: ['7 units'],
      explanation: 'Perimeter = 2(length + width), 20 = 2(length + 3), length = 7'
    }
  ],
  'patterns-logic': [
    {
      id: 'match-1',
      type: 'line-match',
      difficulty: 2,
      points: 20,
      question: 'Match each sequence with its pattern.',
      leftItems: [
        '2, 4, 8, 16, ...',
        '1, 3, 6, 10, ...',
        '1, 1, 2, 3, 5, ...',
        '1, 4, 9, 16, ...'
      ],
      rightItems: [
        'Powers of 2',
        'Triangular numbers',
        'Fibonacci sequence',
        'Perfect squares'
      ],
      correctConnections: [
        { from: 0, to: 0 },
        { from: 1, to: 1 },
        { from: 2, to: 2 },
        { from: 3, to: 3 }
      ],
      explanation: 'Each sequence follows a specific mathematical pattern'
    },
    {
      id: 'order-1',
      type: 'order',
      difficulty: 2,
      points: 20,
      question: 'Arrange these numbers in ascending order.',
      numbers: [15, 7, 23, 4, 18],
      correctOrder: 'ascending',
      explanation: 'Ascending order means smallest to largest: 4, 7, 15, 18, 23'
    },
    {
      id: 'quick-2',
      type: 'quick-tap',
      difficulty: 3,
      points: 25,
      question: 'Tap all Fibonacci numbers!',
      items: [
        { text: '1', isCorrect: true },
        { text: '2', isCorrect: true },
        { text: '3', isCorrect: true },
        { text: '4', isCorrect: false },
        { text: '5', isCorrect: true },
        { text: '6', isCorrect: false },
        { text: '8', isCorrect: true },
        { text: '9', isCorrect: false }
      ],
      timeLimit: 20,
      minCorrect: 5,
      explanation: 'Fibonacci numbers: 1, 1, 2, 3, 5, 8, 13, 21, ...'
    },
    {
      id: 'type-1',
      type: 'type-in',
      difficulty: 3,
      points: 25,
      question: 'If today is Tuesday, what day will it be after 100 days?',
      correctAnswer: 'Thursday',
      caseSensitive: false,
      explanation: '100 ÷ 7 = 14 remainder 2, so it will be 2 days after Tuesday'
    },
    {
      id: 'order-2',
      type: 'order',
      difficulty: 3,
      points: 25,
      question: 'Arrange these numbers to complete the pattern: ___, 4, ___, 16, ___, 64',
      numbers: [2, 8, 32],
      correctOrder: 'ascending',
      explanation: 'Each number is multiplied by 2 to get the next number: 2, 4, 8, 16, 32, 64'
    },
    {
      id: 'logic-1',
      type: 'multiple-choice',
      difficulty: 4,
      points: 30,
      question: 'If all Blips are Quops, and some Quops are Zings, which statement must be true?',
      options: [
        'Some Blips are Zings',
        'All Blips are Zings',
        'No Blips are Zings',
        'All Zings are Blips'
      ],
      correctAnswers: ['Some Blips are Zings'],
      explanation: 'Since all Blips are Quops, and some Quops are Zings, it follows that some Blips must be Zings'
    },
    {
      id: 'sequence-1',
      type: 'type-in',
      difficulty: 4,
      points: 30,
      question: 'In the sequence 2, 6, 12, 20, 30, what is the next number?',
      correctAnswer: '42',
      caseSensitive: false,
      explanation: 'The difference between consecutive terms increases by 2 each time: 4, 6, 8, 10, 12'
    }
  ],
  'number-theory': [
    {
      id: 'quick-4',
      type: 'quick-tap',
      difficulty: 2,
      points: 20,
      question: 'Tap all prime numbers between 20 and 40!',
      items: [
        { text: '23', isCorrect: true },
        { text: '27', isCorrect: false },
        { text: '29', isCorrect: true },
        { text: '31', isCorrect: true },
        { text: '33', isCorrect: false },
        { text: '37', isCorrect: true },
        { text: '39', isCorrect: false }
      ],
      timeLimit: 25,
      minCorrect: 4,
      explanation: 'Prime numbers between 20 and 40 are: 23, 29, 31, 37'
    },
    {
      id: 'match-3',
      type: 'line-match',
      difficulty: 3,
      points: 25,
      question: 'Match each number with its prime factorization.',
      leftItems: [
        '28',
        '45',
        '36',
        '50'
      ],
      rightItems: [
        '2² × 7',
        '3² × 5',
        '2² × 3²',
        '2 × 5²'
      ],
      correctConnections: [
        { from: 0, to: 0 },
        { from: 1, to: 1 },
        { from: 2, to: 2 },
        { from: 3, to: 3 }
      ],
      explanation: 'Break down each number into its prime factors'
    }
  ]
}