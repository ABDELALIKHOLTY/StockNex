'use client';

import React, { useContext, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import UserDropdown from './UserDropdown'
import { SidebarContext } from './Header'
import AuthModal from './AuthModal'
import { 
  LayoutDashboard, 
  Search, 
  Heart, 
  TrendingUp, 
  Settings,
  X,
  Menu,
  LogOut,
  AlertTriangle
} from 'lucide-react'

const menuItems = [
  { id: 'dashboard', href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'search', href: '/search', label: 'Search', icon: Search },
  { id: 'watchlist', href: '/watchlist', label: 'Watchlist', icon: Heart },
  { id: 'prediction', href: '/prediction', label: 'Prediction', icon: TrendingUp },
  { id: 'settings', href: '/settings', label: 'Settings', icon: Settings },
]

const Sidebar = () => {
  const pathname = usePathname()
  const router = useRouter()
  const [showAuthModal, setShowAuthModal] = useState(false)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const sidebarContext = useContext(SidebarContext)

  React.useEffect(() => {
    setIsLoggedIn(!!localStorage.getItem('token'))
  }, [])

  const isOpen = sidebarContext?.isOpen ?? false
  const setIsOpen = sidebarContext?.setIsOpen

  const toggleSidebar = () => {
    if (setIsOpen) {
      setIsOpen(!isOpen)
    }
  }

  const closeSidebar = () => {
    if (setIsOpen) {
      setIsOpen(false)
    }
  }

  const isActive = (href: string) => {
    if (href === '/') {
      return pathname === '/'
    }
    return pathname?.startsWith(href)
  }

  const handleNavClick = () => {
    closeSidebar()
  }

  const handleSettingsClick = (e: React.MouseEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    
    if (!token) {
      setShowAuthModal(true)
      return
    }
    
    closeSidebar()
    router.push('/settings')
  }

  const handleLogout = () => {
    setShowLogoutConfirm(true)
  }

  const confirmLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    closeSidebar()
    setShowLogoutConfirm(false)
    router.push('/sign-in')
  }

  const cancelLogout = () => {
    setShowLogoutConfirm(false)
  }

  return (
    <>
      {/* Mobile Overlay - Only visible when sidebar is open */}
      {isOpen && (
        <div
          className='fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden'
          onClick={closeSidebar}
          aria-label="Close sidebar overlay"
        />
      )}

      {/* Mini Sidebar (Icons only when closed) */}
      {!isOpen && (
        <aside className='fixed top-0 left-0 w-16 bg-gray-800/30 backdrop-blur-sm border-r border-gray-700/50 flex flex-col z-40 md:sticky md:top-0 md:h-screen'>
          {/* Open Menu Button */}
          <div className='p-3 border-b border-gray-700/50 flex items-center justify-center'>
            <button
              onClick={toggleSidebar}
              className='p-3 text-gray-400 hover:text-cyan-400 transition-colors'
              aria-label="Open sidebar"
              type="button"
            >
              <Menu size={28} />
            </button>
          </div>

          {/* Mini Navigation Menu */}
          <nav className='flex-1 overflow-hidden px-2 py-6'>
            <ul className='space-y-4'>
              {menuItems.map(({ id, href, label, icon: Icon }) => (
                <li key={id}>
                  {id === 'settings' ? (
                    <button
                      onClick={handleSettingsClick}
                      className={`w-full flex items-center justify-center p-3 rounded-lg transition-all group relative ${
                        isActive(href)
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                          : 'text-gray-400 hover:text-cyan-400 hover:bg-gray-800/30'
                      }`}
                      title={label}
                    >
                      <Icon size={24} />
                      {/* Tooltip */}
                      <span className='absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50'>
                        {label}
                      </span>
                    </button>
                  ) : (
                    <Link
                      href={href}
                      className={`flex items-center justify-center p-3 rounded-lg transition-all group relative ${
                        isActive(href)
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                          : 'text-gray-400 hover:text-cyan-400 hover:bg-gray-800/30'
                      }`}
                      title={label}
                    >
                      <Icon size={24} />
                      {/* Tooltip */}
                      <span className='absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50'>
                        {label}
                      </span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout Button */}
          {isLoggedIn && (
            <div className='p-3 border-t border-gray-700/50 flex items-center justify-center'>
              <button
                onClick={handleLogout}
                className='p-3 text-gray-400 hover:text-red-400 transition-colors'
                title="Exit"
                type="button"
              >
                <LogOut size={24} />
              </button>
            </div>
          )}
        </aside>
      )}

      {/* Full Sidebar (when open) */}
      {isOpen && (
        <aside 
          className='fixed top-0 left-0 w-64 bg-gray-800/30 backdrop-blur-sm border-r border-gray-700/50 flex flex-col z-40 md:sticky md:top-0 md:h-screen'
        >
          {/* User Avatar Section */}
          <div className='p-6  border-gray-700/50 flex items-center justify-between'>
            <div className='flex-1'>
              <UserDropdown />
            </div>
            
            {/* Close Button */}
            <button
              onClick={closeSidebar}
              className='p-2 text-gray-400 hover:text-cyan-400 transition-colors ml-2'
              aria-label="Close sidebar"
              type="button"
            >
              <X size={24} />
            </button>
          </div>

          {/* Navigation Menu */}
          <nav className='flex-1 overflow-y-auto px-4 py-6'>
            <ul className='space-y-2'>
              {menuItems.map(({ id, href, label, icon: Icon }) => (
                <li key={id}>
                  {id === 'settings' ? (
                    <button
                      onClick={handleSettingsClick}
                      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive(href)
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                          : 'text-gray-400 hover:text-cyan-400 hover:bg-gray-800/30'
                      }`}
                    >
                      <Icon size={24} />
                      <span className='font-medium'>{label}</span>
                    </button>
                  ) : (
                    <Link
                      href={href}
                      onClick={handleNavClick}
                      className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                        isActive(href)
                          ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/50'
                          : 'text-gray-400 hover:text-cyan-400 hover:bg-gray-800/30'
                      }`}
                    >
                      <Icon size={24} />
                      <span className='font-medium'>{label}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </nav>

          {/* Logout Button */}
          {isLoggedIn && (
            <div className='px-4 py-4 border-t border-gray-700/50'>
              <button
                onClick={handleLogout}
                className='w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all text-gray-400 hover:text-red-400 hover:bg-red-500/10'
              >
                <LogOut size={24} />
                <span className='font-medium'>Exit</span>
              </button>
            </div>
          )}
        </aside>
      )}

      {/* Auth Modal */}
      <AuthModal isOpen={showAuthModal} onClose={() => setShowAuthModal(false)} />

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50'>
          <div className='bg-gray-900 border border-gray-700/50 rounded-lg p-8 max-w-sm mx-4 shadow-2xl'>
            {/* Close Button */}
            <button
              onClick={cancelLogout}
              className='absolute top-4 right-4 text-gray-400 hover:text-white transition-colors'
              type="button"
            >
              <X size={24} />
            </button>

            {/* Icon */}
            <div className='flex justify-center mb-4'>
              <div className='bg-red-500/20 rounded-full p-4 border border-red-500/30'>
                <AlertTriangle size={48} className='text-red-400' />
              </div>
            </div>

            {/* Title */}
            <h2 className='text-2xl font-bold text-white text-center mb-2'>
              Exit Confirmed
            </h2>

            {/* Message */}
            <p className='text-gray-400 text-center mb-8'>
              Are you sure you want to exit? You will be logged out of your account.
            </p>

            {/* Buttons */}
            <div className='grid grid-cols-2 gap-3'>
              <button
                onClick={cancelLogout}
                className='px-4 py-3 rounded-lg border border-gray-600 text-gray-300 font-medium hover:bg-gray-800/50 transition-all'
                type="button"
              >
                Cancel
              </button>
              <button
                onClick={confirmLogout}
                className='px-4 py-3 rounded-lg bg-red-500 text-white font-medium hover:bg-red-600 transition-all'
                type="button"
              >
                Exit
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Sidebar