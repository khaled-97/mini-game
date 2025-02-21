'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-primary mb-8"
        >
          Math Learning Game
        </motion.h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Lessons Mode */}
          <Link href="/topics">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-card text-card-foreground rounded-xl shadow-lg p-6 cursor-pointer hover-scale border-primary border"
            >
              <h2 className="text-2xl font-bold text-primary mb-4">Lessons</h2>
              <p className="text-muted-foreground">
                Learn step by step with structured lessons and progress tracking.
              </p>
            </motion.div>
          </Link>

          {/* Practice Mode */}
          <Link href="/practice">
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-card text-card-foreground rounded-xl shadow-lg p-6 cursor-pointer hover-scale border-primary border"
            >
              <h2 className="text-2xl font-bold text-primary mb-4">Practice</h2>
              <p className="text-muted-foreground">
                Challenge yourself with adaptive difficulty questions and build your skills.
              </p>
              <div className="mt-4 flex gap-2">
                {[1, 2, 3, 4].map(level => (
                  <div
                    key={level}
                    className="w-2 h-2 rounded-full bg-primary opacity-25 animate-pulse"
                    style={{ animationDelay: `${level * 0.2}s` }}
                  />
                ))}
              </div>
            </motion.div>
          </Link>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-secondary/50 text-secondary-foreground rounded-lg p-4"
          >
            <h3 className="font-semibold mb-2">Interactive Problems</h3>
            <p className="text-sm text-muted-foreground">
              Engage with drag-and-drop, visual, and creative math problems.
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-secondary/50 text-secondary-foreground rounded-lg p-4"
          >
            <h3 className="font-semibold mb-2">Progress Tracking</h3>
            <p className="text-sm text-muted-foreground">
              Track your scores, streaks, and improvement over time.
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  )
}