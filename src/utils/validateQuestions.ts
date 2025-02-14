import { Question } from '@/types/question'

export function validateQuestions(questions: Question[]): string[] {
  const errors: string[] = []

  questions.forEach((question, index) => {
    // Validate common fields
    if (!question.id) {
      errors.push(`Question ${index + 1} is missing an id`)
    }
    if (!question.type) {
      errors.push(`Question ${index + 1} is missing a type`)
    }
    if (typeof question.difficulty !== 'number' || question.difficulty < 1 || question.difficulty > 4) {
      errors.push(`Question ${index + 1} has invalid difficulty (should be 1-4)`)
    }
    if (typeof question.points !== 'number' || question.points < 1) {
      errors.push(`Question ${index + 1} has invalid points (should be positive)`)
    }
    if (!question.question) {
      errors.push(`Question ${index + 1} is missing question text`)
    }
    if (!question.explanation) {
      errors.push(`Question ${index + 1} is missing an explanation`)
    }

    // Type-specific validation
    switch (question.type) {
      case 'multiple-choice':
        if (!Array.isArray(question.options) || question.options.length < 2) {
          errors.push(`Multiple choice question ${index + 1} needs at least 2 options`)
        }
        if (!Array.isArray(question.correctAnswers) || question.correctAnswers.length < 1) {
          errors.push(`Multiple choice question ${index + 1} needs at least 1 correct answer`)
        }
        break

      case 'fill-blank':
        if (!Array.isArray(question.blanks) || question.blanks.length < 1) {
          errors.push(`Fill in blank question ${index + 1} needs at least 1 blank`)
        }
        question.blanks?.forEach((blank, blankIndex) => {
          if (!blank.id || !blank.answer || typeof blank.position !== 'number') {
            errors.push(`Fill in blank question ${index + 1} has invalid blank at position ${blankIndex}`)
          }
        })
        break

      case 'drag-drop':
        if (!Array.isArray(question.items) || question.items.length < 2) {
          errors.push(`Drag and drop question ${index + 1} needs at least 2 items`)
        }
        if (!Array.isArray(question.dropZones) || question.dropZones.length < 2) {
          errors.push(`Drag and drop question ${index + 1} needs at least 2 drop zones`)
        }
        if (!Array.isArray(question.correctOrder) || question.correctOrder.length !== question.items?.length) {
          errors.push(`Drag and drop question ${index + 1} has mismatched items and correct order`)
        }
        break

      case 'line-match':
        if (!Array.isArray(question.leftItems) || !Array.isArray(question.rightItems)) {
          errors.push(`Line match question ${index + 1} needs both left and right items`)
        }
        if (question.leftItems?.length !== question.rightItems?.length) {
          errors.push(`Line match question ${index + 1} has mismatched left and right items`)
        }
        if (!Array.isArray(question.correctConnections) || 
            question.correctConnections.length !== question.leftItems?.length) {
          errors.push(`Line match question ${index + 1} has invalid connections`)
        }
        break

      case 'graph':
      case 'graph-plot':
        if (!question.gridConfig) {
          errors.push(`Graph question ${index + 1} is missing grid configuration`)
        }
        if (question.type === 'graph' && (!Array.isArray(question.correctPoints) || question.correctPoints.length < 1)) {
          errors.push(`Graph question ${index + 1} needs at least 1 correct point`)
        }
        if (question.type === 'graph-plot' && (!question.correctFunction || !question.checkPoints)) {
          errors.push(`Graph plot question ${index + 1} needs a correct function and check points`)
        }
        break

      case 'quick-tap':
        if (!Array.isArray(question.items) || question.items.length < 4) {
          errors.push(`Quick tap question ${index + 1} needs at least 4 items`)
        }
        if (typeof question.timeLimit !== 'number' || question.timeLimit < 1) {
          errors.push(`Quick tap question ${index + 1} needs a valid time limit`)
        }
        if (typeof question.minCorrect !== 'number' || question.minCorrect < 1) {
          errors.push(`Quick tap question ${index + 1} needs a valid minimum correct count`)
        }
        break

      case 'step-order':
        if (!Array.isArray(question.steps) || question.steps.length < 2) {
          errors.push(`Step order question ${index + 1} needs at least 2 steps`)
        }
        if (!Array.isArray(question.correctOrder) || question.correctOrder.length !== question.steps?.length) {
          errors.push(`Step order question ${index + 1} has mismatched steps and correct order`)
        }
        break
    }
  })

  return errors
}
