'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { loginWithNpsn } from '@/app/actions/auth'

export default function LoginForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)
    
    // Server Action
    const result = await loginWithNpsn(null, formData)
    
    if (result?.error) {
      toast.error(result.error)
      setLoading(false)
    } else {
      toast.success('Berhasil masuk!')
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
          <h1 className="text-2xl font-bold text-slate-900">Selamat Datang</h1>
          <p className="text-sm text-slate-600">Masuk menggunakan NPSN dan kata sandi Anda.</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col space-y-4">
        <div className="flex flex-col space-y-1">
          <label htmlFor="npsn" className="text-sm font-medium text-slate-700">Nomor Pokok Sekolah Nasional (NPSN)</label>
          <input 
            type="text" 
            id="npsn" 
            name="npsn" 
            placeholder="Masukkan 8 digit NPSN" 
            className="border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            required
            autoComplete="off"
          />
        </div>

        <div className="flex flex-col space-y-1">
          <label htmlFor="password" className="text-sm font-medium text-slate-700">Kata Sandi</label>
          <input 
            type="password" 
            id="password" 
            name="password" 
            placeholder="Masukkan kata sandi" 
            className="border border-slate-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
            required
            autoComplete="current-password"
          />
        </div>

        <div className="flex items-center justify-end">
          <Link href="/lupa-sandi" className="text-sm text-blue-700 font-medium hover:text-blue-800 transition">
            Lupa kata sandi?
          </Link>
        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-blue-700 hover:bg-blue-800 text-white font-medium py-2.5 rounded-lg transition-colors flex items-center justify-center disabled:opacity-70"
        >
          {loading ? 'Memproses...' : 'Masuk'}
        </button>
      </form>

      <div className="text-center text-sm text-slate-600">
        Belum memiliki akun?{' '}
        <Link href="/daftar" className="text-blue-700 font-medium hover:text-blue-800 transition">
          Daftar Sekretariat
        </Link>
      </div>
    </div>
  )
}
