'use client'
import React, { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { OrderQuestion as OrderQuestionType } from '@/types/question'
import { soundManager } from '@/utils/soundManager'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
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
  value: number
  index: number
}

function SortableItem({ id, value, index }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
  }

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 rounded-lg border-2 mb-2 cursor-grab active:cursor-grabbing touch-manipulation select-none
        ${isDragging ? 'border-primary bg-primary/5 shadow-lg' : 'border-gray-200 bg-white hover:border-primary/50'}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="flex items-center justify-between">
        <span className="text-lg">{value}</span>
        <span className="text-gray-400">#{index + 1}</span>
      </div>
    </motion.div>
  )
}

export default function OrderQuestion({ question, onAnswer, onNext }: Props) {
  const [items, setItems] = useState(question.numbers)
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 250,
        tolerance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.indexOf(Number(active.id))
        const newIndex = items.indexOf(Number(over.id))
        soundManager.play('click')
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }, [])

  const handleSubmit = useCallback(() => {
    const orderedNumbers = [...items]
    const correctOrder = question.correctOrder === 'ascending' 
      ? [...question.numbers].sort((a, b) => a - b)
      : [...question.numbers].sort((a, b) => b - a)
    
    const correct = orderedNumbers.every((num, index) => num === correctOrder[index])
    
    setIsCorrect(correct)
    setHasSubmitted(true)
    onAnswer({
      correct,
      answer: orderedNumbers.map(String)
    })
    soundManager.play(correct ? 'correct' : 'incorrect')

    // Vibrate on mobile devices
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(correct ? [100] : [50, 50, 50])
    }
  }, [items, question, onAnswer])

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
          Drag and drop the numbers to {question.correctOrder === 'ascending' ? 'ascending' : 'descending'} order
        </p>
      </motion.div>

      {/* Sortable Items */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={items.map(String)}
          strategy={verticalListSortingStrategy}
        >
          <div className="max-w-sm mx-auto">
            {items.map((value, index) => (
              <SortableItem
                key={value}
                id={String(value)}
                value={value}
                index={index}
              />
            ))}
          </div>
        </SortableContext>
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
              <p className="mb-4">Not quite. The correct order is:</p>
              <div className="flex justify-center gap-4">
                {(question.correctOrder === 'ascending' 
                  ? [...question.numbers].sort((a, b) => a - b)
                  : [...question.numbers].sort((a, b) => b - a)
                ).map((num, index) => (
                  <div key={index} className="font-mono bg-white px-3 py-1 rounded border">
                    {num}
                  </div>
                ))}
              </div>
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
