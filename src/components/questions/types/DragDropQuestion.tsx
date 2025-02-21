'use client'
import React, { useState, useCallback, useEffect, useMemo } from 'react'
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
  rectIntersection,
  KeyboardSensor,
  MeasuringStrategy,
} from '@dnd-kit/core'
import { restrictToWindowEdges } from '@dnd-kit/modifiers'
import { cn } from '@/lib/utils'

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
  index: number
}

function DraggableItem({ item, isActive, hasSubmitted, index }: DraggableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: getItemContent(item),
    disabled: hasSubmitted,
  })

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: {
          delay: index * 0.05,
          type: 'spring',
          stiffness: 300,
          damping: 25
        }
      }}
      className={cn(
        "p-2 rounded-lg border-2 text-center cursor-grab active:cursor-grabbing touch-manipulation",
        "w-16 h-16 flex items-center justify-center", // Fixed size
        hasSubmitted ? "border-border cursor-default" : "border-primary shadow-sm hover:shadow-md hover:bg-muted",
        (isDragging || isActive) && "opacity-50 border-primary bg-primary/5 shadow-lg",
      )}
      style={{
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        zIndex: isDragging ? 9999 : 'auto',
        willChange: isDragging ? 'transform' : 'auto',
        touchAction: 'none'
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
  isMatrix?: boolean
  onClick: (zoneId: string) => void
  index: number
}

function DropZone({
  zone,
  placedItem,
  isCorrect,
  hasSubmitted,
  is3x3Grid,
  isMatrix,
  onClick,
  index
}: DropZoneProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: zone.id,
    disabled: hasSubmitted || !!placedItem,
  })

  const zoneSize = "w-16 h-16" // Fixed size matching draggables

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{
        opacity: 1,
        scale: 1,
        transition: {
          delay: index * 0.05,
          type: 'spring',
          stiffness: 300,
          damping: 25
        }
      }}
      className="flex flex-col items-center justify-center" // Centered content
    >
      <motion.div
        onClick={() => placedItem && onClick(zone.id)}
        whileHover={placedItem && !hasSubmitted ? { scale: 1.05 } : {}}
        className={cn(
          zoneSize,
          "rounded-lg border-2 flex items-center justify-center touch-manipulation select-none",
          "relative overflow-hidden", // Ensure content stays contained
          hasSubmitted ? "cursor-default" : placedItem ? "cursor-pointer" : "cursor-copy",
          !hasSubmitted && !placedItem && "border-dashed border-muted-foreground/30",
          hasSubmitted && (isCorrect
            ? "border-green-500 bg-green-100 dark:bg-green-950"
            : "border-red-500 bg-red-100 dark:bg-red-950"
          ),
          !hasSubmitted && (isOver
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
          ),
          placedItem && !hasSubmitted && "hover:bg-muted"
        )}      >
        <AnimatePresence mode="wait">
          {placedItem ? (
            <motion.div
              key="content"
              initial={{ opacity: 0}}
              animate={{ opacity: 1}}
              exit={{ opacity: 0}}
              className="w-full h-full flex items-center justify-center"
            >
              <RichContent content={placedItem} />
            </motion.div>
          ) : (
            <motion.span
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-muted-foreground text-sm text-center p-1"
            >
              {isOver ? "Release to place" : "Drop here"}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.div>
      {(is3x3Grid || isMatrix) && zone.placeholder && (
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
  const [correctItemsMap, setCorrectItemsMap] = useState<Record<string, string>>({})

  // Reset state when the question changes
  useEffect(() => {
    setPlacedItems({})
    setHasSubmitted(false)
    setIsCorrect(false)
    setActiveId(null)

    // Map zone ids to their correct items for easier reference
    const itemMap: Record<string, string> = {}
    question.dropZones.forEach(zone => {
      const correctItemIndex = parseInt(zone.correctItemId.split('-')[1])
      if (!isNaN(correctItemIndex) && correctItemIndex < question.items.length) {
        itemMap[zone.id] = getItemContent(question.items[correctItemIndex])
      }
    })
    setCorrectItemsMap(itemMap)
  }, [question])

  // Check if this is a 3x3 grid question
  const is3x3Grid = question.dropZones.length === 9 &&
    (question.question.includes('3x3 grid') ||
      question.question.includes('3×3 grid'))

  // Check if this is a matrix question
  const isMatrix = question.type === 'drag-drop' ||
    question.question.toLowerCase().includes('matrix') ||
    (question.dropZones.length > 9 &&
      Math.sqrt(question.dropZones.length) % 1 === 0) // Check if perfect square for matrix

  // Get available items (not yet placed)
  const availableItems = question.items.filter(
    item => !Object.values(placedItems).includes(getItemContent(item))
  )

  // Configure sensors with better mobile touch handling
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100, // slight delay helps distinguish taps from drags on mobile
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
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

  const validateMatrix = useCallback(() => {
    // For matrix questions, check if items are in their correct positions
    const correct = Object.entries(placedItems).every(([zoneId, placedItem]) => {
      return placedItem === correctItemsMap[zoneId]
    })
    return correct
  }, [placedItems, correctItemsMap])

  const handleSubmit = useCallback(() => {
    let correct = false

    if (isMatrix) {
      correct = validateMatrix()
    } else {
      // Regular validation
      correct = question.dropZones.every(zone => {
        const placedItem = placedItems[zone.id]
        return placedItem === correctItemsMap[zone.id]
      })
    }

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
  }, [question, placedItems, onAnswer, isMatrix, validateMatrix, correctItemsMap])

  // Get the grid columns based on question type
  const gridColumns = useMemo(() => {
    if (isMatrix) {
      // For matrices, find the square root to determine columns
      const size = Math.sqrt(question.dropZones.length)
      if (size % 1 === 0) {
        return `grid-cols-${size}`
      }
    }
    if (is3x3Grid) return 'grid-cols-3'
    return ''
  }, [is3x3Grid, isMatrix, question.dropZones.length])

  // Create matrix result explanation
  const matrixResultExplanation = useMemo(() => {
    if (!isMatrix || !hasSubmitted) return null

    const size = Math.sqrt(question.dropZones.length)
    if (size % 1 !== 0) return null

    return (
      <div className="mt-4">
        <h3 className="font-medium mb-2">Correct Matrix Placement:</h3>
        <div className={`grid ${gridColumns} gap-2 max-w-lg mx-auto`}>
          {question.dropZones.map((zone, index) => {
            const correctItem = correctItemsMap[zone.id]
            return (
              <div key={index} className="p-2 border rounded text-center bg-green-100 dark:bg-green-950 dark:text-green-100">
                <RichContent content={correctItem} />
                {zone.placeholder && (
                  <div className="mt-1 text-xs text-muted-foreground">{zone.placeholder}</div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    )
  }, [isMatrix, hasSubmitted, question.dropZones, gridColumns, correctItemsMap])

  // Check if all dropzones are filled
  const allZonesFilled = useMemo(() => {
    return Object.keys(placedItems).length === question.dropZones.length
  }, [placedItems, question.dropZones.length])

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
          Drag items to their correct positions {isMatrix ? 'in the matrix' : ''}
        </p>
      </motion.div>

      <DndContext
        sensors={sensors}
        collisionDetection={rectIntersection} // Improved collision detection
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        modifiers={[restrictToWindowEdges]}
        measuring={{
          droppable: {
            strategy: MeasuringStrategy.Always
          }
        }}
      >
        {/* Items */}
        <motion.div
          layout
          layoutRoot
          transition={{
            layout: { duration: 0.2, ease: "easeOut" }
          }}
          className={cn(
            "grid gap-8 justify-center w-full",
            is3x3Grid || isMatrix ? 'grid-cols-3' : 'grid-cols-2 sm:grid-cols-3'
          )}
        >
          <AnimatePresence>
            {availableItems.map((item, index) => (
              <DraggableItem
                key={getItemContent(item)}
                item={item}
                isActive={getItemContent(item) === activeId}
                hasSubmitted={hasSubmitted}
                index={index}
              />
            ))}
          </AnimatePresence>
        </motion.div>

        {/* Drop Zones */}
        <motion.div
          layout // Add layout animations
          className={cn(
            "mt-8 grid gap-2 justify-center",
            is3x3Grid || isMatrix ? 'grid-cols-3' : 'grid-cols-1'
          )}
        >
          {question.dropZones.map((zone, index) => {
            const placedItem = placedItems[zone.id]
            const correctItem = correctItemsMap[zone.id]
            return (
              <DropZone
                key={zone.id}
                zone={zone}
                placedItem={placedItem}
                isCorrect={hasSubmitted ? placedItem === correctItem : undefined}
                hasSubmitted={hasSubmitted}
                is3x3Grid={is3x3Grid}
                isMatrix={isMatrix}
                onClick={handleRemoveItem}
                index={index}
              />
            )
          })}
        </motion.div>

        {/* Drag Overlay */}
        <DragOverlay zIndex={10000}>
          {activeId ? (
            <div className="p-4 rounded-lg border-2 border-primary bg-background shadow-lg text-center">
              <RichContent content={activeId as string} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Controls */}
      <div className="flex justify-center gap-4">
        {!hasSubmitted ? (
          <>
            {allZonesFilled ? (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSubmit}
                className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium shadow-sm transition-shadow hover:shadow-md"
              >
                Check Answer
              </motion.button>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="px-6 py-3 text-sm text-muted-foreground"
              >
                {Object.keys(placedItems).length > 0 ?
                  `${Object.keys(placedItems).length} of ${question.dropZones.length} positions filled` :
                  'Drag items to their correct positions'}
              </motion.div>
            )}
            {onSkip && (
              <motion.button
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={onSkip}
                className="px-6 py-3 bg-secondary text-secondary-foreground rounded-full font-medium hover:bg-secondary/80 transition-colors"
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
            className="px-6 py-3 bg-primary text-primary-foreground rounded-full font-medium shadow-sm transition-shadow hover:shadow-md"
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
              <p className="mb-4">Not quite. Here are the correct matches:</p>
              {isMatrix ? (
                matrixResultExplanation
              ) : (
                <div className="space-y-2 max-w-lg mx-auto">
                  {question.dropZones.map((zone, index) => {
                    const correctItem = correctItemsMap[zone.id]
                    return (
                      <div key={index} className="flex items-center justify-between gap-4 mb-2 p-2 rounded-lg bg-background">
                        <span className="font-medium">{zone.placeholder || `Position ${index + 1}`}:</span>
                        <div className="border rounded p-2 bg-green-100 dark:bg-green-950 dark:text-green-100">
                          <RichContent content={correctItem} />
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
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

// Helper function for keyboard navigation
function sortableKeyboardCoordinates(
  event: KeyboardEvent,
  context: any
) {
  const target = event.target as HTMLElement;
  const rect = target.getBoundingClientRect();

  return {
    x: rect.left + rect.width / 2,
    y: rect.top + rect.height / 2
  };
}
