import { motion } from 'framer-motion'
import { QuestionResponse } from '@/types/question'
import useGameStore from '@/store/useGameStore'

interface LessonCompleteProps {
  responses: QuestionResponse[]
  totalQuestions: number
  onContinue: () => void
}

export default function LessonComplete({
  responses,
  totalQuestions,
  onContinue,
}: LessonCompleteProps) {
  const streak = useGameStore((state) => state.streak)
  const xp = useGameStore((state) => state.xp)
  const level = useGameStore((state) => state.level)

  const totalPoints = responses.reduce((sum, r) => sum + r.points, 0)
  const correctAnswers = responses.filter((r) => r.correct).length
  const accuracy = Math.round((correctAnswers / totalQuestions) * 100)
  const averageTime = Math.round(
    responses.reduce((sum, r) => sum + r.timeTaken, 0) / responses.length / 1000
  )

  const stars = accuracy >= 90 ? 3 : accuracy >= 70 ? 2 : accuracy >= 50 ? 1 : 0

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-background p-8 rounded-lg shadow-lg max-w-2xl mx-auto"
    >
      <h2 className="text-3xl font-bold text-center mb-8">Lesson Complete!</h2>

      {/* Stars */}
      <div className="flex justify-center mb-8 space-x-4">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, scale: 0 }}
            animate={{
              opacity: i < stars ? 1 : 0.3,
              scale: 1,
              rotate: i < stars ? [0, 20, -20, 0] : 0,
            }}
            transition={{ delay: i * 0.2 }}
            className="text-4xl text-yellow-400"
          >
            ⭐
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-primary">{accuracy}%</div>
          <div className="text-sm text-muted-foreground">Accuracy</div>
        </div>
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-primary">{totalPoints}</div>
          <div className="text-sm text-muted-foreground">Points Earned</div>
        </div>
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-primary">{averageTime}s</div>
          <div className="text-sm text-muted-foreground">Average Time</div>
        </div>
        <div className="text-center p-4 bg-muted rounded-lg">
          <div className="text-2xl font-bold text-primary">{streak}🔥</div>
          <div className="text-sm text-muted-foreground">Current Streak</div>
        </div>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="flex justify-between text-sm text-muted-foreground mb-2">
          <span>Level {level}</span>
          <span>{xp} XP</span>
        </div>
        <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-primary"
            initial={{ width: 0 }}
            animate={{ width: `${(xp % 100)}%` }}
            transition={{ duration: 1 }}
          />
        </div>
      </div>

      {/* Continue button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className="w-full py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:bg-primary/90"
        onClick={onContinue}
      >
        Continue Learning
      </motion.button>

      {/* Achievement unlocked (if applicable) */}
      {accuracy === 100 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-6 p-4 bg-yellow-100 border border-yellow-300 rounded-lg text-center"
        >
          <div className="text-lg font-semibold text-yellow-800">
            🏆 Perfect Score!
          </div>
          <div className="text-sm text-yellow-700">
            Achievement Unlocked: Perfectionist
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}
