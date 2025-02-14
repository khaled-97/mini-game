'use client'
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GraphQuestion as GraphQuestionType } from '@/types/question'
import { soundManager } from '@/utils/soundManager'

interface Props {
  question: GraphQuestionType
  onAnswer: (answer: { correct: boolean; answer: string[] }) => void
  onNext: () => void
  onSkip?: () => void
}

export default function GraphQuestion({ question, onAnswer, onNext, onSkip }: Props) {
  const [points, setPoints] = useState<{ x: number; y: number }[]>([])
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  // Convert graph coordinates to canvas coordinates
  const graphToCanvas = useCallback((x: number, y: number) => {
    const { width, height } = canvasSize
    const { xMin, xMax, yMin, yMax } = question.gridConfig
    
    const canvasX = ((x - xMin) / (xMax - xMin)) * width
    const canvasY = height - ((y - yMin) / (yMax - yMin)) * height
    
    return { x: canvasX, y: canvasY }
  }, [canvasSize, question.gridConfig])

  // Convert canvas coordinates to graph coordinates
  const canvasToGraph = useCallback((canvasX: number, canvasY: number) => {
    const { width, height } = canvasSize
    const { xMin, xMax, yMin, yMax } = question.gridConfig
    
    const x = xMin + (canvasX / width) * (xMax - xMin)
    const y = yMin + ((height - canvasY) / height) * (yMax - yMin)
    
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }
  }, [canvasSize, question.gridConfig])

  // Draw grid and points
  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const { width, height } = canvas
    const { xMin, xMax, yMin, yMax, showGrid } = question.gridConfig

    // Clear canvas
    ctx.clearRect(0, 0, width, height)

    // Draw grid
    if (showGrid) {
      ctx.strokeStyle = '#e5e7eb'
      ctx.lineWidth = 1

      // Vertical lines
      for (let x = xMin; x <= xMax; x++) {
        const { x: canvasX } = graphToCanvas(x, 0)
        ctx.beginPath()
        ctx.moveTo(canvasX, 0)
        ctx.lineTo(canvasX, height)
        ctx.stroke()
      }

      // Horizontal lines
      for (let y = yMin; y <= yMax; y++) {
        const { y: canvasY } = graphToCanvas(0, y)
        ctx.beginPath()
        ctx.moveTo(0, canvasY)
        ctx.lineTo(width, canvasY)
        ctx.stroke()
      }
    }

    // Draw axes
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2

    // x-axis
    const { y: xAxisY } = graphToCanvas(0, 0)
    ctx.beginPath()
    ctx.moveTo(0, xAxisY)
    ctx.lineTo(width, xAxisY)
    ctx.stroke()

    // y-axis
    const { x: yAxisX } = graphToCanvas(0, 0)
    ctx.beginPath()
    ctx.moveTo(yAxisX, 0)
    ctx.lineTo(yAxisX, height)
    ctx.stroke()

    // Draw points
    points.forEach(point => {
      const { x: canvasX, y: canvasY } = graphToCanvas(point.x, point.y)
      
      // Point
      ctx.fillStyle = hasSubmitted
        ? isCorrect ? '#22c55e' : '#ef4444'
        : '#6366f1'
      ctx.beginPath()
      ctx.arc(canvasX, canvasY, 8, 0, Math.PI * 2)
      ctx.fill()

      // Coordinates
      ctx.fillStyle = '#000000'
      ctx.font = '14px sans-serif'
      ctx.textAlign = 'left'
      ctx.textBaseline = 'bottom'
      ctx.fillText(`(${point.x}, ${point.y})`, canvasX + 10, canvasY - 10)
    })
  }, [points, hasSubmitted, isCorrect, graphToCanvas, question.gridConfig])

  // Handle canvas resize
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const container = canvas.parentElement
      if (!container) return

      const { width, height } = container.getBoundingClientRect()
      canvas.width = width
      canvas.height = height
      setCanvasSize({ width, height })
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Draw whenever points or canvas size changes
  useEffect(() => {
    draw()
  }, [draw, canvasSize])

  // Handle canvas click/touch
  const handleCanvasInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (hasSubmitted) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    const canvasX = clientX - rect.left
    const canvasY = clientY - rect.top

    const point = canvasToGraph(canvasX, canvasY)
    setPoints([point])
    soundManager.play('click')

    // Vibrate on mobile devices
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50)
    }
  }, [hasSubmitted, canvasToGraph])

  // Handle submit
  const handleSubmit = useCallback(() => {
    if (points.length === 0) return

    const correct = question.correctPoints.some(correctPoint =>
      points.some(point =>
        Math.abs(point.x - correctPoint.x) < 0.2 &&
        Math.abs(point.y - correctPoint.y) < 0.2
      )
    )

    setIsCorrect(correct)
    setHasSubmitted(true)
    onAnswer({
      correct,
      answer: points.map(p => `(${p.x}, ${p.y})`)
    })
    soundManager.play(correct ? 'correct' : 'incorrect')

    // Vibrate on mobile devices
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(correct ? [100] : [50, 50, 50])
    }
  }, [points, question.correctPoints, onAnswer])

  // Handle reset
  const handleReset = useCallback(() => {
    if (hasSubmitted) return
    setPoints([])
    soundManager.play('click')
  }, [hasSubmitted])

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
          Tap to place a point. Use the reset button if you need to try again.
        </p>
      </motion.div>

      {/* Graph */}
      <div className="relative aspect-square w-full max-w-2xl mx-auto">
        <canvas
          ref={canvasRef}
          onClick={handleCanvasInteraction}
          onTouchStart={handleCanvasInteraction}
          className="w-full h-full border-2 border-gray-200 rounded-lg touch-none"
        />
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {!hasSubmitted && (
          <>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleReset}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full font-medium"
            >
              Reset Point
            </motion.button>
            {points.length > 0 && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="px-6 py-3 bg-primary text-white rounded-full font-medium"
              >
                Check Answer
              </motion.button>
            )}
            {onSkip && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSkip}
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full font-medium"
              >
                Skip
              </motion.button>
            )}
          </>
        )}

        {hasSubmitted && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onNext}
            className="px-6 py-3 bg-primary text-white rounded-full font-medium"
          >
            Next Question
          </motion.button>
        )}
      </div>

      {/* Results */}
      {hasSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-6 rounded-lg text-center ${
            isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {isCorrect ? (
            <p>Correct! {question.explanation}</p>
          ) : (
            <div>
              <p className="mb-4">Not quite. The correct point is:</p>
              {question.correctPoints.map((point, index) => (
                <p key={index}>({point.x}, {point.y})</p>
              ))}
              {question.explanation && (
                <p className="mt-4 text-sm opacity-90">{question.explanation}</p>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
