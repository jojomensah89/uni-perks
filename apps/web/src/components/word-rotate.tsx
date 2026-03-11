"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion, type MotionProps } from "motion/react"

import { cn } from "@/lib/utils"

interface WordRotateProps {
    words: string[]
    duration?: number
    motionProps?: MotionProps
    className?: string
}

export function WordRotate({
    words,
    duration = 2500,
    motionProps = {
        initial: { opacity: 0, y: -50 },
        animate: { opacity: 1, y: 0 },
        exit: { opacity: 0, y: 50 },
        transition: { duration: 0.25, ease: "easeOut" },
    },
    className,
}: WordRotateProps) {
    const [index, setIndex] = useState(0)

    useEffect(() => {
        const interval = setInterval(() => {
            setIndex((prevIndex) => (prevIndex + 1) % words.length)
        }, duration)

        // Clean up interval on unmount
        return () => clearInterval(interval)
    }, [words, duration])

    return (
        <span className="inline-grid overflow-hidden text-center">
            <span className={cn(className, "col-start-1 row-start-1 opacity-0 pointer-events-none")}>
                {words.reduce((a, b) => (a.length > b.length ? a : b), "")}
            </span>
            <AnimatePresence mode="wait">
                <motion.span
                    key={words[index]}
                    className={cn(className, "col-start-1 row-start-1")}
                    {...motionProps}
                >
                    {words[index]}
                </motion.span>
            </AnimatePresence>
        </span>
    )
}
