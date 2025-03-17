'use client'
import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { GraphQuestion as GraphQuestionType } from '@/types/question'
import { soundManager } from '@/utils/soundManager'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface Props {
  question: GraphQuestionType
  onAnswer: (answer: { correct: boolean; answer: string[] }) => void
  onNext: () => void
  onSkip?: () => void
}

export default function GraphQuestion({ question, onAnswer, onNext, onSkip }: Props) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [selectedPoint, setSelectedPoint] = useState<{ x: number; y: number } | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const graphRef = useRef<SVGSVGElement>(null)
  const isDark = mounted && resolvedTheme === 'dark'

  useEffect(() => {
    setMounted(true)
  }, [])

  // Graph dimensions
  const width = 300
  const height = 300
  const margin = { top: 10, right: 20, bottom: 30, left: 40 }
  const innerWidth = width - margin.left - margin.right
  const innerHeight = height - margin.top - margin.bottom

  // Graph bounds from question config
  const { xMin, xMax, yMin, yMax } = question.gridConfig

  // Coordinate conversion functions
  const toPixelX = (x: number) => margin.left + (x - xMin) * innerWidth / (xMax - xMin)
  const toPixelY = (y: number) => height - margin.bottom - (y - yMin) * innerHeight / (yMax - yMin)
  const toGraphX = (pixelX: number) => xMin + (pixelX - margin.left) * (xMax - xMin) / innerWidth
  const toGraphY = (pixelY: number) => yMin + ((height - margin.bottom) - pixelY) * (yMax - yMin) / innerHeight

  // Origin position
  const originX = toPixelX(0)
  const originY = toPixelY(0)

  // Generate tick values
  const generateTicks = (min: number, max: number) => {
    const range = max - min
    let step: number

    if (range <= 1) step = 0.1
    else if (range <= 5) step = 0.5
    else if (range <= 20) step = 1
    else if (range <= 100) step = 10
    else step = Math.pow(10, Math.floor(Math.log10(range / 10)))

    const ticks: number[] = []
    const firstTick = Math.ceil(min / step) * step

    for (let i = firstTick; i <= max; i += step) {
      if (Math.abs(i) < step / 10) ticks.push(0)
      else ticks.push(parseFloat(i.toFixed(10)))
    }

    return ticks
  }

  // Handle point selection
  const handlePointerDown = (e: React.PointerEvent) => {
    if (hasSubmitted) return
    
    const svg = graphRef.current
    if (!svg) return

    const rect = svg.getBoundingClientRect()
    const pixelX = e.clientX - rect.left
    const pixelY = e.clientY - rect.top

    // Check if click is within graph area
    if (pixelX >= margin.left && pixelX <= width - margin.right &&
        pixelY >= margin.top && pixelY <= height - margin.bottom) {

      const x = Math.min(Math.max(toGraphX(pixelX), xMin), xMax)
      const y = Math.min(Math.max(toGraphY(pixelY), yMin), yMax)

      setSelectedPoint({
        x: parseFloat(x.toFixed(2)),
        y: parseFloat(y.toFixed(2))
      })

      soundManager.play('click')
      if (navigator.vibrate) navigator.vibrate(50)
    }
  }

  // Submit handler
  const handleSubmit = () => {
    if (!selectedPoint) return

    const threshold = Math.min(
      0.2,
      Math.max(
        0.1,
        (xMax - xMin) * 0.02
      )
    )

    const correct = question.correctPoints.some(correctPoint =>
      Math.abs(selectedPoint.x - correctPoint.x) < threshold &&
      Math.abs(selectedPoint.y - correctPoint.y) < threshold
    )

    setIsCorrect(correct)
    setHasSubmitted(true)
    onAnswer({
      correct,
      answer: [`(${selectedPoint.x}, ${selectedPoint.y})`]
    })

    soundManager.play(correct ? 'correct' : 'incorrect')
    if (navigator.vibrate) navigator.vibrate(correct ? 100 : [50, 50, 50])
  }

  // Generate ticks
  const xTicks = generateTicks(xMin, xMax)
  const yTicks = generateTicks(yMin, yMax)

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
      <div className="flex justify-center w-full">
        <svg
          ref={graphRef}
          viewBox={`0 0 ${width} ${height}`}
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid meet"
          className={cn(
            "touch-none select-none rounded-lg max-w-[300px] w-full aspect-square",
            "border-2 border-border bg-background"
          )}
          onPointerDown={handlePointerDown}
          style={{ touchAction: 'none' }}
        >
          {/* Grid lines */}
          <g>
            {xTicks.map((x, i) => (
              <line
                key={`x-${i}`}
                x1={toPixelX(x)}
                y1={toPixelY(yMin)}
                x2={toPixelX(x)}
                y2={toPixelY(yMax)}
                stroke={isDark ? 'hsla(var(--foreground) / 0.2)' : 'hsl(var(--border))'}
                strokeWidth="1"
                strokeDasharray={x % 5 === 0 ? undefined : "3,3"}
              />
            ))}
            {yTicks.map((y, i) => (
              <line
                key={`y-${i}`}
                x1={toPixelX(xMin)}
                y1={toPixelY(y)}
                x2={toPixelX(xMax)}
                y2={toPixelY(y)}
                stroke={isDark ? 'hsla(var(--foreground) / 0.2)' : 'hsl(var(--border))'}
                strokeWidth="1"
                strokeDasharray={y % 5 === 0 ? undefined : "3,3"}
              />
            ))}
          </g>

          {/* Axes */}
          <line
            x1={toPixelX(xMin)}
            y1={originY}
            x2={toPixelX(xMax)}
            y2={originY}
            stroke={isDark ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))'}
            strokeWidth="2"
          />
          <line
            x1={originX}
            y1={toPixelY(yMin)}
            x2={originX}
            y2={toPixelY(yMax)}
            stroke={isDark ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))'}
            strokeWidth="2"
          />

          {/* Ticks and labels */}
          {xTicks.map((x, i) => (
            <g key={`x-tick-${i}`}>
              <line
                x1={toPixelX(x)}
                y1={originY}
                x2={toPixelX(x)}
                y2={originY + 5}
                stroke={isDark ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))'}
                strokeWidth="1"
              />
              {x !== 0 && (
                <text
                  x={toPixelX(x)}
                  y={originY + 20}
                  textAnchor="middle"
                  fontSize="12px"
                  fill={isDark ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))'}
                >
                  {x}
                </text>
              )}
            </g>
          ))}
          {yTicks.map((y, i) => (
            <g key={`y-tick-${i}`}>
              <line
                x1={originX}
                y1={toPixelY(y)}
                x2={originX - 5}
                y2={toPixelY(y)}
                stroke={isDark ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))'}
                strokeWidth="1"
              />
              {y !== 0 && (
                <text
                  x={originX - 10}
                  y={toPixelY(y) + 4}
                  textAnchor="end"
                  fontSize="12px"
                  fill={isDark ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))'}
                >
                  {y}
                </text>
              )}
            </g>
          ))}

          {/* Origin label */}
          <text
            x={originX - 10}
            y={originY + 20}
            textAnchor="end"
            fontSize="12px"
            fontWeight="500"
            fill={isDark ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))'}
          >
            0
          </text>

          {/* Selected point */}
          {selectedPoint && (
            <>
              <circle
                cx={toPixelX(selectedPoint.x)}
                cy={toPixelY(selectedPoint.y)}
                r="6"
                fill={hasSubmitted
                  ? isCorrect
                    ? 'hsl(var(--success))'
                    : 'hsl(var(--error))'
                  : 'hsl(var(--primary))'}
                stroke={isDark ? 'hsl(var(--background))' : 'hsl(var(--background))'}
                strokeWidth="2"
              />
              <rect
                x={toPixelX(selectedPoint.x) + 10}
                y={toPixelY(selectedPoint.y) - 30}
                width="80"
                height="25"
                rx="4"
                fill={isDark ? 'hsla(var(--background) / 0.8)' : 'hsla(var(--background) / 0.8)'}
                stroke={isDark ? 'hsla(var(--foreground) / 0.2)' : 'hsla(var(--foreground) / 0.2)'}
              />
              <text
                x={toPixelX(selectedPoint.x) + 50}
                y={toPixelY(selectedPoint.y) - 13}
                textAnchor="middle"
                fill={isDark ? 'hsl(var(--foreground))' : 'hsl(var(--foreground))'}
                fontSize="12px"
              >
                ({selectedPoint.x}, {selectedPoint.y})
              </text>
            </>
          )}
        </svg>
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
              onClick={() => setSelectedPoint(null)}
              className="px-6 py-3 bg-secondary text-secondary-foreground rounded-full font-medium touch-manipulation select-none active:scale-[0.98]"
            >
              Reset Point
            </motion.button>
            {selectedPoint && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium touch-manipulation select-none active:scale-[0.98]"
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
                className="px-6 py-3 bg-secondary text-secondary-foreground rounded-full font-medium touch-manipulation select-none active:scale-[0.98]"
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
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium touch-manipulation select-none active:scale-[0.98]"
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
          className={cn(
            "p-6 rounded-lg text-center select-none touch-manipulation",
            isCorrect
              ? "bg-success-muted text-success-emphasis"
              : "bg-error-muted text-error-emphasis"
          )}
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
                <p className="mt-4 text-sm text-muted-foreground dark:text-muted-foreground/90">{question.explanation}</p>
              )}
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
