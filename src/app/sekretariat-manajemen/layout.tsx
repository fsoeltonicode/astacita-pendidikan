'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { 
  Target, 
  LogOut, 
  BarChart4, 
  FileText,
  Settings
} from 'lucide-react'
import { logout } from '@/app/actions/auth'
import toast from 'react-hot-toast'

export default function ManajemenLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const router = useRouter()

  // Sembunyikan Layout sidebar jika di halaman login
  if (pathname.includes('/login')) {
    return <>{children}</>
  }

  const handleLogout = async () => {
    const res = await logout()
    if (res.success) {
      toast.success('Sesi manajemen diakhiri.')
      router.push('/sekretariat-manajemen/login')
    }
  }

  const menuItems = [
    { name: 'Ringkasan Laporan', icon: BarChart4, href: '/sekretariat-manajemen' },
    { name: 'Master Data Berita', icon: FileText, href: '/admin' },
    { name: 'Pengaturan', icon: Settings, href: '#' },
  ]

  return (
    <div className="min-h-screen w-full bg-slate-900 flex font-sans text-slate-200">
      
      {/* Sidebar - Cukup sederhana untuk desktop only (sekretariat/manajemen tdk perlu mobile complex) */}
      <aside className="w-72 bg-slate-950 border-r border-slate-800 flex flex-col shrink-0 text-slate-300 relative z-20">
         <div className="h-20 shrink-0 px-8 border-b border-slate-800 flex items-center space-x-3 bg-slate-900/50">
            <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-blue-900/50">
               <Target size={20} className="text-white" />
            </div>
            <div>
               <h2 className="text-white font-[family-name:var(--font-oswald)] uppercase font-bold tracking-wide">Direksi</h2>
               <p className="text-[10px] text-blue-400 font-bold uppercase tracking-widest">Astacita Pendidikan</p>
            </div>
         </div>

         <nav className="flex-1 p-6 flex flex-col space-y-2 overflow-y-auto">
            <p className="text-xs font-bold text-slate-600 uppercase tracking-widest mb-3 pl-2">Menu Utama</p>
            {menuItems.map((item) => {
               const isActive = pathname === item.href
               return (
                 <Link
                   key={item.name}
                   href={item.href}
                   className={`
                     flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all
                     ${isActive 
                       ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' 
                       : 'hover:bg-slate-800 hover:text-white text-slate-400'
                     }
                   `}
                 >
                   <item.icon size={18} />
                   <span>{item.name}</span>
                 </Link>
               )
            })}
         </nav>

         <div className="p-6 border-t border-slate-800 shrink-0">
            <button 
              onClick={handleLogout}
              className="w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-colors border border-red-900/30"
            >
              <LogOut size={18} />
              <span>Log Out Sesi</span>
            </button>
         </div>
      </aside>

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
         {/* Top Header */}
         <header className="h-20 shrink-0 border-b border-slate-800 flex items-center justify-between px-10 relative z-10 bg-slate-900/80 backdrop-blur-sm">
            <h1 className="text-white font-bold text-lg tracking-wide uppercase">
               Dasbor Keuangan & Operasional
            </h1>
            <div className="flex items-center space-x-4">
               <div className="text-right">
                  <p className="text-sm font-bold text-white">Administrator Tingkat Tinggi</p>
                  <p className="text-[10px] text-emerald-400 tracking-wider">SECURE CONNECTION</p>
               </div>
               <div className="w-10 h-10 rounded-full border-2 border-emerald-500/30 flex items-center justify-center bg-slate-800 text-emerald-400 font-bold">
                  M
               </div>
            </div>
         </header>

         {/* Content */}
         <main className="flex-1 overflow-y-auto p-10">
            <div className="max-w-7xl mx-auto">
               {children}
            </div>
         </main>
      </div>
      
    </div>
  )
}
