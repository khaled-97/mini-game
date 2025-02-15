'use client'
import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { OrderQuestion as OrderQuestionType } from '@/types/question'
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
} from '@dnd-kit/core'
import {
  verticalListSortingStrategy,
  SortableContext,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

interface Props {
  question: OrderQuestionType
  onAnswer: (answer: { correct: boolean; answer: string[] }) => void
  onNext: () => void
  onSkip?: () => void
}

interface SortableItemProps {
  id: string
  number: number
  index: number
  isCorrect?: boolean
  hasSubmitted: boolean
}

function SortableItem({ id, number, index, isCorrect, hasSubmitted }: SortableItemProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled: hasSubmitted,
  })

  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className={`p-4 bg-white rounded-lg border-2 transition-all duration-200 touch-manipulation
        ${!hasSubmitted ? 'cursor-grab active:cursor-grabbing hover:border-primary hover:shadow-md' : ''}
        ${hasSubmitted && isCorrect !== undefined ? (isCorrect ? 'border-green-500 bg-green-50' : 'border-red-500 bg-red-50') : 'border-gray-200'}
        ${isDragging ? 'opacity-50' : 'opacity-100'}
      `}
      style={{
        transform: CSS.Transform.toString(transform),
      }}
      {...attributes}
      {...listeners}
    >
      <div className="flex items-center justify-between">
        <span className="text-lg font-medium">{number}</span>
        {hasSubmitted && (
          <span className="text-xl">
            {isCorrect ? '✓' : '✗'}
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default function OrderQuestion({ question, onAnswer, onNext }: Props) {
  const [numbers, setNumbers] = useState<number[]>([])
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)

  // Initialize numbers in random order
  useEffect(() => {
    const shuffled = [...question.numbers].sort(() => Math.random() - 0.5)
    setNumbers(shuffled)
  }, [question.numbers])

  // Configure sensors for both mouse and touch
  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 100,
        tolerance: 5,
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

    if (active.id !== over.id) {
      setNumbers((items) => {
        const oldIndex = items.findIndex((_, i) => `item-${i}` === active.id)
        const newIndex = items.findIndex((_, i) => `item-${i}` === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
      soundManager.play('click')
    }
  }, [])

  const handleSubmit = useCallback(() => {
    const isAscending = question.correctOrder === 'ascending'
    const sortedNumbers = [...numbers].sort((a, b) => isAscending ? a - b : b - a)
    const correct = numbers.every((num, index) => num === sortedNumbers[index])

    setIsCorrect(correct)
    setHasSubmitted(true)
    onAnswer({
      correct,
      answer: numbers.map(n => n.toString())
    })
    soundManager.play(correct ? 'correct' : 'incorrect')

    // Vibrate on mobile devices
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(correct ? [100] : [50, 50, 50])
    }
  }, [numbers, question.correctOrder, onAnswer])

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
          Drag the numbers to put them in {question.correctOrder} order
        </p>
      </motion.div>

      {/* Numbers List */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="max-w-md mx-auto space-y-4">
          <SortableContext
            items={numbers.map((_, i) => `item-${i}`)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence mode="popLayout">
              {numbers.map((number, index) => {
                const sortedNumbers = [...numbers].sort((a, b) => 
                  question.correctOrder === 'ascending' ? a - b : b - a
                )
                const isNumberCorrect = hasSubmitted && number === sortedNumbers[index]

                return (
                  <SortableItem
                    key={`item-${index}`}
                    id={`item-${index}`}
                    number={number}
                    index={index}
                    isCorrect={hasSubmitted ? isNumberCorrect : undefined}
                    hasSubmitted={hasSubmitted}
                  />
                )
              })}
            </AnimatePresence>
          </SortableContext>
        </div>

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <div className="p-4 bg-white rounded-lg border-2 border-primary shadow-lg">
              <span className="text-lg font-medium">
                {numbers[parseInt(activeId.toString().split('-')[1])]}
              </span>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Submit/Next Button */}
      {!hasSubmitted ? (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-full font-medium"
        >
          Check Answer
        </motion.button>
      ) : (
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

      {/* Explanation */}
      {hasSubmitted && question.explanation && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`p-4 rounded-lg text-center ${
            isCorrect ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {question.explanation}
        </motion.div>
      )}
    </div>
  )
}
