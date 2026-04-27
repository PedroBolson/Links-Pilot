import { cn } from '@/lib/utils'
import { useCountUp } from '@/hooks/useCountUp'

interface AnimatedNumberProps {
  value: number
  className?: string
  durationMs?: number
}

export function AnimatedNumber({ value, className, durationMs }: AnimatedNumberProps) {
  const count = useCountUp(value, { durationMs })
  const increasing = count.direction === 'up' && count.animating

  return (
    <span
      className={cn(
        'inline-flex min-w-[1ch] tabular-nums transition-all duration-300 ease-out',
        increasing && 'translate-y-[-1px] scale-110 text-primary drop-shadow-[0_0_10px_color-mix(in_oklab,var(--primary)_40%,transparent)]',
        count.direction === 'down' && count.animating && 'scale-95 text-destructive',
        className,
      )}
    >
      {count.value}
    </span>
  )
}
