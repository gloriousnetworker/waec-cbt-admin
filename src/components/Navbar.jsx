'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const router = useRouter();

  const navItems = [
    { name: 'Features', href: '#features' },
    { name: 'Subjects', href: '#subjects' },
    { name: 'Demo', href: '#demo' },
    { name: 'Dashboard', href: '/dashboard' }
  ];

  return (
    <nav className="fixed w-full z-50 bg-white/80 backdrop-blur-md py-4 shadow-sm border-b border-gray-200/50">
      <div className="container mx-auto px-6">
        <div className="flex justify-between items-center">
          <Link href="/" className="flex items-center">
            <motion.div
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.5 }}
              className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center mr-3"
            >
              <span className="text-white font-bold">WAEC</span>
            </motion.div>
            <div>
              <div className="font-bold text-lg text-gray-800">CBT Simulator</div>
              <div className="text-xs text-gray-600">Excellence in Examination</div>
            </div>
          </Link>

          <div className="hidden md:flex items-center space-x-8">
            {navItems.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-gray-700 hover:text-blue-600 transition font-medium"
              >
                {item.name}
              </Link>
            ))}
            <button
              onClick={() => router.push('/login')}
              className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold px-6 py-2.5 rounded-lg hover:from-blue-600 hover:to-green-600 transition transform hover:-translate-y-0.5 shadow-lg"
            >
              Start Practicing
            </button>
          </div>

          <button
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden text-gray-700 hover:text-blue-600 focus:outline-none"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        <motion.div
          initial={false}
          animate={{ height: isOpen ? 'auto' : 0, opacity: isOpen ? 1 : 0 }}
          className={`md:hidden overflow-hidden`}
        >
          <div className="pt-6 pb-8 space-y-4">
            {navItems.map((item) => (
              <div key={item.name} className="border-b border-gray-200/50">
                <Link 
                  href={item.href}
                  className="block py-4 text-gray-700 hover:text-blue-600 font-medium"
                  onClick={() => setIsOpen(false)}
                >
                  {item.name}
                </Link>
              </div>
            ))}
            <button
              onClick={() => {
                router.push('/login');
                setIsOpen(false);
              }}
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold px-6 py-3.5 rounded-lg hover:from-blue-600 hover:to-green-600 transition shadow-lg"
            >
              Start Practicing
            </button>
          </div>
        </motion.div>
      </div>
    </nav>
  );
}