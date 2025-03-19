'use client'
import React, { useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { OrderQuestion as OrderQuestionType } from '@/types/question'
import { soundManager } from '@/utils/soundManager'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  MeasuringStrategy,
  UniqueIdentifier,
  defaultDropAnimationSideEffects,
  PointerSensor,
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
  content: {
    text?: string
    equation?: string
    value?: number
  }
  index: number
  isActive: boolean
  disabled: boolean
}

const Item = React.memo(({ content, index }: {
  content: { text?: string; equation?: string; value?: number };
  index: number;
}) => (
  <div className="space-y-2">
    <div className="flex items-center justify-between">
      <span className="text-sm text-muted-foreground">#{index + 1}</span>
    </div>
    {content.equation && (
      <div className="font-mono text-lg">{content.equation}</div>
    )}
    {content.text && (
      <div className="text-sm">{content.text}</div>
    )}
    {content.value !== undefined && (
      <div className="text-lg">{content.value}</div>
    )}
  </div>
));
Item.displayName = 'Item';

function SortableItem({ id, content, index, isActive, disabled }: SortableItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ 
    id,
    disabled,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 20 : 10,
    opacity: isDragging ? 0.5 : 1,
    userSelect: 'none',
    WebkitTouchCallout: 'none',
    touchAction: 'none',
  } as React.CSSProperties;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`p-4 bg-background rounded-lg border-2 mb-2 cursor-grab active:cursor-grabbing touch-none select-none
        ${isDragging || isActive ? 'border-primary bg-primary/5 shadow-lg' : 'border-gray-200 hover:border-primary/50'}
        ${isDragging ? 'shadow-2xl' : ''}
        transition-shadow duration-200
      `}
    >
      <Item content={content} index={index} />
    </div>
  )
}

export default function OrderQuestion({ question, onAnswer, onNext }: Props) {
  const isStepOrder = question.steps !== undefined
  
  // Create an array of item IDs for sorting
  const [itemOrder, setItemOrder] = useState<string[]>(() => {
    if (isStepOrder && question.steps) {
      return question.steps.map((_, index) => `step-${index}`)
    } else if (question.numbers) {
      return question.numbers.map(num => String(num))
    }
    return []
  })
  
  const [hasSubmitted, setHasSubmitted] = useState(false)
  const [isCorrect, setIsCorrect] = useState(false)
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null)
  const [isDragging, setIsDragging] = useState(false)

  // Refs for touch handling
  const isTouchDevice = useRef(false)
  const touchTimeout = useRef<NodeJS.Timeout | null>(null)

  // Check if this is a touch device on mount
  useEffect(() => {
    isTouchDevice.current = 'ontouchstart' in window || 
      navigator.maxTouchPoints > 0 || 
      window.matchMedia('(pointer: coarse)').matches
    
    // Cleanup function to reset any lingering state
    return () => {
      if (touchTimeout.current) clearTimeout(touchTimeout.current)
      document.body.style.overflow = ''
    }
  }, [])

  // Configure sensors based on device type
  const sensors = useSensors(
    // Use PointerSensor as primary for better cross-device compatibility
    useSensor(PointerSensor, {
      activationConstraint: isTouchDevice.current 
        ? { delay: 0, tolerance: 8 } // More forgiving for touch
        : { distance: 5 } // Quick response for mouse
    }),
    // Fallback sensors
    useSensor(MouseSensor, {
      activationConstraint: { distance: 10 },
    }),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 0, tolerance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event
    setActiveId(active.id)
    setIsDragging(true)
    
    // Prevent page scrolling on touch devices
    if (isTouchDevice.current) {
      document.body.style.overflow = 'hidden'
      
      // Add subtle haptic feedback if available
      if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(20)
      }
    }
    
    soundManager.play('click')
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event
    
    // Delay re-enabling scrolling slightly to prevent accidental scrolls
    touchTimeout.current = setTimeout(() => {
      document.body.style.overflow = ''
    }, 100)
    
    setIsDragging(false)
    setActiveId(null)

    if (over && active.id !== over.id) {
      setItemOrder((items) => {
        const oldIndex = items.indexOf(String(active.id))
        const newIndex = items.indexOf(String(over.id))
        
        // Provide haptic feedback on successful reorder
        if (isTouchDevice.current && window.navigator && window.navigator.vibrate) {
          window.navigator.vibrate(30)
        }
        
        return arrayMove(items, oldIndex, newIndex)
      })
    }
  }, [])

  const handleDragCancel = useCallback(() => {
    touchTimeout.current = setTimeout(() => {
      document.body.style.overflow = ''
    }, 100)
    
    setIsDragging(false)
    setActiveId(null)
  }, [])

  const handleSubmit = useCallback(() => {
    let correct = false;
    
    if (isStepOrder && question.steps) {
      // Step order question
      const currentOrder = itemOrder.map(id => id.split('-')[1])
      correct = currentOrder.every(
        (stepIndex, index) => stepIndex === question.correctOrder[index]
      )
    } else if (question.numbers) {
      // Number order question
      const currentOrder = itemOrder.map(num => {
        const index = question.numbers!.indexOf(Number(num))
        return String(index)
      })
      correct = currentOrder.every(
        (index, position) => index === question.correctOrder[position]
      )
    }

    setIsCorrect(correct)
    setHasSubmitted(true)
    onAnswer({
      correct,
      answer: itemOrder
    })
    soundManager.play(correct ? 'correct' : 'incorrect')

    // Vibrate on mobile devices
    if (window.navigator && window.navigator.vibrate) {
      window.navigator.vibrate(correct ? [100] : [50, 50, 50])
    }
  }, [itemOrder, question, isStepOrder, onAnswer])

  // Memoized content getter
  const getItemContent = useCallback((id: string) => {
    if (isStepOrder && question.steps) {
      const index = parseInt(id.split('-')[1])
      const step = question.steps[index]
      return {
        text: step.text,
        equation: step.equation
      }
    } else if (question.numbers) {
      return {
        value: Number(id)
      }
    }
    return {}
  }, [isStepOrder, question.steps, question.numbers])

  // Only allow one active drag at a time
  const disableSorting = hasSubmitted || isDragging

  // Custom drop animation that's smoother on mobile
  const dropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.5',
        },
      },
    }),
  }

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
        {question.initialEquation && (
          <div className="p-4 bg-muted rounded-lg text-center mb-4">
            <div className="font-mono text-lg">{question.initialEquation}</div>
          </div>
        )}
        <p className="text-muted-foreground">
          Drag items to their correct positions. You cant drop an item between other items.
        </p>
      </motion.div>

      {/* Sortable Items with higher z-index container */}
      <div className="relative z-10">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragStart={handleDragStart}
          onDragEnd={handleDragEnd}
          onDragCancel={handleDragCancel}
          measuring={{
            droppable: {
              strategy: MeasuringStrategy.Always,
            },
          }}
        >
          <SortableContext
            items={itemOrder}
            strategy={verticalListSortingStrategy}
          >
            <div className="max-w-2xl mx-auto space-y-2">
              {itemOrder.map((id, index) => (
                <SortableItem
                  key={id}
                  id={id}
                  content={getItemContent(id)}
                  index={index}
                  isActive={id === activeId}
                  disabled={disableSorting}
                />
              ))}
            </div>
          </SortableContext>

          <DragOverlay dropAnimation={dropAnimation} zIndex={30}>
            {activeId ? (
              <div className="p-4 bg-background rounded-lg border-2 border-primary shadow-xl max-w-2xl transform scale-[1.03]">
                <Item 
                  content={getItemContent(String(activeId))} 
                  index={itemOrder.indexOf(String(activeId))} 
                />
              </div>
            ) : null}
          </DragOverlay>
        </DndContext>
      </div>

      {/* Submit/Next Button */}
      {!hasSubmitted ? (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSubmit}
          className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-full font-medium shadow-md"
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
          className="w-full sm:w-auto px-6 py-3 bg-primary text-white rounded-full font-medium shadow-md"
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
            isCorrect ? 'bg-success-muted text-success-emphasis' : 'bg-error-muted text-error-emphasis'
          } shadow-md`}
        >
          {isCorrect ? (
            <p>Correct! {question.explanation}</p>
          ) : (
            <div>
              <p className="mb-4">Not quite. Heres the correct order:</p>
              <div className="space-y-2">
                {isStepOrder && question.steps ? (
                  // Step order question
                  question.correctOrder.map((stepIndex, index) => {
                    const step = question.steps![parseInt(stepIndex)]
                    return (
                      <div key={index} className="p-2 bg-background/50 rounded shadow-sm">
                        <div className="font-mono">{step.equation}</div>
                        {step.explanation && (
                          <div className="mt-1 text-sm">{step.explanation}</div>
                        )}
                      </div>
                    )
                  })
                ) : question.numbers ? (
                  // Number order question
                  <div className="flex justify-center gap-4">
                    {question.correctOrder.map((index) => (
                      <div key={index} className="font-mono bg-background px-3 py-1 rounded border shadow-sm">
                        {question.numbers![parseInt(index)]}
                      </div>
                    ))}
                  </div>
                ) : null}
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
