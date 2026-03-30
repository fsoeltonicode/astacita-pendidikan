'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { 
  LayoutDashboard, 
  Send, 
  ShoppingCart, 
  History, 
  LogOut, 
  CheckCircle2,
  Menu, 
  X,
  User,
  Settings,
  Search,
  ExternalLink
} from 'lucide-react'
import { logout } from '@/app/actions/auth'
import toast from 'react-hot-toast'
import DashboardHeader from '@/components/dashboard/DashboardHeader'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)
  const pathname = usePathname()
  const router = useRouter()

  const handleLogout = async () => {
    const res = await logout()
    if (res.success) {
      toast.success('Berhasil keluar')
      router.push('/login')
    }
  }

  const menuItems = [
    { name: 'Lihat Situs', icon: ExternalLink, href: '/' },
    { name: 'Dasbor', icon: LayoutDashboard, href: '/dasbor' },
    { name: 'Order SP', icon: ShoppingCart, href: '/dasbor/order' },
    { name: 'Kirim SP', icon: Send, href: '/dasbor/kirim' },
    { name: 'Riwayat', icon: History, href: '/dasbor/riwayat' },
    { name: 'Pengaturan', icon: Settings, href: '/dasbor/pengaturan' },
  ]

  return (
    <div className="h-screen w-full bg-slate-50 flex overflow-hidden font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* Sidebar - Locked Height */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:translate-x-0 lg:static lg:h-full
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="h-full flex flex-col overflow-hidden">
          {/* Logo Section - Fixed h-16 */}
          <div className="h-16 shrink-0 px-6 border-b border-blue-700/10 flex items-center justify-between">
            <Link href="/" className="flex items-center">
              <Image 
                src="/logo.png" 
                alt="Logo" 
                width={150} 
                height={40} 
                className="h-8 w-auto object-contain"
              />
            </Link>
            <button className="lg:hidden text-slate-500" onClick={() => setIsSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Navigation Items - Scrollable if needed */}
          <nav className="flex-1 p-4 flex flex-col space-y-1 overflow-y-auto custom-scrollbar">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`
                    flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors
                    ${isActive 
                      ? 'bg-blue-700 text-white shadow-blue-200 shadow-lg' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-blue-700'
                    }
                  `}
                >
                  <item.icon size={18} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Bottom Section - Fixed */}
          <div className="p-4 border-t border-slate-100 shrink-0">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
            >
              <LogOut size={18} />
              <span>Keluar</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Container - Fixed h-screen & Scrollable Content Only */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        
        {/* Header - Fixed Height h-16 */}
        <header className="h-16 shrink-0 bg-white border-b border-blue-700/10 flex items-center justify-between px-4 lg:px-8 z-30">
          <div className="flex items-center flex-1">
            <button 
              className="lg:hidden text-slate-600 mr-4"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="hidden lg:block text-slate-800 font-bold text-lg font-[family-name:var(--font-oswald)] uppercase tracking-wide mr-8 whitespace-nowrap">
              {menuItems.find(i => i.href === pathname)?.name || 'Dasbor Sekretariat'}
            </h2>

            {/* Search */}
            <div className="hidden md:flex flex-1 max-w-md relative">
              <input
                type="text"
                placeholder="Cari fitur atau data..."
                className="w-full pl-4 pr-10 py-1.5 border border-slate-200 rounded-full text-xs focus:outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700 bg-slate-50"
              />
              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={14} />
              </div>
            </div>
          </div>

          {/* Komponen Header Dinamis */}
          <DashboardHeader />
        </header>

        {/* Scrollable Main Area */}
        <main className="flex-1 overflow-y-auto p-4 lg:p-8 bg-slate-50">
           <div className="max-w-screen-2xl mx-auto">
              {children}
           </div>
        </main>
      </div>
    </div>
  )
}
