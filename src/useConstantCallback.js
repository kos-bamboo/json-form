import { useCallback, useRef } from 'react'

export default function useConstantCallback(callback) {
  const ref = useRef()

  ref.current = callback

  return useCallback(
    (...args) => {
      return ref.current(...args)
    },
    [ref],
  )
}
