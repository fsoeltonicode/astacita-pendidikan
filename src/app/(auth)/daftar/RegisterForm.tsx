'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { autoFetchSekolah, registerHumas } from '@/app/actions/auth'

export default function RegisterForm() {
  const [loading, setLoading] = useState(false)
  const [npsn, setNpsn] = useState('')
  const [sekolahData, setSekolahData] = useState<any>(null)
  const [fetchError, setFetchError] = useState<string | null>(null)
  
  const router = useRouter()

  const handleNpsnChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setNpsn(val)

    if (val.length >= 8) {
      setFetchError(null)
      const res = await autoFetchSekolah(val)
      if (res.error) {
        setSekolahData(null)
        setFetchError(res.error)
      } else if (res.data) {
        setSekolahData(res.data)
      }
    } else {
      setSekolahData(null)
      setFetchError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    
    if (!sekolahData) {
      toast.error('Gagal Registrasi: Data sekolah tidak ditemukan.')
      return
    }

    setLoading(true)
    const formData = new FormData(e.currentTarget)
    
    // Pembetulan: prevState di-pass null, password data sudah ada di dalam formData
    const res = await registerHumas(null, formData)

    if (res?.error) {
      toast.error(res.error)
      setLoading(false)
    } else {
      toast.success('Pendaftaran berhasil! Mengalihkan ke Dasbor...')
      router.push('/dasbor')
    }
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="flex flex-col items-center justify-center space-y-2 mb-2">
        {/* Fallback Image. Ganti src dengan URL statis jika ada */}
        <div className="relative w-full flex items-center justify-center mb-4">
           {/* Hapus fallback di bawah ini ketika logo asli sudah tersedia di public/logo.png */}
           {/* <h1 className="text-blue-700 font-bold text-2xl text-center">ASTACITA PENDIDIKAN</h1> */}
           <Image src="/logo.png" alt="Logo Astacita Pendidikan" width={200} height={80} className="object-contain" priority />
        </div>
        <div className="text-center">
          <h2 className="text-xl font-bold text-slate-900">Pendaftaran Narahubung</h2>
          <p className="text-sm text-slate-600">Lengkapi data untuk mendaftarkan akun sekolah Anda.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        
        <div className="flex flex-col space-y-1">
          <label htmlFor="npsn" className="text-sm font-medium text-slate-700">Nomor Pokok Sekolah Nasional (NPSN)</label>
          <input 
            type="text" 
            id="npsn" 
            name="npsn" 
            value={npsn}
            onChange={handleNpsnChange}
            placeholder="Masukkan 8 digit NPSN" 
            className="border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            required
            autoComplete="off"
            maxLength={8}
          />
          {fetchError && <p className="text-xs text-red-600 mt-1 font-medium">{fetchError}</p>}
        </div>

        {/* Info Sekolah Read Only Block */}
        {sekolahData && (
          <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex flex-col space-y-2 text-sm text-slate-800">
            <p className="font-semibold text-blue-900 pb-1 border-b border-blue-200">Informasi Sekolah</p>
            <p><span className="font-medium text-slate-600">Nama:</span> <span className="font-bold">{sekolahData.nama_sekolah}</span></p>
            <p><span className="font-medium text-slate-600">Status N/S:</span> {sekolahData.status_ns}</p>
            <p><span className="font-medium text-slate-600">Kepala Sekolah:</span> {sekolahData.kepala_sekolah}</p>
            <p className="text-xs text-slate-500 mt-2">{sekolahData.kec}, {sekolahData.kab_kot}, {sekolahData.prov}</p>
          </div>
        )}

        <div className="border-t border-slate-200 my-4"></div>

        <div className="flex flex-col space-y-1">
          <label htmlFor="email" className="text-sm font-medium text-slate-700">Email Utama (Untuk Login)</label>
          <input 
            type="email" 
            id="email" 
            name="email" 
            placeholder="contoh: humas@sekolah.sch.id" 
            className="border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            required
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label htmlFor="nama_narahubung" className="text-sm font-medium text-slate-700">Nama Lengkap Narahubung</label>
          <input 
            type="text" 
            id="nama_narahubung" 
            name="nama_narahubung" 
            placeholder="Nama lengkap pengisi form" 
            className="border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            required
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label htmlFor="no_wa" className="text-sm font-medium text-slate-700">Nomor WhatsApp</label>
          <input 
            type="tel" 
            id="no_wa" 
            name="no_wa" 
            placeholder="08123456789" 
            className="border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            required
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">Kata Sandi Baru</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            placeholder="Min. 6 karakter" 
            className="border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            required
            minLength={6}
          />
        </div>

        <div className="pt-2 flex flex-col space-y-2">
           <button 
             type="submit" 
             disabled={loading || !sekolahData}
             className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-50"
           >
             {loading ? 'Memproses pendaftaran...' : 'Kirim Pendaftaran'}
           </button>
           <Link href="/login" className="w-full text-center text-slate-600 hover:text-slate-800 font-medium py-2.5 rounded-lg transition transition-colors border border-transparent hover:border-slate-200">
              Batal
           </Link>
        </div>
      </form>

      <div className="text-center text-sm text-slate-600 border-t border-slate-100 pt-6">
        <p>Gunakan kombinasi simbol dan angka agar akun Anda tetap aman.</p>
      </div>
    </div>
  )
}
