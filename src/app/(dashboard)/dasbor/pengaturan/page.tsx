'use client'

import React, { useState } from 'react'
import { updateUserPassword } from '@/app/actions/auth'
import toast from 'react-hot-toast'
import { Settings, ShieldCheck, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'

export default function PengaturanDasborPage() {
  const [sandiSatu, setSandiSatu] = useState('')
  const [sandiDua, setSandiDua] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (sandiSatu.length < 6) {
      toast.error('Kata sandi harus minimal 6 karakter.')
      return
    }

    if (sandiSatu !== sandiDua) {
      toast.error('Kedua kata sandi baru tidak cocok!')
      return
    }

    setLoading(true)
    const res = await updateUserPassword(sandiSatu)
    
    if (res?.error) {
       toast.error(res.error)
       setLoading(false)
    } else {
       toast.success('Pembaruan Sandi Berhasil! Sandi Anda telah ditukar dengan yang baru.')
       setSandiSatu('')
       setSandiDua('')
       setLoading(false)
    }
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold font-[family-name:var(--font-oswald)] uppercase text-slate-800 tracking-wide flex items-center">
            <Settings className="mr-3 text-blue-600" size={32} /> Pengaturan Akun
          </h1>
          <p className="text-slate-500 mt-2 text-sm max-w-xl">
            Amankan area dasbor Anda. Sistem kami merekomendasikan penggantian kata sandi bawaan ("admin") agar mencegah akses asing menggunakan NPSN Anda.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Banner Keamanan */}
        <div className="col-span-1 border border-blue-200 bg-blue-50/50 rounded-2xl p-6 h-fit relative overflow-hidden">
           <div className="absolute -bottom-10 -right-10 opacity-10">
              <ShieldCheck size={160} className="text-blue-600" />
           </div>
           <div className="flex items-center space-x-3 mb-4 relative z-10">
              <div className="w-10 h-10 bg-blue-100 text-blue-700 rounded-full flex justify-center items-center shadow-sm">
                 <Lock size={18} />
              </div>
              <h3 className="font-bold text-blue-900 uppercase tracking-widest text-sm">Prinsip Keamanan Jaringan</h3>
           </div>
           <p className="text-sm text-blue-800/80 leading-relaxed relative z-10">
              Sandi sekolah tidak disimpan dalam bentuk teks murni pada basis data Astacita Pendidikan. Kami menggunakan teknologi enkripsi *bcrypt* yang tidak bisa dibaca, bahkan oleh staf sekretariat kami sendiri. 
           </p>
           <p className="text-xs text-blue-700 mt-4 opacity-70 relative z-10 font-bold uppercase tracking-widest">
              Standardized by Supabase Auth Layer
           </p>
        </div>

        {/* Formulir */}
        <div className="col-span-1 lg:col-span-2 border border-slate-200 bg-white rounded-2xl p-6 md:p-8 shadow-sm">
           <div className="mb-6 mb-8 border-b border-slate-100 pb-4">
               <h3 className="text-lg font-bold text-slate-800 tracking-wide">Tukar Kata Sandi</h3>
               <p className="text-sm text-slate-500">Isi formulir ganda di bawah ini untuk menugaskan sistem memutar kunci sandi Anda seketika.</p>
           </div>
           
           <form onSubmit={handleSubmit} className="space-y-6 max-w-md">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Sandi Rahasia Baru</label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                       <Lock size={18} className="text-slate-400" />
                     </div>
                     <input
                       type={showPassword ? 'text' : 'password'}
                       value={sandiSatu}
                       onChange={(e) => setSandiSatu(e.target.value)}
                       className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition text-sm placeholder:text-slate-400 font-medium text-slate-800"
                       placeholder="Minimal 6 Huruf/Angka"
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
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Konfirmasi Ulang</label>
                  <div className="relative">
                     <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                       <Lock size={18} className="text-slate-400" />
                     </div>
                     <input
                       type={showPassword ? 'text' : 'password'}
                       value={sandiDua}
                       onChange={(e) => setSandiDua(e.target.value)}
                       className="w-full pl-12 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20 outline-none transition text-sm placeholder:text-slate-400 font-medium text-slate-800"
                       placeholder="Tulis Ulang Sandi Baru"
                       required
                     />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading || sandiSatu.length < 6 || sandiDua.length < 6}
                  className="w-full relative flex justify-center bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl transition shadow-lg shadow-emerald-600/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed uppercase tracking-wider text-sm mt-8"
                >
                  {loading ? (
                    <span className="flex items-center"><Loader2 size={18} className="animate-spin mr-2" /> SEDANG MENGUBAH KUNCI...</span>
                  ) : (
                    'Perbarui Sandi Sekarang'
                  )}
                </button>
             </form>

        </div>

      </div>

    </div>
  )
}
