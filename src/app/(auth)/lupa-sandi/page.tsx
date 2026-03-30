'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { sendResetPasswordEmail } from '@/app/actions/auth'
import toast from 'react-hot-toast'
import { ShieldAlert, ArrowLeft, MailCheck } from 'lucide-react'

export default function LupaSandiPage() {
  const [npsn, setNpsn] = useState('')
  const [loading, setLoading] = useState(false)
  const [successMode, setSuccessMode] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!npsn || npsn.length < 8) {
      toast.error('Gunakan minimal 8 digit NPSN.')
      return
    }

    setLoading(true)
    const res = await sendResetPasswordEmail(npsn)
    
    if (res?.error) {
       toast.error(res.error)
       setLoading(false)
    } else {
       toast.success('Panggilan ke peladen berhasil!')
       setSuccessMode(true)
       setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12 relative overflow-hidden">
      
      {/* Dekorasi Estetik Geometris */}
      <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-600/5 blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-600/5 blur-3xl pointer-events-none"></div>

      <div className="w-full max-w-md bg-white border border-slate-200 p-8 sm:p-10 rounded-3xl shadow-2xl shadow-slate-200/50 relative z-10 transition-all">
        
        {successMode ? (
           <div className="text-center space-y-6 shrink-0 animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2 ring-8 ring-emerald-50/50">
                <MailCheck size={40} />
              </div>
              <div>
                <h1 className="text-2xl font-bold font-[family-name:var(--font-oswald)] uppercase text-slate-800 tracking-wide mb-2">Periksa Email Anda</h1>
                <p className="text-slate-500 text-sm leading-relaxed">
                  Kami telah mengirimkan instruksi & tautan khusus untuk memulihkan akses masuk berdasarkan NPSN <strong className="text-slate-700">{npsn}</strong>. 
                </p>
                <div className="mt-4 p-3 bg-blue-50 text-blue-800 text-xs rounded-lg font-medium">
                  Pastikan mengecek folder Spam atau Junk jika Anda tidak menemukannya dalam 5 menit.
                </div>
              </div>
              <Link 
                href="/login"
                className="inline-block mt-4 w-full bg-slate-900 hover:bg-black text-white py-3.5 rounded-xl font-bold transition shadow-lg text-sm tracking-wider uppercase"
              >
                Kembali ke Halaman Utama
              </Link>
           </div>
        ) : (
           <div className="space-y-8 animate-in fade-in duration-500">
             <div className="flex flex-col mb-4">
                <Link href="/login" className="inline-flex items-center text-slate-400 hover:text-blue-700 font-medium mb-6 text-xs transition">
                   <ArrowLeft size={14} className="mr-1.5" /> Kembali Ke Login
                </Link>
                <div className="w-14 h-14 bg-blue-50 text-blue-700 rounded-2xl flex items-center justify-center mb-5 border border-blue-100/50">
                   <ShieldAlert size={28} />
                </div>
                <h1 className="text-3xl font-bold font-[family-name:var(--font-oswald)] uppercase text-slate-900 tracking-wide leading-tight">Kehilangan<br/><span className="text-blue-700">Akses Masuk?</span></h1>
                <p className="text-slate-500 text-sm mt-3 leading-relaxed">
                  Masukkan Nomor Pokok Sekolah Nasional (NPSN) Anda di bawah ini, kami akan meneruskan tautan pemulihan ke <strong className="text-slate-800">alamat email asli</strong> instansi Anda.
                </p>
             </div>

             <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-widest pl-1">Nomor Induk NPSN</label>
                  <input
                    type="text"
                    value={npsn}
                    onChange={(e) => setNpsn(e.target.value.replace(/\D/g, ''))} // Filter angka saja
                    className="w-full px-5 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:border-blue-500 focus:bg-white focus:ring-4 focus:ring-blue-500/10 outline-none transition text-base placeholder:text-slate-400 font-medium text-slate-800"
                    placeholder="Contoh: 20101234"
                    maxLength={8}
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || npsn.length < 8}
                  className="w-full bg-blue-700 hover:bg-blue-800 text-white font-bold py-4 px-4 rounded-xl transition shadow-lg shadow-blue-700/20 disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed uppercase tracking-wider text-sm"
                >
                  {loading ? 'Sistem Mencari...' : 'Kirim Tautan Pemulihan'}
                </button>
             </form>
           </div>
        )}
      </div>
      
    </div>
  )
}
