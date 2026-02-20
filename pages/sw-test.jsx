'use client'

import { useEffect, useState } from 'react'

export default function SWTest() {
  const [status, setStatus] = useState('Checking...')

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(regs => {
        if (regs.length > 0) {
          setStatus('✅ Service Worker is registered')
        } else {
          setStatus('❌ Service Worker is NOT registered')
        }
      })
    } else {
      setStatus('❌ Service Worker not supported')
    }
  }, [])

  return (
    <div style={{ padding: '20px' }}>
      <h1>Service Worker Test</h1>
      <p>{status}</p>
      <button onClick={() => window.location.reload()}>Refresh</button>
    </div>
  )
}