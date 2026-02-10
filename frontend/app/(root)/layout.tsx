'use client';

import Header, { SidebarContext } from '@/components/Header'
import Sidebar from '@/components/Sidebar'
import React, { useState } from 'react'

export const Layout = ({children}:{children:React.ReactNode}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <SidebarContext.Provider value={{ isOpen: sidebarOpen, setIsOpen: setSidebarOpen }}>
      <div className='min-h-screen text-gray-400 bg-linear-to-b from-slate-950 to-slate-900 flex'>
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className='flex-1 flex flex-col'>
          <Header />
          <main className='flex-1 p-4 overflow-y-auto'>
            {children}
          </main>
          <footer className='border-t border-gray-700/50 bg-gray-800/30 backdrop-blur-sm py-6 px-4 mt-auto'>
            <div className='max-w-7xl mx-auto'>
              <div className='grid grid-cols-1 md:grid-cols-4 gap-8 mb-6'>
                {/* About */}
                <div>
                  <h3 className='font-semibold text-gray-100 mb-3'>StockNex</h3>
                  <p className='text-sm text-gray-400'>
                    Real-time stock market insights and Predictions.</p>
                </div>

                {/* Quick Links */}
                <div>
                  <h3 className='font-semibold text-gray-100 mb-3'>Quick Links</h3>
                  <ul className='space-y-2 text-sm'>
                    <li><a href='/watchlist' className='text-gray-400 hover:text-cyan-400 transition-colors'>Watchlist</a></li>
                    <li><a href='/search' className='text-gray-400 hover:text-cyan-400 transition-colors'>Search</a></li>
                    <li><a href='/' className='text-gray-400 hover:text-cyan-400 transition-colors'>Dashboard</a></li>
                  </ul>
                </div>

                {/* Resources */}
                <div>
                  <h3 className='font-semibold text-gray-100 mb-3'>Resources</h3>
                  <ul className='space-y-2 text-sm'>
                    <li><a href='#' className='text-gray-400 hover:text-cyan-400 transition-colors'>Documentation</a></li>
                    <li><a href='#' className='text-gray-400 hover:text-cyan-400 transition-colors'>API Reference</a></li>
                    <li><a href='#' className='text-gray-400 hover:text-cyan-400 transition-colors'>Support</a></li>
                  </ul>
                </div>

                {/* Legal */}
                <div>
                  <h3 className='font-semibold text-gray-100 mb-3'>Legal</h3>
                  <ul className='space-y-2 text-sm'>
                    <li><a href='#' className='text-gray-400 hover:text-cyan-400 transition-colors'>Privacy Policy</a></li>
                    <li><a href='#' className='text-gray-400 hover:text-cyan-400 transition-colors'>Terms of Service</a></li>
                    <li><a href='#' className='text-gray-400 hover:text-cyan-400 transition-colors'>Contact</a></li>
                  </ul>
                </div>
              </div>

              {/* Divider */}
              <div className='border-t border-gray-700/50 pt-6'>
                <div className='flex flex-col md:flex-row justify-between items-center gap-4'>
                  <p className='text-sm text-gray-500'>
                    © 2025 StockNex. All rights reserved.
                  </p>
                  <div className='flex gap-6 text-sm text-gray-500'>
                    <span className='bg-blend-color-burn'>StockNex</span>
                    <span>v1.0.0</span>
                  </div>
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>
    </SidebarContext.Provider>
  )
}

export default Layout
