import * as React from "react"
import { cn } from "../../lib/utils"
import { motion, type HTMLMotionProps } from "framer-motion"
import { slideUpFade } from "../../animations/variants"

const Card = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-sm", className)}
      {...props}
    />
  )
)
Card.displayName = "Card"

const AnimatedCard = React.forwardRef<HTMLDivElement, HTMLMotionProps<"div">>(
  ({ className, ...props }, ref) => (
    <motion.div
      ref={ref}
      variants={slideUpFade}
      className={cn("rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-foreground)] shadow-sm", className)}
      {...props}
    />
  )
)
AnimatedCard.displayName = "AnimatedCard"


const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("flex flex-col space-y-1.5 p-6", className)} {...props} />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3 ref={ref} className={cn("font-semibold leading-none tracking-tight", className)} {...props} />
  )
)
CardTitle.displayName = "CardTitle"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
  )
)
CardContent.displayName = "CardContent"

export { Card, AnimatedCard, CardHeader, CardTitle, CardContent }


