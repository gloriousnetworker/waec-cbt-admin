'use client'

import '../styles/globals.css'
import { Inter, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import toast from 'react-hot-toast'
import { AuthProvider } from '../context/AuthContext'
import { useEffect } from 'react'
import PWAInstallPrompt from '../components/PWAInstallPrompt'

// [COMPAT-1] Self-hosted fonts — downloaded at build time, served from same origin
const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-inter',
  display: 'swap',
})
const playfair = Playfair_Display({
  subsets: ['latin'],
  weight: ['600', '700', '800'],
  variable: '--font-playfair',
  display: 'swap',
})
const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['500', '700'],
  variable: '--font-mono',
  display: 'swap',
})

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
    fontFamily: '"Inter", sans-serif',
  },
  success: {
    style: {
      background: '#EDF0F7',
      color: '#1F2A49',
      borderLeft: '4px solid #1F2A49',
      border: '1px solid #C5CBDB',
    },
    iconTheme: {
      primary: '#1F2A49',
      secondary: '#EDF0F7',
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
  useEffect(() => {
    const handleOffline = () => {
      toast.error('You are offline — some features may be unavailable.', { id: 'offline-toast', duration: Infinity })
    }

    const handleOnline = () => {
      toast.dismiss('offline-toast')
      toast.success('Back online!', { duration: 2000 })
    }

    window.addEventListener('offline', handleOffline)
    window.addEventListener('online', handleOnline)

    return () => {
      window.removeEventListener('offline', handleOffline)
      window.removeEventListener('online', handleOnline)
    }
  }, [])

  return (
    <html lang="en" className={`${inter.variable} ${playfair.variable} ${jetbrainsMono.variable}`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover" />
        <meta name="theme-color" content="#1F2A49" />
        <meta name="description" content="Einstein's CBT Admin Portal — Manage your school's students, exams and results" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icons/icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/icon-152x152.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/icon-180x180.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/icon-180x180.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="Einstein's CBT Admin" />
        {/* iOS Splash Screens — prevents white flash on PWA launch */}
        <link rel="apple-touch-startup-image" media="screen and (device-width: 430px) and (device-height: 932px) and (-webkit-device-pixel-ratio: 3)" href="/icons/icon-512x512.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)" href="/icons/icon-512x512.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 390px) and (device-height: 844px) and (-webkit-device-pixel-ratio: 3)" href="/icons/icon-512x512.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)" href="/icons/icon-512x512.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 414px) and (device-height: 896px) and (-webkit-device-pixel-ratio: 2)" href="/icons/icon-512x512.png" />
        <link rel="apple-touch-startup-image" media="screen and (device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)" href="/icons/icon-512x512.png" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="Einstein's CBT Admin" />
        <meta name="msapplication-TileColor" content="#1F2A49" />
        <meta name="msapplication-tap-highlight" content="no" />
        <title>Einstein's CBT Admin — Mega Tech Solutions</title>
        <script src="/sw-register.js" defer></script>
      </head>
      <body className="bg-surface-muted min-h-screen antialiased">
        {/* Subtle brand watermark — decorative, non-interactive */}
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none select-none z-0" aria-hidden="true">
          <img src="/logo.png" alt="" className="w-[min(50vw,420px)] opacity-[0.04]" />
        </div>
        <AuthProvider>
          <Toaster 
            position="top-center" 
            toastOptions={toastOptions}
            containerStyle={{
              top: 20,
            }}
          />
          {children}
          <PWAInstallPrompt />
        </AuthProvider>
      </body>
    </html>
  )
}