'use client'

import '../styles/globals.css'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from '../context/AuthContext'
import { useEffect, useState } from 'react'

const toastOptions = {
  style: {
    background: '#fff',
    color: '#1E1E1E',
    fontSize: '14px',
    padding: '14px 20px',
    borderRadius: '8px',
    fontWeight: '500',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    border: '1px solid #E8E8E8',
    maxWidth: '400px',
    fontFamily: '"Playfair Display", serif',
  },
  success: {
    style: {
      background: '#E8F8F6',
      color: '#2563EB',
      borderLeft: '4px solid #2563EB',
      border: '1px solid #C7EDE9',
    },
    iconTheme: {
      primary: '#2563EB',
      secondary: '#E8F8F6',
    },
  },
  error: {
    style: {
      background: '#FEF2F2',
      color: '#DC2626',
      borderLeft: '4px solid #DC2626',
      border: '1px solid #FEE2E2',
    },
    iconTheme: {
      primary: '#DC2626',
      secondary: '#FEF2F2',
    },
  },
  loading: {
    style: {
      background: '#F9FAFB',
      color: '#626060',
      borderLeft: '4px solid #9CA3AF',
      border: '1px solid #E5E7EB',
    },
  },
  duration: 3000,
}

export default function RootLayout({ children }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null)

  useEffect(() => {
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
    })

    window.addEventListener('appinstalled', () => {
      setDeferredPrompt(null)
    })

    const handleOffline = () => {
      console.log('App is offline')
    }
    
    const handleOnline = () => {
      console.log('App is online')
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#2563EB" />
        <meta name="description" content="School Admin Dashboard - Manage Students, Exams and Results" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="School Admin" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="School Admin" />
        <meta name="msapplication-TileColor" content="#2563EB" />
        <meta name="msapplication-tap-highlight" content="no" />
        <title>School Admin Dashboard</title>
        <script src="/sw-register.js" defer></script>
      </head>
      <body className="bg-white min-h-screen font-playfair antialiased">
        <AuthProvider>
          <Toaster 
            position="top-center" 
            toastOptions={toastOptions}
            containerStyle={{
              top: 20,
            }}
          />
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}