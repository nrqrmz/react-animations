import { motion, useReducedMotion } from 'motion/react'

type Props = {
  text: string
  className?: string
  delay?: number
  as?: 'h1' | 'h2' | 'h3' | 'span'
}

// Reveals a line letter by letter, each letter rising out of a mask.
export function SplitText({ text, className, delay = 0, as = 'span' }: Props) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  let n = 0
  return (
    <Tag className={className} aria-label={text}>
      {text.split(' ').map((word, wi) => (
        <span key={wi} aria-hidden className="mr-[0.22em] inline-block overflow-hidden pb-[0.08em] align-bottom">
          {word.split('').map((ch, ci) => (
            <motion.span
              key={ci}
              className="inline-block"
              initial={reduce ? { opacity: 0 } : { y: '115%', rotate: 6, opacity: 0 }}
              animate={{ y: 0, rotate: 0, opacity: 1 }}
              transition={{ duration: 0.85, delay: delay + n++ * 0.035, ease: [0.22, 1, 0.36, 1] }}
            >
              {ch}
            </motion.span>
          ))}
        </span>
      ))}
    </Tag>
  )
}
