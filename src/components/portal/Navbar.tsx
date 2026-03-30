'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter, usePathname } from 'next/navigation'
import { Search, Menu, X, User, LogOut, LayoutDashboard, ChevronRight } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { logout } from '@/app/actions/auth'

export default function Navbar() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [user, setUser] = useState<{id: string} | null>(null)
  const [isScrolled, setIsScrolled] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    checkUser()
  }, [supabase.auth])

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 10)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const handleLogout = async () => {
    await logout()
    setUser(null)
    router.refresh()
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      window.location.href = `/pencarian?q=${encodeURIComponent(searchQuery)}`
    }
  }

  const navLinks = [
    { name: 'Beranda', href: '/' },
    { name: 'PAUD', href: '/kategori/paud' },
    { name: 'DIKDAS', href: '/kategori/dikdas' },
    { name: 'DIKMEN', href: '/kategori/dikmen' },
    { name: 'Opini', href: '/kategori/opini' },
    { name: 'Prestasi', href: '/kategori/prestasi' },
    { name: 'Kegiatan', href: '/kategori/kegiatan' },
    { name: 'Pengumuman', href: '/kategori/pengumuman' },
  ]

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled ? 'shadow-lg shadow-slate-900/5' : ''}`}>
      {/* Top strip */}
      <div className="bg-slate-900 text-slate-400 text-xs py-1.5 hidden md:block">
        <div className="container mx-auto px-4 lg:px-8 flex justify-between items-center">
          <span>📧 admin@astacita-pendidikan.web.id</span>
          <span>Pusat Informasi & Depo Siaran Pers Satuan Pendidikan</span>
        </div>
      </div>
      
      {/* Main Navbar */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-200/80">
        <div className="container mx-auto px-4 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2 shrink-0">
            <Image 
              src="/logo.png" 
              alt="Astacita Pendidikan" 
              width={180} 
              height={45} 
              className="h-9 w-auto object-contain"
              priority
            />
          </Link>

          {/* Search Desktop */}
          <form onSubmit={handleSearch} className="hidden md:flex flex-1 max-w-sm mx-6 relative">
            <input
              type="text"
              placeholder="Cari judul berita atau NPSN..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10 focus:bg-white transition-all placeholder:text-slate-400"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-blue-600 transition">
              <Search size={16} />
            </button>
          </form>

          {/* Actions Desktop */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <>
                <Link 
                  href="/dasbor" 
                  className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-1.5 transition-colors shadow-sm"
                >
                  <LayoutDashboard size={14} />
                  <span>Dasbor Saya</span>
                </Link>
                <button 
                  onClick={handleLogout}
                  className="text-xs font-medium text-slate-500 hover:text-red-600 p-2 rounded-lg hover:bg-red-50 transition-all"
                  title="Keluar"
                >
                  <LogOut size={16} />
                </button>
              </>
            ) : (
              <>
                <Link href="/daftar" className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition px-3 py-2">
                  Daftar
                </Link>
                <Link 
                  href="/login" 
                  className="text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center space-x-1.5 transition-colors shadow-sm"
                >
                  <User size={14} />
                  <span>Masuk</span>
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <button 
            className="md:hidden text-slate-700 p-1.5 rounded-lg hover:bg-slate-100 transition"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Category Navigation (Desktop) */}
      <nav className="hidden md:block bg-slate-800 text-white">
        <div className="container mx-auto px-4 lg:px-8">
          <ul className="flex items-center space-x-1 overflow-x-auto text-[11px] font-semibold py-2">
            {navLinks.map((link) => {
              const isActive = pathname === link.href
              return (
                <li key={link.name}>
                  <Link 
                    href={link.href} 
                    className={`px-3.5 py-1.5 rounded-md transition-all whitespace-nowrap uppercase tracking-widest ${
                      isActive 
                        ? 'bg-blue-600 text-white' 
                        : 'hover:bg-white/10 text-slate-300 hover:text-white'
                    }`}
                  >
                    {link.name}
                  </Link>
                </li>
              )
            })}
          </ul>
        </div>
      </nav>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-md border-t border-slate-100 absolute w-full left-0 shadow-xl z-50 animate-in slide-in-from-top-2 duration-200">
          <form onSubmit={handleSearch} className="p-4 border-b border-slate-100">
            <div className="relative">
              <input
                type="text"
                placeholder="Cari berita..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-4 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-sm"
              />
              <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search size={16} />
              </button>
            </div>
          </form>
          <ul className="flex flex-col py-2 px-2">
            {navLinks.map((link) => (
              <li key={link.name}>
                <Link 
                  href={link.href} 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-2.5 text-slate-700 text-sm font-medium hover:bg-blue-50 hover:text-blue-700 rounded-lg transition"
                >
                  <span>{link.name}</span>
                  <ChevronRight size={14} className="text-slate-300" />
                </Link>
              </li>
            ))}
          </ul>
          <div className="p-4 flex flex-col space-y-2 border-t border-slate-100">
            {user ? (
              <>
                <Link 
                  href="/dasbor" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center text-sm font-semibold bg-blue-600 text-white py-2.5 rounded-lg flex items-center justify-center space-x-2"
                >
                  <LayoutDashboard size={16} />
                  <span>Dasbor Saya</span>
                </Link>
                <button 
                   onClick={handleLogout}
                   className="text-center text-sm font-medium text-red-600 py-2.5 border border-red-100 rounded-lg flex items-center justify-center space-x-2 hover:bg-red-50 transition"
                >
                  <LogOut size={16} />
                  <span>Keluar</span>
                </button>
              </>
            ) : (
              <>
                <Link 
                  href="/login" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center text-sm font-semibold bg-blue-600 text-white py-2.5 rounded-lg flex items-center justify-center space-x-2"
                >
                  <User size={16} />
                  <span>Masuk</span>
                </Link>
                <Link 
                  href="/daftar" 
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-center text-sm font-medium text-slate-700 py-2.5 border border-slate-200 rounded-lg"
                >
                  Pendaftaran Sekolah
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
