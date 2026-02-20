'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ChunkErrorBoundary({ children }) {
  const router = useRouter()

  useEffect(() => {
    const handleChunkError = (event) => {
      if (event.message && event.message.includes('loading chunk')) {
        router.push('/offline')
      }
    }

    window.addEventListener('error', handleChunkError)

    return () => {
      window.removeEventListener('error', handleChunkError)
    }
  }, [router])

  return children
}