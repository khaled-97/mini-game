'use client'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useGameStore from '@/store/useGameStore'

// Sample leaderboard data (in a real app, this would come from the database)
const leaderboardData = [
  { id: 1, name: 'Alex', xp: 12500, level: 25, streak: 15 },
  { id: 2, name: 'Sarah', xp: 11200, level: 22, streak: 8 },
  { id: 3, name: 'Michael', xp: 10800, level: 21, streak: 12 },
  { id: 4, name: 'Emma', xp: 9500, level: 19, streak: 5 },
  { id: 5, name: 'James', xp: 9000, level: 18, streak: 7 },
]

export default function LeaderboardPage() {
  const currentXP = useGameStore((state) => state.xp)
  const currentLevel = useGameStore((state) => state.level)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [players, setPlayers] = useState<typeof leaderboardData>([])

  useEffect(() => {
    // Simulate loading leaderboard data
    const timer = setTimeout(() => {
      try {
        if (!leaderboardData || leaderboardData.length === 0) {
          setError('No leaderboard data available.')
        } else {
          setPlayers(leaderboardData)
        }
      } catch (error) {
        setError('Failed to load leaderboard.')
        console.error('Error loading leaderboard:', error)
      } finally {
        setIsLoading(false)
      }
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Loading Leaderboard...</h2>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        </div>
      </div>
    )
  }

  if (error || players.length === 0) {
    return (
      <div className="min-h-screen bg-background p-6 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-primary mb-4">
            {error || 'No Players Found'}
          </h2>
          <p className="text-muted-foreground mb-8">
            {error ? 'Please try again later.' : 'Be the first to join the leaderboard!'}
          </p>
        </div>
      </div>
    )
  }

  // Calculate current player's rank
  const currentRank = players.findIndex(player => player.xp <= currentXP) + 1 || players.length + 1

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl font-bold text-center mb-8"
        >
          Leaderboard
        </motion.h1>

        {/* Your stats */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-card p-6 rounded-lg shadow-lg mb-8"
        >
          <h2 className="text-xl font-semibold mb-4">Your Position</h2>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{currentXP.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Total XP</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{currentLevel}</div>
              <div className="text-sm text-muted-foreground">Level</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">#{currentRank}</div>
              <div className="text-sm text-muted-foreground">Rank</div>
            </div>
          </div>
        </motion.div>

        {/* Leaderboard list */}
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-4"
        >
          {players.map((player, index) => (
            <motion.div
              key={player.id}
              variants={item}
              className={`bg-card p-4 rounded-lg shadow-sm border flex items-center
                ${index === 0 ? 'bg-yellow-50 border-yellow-200' : ''}
                ${index === 1 ? 'bg-gray-50 border-gray-200' : ''}
                ${index === 2 ? 'bg-orange-50 border-orange-200' : ''}
              `}
            >
              <div className="flex-shrink-0 w-8 text-center font-bold">
                {index + 1}
              </div>
              <div className="flex-grow">
                <div className="font-semibold">{player.name}</div>
                <div className="text-sm text-muted-foreground">
                  Level {player.level}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="font-semibold">{player.xp.toLocaleString()} XP</div>
                  <div className="text-sm text-muted-foreground">
                    {player.streak}🔥 Streak
                  </div>
                </div>
                {index < 3 && (
                  <div className="text-2xl">
                    {index === 0 && '🥇'}
                    {index === 1 && '🥈'}
                    {index === 2 && '🥉'}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}
