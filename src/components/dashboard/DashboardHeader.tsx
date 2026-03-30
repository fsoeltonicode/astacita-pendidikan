'use client'

import { useState, useEffect } from 'react'
import { getUserProfile } from '@/app/actions/auth'
import { CheckCircle2, User } from 'lucide-react'

export default function DashboardHeader() {
  const [profile, setProfile] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function loadProfile() {
      const data = await getUserProfile()
      setProfile(data)
      setIsLoading(false)
    }
    loadProfile()
  }, [])

  if (isLoading) {
    return (
      <div className="flex items-center space-x-3 pl-4 animate-pulse">
        <div className="hidden sm:flex flex-col items-end space-y-1">
          <div className="h-3 w-24 bg-slate-200 rounded"></div>
          <div className="h-2 w-16 bg-slate-200 rounded"></div>
        </div>
        <div className="w-9 h-9 rounded-full bg-slate-200 shrink-0"></div>
      </div>
    )
  }

  const namaSekolah = profile?.nama_sekolah || 'Nama Sekolah'
  const namaUser = profile?.nama_narahubung || 'Narahubung'
  const inisial = namaUser.charAt(0).toUpperCase()
  const isDapodik = profile?.status_dapodik === 'Terdaftar'

  return (
    <div className="flex items-center space-x-3 pl-4">
      {/* Info User */}
      <div className="hidden sm:flex flex-col items-end">
        <span className="text-xs font-bold text-slate-800 leading-tight max-w-[180px] truncate text-right">
          {namaSekolah}
        </span>
        <span className="text-[10px] text-slate-500 font-medium">
          {namaUser}
        </span>
        {isDapodik && (
          <span className="text-[9px] text-blue-600 font-bold flex items-center mt-0.5">
            <CheckCircle2 size={9} className="mr-1" /> DAPODIK TERVERIFIKASI
          </span>
        )}
      </div>

      {/* Avatar dengan Inisial */}
      <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center text-white font-bold text-sm border-2 border-blue-200 cursor-pointer hover:bg-blue-800 transition shrink-0">
        {profile ? inisial : <User size={18} />}
      </div>
    </div>
  )
}

