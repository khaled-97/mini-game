import { Question } from '@/types/question'

interface TopicQuestions {
  [topicId: string]: Question[]
}

export const questions: TopicQuestions = {
  'algebra': [
    {
      id: 'alg-1',
      type: 'graph-plot',
      difficulty: 3,
      points: 25,
      question: 'Plot y = x² - 2x - 3',
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
      explanation: 'This parabola opens upward, crosses x-axis at x = -1 and x = 3, and has a vertex at (1, -4)'
    },
    {
      id: 'alg-2',
      type: 'fill-blank',
      difficulty: 2,
      points: 20,
      question: 'Solve the equation: {0}x + 5 = 17, x = {1}',
      blanks: [
        { id: 'b1', answer: '3', position: 0 },
        { id: 'b2', answer: '4', position: 1 }
      ],
      explanation: 'Subtract 5 from both sides: 3x = 12, then divide by 3: x = 4'
    },
    {
      id: 'alg-3',
      type: 'multiple-choice',
      difficulty: 2,
      points: 20,
      question: 'Which equation represents "three times a number decreased by 7 equals 20"?',
      options: [
        '3x - 7 = 20',
        'x - 7 = 20',
        '3x + 7 = 20',
        '3(x - 7) = 20'
      ],
      correctAnswers: ['3x - 7 = 20'],
      explanation: '"Three times a number" is 3x, "decreased by 7" means subtract 7, "equals 20" is = 20'
    },
    {
      id: 'alg-4',
      type: 'graph',
      difficulty: 3,
      points: 25,
      question: 'Plot the vertex of the parabola y = -x² + 6x - 5',
      correctPoints: [
        { x: 3, y: 4 }
      ],
      gridConfig: {
        xMin: -1,
        xMax: 7,
        yMin: -2,
        yMax: 6,
        showGrid: true
      },
      explanation: 'For y = -x² + 6x - 5, the vertex form is y = -(x - 3)² + 4, so the vertex is at (3, 4)'
    },
    {
      id: 'alg-5',
      type: 'step-order',
      difficulty: 3,
      points: 25,
      question: 'Order the steps to solve: 2(x + 3) = 14',
      initialEquation: '2(x + 3) = 14',
      steps: [
        {
          text: 'Distribute',
          equation: '2x + 6 = 14',
          explanation: 'Multiply 2 by each term inside parentheses'
        },
        {
          text: 'Subtract 6',
          equation: '2x = 8',
          explanation: 'Subtract 6 from both sides'
        },
        {
          text: 'Divide by 2',
          equation: 'x = 4',
          explanation: 'Divide both sides by 2'
        }
      ],
      correctOrder: [0, 1, 2],
      explanation: 'Follow the order: distribute → subtract → divide'
    }
  ],
  'geometry': [
    {
      id: 'geo-1',
      type: 'graph',
      difficulty: 2,
      points: 20,
      question: 'Plot the vertices of a rectangle with width 4 and height 3',
      correctPoints: [
        { x: 0, y: 0 },
        { x: 4, y: 0 },
        { x: 4, y: 3 },
        { x: 0, y: 3 }
      ],
      gridConfig: {
        xMin: -1,
        xMax: 6,
        yMin: -1,
        yMax: 5,
        showGrid: true
      },
      explanation: 'A rectangle with width 4 and height 3 can be drawn by plotting points at (0,0), (4,0), (4,3), and (0,3)'
    },
    {
      id: 'geo-2',
      type: 'multiple-choice',
      difficulty: 2,
      points: 20,
      question: 'What is the area of a triangle with base 6 units and height 4 units?',
      options: [
        '12 square units',
        '24 square units',
        '10 square units',
        '8 square units'
      ],
      correctAnswers: ['12 square units'],
      explanation: 'Area of a triangle = ½ × base × height = ½ × 6 × 4 = 12 square units'
    },
    {
      id: 'geo-3',
      type: 'line-match',
      difficulty: 3,
      points: 25,
      question: 'Match each shape with its area formula.',
      leftItems: [
        'Circle',
        'Triangle',
        'Rectangle',
        'Square'
      ],
      rightItems: [
        'πr²',
        '½bh',
        'lw',
        's²'
      ],
      correctConnections: [
        { from: 0, to: 0 },
        { from: 1, to: 1 },
        { from: 2, to: 2 },
        { from: 3, to: 3 }
      ],
      explanation: 'Each shape has a unique formula for calculating its area'
    },
    {
      id: 'geo-4',
      type: 'fill-blank',
      difficulty: 3,
      points: 25,
      question: 'If a circle has radius {0} units, its circumference is {1}π units',
      blanks: [
        { id: 'b1', answer: '5', position: 0 },
        { id: 'b2', answer: '10', position: 1 }
      ],
      explanation: 'Circumference = 2πr = 2π × 5 = 10π'
    }
  ],
  'calculus': [
    {
      id: 'calc-1',
      type: 'graph-plot',
      difficulty: 4,
      points: 30,
      question: 'Plot the derivative of y = x²',
      plotType: 'function',
      correctFunction: '2*x',
      gridConfig: {
        xMin: -3,
        xMax: 3,
        yMin: -6,
        yMax: 6,
        showGrid: true,
        showAxis: true,
        step: 1
      },
      checkPoints: [
        { x: -2, y: -4 },
        { x: 0, y: 0 },
        { x: 2, y: 4 }
      ],
      explanation: 'The derivative of x² is 2x, which is a linear function'
    },
    {
      id: 'calc-2',
      type: 'multiple-choice',
      difficulty: 3,
      points: 25,
      question: 'What is the derivative of y = 3x² + 2x - 1?',
      options: [
        '6x + 2',
        '3x + 2',
        '6x² + 2',
        '3x² + 2x'
      ],
      correctAnswers: ['6x + 2'],
      explanation: 'Use the power rule: derivative of x² is 2x, so d/dx(3x²) = 6x, and d/dx(2x) = 2. Constants disappear.'
    },
    {
      id: 'calc-3',
      type: 'line-match',
      difficulty: 3,
      points: 25,
      question: 'Match each function with its derivative.',
      leftItems: [
        'x³',
        'sin(x)',
        'e^x',
        'ln(x)'
      ],
      rightItems: [
        '3x²',
        'cos(x)',
        'e^x',
        '1/x'
      ],
      correctConnections: [
        { from: 0, to: 0 },
        { from: 1, to: 1 },
        { from: 2, to: 2 },
        { from: 3, to: 3 }
      ],
      explanation: 'Each function has a specific derivative based on differentiation rules'
    }
  ],
  'trigonometry': [
    {
      id: 'trig-1',
      type: 'graph-plot',
      difficulty: 3,
      points: 25,
      question: 'Plot y = sin(x)',
      plotType: 'function',
      correctFunction: 'sin(x)',
      gridConfig: {
        xMin: -3.14,
        xMax: 3.14,
        yMin: -1.5,
        yMax: 1.5,
        showGrid: true,
        showAxis: true,
        step: 1.57
      },
      checkPoints: [
        { x: 0, y: 0 },
        { x: 1.57, y: 1 },
        { x: -1.57, y: -1 }
      ],
      explanation: 'The sine function has a period of 2π and amplitude of 1'
    },
    {
      id: 'trig-2',
      type: 'multiple-choice',
      difficulty: 2,
      points: 20,
      question: 'What is sin(30°)?',
      options: [
        '0.5',
        '0.866',
        '1',
        '0'
      ],
      correctAnswers: ['0.5'],
      explanation: 'sin(30°) = ½, or approximately 0.5'
    },
    {
      id: 'trig-3',
      type: 'line-match',
      difficulty: 3,
      points: 25,
      question: 'Match each angle with its sine value.',
      leftItems: [
        '0°',
        '30°',
        '45°',
        '90°'
      ],
      rightItems: [
        '0',
        '0.5',
        '0.707',
        '1'
      ],
      correctConnections: [
        { from: 0, to: 0 },
        { from: 1, to: 1 },
        { from: 2, to: 2 },
        { from: 3, to: 3 }
      ],
      explanation: 'These are common angles and their sine values'
    }
  ],
  'statistics': [
    {
      id: 'stat-1',
      type: 'multiple-choice',
      difficulty: 2,
      points: 20,
      question: 'What is the mean of the numbers: 2, 4, 7, 11, 16?',
      options: [
        '8',
        '7',
        '9',
        '10'
      ],
      correctAnswers: ['8'],
      explanation: 'Mean = (2 + 4 + 7 + 11 + 16) ÷ 5 = 40 ÷ 5 = 8'
    },
    {
      id: 'stat-2',
      type: 'fill-blank',
      difficulty: 3,
      points: 25,
      question: 'In a set of numbers, the median is {0} and the mode is {1}: 3, 4, 4, 5, 7',
      blanks: [
        { id: 'b1', answer: '4', position: 0 },
        { id: 'b2', answer: '4', position: 1 }
      ],
      explanation: 'Median is the middle number (4), and mode is the most frequent number (4)'
    },
    {
      id: 'stat-3',
      type: 'quick-tap',
      difficulty: 3,
      points: 25,
      question: 'Tap all numbers that are more than one standard deviation from the mean: Mean = 10, SD = 2',
      items: [
        { text: '7', isCorrect: true },
        { text: '8', isCorrect: false },
        { text: '9', isCorrect: false },
        { text: '13', isCorrect: true },
        { text: '11', isCorrect: false },
        { text: '14', isCorrect: true }
      ],
      timeLimit: 20,
      minCorrect: 3,
      explanation: 'One SD = 2, so numbers outside 8-12 are more than one SD from mean'
    }
  ],
  'logic': [
    {
      id: 'log-1',
      type: 'line-match',
      difficulty: 2,
      points: 20,
      question: 'Match each sequence with its next number.',
      leftItems: [
        '2, 4, 8, 16, ...',
        '1, 4, 9, 16, ...',
        '1, 3, 6, 10, ...',
        '1, 1, 2, 3, 5, ...'
      ],
      rightItems: [
        '32',
        '25',
        '15',
        '8'
      ],
      correctConnections: [
        { from: 0, to: 0 },
        { from: 1, to: 1 },
        { from: 2, to: 2 },
        { from: 3, to: 3 }
      ],
      explanation: 'Each sequence follows a pattern: ×2, square numbers, triangular numbers, Fibonacci'
    },
    {
      id: 'log-2',
      type: 'multiple-choice',
      difficulty: 3,
      points: 25,
      question: 'If all Widgets are Gadgets, and no Gadgets are Purple, which statement must be true?',
      options: [
        'No Widgets are Purple',
        'Some Widgets are Purple',
        'All Purple things are Widgets',
        'Some Gadgets are Purple'
      ],
      correctAnswers: ['No Widgets are Purple'],
      explanation: 'If all Widgets are Gadgets, and no Gadgets are Purple, then no Widgets can be Purple'
    },
    {
      id: 'log-3',
      type: 'quick-tap',
      difficulty: 3,
      points: 25,
      question: 'Tap all numbers that follow the pattern!',
      items: [
        { text: '2', isCorrect: true },
        { text: '4', isCorrect: false },
        { text: '6', isCorrect: true },
        { text: '8', isCorrect: false },
        { text: '10', isCorrect: true },
        { text: '12', isCorrect: false }
      ],
      timeLimit: 15,
      minCorrect: 3,
      explanation: 'The pattern is: numbers that are 2 more than a multiple of 4'
    }
  ]
}
