'use client'
import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Props {
  message: string
  duration?: number
}

export function WelcomeMessage({ message, duration = 2000 }: Props) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, duration)

    return () => clearTimeout(timer)
  }, [duration])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          className="fixed top-20 left-4 right-4 md:left-1/2 md:right-auto md:-translate-x-1/2 z-50"
        >
          <div className="bg-primary px-6 py-3 rounded-full shadow-lg mx-auto max-w-md">
            <p className="text-white font-medium text-center text-sm md:text-base">
              {message}
            </p>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
