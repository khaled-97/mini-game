'use client'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { ThemeToggle } from '@/components/theme-toggle'

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm border-b">
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
          </div>

          {/* Navigation links */}
          <div className="flex items-center space-x-2 sm:space-x-3 mr-2">
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
      </motion.div>
    </nav>
  )
}
