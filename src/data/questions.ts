import { Question } from '@/types/question'

interface TopicQuestions {
  [topicId: string]: Question[]
}

export const questions: TopicQuestions = {
  'algebra': [
    {
      id: 'alg-1',
      type: 'fill-blank',
      difficulty: 2,
      points: 20,
      question: 'A number squared plus 3 times the number equals 10. The answer is {0}.',
      blanks: [
        { id: 'b1', answer: '2', position: 0 }
      ],
      explanation: 'The equation is x² + 3x = 10. Rearranging to standard form: x² + 3x - 10 = 0. Using quadratic formula or factoring gives x = 2 or x = -5. Since we need one answer, x = 2 works.'
    },
    {
      id: 'alg-2',
      type: 'graph',
      difficulty: 3,
      points: 25,
      question: 'Match the equation to its graph: y = 2x + 3',
      correctPoints: [
        { x: -1, y: 1 },
        { x: 0, y: 3 },
        { x: 1, y: 5 }
      ],
      gridConfig: {
        xMin: -2,
        xMax: 2,
        yMin: -1,
        yMax: 6,
        showGrid: true
      },
      explanation: 'This is a linear function with slope 2 and y-intercept 3'
    },
    {
      id: 'alg-3',
      type: 'order',
      difficulty: 3,
      points: 25,
      question: 'Solve 3(x+4)=21 for x',
      initialEquation: '3(x + 4) = 21',
      steps: [
        {
          text: 'Distribute the 3',
          equation: '3x + 12 = 21',
          explanation: 'Multiply 3 by each term inside parentheses'
        },
        {
          text: 'Subtract 12 from both sides',
          equation: '3x = 9',
          explanation: 'Subtract 12 from both sides to isolate the term with x'
        },
        {
          text: 'Divide both sides by 3',
          equation: 'x = 3',
          explanation: 'Divide by 3 to solve for x'
        }
      ],
      correctOrder: ['0', '1', '2'],
      explanation: 'Follow the order: distribute → subtract → divide'
    },
    {
      id: 'alg-4',
      type: 'quick-tap',
      difficulty: 4,
      points: 30,
      question: 'Quickly tap all expressions equal to 16',
      items: [
        { text: '2^4', isCorrect: true },
        { text: '4^2', isCorrect: true },
        { text: '8×2', isCorrect: true },
        { text: '3^3', isCorrect: false },
        { text: '5+10', isCorrect: false },
        { text: '20-4', isCorrect: true },
        { text: '15+2', isCorrect: false },
        { text: '32÷2', isCorrect: true }
      ],
      timeLimit: 15,
      minCorrect: 4,
      explanation: 'All expressions equal to 16: 2^4 = 16, 4^2 = 16, 8×2 = 16, 20-4 = 16, 32÷2 = 16'
    },
    {
      id: 'alg-5',
      type: 'fill-blank',
      difficulty: 2,
      points: 20,
      question: '🍎 + 🍎 + 🍎 = 15, 🍎 + 🍌 = 10. What is 🍌? {0}',
      blanks: [
        { id: 'b1', answer: '5', position: 0 }
      ],
      explanation: 'If 3🍎 = 15, then 🍎 = 5. If 🍎 + 🍌 = 10 and 🍎 = 5, then 🍌 = 5'
    },
    {
      id: 'alg-6',
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
      id: 'alg-7',
      type: 'order',
      difficulty: 3,
      points: 25,
      question: 'Solve the quadratic equation: x² - 5x + 6 = 0',
      initialEquation: 'x² - 5x + 6 = 0',
      steps: [
        {
          text: 'Factor',
          equation: '(x - 2)(x - 3) = 0',
          explanation: 'Find factors that multiply to 6 and add to -5'
        },
        {
          text: 'Set each factor to zero',
          equation: 'x - 2 = 0 or x - 3 = 0',
          explanation: 'If product is zero, one factor must be zero'
        },
        {
          text: 'Solve each equation',
          equation: 'x = 2 or x = 3',
          explanation: 'Add 2 and 3 to both sides respectively'
        }
      ],
      correctOrder: ['0', '1', '2'],
      explanation: 'Use factoring to solve quadratic equation: factor, set to zero, solve'
    },
    {
      id: 'alg-8',
      type: 'type-in',
      difficulty: 4,
      points: 30,
      question: 'Solve the system: 2x + y = 7, x - y = 1',
      correctAnswer: '3',
      validation: {
        type: 'number',
        integer: true
      },
      explanation: 'Add equations to get 3x = 8, so x = 3. Then y = 7 - 2(3) = 1'
    },
    {
      id: 'alg-9',
      type: 'line-match',
      difficulty: 4,
      points: 30,
      question: 'Match each expression with its equivalent form',
      leftItems: [
        '(x+2)²',
        'x²-4',
        '2(x+3)',
        '(x+1)(x-1)'
      ],
      rightItems: [
        'x² + 4x + 4',
        '(x+2)(x-2)',
        '2x + 6',
        'x² - 1'
      ],
      correctConnections: [
        { from: 0, to: 0 },
        { from: 1, to: 1 },
        { from: 2, to: 2 },
        { from: 3, to: 3 }
      ],
      explanation: 'These are common algebraic identities: perfect square, difference of squares, distributive property, and difference of squares'
    },
    {
      id: 'alg-10',
      type: 'graph',
      difficulty: 3,
      points: 25,
      question: 'Plot three points that form a right triangle',
      correctPoints: [
        { x: 0, y: 0 },
        { x: 3, y: 0 },
        { x: 0, y: 4 }
      ],
      gridConfig: {
        xMin: -5,
        xMax: 5,
        yMin: -5,
        yMax: 5,
        showGrid: true
      },
      explanation: 'A 3-4-5 right triangle can be formed by points at (0,0), (3,0), and (0,4)'
    },
    {
      id: 'alg-11',
      type: 'type-in',
      difficulty: 3,
      points: 25,
      question: 'Factor completely: x² - 4',
      correctAnswer: '(x+2)(x-2)',
      validation: {
        type: 'text'
      },
      explanation: 'This is a difference of squares: a² - b² = (a+b)(a-b)'
    },
    {
      id: 'alg-12',
      type: 'fill-blank',
      difficulty: 2,
      points: 20,
      question: 'If 3^x = 27, what is x? {0}',
      blanks: [
        { id: 'b1', answer: '3', position: 0 }
      ],
      explanation: '3^3 = 27, so x = 3'
    }
  ],
  'geometry': [
    {
      id: 'geo-1',
      type: 'graph',
      difficulty: 2,
      points: 20,
      question: 'Draw lines of symmetry for a rectangle with width 4 and height 3',
      correctPoints: [
        { x: 2, y: 0 },
        { x: 2, y: 3 },
        { x: 0, y: 1.5 },
        { x: 4, y: 1.5 }
      ],
      gridConfig: {
        xMin: -1,
        xMax: 5,
        yMin: -1,
        yMax: 4,
        showGrid: true
      },
      explanation: 'A rectangle has 2 lines of symmetry: one vertical through the center and one horizontal through the center'
    },
    {
      id: 'geo-2',
      type: 'multiple-choice',
      difficulty: 2,
      points: 20,
      question: 'A polygon has 5 sides, all equal angles, but unequal sides. What is it?',
      options: [
        'Regular pentagon',
        'Irregular pentagon',
        'Rhombus',
        'Regular hexagon'
      ],
      correctAnswers: ['Irregular pentagon'],
      explanation: 'A pentagon with equal angles but unequal sides is an irregular pentagon'
    },
    {
      id: 'geo-3',
      type: 'type-in',
      difficulty: 3,
      points: 25,
      question: 'A robber stole a diamond shaped like a rhombus (diagonals 6cm & 8cm). What\'s its area?',
      correctAnswer: '24',
      validation: {
        type: 'number',
        integer: true
      },
      explanation: 'Area of rhombus = (d₁ × d₂) ÷ 2 = (6 × 8) ÷ 2 = 24 cm²'
    },
    {
      id: 'geo-4',
      type: 'type-in',
      difficulty: 3,
      points: 25,
      question: 'A cube has volume 64 cm³. What\'s its surface area?',
      correctAnswer: '96',
      validation: {
        type: 'number',
        integer: true
      },
      explanation: 'Volume = s³, so s = 4 cm. Surface area = 6s² = 6(4²) = 96 cm²'
    },
    {
      id: 'geo-5',
      type: 'type-in',
      difficulty: 3,
      points: 25,
      question: 'Find the area of a circle with radius 5 units (use 3.14 for π, round to nearest integer)',
      correctAnswer: '79',
      validation: {
        type: 'number',
        integer: true
      },
      explanation: 'Area = πr² = 3.14 × 5² = 3.14 × 25 ≈ 79 square units'
    },
    {
      id: 'geo-6',
      type: 'multiple-choice',
      difficulty: 4,
      points: 30,
      question: 'In triangle ABC, if a = 8, b = 5, and C = 120°, what is side c? (round to nearest integer)',
      options: [
        '11',
        '12',
        '13',
        '14'
      ],
      correctAnswers: ['11'],
      explanation: 'Using law of cosines: c² = a² + b² - 2ab×cos(C) = 8² + 5² - 2×8×5×cos(120°) = 121'
    },
    {
      id: 'geo-7',
      type: 'graph',
      difficulty: 3,
      points: 25,
      question: 'Plot the image of point (2,3) after a 90° clockwise rotation about the origin',
      correctPoints: [
        { x: 3, y: -2 }
      ],
      gridConfig: {
        xMin: -4,
        xMax: 4,
        yMin: -4,
        yMax: 4,
        showGrid: true
      },
      explanation: '90° clockwise rotation: (x,y) → (y,-x), so (2,3) → (3,-2)'
    },
    {
      id: 'geo-8',
      type: 'type-in',
      difficulty: 3,
      points: 25,
      question: 'Find the perimeter of a regular hexagon with side length 4 units',
      correctAnswer: '24',
      validation: {
        type: 'number',
        integer: true
      },
      explanation: 'Perimeter = number of sides × side length = 6 × 4 = 24 units'
    }
  ],
  'calculus': [
    {
      id: 'calc-1',
      type: 'order',
      difficulty: 3,
      points: 25,
      question: 'Order the steps to find the derivative of y = x³ + 2x² - 4x + 1',
      initialEquation: 'y = x³ + 2x² - 4x + 1',
      steps: [
        {
          text: 'Apply power rule to x³',
          equation: '3x² + 2x² - 4x + 1',
          explanation: 'd/dx(x³) = 3x²'
        },
        {
          text: 'Apply power rule to 2x²',
          equation: '3x² + 4x - 4x + 1',
          explanation: 'd/dx(2x²) = 4x'
        },
        {
          text: 'Apply power rule to -4x',
          equation: '3x² + 4x - 4 + 1',
          explanation: 'd/dx(-4x) = -4'
        },
        {
          text: 'Derivative of constant',
          equation: '3x² + 4x - 4 + 0',
          explanation: 'd/dx(1) = 0'
        },
        {
          text: 'Simplify',
          equation: '3x² + 4x - 4',
          explanation: 'Combine like terms'
        }
      ],
      correctOrder: ['0', '1', '2', '3', '4'],
      explanation: 'Take the derivative term by term using the power rule, then simplify'
    },
    {
      id: 'calc-2',
      type: 'type-in',
      difficulty: 3,
      points: 25,
      question: 'Find the derivative of f(x) = 3x²',
      correctAnswer: '6x',
      validation: {
        type: 'text'
      },
      explanation: 'Using the power rule: d/dx(3x²) = 3 × 2x = 6x'
    },
    {
      id: 'calc-3',
      type: 'graph-plot',
      difficulty: 4,
      points: 30,
      question: 'What\'s the instantaneous slope of y = x³ at x = 2?',
      plotType: 'function',
      correctFunction: '3*x^2',
      gridConfig: {
        xMin: -3,
        xMax: 3,
        yMin: -6,
        yMax: 6,
        showGrid: true,
        showAxis: true,
        step: 1
      },
      explanation: 'The derivative of x³ is 3x². At x = 2, the slope is 3(2²) = 12'
    },
    {
      id: 'calc-4',
      type: 'type-in',
      difficulty: 3,
      points: 25,
      question: 'Evaluate ∫(2x + 3)dx',
      correctAnswer: 'x^2 + 3x',
      validation: {
        type: 'text'
      },
      explanation: 'Integrate term by term: ∫2x dx = x² and ∫3 dx = 3x, combine to get x² + 3x (+ C)'
    },
    {
      id: 'calc-5',
      type: 'order',
      difficulty: 4,
      points: 30,
      question: 'Find the maximum volume of a box with surface area 600 cm²',
      initialEquation: 'V = x(10-x)(15-x), where x is height',
      steps: [
        {
          text: 'Find derivative',
          equation: 'dV/dx = (10-x)(15-x) - x(15-x) - x(10-x)',
          explanation: 'Use product rule'
        },
        {
          text: 'Simplify',
          equation: 'dV/dx = 150 - 25x + x²',
          explanation: 'Combine like terms'
        },
        {
          text: 'Set equal to zero',
          equation: '150 - 25x + x² = 0',
          explanation: 'Critical points occur where derivative is zero'
        },
        {
          text: 'Solve quadratic',
          equation: 'x = 5',
          explanation: 'x = 5 gives maximum volume'
        }
      ],
      correctOrder: ['0', '1', '2', '3'],
      explanation: 'Use calculus to maximize volume: find derivative, set to zero, solve'
    },
    {
      id: 'calc-6',
      type: 'multiple-choice',
      difficulty: 4,
      points: 30,
      question: 'What is ∫sin(x)dx?',
      options: [
        '-cos(x)',
        'cos(x)',
        'sin(x)',
        '-sin(x)'
      ],
      correctAnswers: ['-cos(x)'],
      explanation: 'The integral of sin(x) is -cos(x) (+ C)'
    },
    {
      id: 'calc-7',
      type: 'type-in',
      difficulty: 3,
      points: 25,
      question: 'Find the derivative of y = e^x',
      correctAnswer: 'e^x',
      validation: {
        type: 'text'
      },
      explanation: 'The derivative of e^x is e^x'
    },
    {
      id: 'calc-8',
      type: 'multiple-choice',
      difficulty: 4,
      points: 30,
      question: 'What is the second derivative of y = x³?',
      options: [
        '6x',
        '3x²',
        '6',
        'x³'
      ],
      correctAnswers: ['6x'],
      explanation: 'First derivative is 3x², second derivative is 6x'
    }
  ],
  'trigonometry': [
    {
      id: 'trig-1',
      type: 'type-in',
      difficulty: 2,
      points: 20,
      question: 'A Ferris wheel with radius 10m makes a 30° angle. What\'s the height?',
      correctAnswer: '5',
      validation: {
        type: 'number',
        integer: true
      },
      explanation: 'Height = radius × sin(30°) = 10 × 0.5 = 5m'
    },
    {
      id: 'trig-2',
      type: 'line-match',
      difficulty: 3,
      points: 25,
      question: 'Match each identity with its correct form.',
      leftItems: [
        'sin²x + cos²x',
        'sin(2x)',
        'cos(A+B)',
        'tan(x)'
      ],
      rightItems: [
        '1',
        '2sinx×cosx',
        'cosA×cosB - sinA×sinB',
        'sinx/cosx'
      ],
      correctConnections: [
        { from: 0, to: 0 },
        { from: 1, to: 1 },
        { from: 2, to: 2 },
        { from: 3, to: 3 }
      ],
      explanation: 'These are fundamental trigonometric identities'
    },
    {
      id: 'trig-3',
      type: 'type-in',
      difficulty: 3,
      points: 25,
      question: 'Find sin(60°) to 3 decimal places',
      correctAnswer: '0.866',
      validation: {
        type: 'number',
        precision: 3
      },
      explanation: 'sin(60°) = √3/2 ≈ 0.866'
    },
    {
      id: 'trig-4',
      type: 'multiple-choice',
      difficulty: 3,
      points: 25,
      question: 'Which angle has the same sine value as 150°?',
      options: [
        '30°',
        '210°',
        '330°',
        '-150°'
      ],
      correctAnswers: ['30°'],
      explanation: 'sin(150°) = sin(180° - 30°) = sin(30°)'
    },
    {
      id: 'trig-5',
      type: 'graph-plot',
      difficulty: 4,
      points: 30,
      question: 'Plot y = 2sin(x)',
      plotType: 'function',
      correctFunction: '2*sin(x)',
      gridConfig: {
        xMin: -3.14,
        xMax: 3.14,
        yMin: -2.5,
        yMax: 2.5,
        showGrid: true,
        showAxis: true,
        step: 1.57
      },
      explanation: 'This is a sine wave with amplitude 2 and period 2π'
    },
    {
      id: 'trig-6',
      type: 'type-in',
      difficulty: 3,
      points: 25,
      question: 'Find cos(45°) to 3 decimal places',
      correctAnswer: '0.707',
      validation: {
        type: 'number',
        precision: 3
      },
      explanation: 'cos(45°) = 1/√2 ≈ 0.707'
    },
    {
      id: 'trig-7',
      type: 'multiple-choice',
      difficulty: 3,
      points: 25,
      question: 'What is tan(45°)?',
      options: [
        '1',
        '0',
        '√3',
        'undefined'
      ],
      correctAnswers: ['1'],
      explanation: 'tan(45°) = sin(45°)/cos(45°) = (1/√2)/(1/√2) = 1'
    },
    {
      id: 'trig-8',
      type: 'graph-plot',
      difficulty: 4,
      points: 30,
      question: 'Plot y = cos(x)',
      plotType: 'function',
      correctFunction: 'cos(x)',
      gridConfig: {
        xMin: -3.14,
        xMax: 3.14,
        yMin: -1.5,
        yMax: 1.5,
        showGrid: true,
        showAxis: true,
        step: 1.57
      },
      explanation: 'This is a cosine wave with amplitude 1 and period 2π'
    }
  ],
  'statistics': [
    {
      id: 'stat-1',
      type: 'type-in',
      difficulty: 2,
      points: 20,
      question: 'Calculate the standard deviation of the data set: 4, 8, 6, 5, 3',
      correctAnswer: '1.9',
      validation: {
        type: 'number',
        precision: 1
      },
      explanation: 'Mean = 5.2, sum of squared differences = 18, divide by 5 and take square root ≈ 1.9'
    },
    {
      id: 'stat-2',
      type: 'multiple-choice',
      difficulty: 3,
      points: 25,
      question: 'If X is normally distributed with μ=50 and σ=5, what is P(45 < X < 55)?',
      options: [
        '0.68',
        '0.95',
        '0.99',
        '0.50'
      ],
      correctAnswers: ['0.68'],
      explanation: 'This represents one standard deviation on either side of the mean, which contains about 68% of the data'
    },
    {
      id: 'stat-3',
      type: 'quick-tap',
      difficulty: 3,
      points: 25,
      question: 'Tap all numbers that are outliers: 12, 15, 11, 13, 40',
      items: [
        { text: '12', isCorrect: false },
        { text: '15', isCorrect: false },
        { text: '11', isCorrect: false },
        { text: '13', isCorrect: false },
        { text: '40', isCorrect: true }
      ],
      timeLimit: 15,
      minCorrect: 1,
      explanation: '40 is significantly different from the other values which cluster around 11-15'
    },
    {
      id: 'stat-4',
      type: 'type-in',
      difficulty: 3,
      points: 25,
      question: 'A coin is tossed 10 times. What is the probability of exactly 6 heads? (Answer to 3 decimal places)',
      correctAnswer: '0.205',
      validation: {
        type: 'number',
        precision: 3
      },
      explanation: 'Using binomial probability: C(10,6) × (0.5)^6 × (0.5)^4 ≈ 0.205'
    },
    {
      id: 'stat-5',
      type: 'multiple-choice',
      difficulty: 4,
      points: 30,
      question: 'In a normal distribution, what percentage of data falls within 2 standard deviations of the mean?',
      options: [
        '68%',
        '95%',
        '99.7%',
        '90%'
      ],
      correctAnswers: ['95%'],
      explanation: 'Approximately 95% of data falls within ±2 standard deviations of the mean in a normal distribution'
    },
    {
      id: 'stat-6',
      type: 'order',
      difficulty: 3,
      points: 25,
      question: 'Order the steps to find the median of: 7, 2, 9, 4, 11, 3, 5',
      initialEquation: '7, 2, 9, 4, 11, 3, 5',
      steps: [
        {
          text: 'Order numbers',
          equation: '2, 3, 4, 5, 7, 9, 11',
          explanation: 'Arrange numbers in ascending order'
        },
        {
          text: 'Find middle position',
          equation: 'Position = (n+1)/2 = (7+1)/2 = 4',
          explanation: 'For odd number of values, median is at (n+1)/2'
        },
        {
          text: 'Identify median',
          equation: '5',
          explanation: '4th number in ordered list is 5'
        }
      ],
      correctOrder: ['0', '1', '2'],
      explanation: 'To find median: order numbers, find middle position, identify value at that position'
    },
    {
      id: 'stat-7',
      type: 'multiple-choice',
      difficulty: 4,
      points: 30,
      question: 'What correlation coefficient indicates the strongest relationship?',
      options: [
        '0.85',
        '-0.92',
        '0.45',
        '-0.67'
      ],
      correctAnswers: ['-0.92'],
      explanation: 'The absolute value of the correlation coefficient indicates strength. |-0.92| = 0.92 is largest'
    },
    {
      id: 'stat-8',
      type: 'type-in',
      difficulty: 3,
      points: 25,
      question: 'In a sample of 100 people, 35 prefer tea over coffee. What\'s the sample proportion? (to 2 decimal places)',
      correctAnswer: '0.35',
      validation: {
        type: 'number',
        precision: 2
      },
      explanation: 'Sample proportion = number of successes / sample size = 35/100 = 0.35'
    }
  ],
  'logic': [
    {
      id: 'log-1',
      type: 'type-in',
      difficulty: 2,
      points: 20,
      question: 'Crack the pattern: 2, 4, 8, 16, ___',
      correctAnswer: '32',
      validation: {
        type: 'number',
        integer: true
      },
      explanation: 'Each number is doubled to get the next number: 2×2=4, 4×2=8, 8×2=16, 16×2=32'
    },
    {
      id: 'log-2',
      type: 'drag-drop',
      difficulty: 3,
      points: 25,
      question: 'Fill the 3x3 grid so each row sums to 15',
      items: [2, 7, 6, 9, 5, 1, 4, 3, 8].map(n => ({ type: 'text', content: String(n) })),
      dropZones: [
        { id: 'z1', correctItemId: 'item-0' },
        { id: 'z2', correctItemId: 'item-1' },
        { id: 'z3', correctItemId: 'item-2' },
        { id: 'z4', correctItemId: 'item-3' },
        { id: 'z5', correctItemId: 'item-4' },
        { id: 'z6', correctItemId: 'item-5' },
        { id: 'z7', correctItemId: 'item-6' },
        { id: 'z8', correctItemId: 'item-7' },
        { id: 'z9', correctItemId: 'item-8' }
      ],
      correctOrder: ['4', '9', '2', '3', '5', '7', '8', '1', '6'],
      explanation: 'This is a magic square where each row, column, and diagonal sums to 15'
    },
    {
      id: 'log-3',
      type: 'multiple-choice',
      difficulty: 3,
      points: 25,
      question: 'You have a 30% chance of rain each day. What\'s the probability it rains at least once in 3 days?',
      options: [
        '65.7%',
        '90%',
        '45%',
        '30%'
      ],
      correctAnswers: ['65.7%'],
      explanation: 'P(at least one rain) = 1 - P(no rain for 3 days) = 1 - (0.7)³ = 0.657 or 65.7%'
    },
    {
      id: 'log-4',
      type: 'order',
      difficulty: 3,
      points: 25,
      question: 'Arrange the steps to solve this syllogism: "All A are B, No B are C"',
      initialEquation: 'All A are B, No B are C',
      steps: [
        {
          text: 'Identify first premise',
          equation: 'All A are B',
          explanation: 'First premise establishes relationship between A and B'
        },
        {
          text: 'Identify second premise',
          equation: 'No B are C',
          explanation: 'Second premise establishes relationship between B and C'
        },
        {
          text: 'Connect through middle term B',
          equation: 'A → B, B ∩ C = ∅',
          explanation: 'B is the middle term connecting A and C'
        },
        {
          text: 'Draw conclusion',
          equation: 'No A are C',
          explanation: 'If all A are B, and no B are C, then no A can be C'
        }
      ],
      correctOrder: ['0', '1', '2', '3'],
      explanation: 'Follow logical steps to solve syllogism: identify premises, connect through middle term, draw conclusion'
    },
    {
      id: 'log-5',
      type: 'multiple-choice',
      difficulty: 4,
      points: 30,
      question: 'If "If it rains, then the ground is wet" is true, which statement must also be true?',
      options: [
        'If the ground is wet, then it rained',
        'If the ground is not wet, then it did not rain',
        'If it did not rain, then the ground is not wet',
        'If it is not raining, then the ground is not wet'
      ],
      correctAnswers: ['If the ground is not wet, then it did not rain'],
      explanation: 'This is the contrapositive of the original statement, which is logically equivalent'
    },
    {
      id: 'log-6',
      type: 'multiple-choice',
      difficulty: 3,
      points: 25,
      question: 'What is the negation of "All cats are black"?',
      options: [
        'No cats are black',
        'Some cats are not black',
        'All cats are not black',
        'Some cats are black'
      ],
      correctAnswers: ['Some cats are not black'],
      explanation: 'The negation of "all" is "some are not"'
    },
    {
      id: 'log-7',
      type: 'order',
      difficulty: 4,
      points: 30,
      question: 'Evaluate: (p ∨ q) ∧ ¬p, where p is true and q is false',
      initialEquation: '(p ∨ q) ∧ ¬p, p = true, q = false',
      steps: [
        {
          text: 'Evaluate p ∨ q',
          equation: '(true ∨ false) ∧ ¬p = true ∧ ¬p',
          explanation: 'true OR false = true'
        },
        {
          text: 'Evaluate ¬p',
          equation: 'true ∧ ¬true = true ∧ false',
          explanation: 'NOT true = false'
        },
        {
          text: 'Evaluate final AND',
          equation: 'true ∧ false = false',
          explanation: 'true AND false = false'
        }
      ],
      correctOrder: ['0', '1', '2'],
      explanation: 'Evaluate step by step: OR, then NOT, then AND'
    },
    {
      id: 'log-8',
      type: 'multiple-choice',
      difficulty: 3,
      points: 25,
      question: 'Which statement is logically equivalent to "If p then q"?',
      options: [
        'If not q then not p',
        'If not p then not q',
        'If q then p',
        'Not p and not q'
      ],
      correctAnswers: ['If not q then not p'],
      explanation: 'This is the contrapositive, which is logically equivalent to the original statement'
    }
  ]
}
