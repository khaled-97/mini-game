import { motion } from 'framer-motion'

interface LoadingProps {
  message?: string
}

export default function Loading({ message = 'Loading...' }: LoadingProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[200px]">
      <motion.div
        className="flex space-x-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="w-3 h-3 bg-primary rounded-full"
            animate={{
              y: ['0%', '-50%', '0%'],
            }}
            transition={{
              duration: 0.6,
              repeat: Infinity,
              delay: i * 0.2,
            }}
          />
        ))}
      </motion.div>
      <motion.p
        className="mt-4 text-muted-foreground"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        {message}
      </motion.p>
    </div>
  )
}

// Loading states component for skeleton loading
export function LoadingStates() {
  return (
    <div className="w-full max-w-4xl mx-auto p-6 space-y-6">
      {/* Question skeleton */}
      <div className="space-y-4">
        <div className="h-8 bg-muted rounded-md w-3/4 animate-pulse" />
        <div className="space-y-2">
          <div className="h-4 bg-muted rounded-md w-full animate-pulse" />
          <div className="h-4 bg-muted rounded-md w-5/6 animate-pulse" />
        </div>
      </div>

      {/* Options skeleton */}
      <div className="space-y-4 mt-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="h-12 bg-muted rounded-md w-full animate-pulse"
          />
        ))}
      </div>

      {/* Button skeleton */}
      <div className="mt-8">
        <div className="h-10 bg-muted rounded-md w-32 mx-auto animate-pulse" />
      </div>
    </div>
  )
}

// Loading overlay for transitions
export function LoadingOverlay() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center z-50"
    >
      <Loading message="Loading next question..." />
    </motion.div>
  )
}
