'use client'
import React, { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { StepOrderQuestion as StepOrderQuestionType } from '@/types/question'
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
  question: StepOrderQuestionType
  onAnswer: (answer: { correct: boolean; answer: string[] }) => void
  onNext: () => void
}

interface SortableStepProps {
  id: string
  step: {
    text: string
    equation: string
    explanation?: string
  }
  index: number
  isCorrect?: boolean
  hasSubmitted: boolean
}

function SortableStep({ id, step, index, isCorrect, hasSubmitted }: SortableStepProps) {
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
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Step {index + 1}</span>
          {hasSubmitted && (
            <span className="text-xl">
              {isCorrect ? '✓' : '✗'}
            </span>
          )}
        </div>
        <div className="font-mono text-lg">{step.equation}</div>
        <div className="text-sm">{step.text}</div>
      </div>
    </motion.div>
  )
}

export default function StepOrderQuestion({ question, onAnswer, onNext }: Props) {
  const [steps, setSteps] = useState<typeof question.steps>([])
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)

  // Initialize steps in random order
  useEffect(() => {
    const shuffled = [...question.steps].sort(() => Math.random() - 0.5)
    setSteps(shuffled)
  }, [question.steps])

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
      setSteps((items) => {
        const oldIndex = items.findIndex((_, i) => `step-${i}` === active.id)
        const newIndex = items.findIndex((_, i) => `step-${i}` === over.id)
        return arrayMove(items, oldIndex, newIndex)
      })
      soundManager.play('click')
    }
  }, [])

  const handleSubmit = useCallback(() => {
    const correct = steps.every((step, index) => {
      const correctIndex = question.correctOrder[index]
      return step === question.steps[correctIndex]
    })

    setIsCorrect(correct)
    setHasSubmitted(true)
    onAnswer({
      correct,
      answer: steps.map(step => step.equation)
    })
    soundManager.play(correct ? 'correct' : 'incorrect')

    // Vibrate on mobile devices
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(correct ? [100] : [50, 50, 50])
    }
  }, [steps, question.correctOrder, question.steps, onAnswer])

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
          Drag the steps to put them in the correct order
        </p>
      </motion.div>

      {/* Initial Equation */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="p-4 bg-muted rounded-lg text-center"
      >
        <div className="font-mono text-lg">{question.initialEquation}</div>
      </motion.div>

      {/* Steps List */}
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="space-y-4">
          <SortableContext
            items={steps.map((_, i) => `step-${i}`)}
            strategy={verticalListSortingStrategy}
          >
            <AnimatePresence mode="popLayout">
              {steps.map((step, index) => {
                const correctIndex = question.correctOrder[index]
                const isStepCorrect = hasSubmitted && step === question.steps[correctIndex]

                return (
                  <SortableStep
                    key={`step-${index}`}
                    id={`step-${index}`}
                    step={step}
                    index={index}
                    isCorrect={hasSubmitted ? isStepCorrect : undefined}
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
              <div className="space-y-2">
                <span className="text-sm text-muted-foreground">
                  Step {parseInt(activeId.toString().split('-')[1]) + 1}
                </span>
                <div className="font-mono text-lg">
                  {steps[parseInt(activeId.toString().split('-')[1])].equation}
                </div>
                <div className="text-sm">
                  {steps[parseInt(activeId.toString().split('-')[1])].text}
                </div>
              </div>
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
              <p>Not quite. Here's the correct order:</p>
              <div className="mt-4 space-y-2">
                {question.correctOrder.map((stepIndex, index) => {
                  const step = question.steps[stepIndex]
                  return (
                    <div key={index} className="p-2 bg-white/50 rounded">
                      <div className="font-mono">{step.equation}</div>
                      {step.explanation && (
                        <div className="mt-1 text-sm">{step.explanation}</div>
                      )}
                    </div>
                  )
                })}
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
