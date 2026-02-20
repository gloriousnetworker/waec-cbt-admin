'use client'

import { useEffect, useState } from 'react'

export default function OfflineDetector() {
  const [isOffline, setIsOffline] = useState(false)

  useEffect(() => {
    const handleOffline = () => setIsOffline(true)
    const handleOnline = () => setIsOffline(false)

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)
    setIsOffline(!navigator.onLine)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  if (!isOffline) return null

  return (
    <div className="fixed top-0 left-0 right-0 bg-yellow-50 border-b border-yellow-200 px-4 py-2 z-50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <p className="text-sm text-yellow-800">
          📴 You're offline. Using cached content.
        </p>
      </div>
    </div>
  )
}