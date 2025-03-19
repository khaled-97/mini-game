'use client'
import { motion } from 'framer-motion'

// Sample achievements data (in a real app, this would come from the database)
const achievements = [
  {
    id: 1,
    name: 'First Steps',
    description: 'Complete your first lesson',
    icon: '🎯',
    xpReward: 100,
    progress: 100,
    completed: true,
  },
  {
    id: 2,
    name: 'Perfect Score',
    description: 'Get 100% on any lesson',
    icon: '⭐',
    xpReward: 200,
    progress: 80,
    completed: false,
  },
  {
    id: 3,
    name: 'Math Wizard',
    description: 'Complete all lessons in a topic',
    icon: '🧙‍♂️',
    xpReward: 500,
    progress: 60,
    completed: false,
  },
  {
    id: 4,
    name: 'On Fire',
    description: 'Maintain a streak for 7 days',
    icon: '🔥',
    xpReward: 300,
    progress: 40,
    completed: false,
  },
  {
    id: 5,
    name: 'Speed Demon',
    description: 'Complete a lesson in under 3 minutes',
    icon: '⚡',
    xpReward: 250,
    progress: 0,
    completed: false,
  },
]

export default function AchievementsPage() {

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-8 text-foreground"
        >
          Achievements
        </motion.h1>

        {/* Stats summary */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card p-6 rounded-lg shadow-lg mb-8 text-card-foreground"
        >
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {achievements.filter((a) => a.completed).length}
              </div>
              <div className="text-sm text-muted-foreground">
                Achievements Unlocked
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {Math.round(
                  (achievements.filter((a) => a.completed).length /
                    achievements.length) *
                    100
                )}
                %
              </div>
              <div className="text-sm text-muted-foreground">Completion</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {achievements.reduce(
                  (sum, a) => (a.completed ? sum + a.xpReward : sum),
                  0
                )}
              </div>
              <div className="text-sm text-muted-foreground">XP Earned</div>
            </div>
          </div>
        </motion.div>

        {/* Achievements list */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid gap-4"
        >
          {achievements.map((achievement) => (
            <motion.div
              key={achievement.id}
              variants={item}
              className={`bg-card p-6 rounded-lg shadow-sm border 
                ${
                  achievement.completed
                    ? 'border-success bg-success/10'
                    : 'border-border'
                }
              `}
            >
              <div className="flex items-start space-x-4">
                <div className="text-4xl">{achievement.icon}</div>
                <div className="flex-grow">
                  <h3 className="text-lg font-semibold mb-1 text-card-foreground">
                    {achievement.name}
                  </h3>
                  <p className="text-muted-foreground mb-3">
                    {achievement.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="text-sm text-muted-foreground">
                        {achievement.xpReward} XP
                      </div>
                      {achievement.completed && (
                        <span className="text-success text-sm">✓ Completed</span>
                      )}
                    </div>
                  </div>
                  {!achievement.completed && (
                    <div className="mt-2">
                      <div className="h-2 bg-muted rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-primary"
                          initial={{ width: 0 }}
                          animate={{ width: `${achievement.progress}%` }}
                          transition={{ duration: 1 }}
                        />
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {achievement.progress}% complete
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}