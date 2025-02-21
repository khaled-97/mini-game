'use client'
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { LineMatchQuestion as LineMatchQuestionType } from '@/types/question'
import { isRichContent } from '@/utils/questionContent'
import RichContent from '../RichContent'
import { soundManager } from '@/utils/soundManager'
import { createShuffledPairs } from '@/utils/shuffleArray'
import { useTheme } from 'next-themes'
import { cn } from '@/lib/utils'

interface Props {
  question: LineMatchQuestionType
  onAnswer: (answer: { correct: boolean; answer: string[] }) => void
  onNext: () => void
  onSkip?: () => void
  showFeedback?: boolean
}

interface Connection {
  from: number
  to: number
}

interface Point {
  x: number
  y: number
}

export default function LineMatchQuestion({ question, onAnswer, onNext }: Props) {
  const { resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [connections, setConnections] = useState<Connection[]>([])

  useEffect(() => {
    setMounted(true)
  }, [])
  const [activeConnection, setActiveConnection] = useState<{ from: number } | null>(null)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [mousePos, setMousePos] = useState<Point>({ x: 0, y: 0 })
  const [touchStartItem, setTouchStartItem] = useState<{ side: 'left' | 'right'; index: number } | null>(null)
  const [hoveredRightItem, setHoveredRightItem] = useState<number | null>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  
  // Shuffle right items and store both items and their connections
  const [shuffledState] = useState(() => 
    createShuffledPairs(question.rightItems, question.correctConnections)
  )

  // Draw connections
  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size to match container
    canvas.width = container.offsetWidth
    canvas.height = container.offsetHeight

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw existing connections
    connections.forEach(connection => {
      const leftItem = document.querySelector(`[data-left-item="${connection.from}"]`)
      const rightItem = document.querySelector(`[data-right-item="${connection.to}"]`)
      if (!leftItem || !rightItem) return

      const leftRect = leftItem.getBoundingClientRect()
      const rightRect = rightItem.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      const startX = leftRect.right - containerRect.left
      const startY = leftRect.top - containerRect.top + leftRect.height / 2
      const endX = rightRect.left - containerRect.left
      const endY = rightRect.top - containerRect.top + rightRect.height / 2

      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      // Theme-aware colors
      const isDark = mounted && resolvedTheme === 'dark'
      ctx.strokeStyle = hasSubmitted
        ? isConnectionCorrect(connection) 
          ? isDark ? '#22c55e' : '#15803d'  // green-600 : green-700
          : isDark ? '#ef4444' : '#dc2626'   // red-500 : red-600
        : isDark ? '#818cf8' : '#6366f1'     // indigo-400 : indigo-500
      ctx.lineWidth = 2
      ctx.stroke()
    })

    // Draw active connection
    if (activeConnection) {
      const leftItem = document.querySelector(`[data-left-item="${activeConnection.from}"]`)
      if (!leftItem) return

      const leftRect = leftItem.getBoundingClientRect()
      const containerRect = container.getBoundingClientRect()

      const startX = leftRect.right - containerRect.left
      const startY = leftRect.top - containerRect.top + leftRect.height / 2
      const endX = mousePos.x - containerRect.left
      const endY = mousePos.y - containerRect.top

      ctx.beginPath()
      ctx.moveTo(startX, startY)
      ctx.lineTo(endX, endY)
      const isDark = mounted && resolvedTheme === 'dark'
      ctx.strokeStyle = isDark ? '#818cf8' : '#6366f1'
      ctx.lineWidth = 2
      ctx.stroke()
    }
  }, [connections, activeConnection, mousePos, hasSubmitted])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current && containerRef.current) {
        canvasRef.current.width = containerRef.current.offsetWidth
        canvasRef.current.height = containerRef.current.offsetHeight
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!activeConnection) return
    setMousePos({ x: e.clientX, y: e.clientY })
  }, [activeConnection])

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    e.preventDefault() // Prevent scrolling while drawing
    if (!activeConnection || !e.touches[0]) return
    
    const touch = e.touches[0]
    setMousePos({ x: touch.clientX, y: touch.clientY })
    
    // Check if touch is over a right item
    const elements = document.elementsFromPoint(touch.clientX, touch.clientY)
    const rightItem = elements.find(el => el.hasAttribute('data-right-item'))
    if (rightItem) {
      const index = parseInt(rightItem.getAttribute('data-right-item') || '-1')
      if (index !== -1) {
        setHoveredRightItem(index)
      }
    } else {
      setHoveredRightItem(null)
    }
  }, [activeConnection])

  const handleContainerTouchEnd = useCallback((e: React.TouchEvent) => {
    e.preventDefault()
    setHoveredRightItem(null)
    
    if (activeConnection && hoveredRightItem !== null) {
      const newConnection = { from: activeConnection.from, to: hoveredRightItem }
      setConnections(prev => [...prev, newConnection])
      setActiveConnection(null)
      soundManager.play('connected')
      
      // Vibrate on mobile devices
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50)
      }
    }
  }, [activeConnection, hoveredRightItem])

  const isConnectionCorrect = useCallback((connection: Connection) => {
    return shuffledState.shuffledConnections.some(correct => 
      correct.from === connection.from && correct.to === connection.to
    )
  }, [shuffledState.shuffledConnections])

  const handleLeftItemClick = useCallback((index: number) => {
    if (hasSubmitted) return

    // If this item is already connected, remove its connection
    const existingConnection = connections.find(c => c.from === index)
    if (existingConnection) {
      setConnections(prev => prev.filter(c => c.from !== index))
      soundManager.play('click')
      return
    }

    setActiveConnection({ from: index })
    soundManager.play('click')
  }, [hasSubmitted, connections])

  const handleRightItemClick = useCallback((index: number) => {
    if (hasSubmitted) return

    // If this item is already connected, remove its connection
    const existingConnection = connections.find(c => c.to === index)
    if (existingConnection) {
      setConnections(prev => prev.filter(c => c.to !== index))
      soundManager.play('click')
      return
    }

    if (activeConnection) {
      const newConnection = { from: activeConnection.from, to: index }
      setConnections(prev => [...prev, newConnection])
      setActiveConnection(null)
      soundManager.play('click')
    }
  }, [hasSubmitted, activeConnection, connections])

  const handleTouchStart = useCallback((side: 'left' | 'right', index: number) => {
    if (hasSubmitted) return
    setTouchStartItem({ side, index })
  }, [hasSubmitted])

  const handleTouchEnd = useCallback((side: 'left' | 'right', index: number) => {
    if (hasSubmitted || !touchStartItem) return

    // If touch ended on the same item, handle as a click
    if (touchStartItem.side === side && touchStartItem.index === index) {
      if (side === 'left') {
        handleLeftItemClick(index)
      } else {
        handleRightItemClick(index)
      }
    }

    setTouchStartItem(null)
  }, [hasSubmitted, touchStartItem, handleLeftItemClick, handleRightItemClick])

  const handleSubmit = useCallback(() => {
    const correct = connections.every(isConnectionCorrect)
    setIsCorrect(correct)
    setHasSubmitted(true)
    onAnswer({
      correct,
      answer: connections.map(c => `${c.from}-${c.to}`)
    })
    soundManager.play(correct ? 'correct' : 'incorrect')

    // Vibrate on mobile devices
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(correct ? [100] : [50, 50, 50])
    }
  }, [connections, isConnectionCorrect, onAnswer])

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
          Match the related items. Tap an item again to remove its connection.
        </p>
      </motion.div>

      {/* Matching Area */}
      <div 
        ref={containerRef}
        className="relative min-h-[400px]"
        onMouseMove={handleMouseMove}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleContainerTouchEnd}
      >
        <canvas
          ref={canvasRef}
          className="absolute inset-0 pointer-events-none touch-none"
        />

        {/* Left Items */}
        <div className="absolute left-0 top-0 space-y-4 w-[45%]">
          {question.leftItems.map((item, index) => (
            <motion.button
              key={`left-${index}`}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              data-left-item={index}
              onTouchStart={() => handleTouchStart('left', index)}
              onTouchEnd={() => handleTouchEnd('left', index)}
              onClick={() => handleLeftItemClick(index)}
              disabled={hasSubmitted}
              className={cn(
                "w-full p-4 rounded-lg border-2 transition-all duration-200 text-left touch-manipulation select-none",
                !hasSubmitted && "hover:border-primary hover:bg-primary/5 active:scale-[1.02]",
                activeConnection?.from === index && "border-primary bg-primary/5 scale-[1.02]",
                !activeConnection && "border-border",
                "disabled:cursor-default dark:border-border"
              )}
            >
              <RichContent content={item} />
            </motion.button>
          ))}
        </div>

        {/* Right Items */}
        <div className="absolute right-0 top-0 space-y-4 w-[45%]">
          {shuffledState.shuffledItems.map((item, index) => (
            <motion.button
              key={`right-${index}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              data-right-item={index}
              onTouchStart={() => handleTouchStart('right', index)}
              onTouchEnd={() => handleTouchEnd('right', index)}
              onClick={() => handleRightItemClick(index)}
              disabled={hasSubmitted}
              className={cn(
                "w-full p-4 rounded-lg border-2 transition-all duration-200 text-left touch-manipulation select-none",
                !hasSubmitted && activeConnection && "hover:border-primary hover:bg-primary/5 active:scale-[1.02]",
                (connections.some(c => c.to === index) || hoveredRightItem === index) && "border-primary bg-primary/5 scale-[1.02]",
                !connections.some(c => c.to === index) && hoveredRightItem !== index && "border-border",
                "disabled:cursor-default dark:border-border"
              )}
            >
              <RichContent content={item} />
            </motion.button>
          ))}
        </div>
      </div>

      {/* Submit/Next Button */}
      {!hasSubmitted ? (
        connections.length === question.leftItems.length && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSubmit}
            className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium"
          >
            Check Answer
          </motion.button>
        )
      ) : (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={onNext}
            className="w-full sm:w-auto px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium"
        >
          Next Question
        </motion.button>
      )}

      {/* Results */}
      {hasSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={cn(
            "p-6 rounded-lg text-center",
            isCorrect 
              ? "bg-green-100 dark:bg-green-950 text-green-800 dark:text-green-100" 
              : "bg-red-100 dark:bg-red-950 text-red-800 dark:text-red-100"
          )}
        >
          {isCorrect ? (
            <p>Correct! {question.explanation}</p>
          ) : (
            <div>
              <p>Not quite. Here are the correct matches:</p>
              <div className="mt-4 space-y-2">
                {question.correctConnections.map((connection, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <div className="flex-1 text-left">
                      <RichContent content={question.leftItems[connection.from]} />
                    </div>
                    <div className="mx-4">➜</div>
                    <div className="flex-1 text-right">
                      <RichContent content={question.rightItems[connection.to]} />
                    </div>
                  </div>
                ))}
              </div>
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
