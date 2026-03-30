'use client'

import { useState, useEffect } from 'react'
import Link from "next/link"
import Image from "next/image"
import { LayoutDashboard, LogOut, User } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { logout } from '@/app/actions/auth'

export default function Footer() {
  const [user, setUser] = useState<{id: string} | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const checkUser = async () => {
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
    }
    checkUser()
  }, [supabase.auth])

  const handleLogout = async () => {
    await logout()
    setUser(null)
  }

  return (
    <footer className="bg-slate-950 mt-0 py-12 md:py-16 text-slate-400">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 lg:gap-16">
          
          {/* Brand & Address */}
          <div className="md:col-span-5 flex flex-col space-y-4">
            <div className="bg-white p-2.5 rounded-lg max-w-fit mb-1">
              <Image 
                src="/logo.png" 
                alt="Astacita Pendidikan" 
                width={160} 
                height={40} 
                className="h-7 w-auto object-contain"
              />
            </div>
            <p className="text-sm font-semibold text-slate-200">Pusat Informasi & Depo Siaran Pers</p>
            <p className="text-sm text-slate-500 max-w-xs leading-relaxed">
              Jl. Mandor Samin No. 38D<br />
              Grand Depok City, Kota Depok<br />
              Jawa Barat, Indonesia
            </p>
            <div className="pt-1">
               <p className="text-sm text-slate-500">📧 admin@astacita-pendidikan.web.id</p>
            </div>
          </div>

          {/* Navigasi */}
          <div className="md:col-span-3">
            <h4 className="text-slate-200 font-bold font-[family-name:var(--font-oswald)] tracking-wider mb-4 uppercase text-xs">
              Navigasi
            </h4>
            <ul className="flex flex-col space-y-2.5 text-sm">
              <li><Link href="/" className="hover:text-blue-400 transition-colors">Beranda</Link></li>
              <li><Link href="/kategori/dikdas" className="hover:text-blue-400 transition-colors">DIKDAS (SD/SMP)</Link></li>
              <li><Link href="/kategori/dikmen" className="hover:text-blue-400 transition-colors">DIKMEN (SMA/SMK)</Link></li>
              <li><Link href="/kategori/paud" className="hover:text-blue-400 transition-colors">PAUD</Link></li>
              <li><Link href="/kategori/opini" className="hover:text-blue-400 transition-colors">Opini & Jurnal</Link></li>
              <li><Link href="/kategori/prestasi" className="hover:text-blue-400 transition-colors">Prestasi</Link></li>
            </ul>
          </div>

          {/* Aksi Pengguna — Dinamis Berdasarkan Status Login */}
          <div className="md:col-span-4">
            <h4 className="text-slate-200 font-bold font-[family-name:var(--font-oswald)] tracking-wider mb-4 uppercase text-xs">
              Layanan Humas & Sekolah
            </h4>
            <p className="text-sm text-slate-500 mb-5 leading-relaxed">
              Laporkan transparansi, prestasi, dan kegiatan harian dari sekolah Anda dengan membuat akun sekretariat gratis.
            </p>
            <div className="flex space-x-3">
              {user ? (
                <>
                  <Link 
                    href="/dasbor" 
                    className="text-xs font-semibold px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors flex items-center space-x-1.5"
                  >
                    <LayoutDashboard size={14} />
                    <span>Dasbor Saya</span>
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="text-xs font-medium px-4 py-2.5 border border-slate-700 text-slate-400 rounded-lg hover:border-red-500/50 hover:text-red-400 hover:bg-red-900/10 transition-all flex items-center space-x-1.5"
                  >
                    <LogOut size={14} />
                    <span>Keluar</span>
                  </button>
                </>
              ) : (
                <>
                  <Link 
                    href="/login"
                    className="text-xs font-medium px-4 py-2.5 border border-slate-700 rounded-lg text-slate-300 hover:bg-slate-800 hover:border-blue-600/50 hover:text-blue-400 transition-all"
                  >
                    Masuk
                  </Link>
                  <Link 
                    href="/daftar"
                    className="text-xs font-semibold px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
                  >
                    Daftar Sekolah
                  </Link>
                </>
              )}
            </div>
          </div>
          
        </div>

        <div className="mt-12 pt-6 border-t border-slate-800/60 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-600">
          <p>&copy; {new Date().getFullYear()} Astacita Pendidikan. Hak Cipta Dilindungi.</p>
          <p className="mt-2 sm:mt-0">www.astacita-pendidikan.web.id</p>
        </div>
      </div>
    </footer>
  );
}
