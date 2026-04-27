import { useEffect, useRef, useState } from 'react'

interface CountUpOptions {
  durationMs?: number
}

interface CountUpState {
  value: number
  direction: 'up' | 'down' | 'idle'
  animating: boolean
}

function easeOutCubic(value: number): number {
  return 1 - Math.pow(1 - value, 3)
}

function shouldReduceMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function useCountUp(value: number, options: CountUpOptions = {}): CountUpState {
  const { durationMs = 950 } = options
  const [state, setState] = useState<CountUpState>({
    value: 0,
    direction: 'idle',
    animating: false,
  })
  const previousValue = useRef(0)

  useEffect(() => {
    const startValue = previousValue.current
    const delta = value - startValue
    const direction = delta > 0 ? 'up' : delta < 0 ? 'down' : 'idle'

    if (delta === 0) return undefined

    if (shouldReduceMotion()) {
      const frame = requestAnimationFrame(() => {
        previousValue.current = value
        setState({ value, direction: 'idle', animating: false })
      })

      return () => cancelAnimationFrame(frame)
    }

    const startedAt = performance.now()
    let frame = 0

    function animate(now: number) {
      const progress = Math.min((now - startedAt) / durationMs, 1)
      const nextValue = startValue + delta * easeOutCubic(progress)

      setState({
        value: Math.round(nextValue),
        direction,
        animating: progress < 1,
      })

      if (progress < 1) {
        frame = requestAnimationFrame(animate)
      } else {
        previousValue.current = value
        setState({
          value,
          direction: 'idle',
          animating: false,
        })
      }
    }

    frame = requestAnimationFrame(animate)

    return () => cancelAnimationFrame(frame)
  }, [durationMs, value])

  return state
}
