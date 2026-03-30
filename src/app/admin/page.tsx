import { createServiceClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import AdminSPCard from '@/components/admin/AdminSPCard'
import { ClipboardList, CheckCircle2, XCircle, Clock } from 'lucide-react'
import Link from 'next/link'

export default async function AdminPage() {
  const supabase = createServiceClient()

  // Validasi user yang sedang login, pastikan role-nya admin
  // Gunakan createClient untuk cek session cookie
  const { createClient } = await import('@/utils/supabase/server')
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()

  if (!user) redirect('/login')

  // Cek role di tabel users
  const { data: userData } = await supabase
    .from('users')
    .select('role')
    .eq('id', user.id)
    .limit(1)

  if (!userData || userData.length === 0 || userData[0].role !== 'admin') {
    redirect('/dasbor')
  }

  // Ambil semua SP pending
  const { data: pendingSP } = await supabase
    .from('siaran_pers')
    .select(`id, judul, kategori, status, created_at, foto_url, isi_sp, link_url_publikasi, tgl_posting, sekolah (nama_sekolah, npsn)`)
    .eq('status', 'pending')
    .order('created_at', { ascending: false })

  // Ambil statistik cepat
  const { count: totalApproved } = await supabase
    .from('siaran_pers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'approved')

  const { count: totalRejected } = await supabase
    .from('siaran_pers')
    .select('*', { count: 'exact', head: true })
    .eq('status', 'rejected')

  const pendingList = pendingSP || []

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-blue-700 rounded-lg flex items-center justify-center">
            <ClipboardList size={18} className="text-white" />
          </div>
          <div>
            <h1 className="font-bold text-slate-900 text-sm">Dasbor Admin</h1>
            <p className="text-xs text-slate-500">Moderasi Siaran Pers</p>
          </div>
        </div>
        <Link href="/" className="text-xs text-blue-600 hover:underline font-medium">
          ← Lihat Portal Publik
        </Link>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-8">

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 flex items-center space-x-3">
            <Clock size={28} className="text-amber-500" />
            <div>
              <p className="text-2xl font-bold text-amber-700">{pendingList.length}</p>
              <p className="text-xs text-amber-600 font-medium">Menunggu Review</p>
            </div>
          </div>
          <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-4 flex items-center space-x-3">
            <CheckCircle2 size={28} className="text-emerald-500" />
            <div>
              <p className="text-2xl font-bold text-emerald-700">{totalApproved || 0}</p>
              <p className="text-xs text-emerald-600 font-medium">Disetujui</p>
            </div>
          </div>
          <div className="bg-red-50 border border-red-100 rounded-xl p-4 flex items-center space-x-3">
            <XCircle size={28} className="text-red-400" />
            <div>
              <p className="text-2xl font-bold text-red-600">{totalRejected || 0}</p>
              <p className="text-xs text-red-500 font-medium">Ditolak</p>
            </div>
          </div>
        </div>

        {/* Pending List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-bold text-slate-800 uppercase text-sm tracking-wide">
              Antrean Siaran Pers Menunggu Persetujuan
            </h2>
            <span className="text-xs bg-amber-100 text-amber-700 px-3 py-1 rounded-full font-bold">
              {pendingList.length} Antrean
            </span>
          </div>

          {pendingList.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
              <CheckCircle2 size={48} className="text-emerald-400 mx-auto mb-3" />
              <p className="font-semibold text-slate-700">Antrean Kosong!</p>
              <p className="text-sm text-slate-400 mt-1">Semua Siaran Pers sudah diproses.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingList.map((sp: any) => (
                <AdminSPCard key={sp.id} sp={{
                  ...sp,
                  sekolah: Array.isArray(sp.sekolah) ? sp.sekolah[0] : sp.sekolah
                }} />
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  )
}
