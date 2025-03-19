'use client'
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GraphPlotQuestion as GraphPlotQuestionType } from '@/types/question'
import { soundManager } from '@/utils/soundManager'
import { 
  evaluateMathExpression, 
  formatMathExpression 
} from '@/utils/mathExpressions'

interface Props {
  question: GraphPlotQuestionType
  onAnswer: (answer: { correct: boolean; answer: string[] }) => void
  onNext: () => void
  onSkip?: () => void
}

interface Point {
  x: number
  y: number
}

export default function GraphPlotQuestion({ question, onAnswer, onNext }: Props) {
  const [userFunction, setUserFunction] = useState('')
  const [points] = useState<Point[]>([])
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Convert graph coordinates to canvas coordinates
  const toCanvasCoords = useCallback((point: Point, canvas: HTMLCanvasElement): Point => {
    const { xMin, xMax, yMin, yMax } = question.gridConfig
    const padding = 40 // Padding for axes labels
    const graphWidth = canvas.width - padding * 2
    const graphHeight = canvas.height - padding * 2

    return {
      x: padding + ((point.x - xMin) / (xMax - xMin)) * graphWidth,
      y: canvas.height - (padding + ((point.y - yMin) / (yMax - yMin)) * graphHeight)
    }
  }, [question.gridConfig])

  // Draw grid and function
  const drawGraph = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { xMin, xMax, yMin, yMax, showGrid, showAxis, step } = question.gridConfig
    const padding = 40
    const width = canvas.width
    const height = canvas.height

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1

      // Vertical grid lines
      for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += step) {
        const { x: canvasX } = toCanvasCoords({ x, y: 0 }, canvas)
        ctx.beginPath()
        ctx.moveTo(canvasX, padding)
        ctx.lineTo(canvasX, height - padding)
        ctx.stroke()
      }

      // Horizontal grid lines
      for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y += step) {
        const { y: canvasY } = toCanvasCoords({ x: 0, y }, canvas)
        ctx.beginPath()
        ctx.moveTo(padding, canvasY)
        ctx.lineTo(width - padding, canvasY)
        ctx.stroke()
      }
    }

    // Draw axes
    if (showAxis) {
      ctx.strokeStyle = '#000000'
      ctx.lineWidth = 2

      // X-axis
      const { y: xAxisY } = toCanvasCoords({ x: 0, y: 0 }, canvas)
      ctx.beginPath()
      ctx.moveTo(padding, xAxisY)
      ctx.lineTo(width - padding, xAxisY)
      ctx.stroke()

      // Y-axis
      const { x: yAxisX } = toCanvasCoords({ x: 0, y: 0 }, canvas)
      ctx.beginPath()
      ctx.moveTo(yAxisX, padding)
      ctx.lineTo(yAxisX, height - padding)
      ctx.stroke()

      // Draw axis labels
      ctx.fillStyle = '#000000'
      ctx.font = '12px Arial'
      ctx.textAlign = 'center'

      // X-axis labels
      for (let x = Math.ceil(xMin); x <= Math.floor(xMax); x += step) {
        const { x: canvasX } = toCanvasCoords({ x, y: 0 }, canvas)
        ctx.fillText(x.toString(), canvasX, xAxisY + 20)
      }

      // Y-axis labels
      ctx.textAlign = 'right'
      for (let y = Math.ceil(yMin); y <= Math.floor(yMax); y += step) {
        const { y: canvasY } = toCanvasCoords({ x: 0, y }, canvas)
        ctx.fillText(y.toString(), yAxisX - 10, canvasY + 4)
      }
    }

    // Plot user function
    if (userFunction) {
      try {
        ctx.strokeStyle = hasSubmitted ? (isCorrect ? 'hsl(var(--success))' : 'hsl(var(--error))') : '#6366f1'
        ctx.lineWidth = 2
        ctx.beginPath()

        let isFirstPoint = true
        for (let px = xMin; px <= xMax; px += 0.1) {
          try {
            const py = evaluateMathExpression(userFunction, px)
            if (typeof py === 'number' && !isNaN(py)) {
              const { x, y } = toCanvasCoords({ x: px, y: py }, canvas)
              if (isFirstPoint) {
                ctx.moveTo(x, y)
                isFirstPoint = false
              } else {
                ctx.lineTo(x, y)
              }
            }
          } catch (err) {
            console.error('Error plotting function:', err)
          }
        }
        ctx.stroke()
      } catch (err) {
        console.error('Error plotting function:', err)
      }
    }

    // Plot points
    points.forEach(({ x, y }) => {
      const coords = toCanvasCoords({ x, y }, canvas)
      ctx.beginPath()
      ctx.arc(coords.x, coords.y, 4, 0, Math.PI * 2)
      ctx.fillStyle = '#6366f1'
      ctx.fill()
    })
  }, [userFunction, points, hasSubmitted, isCorrect, question.gridConfig, toCanvasCoords])

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const container = canvas.parentElement
      if (!container) return

      canvas.width = container.offsetWidth
      canvas.height = container.offsetWidth * 0.75 // 4:3 aspect ratio
      drawGraph()
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [drawGraph])

  // Redraw when function changes
  useEffect(() => {
    drawGraph()
  }, [userFunction, points, hasSubmitted, drawGraph])

  const validateFunction = useCallback((func: string): boolean => {
    if (!func.trim()) return false

    try {
      // Test a few points
      const testPoints = [-1, 0, 1]
      return testPoints.every(x => {
        const y = evaluateMathExpression(func, x)
        return typeof y === 'number' && !isNaN(y)
      })
    } catch (err) {
      console.error('Error validating function:', err)
      return false
    }
  }, [])

  const handleSubmit = useCallback(() => {
    if (!validateFunction(userFunction)) {
      return
    }

    let correct = false
    try {
      // Check if function passes through check points
      if (question.checkPoints) {
        correct = question.checkPoints.every(point => {
          const y = evaluateMathExpression(userFunction, point.x)
          return Math.abs(y - point.y) < 0.1
        })
      } else {
        // Compare with correct function at several points
        const testPoints = Array.from({ length: 10 }, (_, i) => 
          question.gridConfig.xMin + (i / 9) * (question.gridConfig.xMax - question.gridConfig.xMin)
        )
        correct = testPoints.every(x => {
          const userY = evaluateMathExpression(userFunction, x)
          const correctY = evaluateMathExpression(question.correctFunction, x)
          return Math.abs(userY - correctY) < 0.1
        })
      }
    } catch (err) {
      console.error('Error validating function:', err)
      return
    }

    setIsCorrect(correct)
    setHasSubmitted(true)
    onAnswer({
      correct,
      answer: [userFunction]
    })
    soundManager.play(correct ? 'correct' : 'incorrect')

    // Vibrate on mobile devices
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(correct ? [100] : [50, 50, 50])
    }
  }, [userFunction, question, validateFunction, onAnswer])

  return (
    <div className="space-y-8">
      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center"
      >
        <h2 className="text-2xl font-semibold text-primary mb-2">
          {question.question}
        </h2>
        <p className="text-muted-foreground">
          Enter a function to plot on the graph (e.g., x^2 + 2*x + 1)
        </p>
      </motion.div>

      {/* Function Input */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-grow">
          <input
            type="text"
            value={userFunction}
            onChange={(e) => setUserFunction(e.target.value)}
            disabled={hasSubmitted}
            placeholder="e.g., x^2 + 2*x + 1"
            className={`w-full p-4 rounded-lg border-2 transition-all duration-200
              ${!hasSubmitted ? 'border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary focus:ring-offset-2' : ''}
              ${hasSubmitted && isCorrect ? 'border-success bg-success-muted' : ''}
              ${hasSubmitted && !isCorrect ? 'border-error bg-error-muted' : ''}
              disabled:cursor-not-allowed
            `}
          />
        </div>
        {!hasSubmitted && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            className="px-6 py-3 bg-primary text-white rounded-full font-medium whitespace-nowrap"
          >
            Plot Function
          </motion.button>
        )}
      </div>

      {/* Graph */}
      <div className="relative">
        <canvas
          ref={canvasRef}
          className="w-full border rounded-lg"
        />
      </div>

      {/* Next Button */}
      {hasSubmitted && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
          className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-full font-medium"
        >
          Next Question
        </motion.button>
      )}

      {/* Results */}
      {hasSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-lg text-center ${
            isCorrect ? 'bg-success-muted text-success-emphasis' : 'bg-error-muted text-error-emphasis'
          }`}
        >
          {isCorrect ? (
            <p>Correct! {question.explanation}</p>
          ) : (
            <div>
              <p>Not quite. The correct function is:</p>
              <p className="mt-2 font-mono">{formatMathExpression(question.correctFunction)}</p>
              {question.explanation && (
                <p className="mt-4 text-sm text-muted-foreground dark:text-muted-foreground/90">{question.explanation}</p>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
