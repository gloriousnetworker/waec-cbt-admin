'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

export default function Footer() {
  const footerColumns = [
    {
      title: 'Quick Links',
      items: [
        { name: 'Features', href: '#features' },
        { name: 'Subjects', href: '#subjects' },
        { name: 'Demo Login', href: '#demo' },
        { name: 'Dashboard', href: '/dashboard' }
      ]
    },
    {
      title: 'Resources',
      items: [
        { name: 'Past Questions', href: '#' },
        { name: 'Study Guide', href: '#' },
        { name: 'Exam Tips', href: '#' },
        { name: 'Tutorials', href: '#' }
      ]
    },
    {
      title: 'Support',
      items: [
        { name: 'Help Center', href: '#' },
        { name: 'Contact Us', href: '#' },
        { name: 'Report Issue', href: '#' },
        { name: 'FAQ', href: '#' }
      ]
    }
  ];

  const socialMedia = [
    { name: 'Twitter', icon: '🐦', href: '#' },
    { name: 'Facebook', icon: '📘', href: '#' },
    { name: 'Instagram', icon: '📷', href: '#' },
    { name: 'YouTube', icon: '▶️', href: '#' }
  ];

  return (
    <footer className="bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-16 pb-8">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10">
          <div className="lg:col-span-2">
            <div className="flex items-center mb-6">
              <motion.div
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
                className="w-12 h-12 bg-gradient-to-br from-blue-500 to-green-500 rounded-lg flex items-center justify-center mr-4"
              >
                <span className="text-white font-bold text-lg">WAEC</span>
              </motion.div>
              <div>
                <div className="font-bold text-xl">WAEC CBT Simulator</div>
                <div className="text-gray-400 text-sm">Excellence in Examination</div>
              </div>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              The ultimate platform for Nigerian students to practice WAEC examinations with real-time simulation, instant feedback, and comprehensive performance analysis.
            </p>
            <div className="flex space-x-4">
              {socialMedia.map((social) => (
                <motion.a
                  key={social.name}
                  href={social.href}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-full flex items-center justify-center text-lg transition"
                >
                  {social.icon}
                </motion.a>
              ))}
            </div>
          </div>

          {footerColumns.map((col, colIndex) => (
            <motion.div
              key={col.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: colIndex * 0.1 }}
              viewport={{ once: true }}
            >
              <h3 className="text-lg font-semibold mb-4 text-blue-400">{col.title}</h3>
              <ul className="space-y-3 text-gray-400">
                {col.items.map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="hover:text-white transition hover:pl-2 block">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-500 text-sm mb-4 md:mb-0">
            &copy; {new Date().getFullYear()} WAEC CBT Simulator. All rights reserved.
          </p>
          <div className="flex space-x-6 text-gray-500">
            <Link href="#" className="hover:text-white text-sm transition">
              Privacy Policy
            </Link>
            <Link href="#" className="hover:text-white text-sm transition">
              Terms of Service
            </Link>
            <Link href="#" className="hover:text-white text-sm transition">
              Cookie Policy
            </Link>
          </div>
        </div>

        <div className="mt-8 text-center text-gray-500 text-sm">
          <p>WAEC® is a registered trademark. This platform is for educational purposes only.</p>
        </div>
      </div>
    </footer>
  );
}