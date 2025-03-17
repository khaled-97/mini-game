'use client'
import { motion } from 'framer-motion'
import { soundManager } from '@/utils/soundManager'

interface NumPadProps {
    onNumber: (num: number) => void
    onBackspace: () => void
    onDecimal: () => void
    hasSubmitted: boolean
    showDecimal?: boolean
}

export default function NumPad({
    onNumber,
    onBackspace,
    onDecimal,
    hasSubmitted,
    showDecimal = true
}: NumPadProps) {
    if (hasSubmitted) return null;

    const handleClick = (action: () => void) => {
        action();
        soundManager.play('click');
        if (window.navigator && window.navigator.vibrate) {
            window.navigator.vibrate(50);
        }
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-3 gap-3 max-w-[320px] mx-auto mt-4 select-none touch-manipulation"
        >
            {[7, 8, 9, 4, 5, 6, 1, 2, 3].map((num) => (
                <motion.button
                    key={num}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleClick(() => onNumber(num))}
                    className="flex items-center justify-center h-14 aspect-square rounded-full bg-background border-2 border-border shadow-sm hover:shadow-md hover:border-primary hover:bg-primary/5 active:scale-95 transition-all duration-150 text-lg font-medium"
                >
                    {num}
                </motion.button>
            ))}
            {showDecimal && (
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleClick(onDecimal)}
                    className="flex items-center justify-center h-14 aspect-square rounded-full bg-background border-2 border-border shadow-sm hover:shadow-md hover:border-primary hover:bg-primary/5 active:scale-95 transition-all duration-150 text-lg font-medium"
                >
                    .
                </motion.button>
            )}
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleClick(() => onNumber(0))}
                className="flex items-center justify-center h-14 aspect-square rounded-full bg-background border-2 border-border shadow-sm hover:shadow-md hover:border-primary hover:bg-primary/5 active:scale-95 transition-all duration-150 text-lg font-medium"
            >
                0
            </motion.button>
            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handleClick(onBackspace)}
                className="flex items-center justify-center h-14 aspect-square rounded-full bg-background border-2 border-border shadow-sm hover:shadow-md hover:border-primary hover:bg-primary/5 active:scale-95 transition-all duration-150 text-lg font-medium"
                aria-label="Backspace"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9.75L14.25 12m0 0l2.25 2.25M14.25 12l2.25-2.25M14.25 12L12 14.25m-2.58 4.92l-6.375-6.375a1.125 1.125 0 010-1.59L9.42 4.83c.211-.211.498-.33.796-.33H19.5a2.25 2.25 0 012.25 2.25v10.5a2.25 2.25 0 01-2.25 2.25h-9.284c-.298 0-.585-.119-.796-.33z" />
                    </svg>
            </motion.button>
        </motion.div>
    )
}
