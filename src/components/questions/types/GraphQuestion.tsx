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

const GRID_TARGET_STEPS = 10

export default function GraphQuestion({ question, onAnswer, onNext, onSkip }: Props) {
  // Dynamic sizes based on canvas width
  const getResponsiveSizes = useCallback((width: number) => {
    const baseWidth = 600 // Base width for desktop
    const scale = Math.max(0.5, width / baseWidth) // Minimum scale of 0.5
    return {
      pointRadius: Math.max(6, Math.floor(8 * scale)),
      fontSize: Math.max(12, Math.floor(14 * scale)),
      labelOffset: Math.max(8, Math.floor(10 * scale))
    }
  }, [])
  const [points, setPoints] = useState<{ x: number; y: number }[]>([])
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [canvasSize, setCanvasSize] = useState({ width: 0, height: 0 })

  // Helper to calculate grid step size
  const getGridStep = useCallback((range: number) => {
    let step = range / GRID_TARGET_STEPS
    const exponent = Math.floor(Math.log10(step))
    const mantissa = step / Math.pow(10, exponent)
    
    if (mantissa <= 1) step = 1 * Math.pow(10, exponent)
    else if (mantissa <= 2) step = 2 * Math.pow(10, exponent)
    else if (mantissa <= 5) step = 5 * Math.pow(10, exponent)
    else step = 10 * Math.pow(10, exponent)
    
    return step
  }, [])

  // Coordinate conversions
  const graphToCanvas = useCallback((x: number, y: number) => {
    const { width, height } = canvasSize
    const { xMin, xMax, yMin, yMax } = question.gridConfig
    
    const canvasX = ((x - xMin) / (xMax - xMin)) * width
    const canvasY = height - ((y - yMin) / (yMax - yMin)) * height
    
    return { x: canvasX, y: canvasY }
  }, [canvasSize, question.gridConfig])

  const canvasToGraph = useCallback((clientX: number, clientY: number) => {
    const { width, height } = canvasSize
    const { xMin, xMax, yMin, yMax } = question.gridConfig
    
    const x = xMin + (clientX / width) * (xMax - xMin)
    const y = yMin + ((height - clientY) / height) * (yMax - yMin)
    
    return { x: Math.round(x * 10) / 10, y: Math.round(y * 10) / 10 }
  }, [canvasSize, question.gridConfig])

  // Drawing functions
  const drawGrid = useCallback((ctx: CanvasRenderingContext2D) => {
    const { xMin, xMax, yMin, yMax } = question.gridConfig
    const xStep = getGridStep(xMax - xMin)
    const yStep = getGridStep(yMax - yMin)
    const { fontSize } = getResponsiveSizes(canvasSize.width)
    const dpr = window.devicePixelRatio || 1

    // Style setup
    ctx.strokeStyle = '#e5e7eb'
    ctx.lineWidth = Math.max(1, 1 * dpr) // Thicker lines on high DPI screens
    ctx.font = `${fontSize}px sans-serif`
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    
    // Draw origin label
    const origin = graphToCanvas(0, 0)
    ctx.fillStyle = '#4b5563'
    ctx.fillText('0', origin.x + fontSize/2, origin.y + fontSize/2)

    // Draw and label vertical lines
    let x = Math.floor(xMin / xStep) * xStep
    while (x <= xMax) {
      if (x >= xMin) {
        const { x: canvasX } = graphToCanvas(x, 0)
        ctx.beginPath()
        ctx.moveTo(canvasX, 0)
        ctx.lineTo(canvasX, canvasSize.height)
        ctx.stroke()

        // Draw x-axis labels (skip 0 as it's on the axis)
        if (x !== 0) {
          const { y: labelY } = graphToCanvas(0, 0)
          ctx.fillStyle = '#6b7280'
          ctx.fillText(x.toString(), canvasX, labelY + fontSize)
        }
      }
      x += xStep
    }

    // Draw and label horizontal lines
    let y = Math.floor(yMin / yStep) * yStep
    while (y <= yMax) {
      if (y >= yMin) {
        const { y: canvasY } = graphToCanvas(0, y)
        ctx.beginPath()
        ctx.moveTo(0, canvasY)
        ctx.lineTo(canvasSize.width, canvasY)
        ctx.stroke()

        // Draw y-axis labels (skip 0 as it's on the axis)
        if (y !== 0) {
          const { x: labelX } = graphToCanvas(0, 0)
          ctx.fillStyle = '#6b7280'
          ctx.fillText(y.toString(), labelX - fontSize, canvasY)
        }
      }
      y += yStep
    }
  }, [graphToCanvas, question.gridConfig, canvasSize, getGridStep])

  const drawAxes = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = '#000000'
    ctx.lineWidth = 2

    // X-axis
    const xAxis = graphToCanvas(0, 0)
    ctx.beginPath()
    ctx.moveTo(0, xAxis.y)
    ctx.lineTo(canvasSize.width, xAxis.y)
    ctx.stroke()

    // Y-axis
    const yAxis = graphToCanvas(0, 0)
    ctx.beginPath()
    ctx.moveTo(yAxis.x, 0)
    ctx.lineTo(yAxis.x, canvasSize.height)
    ctx.stroke()
  }, [graphToCanvas, canvasSize])

  const drawPoints = useCallback((ctx: CanvasRenderingContext2D) => {
    points.forEach(point => {
      const { x, y } = graphToCanvas(point.x, point.y)
      
      ctx.fillStyle = hasSubmitted
        ? isCorrect ? '#22c55e' : '#ef4444'
        : '#6366f1'
      
      ctx.beginPath()
      const { pointRadius, fontSize, labelOffset } = getResponsiveSizes(canvasSize.width)
      ctx.arc(x, y, pointRadius, 0, Math.PI * 2)
      ctx.fill()

      // Adjust label position based on quadrant to prevent text from going off-screen
      const textX = x + labelOffset
      const textY = y - labelOffset
      const metrics = ctx.measureText(`(${point.x}, ${point.y})`)
      
      // Adjust font size
      ctx.fillStyle = '#000000'
      ctx.font = `${fontSize}px sans-serif`
      
      // Adjust position if too close to edges
      const labelX = textX + metrics.width > canvasSize.width ? x - metrics.width - labelOffset : textX
      const labelY = textY < metrics.actualBoundingBoxAscent ? y + fontSize + labelOffset : textY
      
      ctx.fillText(`(${point.x}, ${point.y})`, labelX, labelY)
    })
  }, [points, hasSubmitted, isCorrect, graphToCanvas])

  const draw = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // High-DPI setup
    const dpr = window.devicePixelRatio || 1
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    if (question.gridConfig.showGrid) drawGrid(ctx)
    drawAxes(ctx)
    drawPoints(ctx)
  }, [drawAxes, drawGrid, drawPoints, question.gridConfig.showGrid])

  // Resize handler
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const container = canvas.parentElement
    if (!container) return

    const observer = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      const dpr = window.devicePixelRatio || 1
      
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      
      setCanvasSize({ width, height })
    })

    observer.observe(container)
    return () => observer.disconnect()
  }, [])

  // Interaction handler
  const handleCanvasInteraction = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (hasSubmitted) return
    if (e.nativeEvent instanceof TouchEvent) e.preventDefault()

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY
    
    const point = canvasToGraph(
      (clientX - rect.left) * (canvasSize.width / rect.width),
      (clientY - rect.top) * (canvasSize.height / rect.height)
    )

    setPoints([point])
    soundManager.play('click')

    if (navigator.vibrate) navigator.vibrate(50)
  }, [hasSubmitted, canvasToGraph, canvasSize])

  // Submit handler
  const handleSubmit = useCallback(() => {
    if (points.length === 0) return
  
    const threshold = Math.min(
      0.2,
      Math.max(
        0.1,
        (question.gridConfig.xMax - question.gridConfig.xMin) * 0.02
      )
    )
  
    const correct = question.correctPoints.some(correctPoint =>
      points.some(point =>
        Math.abs(point.x - correctPoint.x) < threshold &&
        Math.abs(point.y - correctPoint.y) < threshold
      )
    )
  
    setIsCorrect(correct)
    setHasSubmitted(true)
    onAnswer({
      correct,
      answer: points.map(p => `(${p.x}, ${p.y})`)
    })
    
    soundManager.play(correct ? 'correct' : 'incorrect')
    if (navigator.vibrate) navigator.vibrate(correct ? 100 : [50, 50, 50])
  }, [points, question.correctPoints, question.gridConfig, onAnswer])

  // Reset handler
  const handleReset = useCallback(() => {
    if (hasSubmitted) return
    setPoints([])
    soundManager.play('click')
  }, [hasSubmitted])

  // Redraw when needed
  useEffect(() => { draw() }, [draw, points, hasSubmitted, isCorrect])

  return (
    <div className="space-y-8">
      {/* Question */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center select-none touch-manipulation"
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
          className="w-full h-full border-2 border-gray-200 rounded-lg touch-none cursor-crosshair"
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
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full font-medium touch-manipulation select-none active:scale-[0.98]"
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
                className="px-6 py-3 bg-primary text-white rounded-full font-medium touch-manipulation select-none active:scale-[0.98]"
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
                className="px-6 py-3 bg-gray-200 text-gray-800 rounded-full font-medium touch-manipulation select-none active:scale-[0.98]"
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
            className="px-6 py-3 bg-primary text-white rounded-full font-medium touch-manipulation select-none active:scale-[0.98]"
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
          className={`p-6 rounded-lg text-center select-none touch-manipulation ${
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
