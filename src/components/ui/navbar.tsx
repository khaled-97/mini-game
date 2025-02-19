'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import useGameStore from '@/store/useGameStore'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Navbar() {
  const pathname = usePathname()
  const level = useGameStore((state) => state.level)
  const xp = useGameStore((state) => state.xp)
  const streak = useGameStore((state) => state.streak)

  const isActive = (path: string) => pathname === path

  const navItems = [
    { href: '/topics', label: 'Topics' },
    { href: '/leaderboard', label: 'Leaderboard' },
    { href: '/achievements', label: 'Achievements' },
  ]

  return (
    <nav className="fixed top-0 left-0 right-0 glass-effect z-50 mobile-safe-area">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Logo and stats */}
          <div className="flex items-center space-x-8">
            <Link 
              href="/" 
              className="font-bold text-xl bg-gradient-to-r from-primary to-primary-light bg-clip-text text-transparent hover-scale focus-ring"
            >
              Math Game
            </Link>
            <div className="hidden md:flex items-center space-x-6">
              <motion.div 
                className="text-sm glass-effect px-3 py-1.5 rounded-full"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                <span className="text-primary-light">Level</span>{' '}
                <span className="font-medium text-primary">{level}</span>
              </motion.div>
              <motion.div 
                className="text-sm glass-effect px-3 py-1.5 rounded-full"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
              >
                <span className="text-primary-light">XP</span>{' '}
                <span className="font-medium text-primary">{xp}</span>
              </motion.div>
              <motion.div 
                className="text-sm glass-effect px-3 py-1.5 rounded-full"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 }}
              >
                <span className="text-primary-light">Streak</span>{' '}
                <span className="font-medium text-primary">{streak}🔥</span>
              </motion.div>
            </div>
          </div>

          {/* Navigation links */}
          <div className="flex items-center space-x-2 sm:space-x-3 mr-2">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
              className={`px-2 sm:px-3 py-2 rounded-md text-sm font-medium transition-colors relative hover-scale focus-ring
                ${
                  isActive(item.href)
                    ? 'text-primary bg-primary/5'
                    : 'text-muted-foreground hover:text-primary hover:bg-primary/5'
                }
              `}
              >
                {item.label}
                {isActive(item.href) && (
                  <motion.div
                    layoutId="navbar-indicator"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                    initial={false}
                    transition={{
                      type: 'spring',
                      stiffness: 500,
                      damping: 30,
                    }}
                  />
                )}
              </Link>
            ))}
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Mobile stats bar */}
      <motion.div 
        className="md:hidden border-t glass-effect"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-around py-2">
          <motion.div 
            className="text-sm"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span className="text-primary-light">Level</span>{' '}
            <span className="font-medium text-primary">{level}</span>
          </motion.div>
          <motion.div 
            className="text-sm"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <span className="text-primary-light">XP</span>{' '}
            <span className="font-medium text-primary">{xp}</span>
          </motion.div>
          <motion.div 
            className="text-sm"
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <span className="text-primary-light">Streak</span>{' '}
            <span className="font-medium text-primary">{streak}🔥</span>
          </motion.div>
        </div>
      </motion.div>
    </nav>
  )
}
