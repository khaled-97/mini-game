import { soundManager } from './soundManager'
import logger from './logger'

interface FeedbackOptions {
  showConfetti?: boolean
  playSound?: boolean
  logAnswer?: boolean
}

class FeedbackManager {
  private static instance: FeedbackManager

  private constructor() {}

  static getInstance(): FeedbackManager {
    if (!FeedbackManager.instance) {
      FeedbackManager.instance = new FeedbackManager()
    }
    return FeedbackManager.instance
  }

  handleAnswer(isCorrect: boolean, component: string, details?: any, options: FeedbackOptions = {}) {
    const {
      showConfetti = true,
      playSound = true,
      logAnswer = true
    } = options

    try {
      // Play appropriate sound
      if (playSound) {
        if (isCorrect) {
          soundManager.play('correct')
        } else {
          soundManager.play('incorrect')
        }
      }

      // Log the answer
      if (logAnswer) {
        if (isCorrect) {
          logger.info(component, 'Correct answer submitted', details)
        } else {
          logger.warn(component, 'Incorrect answer submitted', details)
        }
      }

      // Show confetti for correct answers
      if (isCorrect && showConfetti) {
        this.showConfetti()
      }

    } catch (error) {
      logger.error(component, 'Error handling answer feedback', error)
    }
  }

  private showConfetti() {
    // TODO: Implement confetti animation
    // This could be added later using a library like canvas-confetti
  }

  // Additional feedback methods can be added here
  showToast(message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info') {
    // TODO: Implement toast notifications
    console.log(`[${type.toUpperCase()}] ${message}`)
  }

  showValidationError(message: string, component: string) {
    logger.warn(component, 'Validation error', { message })
    this.showToast(message, 'warning')
  }
}

export const feedbackManager = FeedbackManager.getInstance()

export default feedbackManager
