import { Topic } from '@/types/topic'

export const topics: Topic[] = [
  {
    id: 'algebra',
    name: 'Algebra',
    description: 'Master equations, functions, and algebraic concepts',
    icon: '∑',
    color: 'bg-blue-500'
  },
  {
    id: 'geometry',
    name: 'Geometry',
    description: 'Learn shapes, areas, and spatial relationships',
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
    name: 'Logic & Patterns',
    description: 'Develop logical thinking and pattern recognition skills',
    icon: '⟹',
    color: 'bg-indigo-500'
  }
]
