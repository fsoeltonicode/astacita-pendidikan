'use client'

import React, { useState } from 'react'
import { updateUserPassword } from '@/app/actions/auth'
import toast from 'react-hot-toast'
import { KeyRound, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function GantiSandiBaruPage() {
  const [sandiSatu, setSandiSatu] = useState('')
  const [sandiDua, setSandiDua] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (sandiSatu.length < 6) {
      toast.error('Kata sandi harus minimal 6 karakter.')
      return
    }

    if (sandiSatu !== sandiDua) {
      toast.error('Kedua kata sandi tidak cocok. Periksa kembali ketikan Anda.')
      return
    }

    setLoading(true)
    const res = await updateUserPassword(sandiSatu)
    
    if (res?.error) {
       toast.error(res.error)
       setLoading(false)
    } else {
       toast.success('Pembaruan Sandi Berhasil! Anda kini sudah dapat Login.')
       setTimeout(() => {
          router.push('/dasbor') // Kita tendang ia ke dasbor krn Supabase updateUser otomatis me-loginkan pengguna.
       }, 1500)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 relative overflow-hidden">
      
      {/* Dekorasi Estetik Geometris */}
      <div className="absolute top-0 left-0 -ml-20 -mt-20 w-80 h-80 rounded-full bg-blue-600/5 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-slate-200 p-8 sm:p-10 rounded-3xl shadow-2xl shadow-slate-200/50 relative z-10 transition-all">
        
        <div className="space-y-8 animate-in fade-in zoom-in-95 duration-500">
             <div className="flex flex-col mb-4 items-center justify-center text-center">
                <div className="w-16 h-16 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center mb-5 border border-blue-100/50 shadow-inner">
                   <KeyRound size={32} />
                </div>
                <h1 className="text-3xl font-bold font-[family-name:var(--font-oswald)] uppercase text-slate-900 tracking-wide leading-tight text-center">
                   Buat Kata <span className="text-blue-700">Sandi Baru</span>
                </h1>
                <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                  Tautan keamanan sah diterima. Silakan ketikkan kata sandi baru Anda untuk kembali mengakses platform.
                </p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Sandi Baru Anda</label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                       <Lock size={18} className="text-slate-400" />
                     </div>
                     <input
                       type={showPassword ? 'text' : 'password'}
                       value={sandiSatu}
                       onChange={(e) => setSandiSatu(e.target.value)}
                       className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition text-base placeholder:text-slate-400 font-medium text-slate-800"
                       placeholder="Minimal 6 Karakter"
                       required
                       minLength={6}
                     />
                     <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition"
                        onClick={() => setShowPassword(!showPassword)}
                     >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                     </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Konfirmasi Sandi</label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                       <Lock size={18} className="text-slate-400" />
                     </div>
                     <input
                       type={showPassword ? 'text' : 'password'}
                       value={sandiDua}
                       onChange={(e) => setSandiDua(e.target.value)}
                       className="w-full pl-12 pr-12 py-3.5 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition text-base placeholder:text-slate-400 font-medium text-slate-800"
                       placeholder="Ulangi Sandi Baru"
                       required
                     />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || sandiSatu.length < 6 || sandiDua.length < 6}
                  className="w-full relative flex justify-center bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 px-4 rounded-xl transition shadow-lg shadow-blue-700/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                >
                  {loading ? (
                    <span className="flex items-center"><Loader2 size={18} className="animate-spin mr-2" /> MENYIMPAN...</span>
                  ) : (
                    'Simpan & Log Masuk'
                  )}
                </button>
             </form>
           </div>
      </div>
      
    </div>
  )
}
