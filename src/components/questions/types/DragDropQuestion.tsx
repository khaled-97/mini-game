'use client'
import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DragDropQuestion as DragDropQuestionType } from '@/types/question'
import { isRichContent, QuestionItem } from '@/utils/questionContent'
import RichContent from '../RichContent'
import { soundManager } from '@/utils/soundManager'
import {
  DndContext,
  DragOverlay,
  useSensor,
  useSensors,
  MouseSensor,
  TouchSensor,
  DragStartEvent,
  DragEndEvent,
  UniqueIdentifier,
  useDraggable,
  useDroppable,
  closestCenter,
} from '@dnd-kit/core'

interface Props {
  question: DragDropQuestionType
  onAnswer: (answer: { correct: boolean; answer: string[] }) => void
  onNext: () => void
  onSkip?: () => void
}

function getItemContent(item: QuestionItem): string {
  return isRichContent(item) ? item.content : item
}

interface DraggableItemProps {
  item: QuestionItem
  isActive: boolean
  hasSubmitted: boolean
}

function DraggableItem({ item, isActive, hasSubmitted }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: getItemContent(item),
    disabled: hasSubmitted,
  })

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`p-4 rounded-lg border-2 text-center cursor-grab active:cursor-grabbing touch-manipulation
        ${hasSubmitted ? 'border-gray-200' : 'border-primary'}
        ${isDragging || isActive ? 'opacity-50 border-primary bg-primary/5 shadow-lg' : ''}
      `}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
      }}
      {...attributes}
      {...listeners}
    >
      <RichContent content={item} />
    </motion.div>
  )
}

interface DropZoneProps {
  zone: DragDropQuestionType['dropZones'][0]
  placedItem: string | null
  isCorrect?: boolean
  hasSubmitted: boolean
  is3x3Grid?: boolean
}

function DropZone({ zone, placedItem, isCorrect, hasSubmitted, is3x3Grid }: DropZoneProps) {
  const { setNodeRef } = useDroppable({
    id: zone.id,
    disabled: hasSubmitted,
  })

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className={is3x3Grid ? 'flex flex-col items-center' : 'flex items-center gap-4'}
    >
      {!is3x3Grid && (
        <div className="flex-1 text-right">
          {zone.placeholder}
        </div>
      )}
      <div className={`${is3x3Grid ? 'w-20 h-20' : 'w-32 h-16'} rounded-lg border-2 flex items-center justify-center touch-manipulation select-none
        ${hasSubmitted ? 'cursor-default' : placedItem ? 'cursor-pointer' : 'cursor-copy'}
        ${!hasSubmitted && !placedItem ? 'border-dashed border-gray-300' : ''}
        ${hasSubmitted ? (isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'border-gray-200'}
      `}>
        {placedItem ? (
          <RichContent content={placedItem} />
        ) : (
          <span className="text-gray-400">Drop here</span>
        )}
      </div>
      {is3x3Grid && zone.placeholder && (
        <div className="mt-1 text-xs text-muted-foreground">
          {zone.placeholder}
        </div>
      )}
    </motion.div>
  )
}

export default function DragDropQuestion({ question, onAnswer, onNext, onSkip }: Props) {
  const [placedItems, setPlacedItems] = useState<Record<string, string>>({})
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)

  // Check if this is a 3x3 grid question
  const is3x3Grid = question.dropZones.length === 9 && question.question.includes('3x3 grid')

  // Get available items (not yet placed)
  const availableItems = question.items.filter(
    item => !Object.values(placedItems).includes(getItemContent(item))
  )

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 0,
        tolerance: 0,
      },
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setActiveId(event.active.id)
    soundManager.play('click')
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    setActiveId(null)

    if (!over) return

    setPlacedItems(prev => ({
      ...prev,
      [over.id as string]: active.id as string
    }))
    soundManager.play('click')

    // Vibrate on mobile devices
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(50)
    }
  }, [])

  const handleRemoveItem = useCallback((zoneId: string) => {
    if (hasSubmitted) return
    setPlacedItems(prev => {
      const newItems = { ...prev }
      delete newItems[zoneId]
      return newItems
    })
    soundManager.play('click')
  }, [hasSubmitted])

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
          Drag items to their correct positions
        </p>
      </motion.div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        {/* Items */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="grid grid-cols-2 sm:grid-cols-3 gap-4"
        >
          {availableItems.map((item, index) => (
            <DraggableItem
              key={index}
              item={item}
              isActive={getItemContent(item) === activeId}
              hasSubmitted={hasSubmitted}
            />
          ))}
        </motion.div>

        {/* Drop Zones */}
        <div className={`mt-8 ${is3x3Grid ? 'grid grid-cols-3 gap-4 max-w-md mx-auto' : 'space-y-4'}`}>
          {question.dropZones.map((zone) => {
            const placedItem = placedItems[zone.id]
            const correctItem = question.items[parseInt(zone.correctItemId.split('-')[1])]
            return (
              <DropZone
                key={zone.id}
                zone={zone}
                placedItem={placedItem}
                isCorrect={hasSubmitted ? placedItem === getItemContent(correctItem) : undefined}
                hasSubmitted={hasSubmitted}
                is3x3Grid={is3x3Grid}
              />
            )
          })}
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <div className="p-4 rounded-lg border-2 border-primary bg-white shadow-lg text-center">
              <RichContent content={activeId as string} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

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
