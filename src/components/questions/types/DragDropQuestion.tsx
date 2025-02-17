'use client'
import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropQuestion as DragDropQuestionType } from '@/types/question'
import { isRichContent, QuestionItem } from '@/utils/questionContent'
import RichContent from '../RichContent'
import { soundManager } from '@/utils/soundManager'

interface Props {
  question: DragDropQuestionType
  onAnswer: (answer: { correct: boolean; answer: string[] }) => void
  onNext: () => void
  onSkip?: () => void
}

function getItemContent(item: QuestionItem): string {
  return isRichContent(item) ? item.content : item
}

export default function DragDropQuestion({ question, onAnswer, onNext, onSkip }: Props) {
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [touchedItem, setTouchedItem] = useState<string | null>(null)
  const [touchStartCoords, setTouchStartCoords] = useState<{ x: number; y: number } | null>(null)
  const [placedItems, setPlacedItems] = useState<Record<string, string>>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  // Get available items (not yet placed)
  const availableItems = question.items.filter(
    item => !Object.values(placedItems).includes(getItemContent(item))
  )

  // Handle drag start
  const handleDragStart = useCallback((item: QuestionItem) => {
    setDraggedItem(getItemContent(item))
    soundManager.play('click')
  }, [])

  // Handle touch start
  const handleTouchStart = useCallback((event: React.TouchEvent, item: QuestionItem) => {
    event.preventDefault()
    const touch = event.touches[0]
    setTouchStartCoords({ x: touch.clientX, y: touch.clientY })
    setTouchedItem(getItemContent(item))
    soundManager.play('click')
  }, [])

  // Handle touch move
  const handleTouchMove = useCallback((event: React.TouchEvent) => {
    event.preventDefault()
  }, [])

  // Handle drop
  const handleDrop = useCallback((zoneId: string) => {
    if (draggedItem) {
      setPlacedItems(prev => ({ ...prev, [zoneId]: draggedItem }))
      setDraggedItem(null)
      soundManager.play('click')

      // Vibrate on mobile devices
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50)
      }
    }
  }, [draggedItem])

  // Handle touch end
  const handleTouchEnd = useCallback((event: React.TouchEvent, zoneId: string) => {
    event.preventDefault()
    if (!touchedItem || !touchStartCoords) return

    const touch = event.changedTouches[0]
    const dropZoneElement = event.currentTarget as HTMLElement
    const rect = dropZoneElement.getBoundingClientRect()

    // Check if touch ended within the drop zone
    if (
      touch.clientX >= rect.left &&
      touch.clientX <= rect.right &&
      touch.clientY >= rect.top &&
      touch.clientY <= rect.bottom
    ) {
      setPlacedItems(prev => ({ ...prev, [zoneId]: touchedItem }))
      soundManager.play('click')
      
      // Vibrate on mobile devices
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(50)
      }
    }

    setTouchedItem(null)
    setTouchStartCoords(null)
  }, [touchedItem, touchStartCoords])

  // Handle item removal
  const handleRemoveItem = useCallback((zoneId: string) => {
    if (hasSubmitted) return
    setPlacedItems(prev => {
      const newItems = { ...prev }
      delete newItems[zoneId]
      return newItems
    })
    soundManager.play('click')
  }, [hasSubmitted])

  // Handle submit
  const handleSubmit = useCallback(() => {
    const correct = question.dropZones.every(zone => {
      const placedItem = placedItems[zone.id]
      const correctItem = question.items[parseInt(zone.correctItemId.split('-')[1])]
      return placedItem === getItemContent(correctItem)
    })

    setIsCorrect(correct)
    setHasSubmitted(true)
    onAnswer({
      correct,
      answer: Object.values(placedItems)
    })
    soundManager.play(correct ? 'correct' : 'incorrect')

    // Vibrate on mobile devices
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(correct ? [100] : [50, 50, 50])
    }
  }, [question, placedItems, onAnswer])

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
          Drag items to their correct positions or tap to select and place.
        </p>
      </motion.div>

      {/* Items */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-2 sm:grid-cols-4 gap-4"
      >
        {availableItems.map((item, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            draggable={!hasSubmitted}
            onDragStart={() => handleDragStart(item)}
            onTouchStart={(e) => handleTouchStart(e, item)}
            onTouchMove={handleTouchMove}
            className={`p-4 rounded-lg border-2 text-center cursor-grab active:cursor-grabbing touch-manipulation
              ${hasSubmitted ? 'border-gray-200' : 'border-primary'}
              ${draggedItem === getItemContent(item) ? 'opacity-50' : ''}
              ${touchedItem === getItemContent(item) ? 'opacity-50' : ''}
            `}
          >
            <RichContent content={item} />
          </motion.div>
        ))}
      </motion.div>

      {/* Drop Zones */}
      <div className="space-y-4">
        {question.dropZones.map((zone, index) => (
          <motion.div
            key={zone.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-4"
          >
            <div className="flex-1 text-right">
              {zone.placeholder}
            </div>
            <motion.div
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDrop(zone.id)}
              onTouchEnd={(e) => handleTouchEnd(e, zone.id)}
              onTouchMove={handleTouchMove}
              onClick={() => handleRemoveItem(zone.id)}
              className={`w-32 h-16 rounded-lg border-2 flex items-center justify-center touch-manipulation select-none
                ${hasSubmitted ? 'cursor-default' : placedItems[zone.id] ? 'cursor-pointer' : 'cursor-copy'}
                ${!hasSubmitted && !placedItems[zone.id] ? 'border-dashed border-gray-300' : ''}
                ${hasSubmitted ? (
                  placedItems[zone.id] === getItemContent(question.items[parseInt(zone.correctItemId.split('-')[1])])
                    ? 'border-green-500 bg-green-50'
                    : 'border-red-500 bg-red-50'
                ) : 'border-gray-200'}
              `}
            >
              {placedItems[zone.id] ? (
                <RichContent content={placedItems[zone.id]} />
              ) : (
                <span className="text-gray-400">Drop here</span>
              )}
            </motion.div>
          </motion.div>
        ))}
      </div>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {!hasSubmitted ? (
          <>
            {Object.keys(placedItems).length === question.dropZones.length && (
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
        ) : (
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
              <p className="mb-4">Not quite. Here are the correct matches:</p>
              {question.dropZones.map((zone, index) => {
                const correctItem = question.items[parseInt(zone.correctItemId.split('-')[1])]
                return (
                  <div key={index} className="flex items-center justify-between gap-4 mb-2">
                    <span>{zone.placeholder}:</span>
                    <RichContent content={correctItem} />
                  </div>
                )
              })}
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
