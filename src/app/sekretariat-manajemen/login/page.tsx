'use client'

import React, { useState } from 'react'
import Image from 'next/image'
import { Eye, EyeOff, Lock, User, Target } from 'lucide-react'
import { loginEmail } from '@/app/actions/auth'
import toast from 'react-hot-toast'
import { useRouter } from 'next/navigation'

export default function ManajemenLogin() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    
    // Karena ini manajemen rahasia, mereka login pakai Email, bukan NPSN
    const formData = new FormData()
    formData.append('email', email)
    formData.append('password', password)
    
    // Harus membuat fungsi loginEmail di actions karena saat ini cuma ada loginNpsn
    const res = await loginEmail(formData)
    
    if (res?.error) {
       toast.error(res.error)
       setLoading(false)
    } else {
       toast.success('Otentikasi berhasil.')
       router.push('/sekretariat-manajemen')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full z-0 overflow-hidden pointer-events-none opacity-20">
         <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600 rounded-full blur-[120px]"></div>
         <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-emerald-600 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-md bg-white/10 backdrop-blur-md border border-white/20 p-8 rounded-2xl shadow-2xl relative z-10 text-white">
        <div className="flex flex-col items-center justify-center mb-8">
           <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
              <Target size={32} />
           </div>
           <h1 className="text-2xl font-bold font-[family-name:var(--font-oswald)] uppercase text-center tracking-wider">Akses Terbatas</h1>
           <p className="text-slate-300 text-sm mt-1 text-center">Dasbor Laporan Keuangan Sekretariat Manajemen</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-widest pl-1">Email Kredensial</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <User size={18} className="text-slate-400" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-sm placeholder:text-slate-500"
                placeholder="sekretariat@astacita.id"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 uppercase tracking-widest pl-1">Kata Sandi</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock size={18} className="text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-slate-800/50 border border-slate-700 rounded-xl focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition text-sm placeholder:text-slate-500"
                placeholder="Masukkan kata sandi..."
                required
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-white transition"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 px-4 rounded-xl transition duration-200 shadow-lg shadow-blue-500/30 disabled:opacity-50 disabled:cursor-not-allowed uppercase tracking-widest text-sm"
          >
            {loading ? 'Melewati Keamanan...' : 'Masuk Sistem'}
          </button>
        </form>
        
        <div className="mt-8 pt-6 border-t border-white/10 text-center">
           <span className="text-xs text-slate-400 tracking-wider">SECURE CONNECTION ESTABLISHED</span>
        </div>
      </div>
    </div>
  )
}
