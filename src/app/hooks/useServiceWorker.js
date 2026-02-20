'use client'

import { useEffect, useState } from 'react'

export function useServiceWorker() {
  const [swStatus, setSwStatus] = useState('loading')
  const [updateAvailable, setUpdateAvailable] = useState(false)

  useEffect(() => {
    if (typeof window === 'undefined') return

    // Don't even try in development with Turbopack
    if (process.env.NODE_ENV === 'development') {
      console.log('⚠️ Service Worker disabled in development mode')
      setSwStatus('development')
      return
    }

    if (!('serviceWorker' in navigator)) {
      console.log('❌ Service Worker not supported')
      setSwStatus('unsupported')
      return
    }

    let retryCount = 0
    const maxRetries = 3

    const registerSW = async () => {
      try {
        console.log('📝 Attempting to register Service Worker...')
        
        // Check if SW is already registered
        const existingRegistrations = await navigator.serviceWorker.getRegistrations()
        
        if (existingRegistrations.length > 0) {
          console.log('✅ Service Worker already registered')
          setSwStatus('registered')
          
          // Check for updates
          const registration = existingRegistrations[0]
          if (registration.waiting) {
            setUpdateAvailable(true)
          }
          return
        }

        // Register new SW
        const registration = await navigator.serviceWorker.register('/sw.js')
        
        console.log('✅ Service Worker registered successfully:', registration)
        setSwStatus('registered')

        // Check for updates
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setUpdateAvailable(true)
              }
            })
          }
        })

        if (registration.waiting) {
          setUpdateAvailable(true)
        }

      } catch (error) {
        console.error('❌ Service Worker registration failed:', error)
        
        if (retryCount < maxRetries) {
          retryCount++
          console.log(`Retrying registration (${retryCount}/${maxRetries})...`)
          setTimeout(registerSW, 3000 * retryCount)
        } else {
          setSwStatus('failed')
        }
      }
    }

    // Wait for page to be fully loaded
    if (document.readyState === 'complete') {
      setTimeout(registerSW, 2000)
    } else {
      window.addEventListener('load', () => {
        setTimeout(registerSW, 2000)
      })
    }

    return () => {
      window.removeEventListener('load', registerSW)
    }
  }, [])

  const skipWaiting = () => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then(registration => {
        if (registration.waiting) {
          registration.waiting.postMessage({ type: 'SKIP_WAITING' })
          setUpdateAvailable(false)
          window.location.reload()
        }
      })
    }
  }

  return { swStatus, updateAvailable, skipWaiting }
}