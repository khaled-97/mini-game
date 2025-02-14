import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

interface GameState {
  // User state
  xp: number
  level: number
  streak: number
  lastPlayed: Date | null
  
  // Current game session
  currentTopic: string | null
  currentLesson: string | null
  currentQuestion: number
  score: number
  
  // Progress tracking
  completedLessons: string[]
  achievements: string[]
  
  // Actions
  setXP: (xp: number) => void
  addXP: (amount: number) => void
  setLevel: (level: number) => void
  setStreak: (streak: number) => void
  incrementStreak: () => void
  resetStreak: () => void
  setLastPlayed: (date: Date) => void
  
  setCurrentTopic: (topicId: string | null) => void
  setCurrentLesson: (lessonId: string | null) => void
  setCurrentQuestion: (questionNumber: number) => void
  setScore: (score: number) => void
  addToScore: (points: number) => void
  
  addCompletedLesson: (lessonId: string) => void
  addAchievement: (achievementId: string) => void
  
  resetGameSession: () => void
}

const useGameStore = create<GameState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        xp: 0,
        level: 1,
        streak: 0,
        lastPlayed: null,
        currentTopic: null,
        currentLesson: null,
        currentQuestion: 0,
        score: 0,
        completedLessons: [],
        achievements: [],

        // Actions
        setXP: (xp) => set({ xp }),
        addXP: (amount) => set((state) => ({ xp: state.xp + amount })),
        setLevel: (level) => set({ level }),
        setStreak: (streak) => set({ streak }),
        incrementStreak: () => set((state) => ({ streak: state.streak + 1 })),
        resetStreak: () => set({ streak: 0 }),
        setLastPlayed: (date) => set({ lastPlayed: date }),

        setCurrentTopic: (topicId) => set({ currentTopic: topicId }),
        setCurrentLesson: (lessonId) => set({ currentLesson: lessonId }),
        setCurrentQuestion: (questionNumber) => set({ currentQuestion: questionNumber }),
        setScore: (score) => set({ score }),
        addToScore: (points) => set((state) => ({ score: state.score + points })),

        addCompletedLesson: (lessonId) =>
          set((state) => ({
            completedLessons: [...state.completedLessons, lessonId],
          })),
        addAchievement: (achievementId) =>
          set((state) => ({
            achievements: [...state.achievements, achievementId],
          })),

        resetGameSession: () =>
          set({
            currentTopic: null,
            currentLesson: null,
            currentQuestion: 0,
            score: 0,
          }),
      }),
      {
        name: 'game-storage',
      }
    )
  )
)

export default useGameStore
