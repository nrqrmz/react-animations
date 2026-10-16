import { motion, useReducedMotion, type HTMLMotionProps } from 'motion/react'

type Props = HTMLMotionProps<'div'> & {
  delay?: number
  from?: 'up' | 'down' | 'left' | 'right' | 'scale'
}

const offsets = {
  up: { y: 40 },
  down: { y: -40 },
  left: { x: 50 },
  right: { x: -50 },
  scale: { scale: 0.8 },
}

// Fades and slides its children in when they scroll into view.
export function Reveal({ delay = 0, from = 'up', children, ...rest }: Props) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      initial={{ opacity: 0, ...(reduce ? {} : offsets[from]) }}
      whileInView={{ opacity: 1, x: 0, y: 0, scale: 1 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] }}
      {...rest}
    >
      {children}
    </motion.div>
  )
}

// Parent/child variants for staggered lists (children use `staggerItem`).
export const staggerParent = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12 } },
}
export const staggerItem = {
  hidden: { opacity: 0, y: 40, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as const } },
}
