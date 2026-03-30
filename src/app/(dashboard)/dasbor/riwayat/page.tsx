import { createClient } from '@/utils/supabase/server'
import { createServiceClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { 
  Clock, CheckCircle2, XCircle, Send, 
  PlusCircle, ExternalLink, FileText
} from 'lucide-react'

const STATUS_MAP: Record<string, { label: string; color: string; icon: React.ElementType }> = {
  pending:  { label: 'Menunggu',  color: 'bg-amber-50 text-amber-700 border-amber-200',  icon: Clock },
  approved: { label: 'Disetujui', color: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle2 },
  rejected: { label: 'Ditolak',   color: 'bg-red-50 text-red-600 border-red-200',        icon: XCircle },
  draft:    { label: 'Draf',      color: 'bg-slate-100 text-slate-600 border-slate-200', icon: FileText },
}

export default async function RiwayatPage() {
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) redirect('/login')

  const supabase = createServiceClient()

  // Ambil NPSN user yang login
  const { data: usersData } = await supabase
    .from('users')
    .select('npsn, nama_narahubung')
    .eq('id', user.id)
    .limit(1)

  if (!usersData || usersData.length === 0) redirect('/dasbor')

  const npsn = usersData[0].npsn

  // Ambil seluruh riwayat SP milik sekolah ini
  const { data: siaranPersList } = await supabase
    .from('siaran_pers')
    .select('id, judul, kategori, status, created_at, tgl_posting, foto_url, link_url_publikasi')
    .eq('npsn', npsn)
    .order('created_at', { ascending: false })

  const list = siaranPersList || []

  const countByStatus = {
    pending: list.filter(s => s.status === 'pending').length,
    approved: list.filter(s => s.status === 'approved').length,
    rejected: list.filter(s => s.status === 'rejected').length,
  }

  return (
    <div className="flex flex-col space-y-8 max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 font-[family-name:var(--font-oswald)] uppercase">
            Riwayat Siaran Pers
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Pantau status seluruh kiriman berita Anda.
          </p>
        </div>
        <Link 
          href="/dasbor/kirim"
          className="flex items-center space-x-2 bg-blue-700 hover:bg-blue-800 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition shadow-md shadow-blue-100"
        >
          <Send size={16} />
          <span>Kirim SP Baru</span>
        </Link>
      </div>

      {/* Stats Ringkas */}
      <div className="grid grid-cols-3 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center space-x-3">
          <Clock size={24} className="text-amber-500" />
          <div>
            <p className="text-xl font-bold text-slate-900">{countByStatus.pending}</p>
            <p className="text-xs text-slate-500">Menunggu</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center space-x-3">
          <CheckCircle2 size={24} className="text-emerald-500" />
          <div>
            <p className="text-xl font-bold text-slate-900">{countByStatus.approved}</p>
            <p className="text-xs text-slate-500">Disetujui</p>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-slate-200 p-4 flex items-center space-x-3">
          <XCircle size={24} className="text-red-400" />
          <div>
            <p className="text-xl font-bold text-slate-900">{countByStatus.rejected}</p>
            <p className="text-xs text-slate-500">Ditolak</p>
          </div>
        </div>
      </div>

      {/* Daftar SP */}
      {list.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-16 text-center">
          <PlusCircle size={48} className="text-slate-300 mx-auto mb-4" />
          <h3 className="font-semibold text-slate-700">Belum Ada Kiriman</h3>
          <p className="text-sm text-slate-400 mt-1 mb-6">
            Mulai tulis dan kirimkan Siaran Pers pertama sekolah Anda!
          </p>
          <Link 
            href="/dasbor/kirim"
            className="inline-flex items-center space-x-2 bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-800 transition"
          >
            <Send size={16} />
            <span>Kirim Siaran Pers Pertama</span>
          </Link>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200">
                <th className="text-left px-5 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Judul</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide hidden md:table-cell">Kategori</th>
                <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide hidden lg:table-cell">Dikirim</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Status</th>
                <th className="text-center px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {list.map((sp) => {
                const statusInfo = STATUS_MAP[sp.status] || STATUS_MAP.draft
                const StatusIcon = statusInfo.icon
                return (
                  <tr key={sp.id} className="hover:bg-slate-50 transition">
                    <td className="px-5 py-4">
                      <div className="flex items-start space-x-3">
                        {sp.foto_url && (
                          <img
                            src={sp.foto_url}
                            alt={sp.judul}
                            className="w-12 h-10 object-cover rounded-lg shrink-0 border border-slate-100"
                          />
                        )}
                        <p className="font-medium text-slate-800 line-clamp-2 leading-snug">{sp.judul}</p>
                      </div>
                    </td>
                    <td className="px-4 py-4 hidden md:table-cell">
                      <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded font-medium">
                        {sp.kategori}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-slate-500 hidden lg:table-cell whitespace-nowrap">
                      {new Date(sp.created_at).toLocaleDateString('id-ID', {
                        day: '2-digit', month: 'short', year: 'numeric'
                      })}
                    </td>
                    <td className="px-4 py-4 text-center">
                      <span className={`inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full border text-xs font-semibold ${statusInfo.color}`}>
                        <StatusIcon size={12} />
                        <span>{statusInfo.label}</span>
                      </span>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {sp.status === 'approved' ? (
                        <div className="flex items-center justify-center space-x-2">
                          <Link
                            href={`/berita/${sp.id}`}
                            target="_blank"
                            className="text-xs text-blue-600 hover:underline font-medium flex items-center space-x-1"
                          >
                            <ExternalLink size={12} />
                            <span>Lihat</span>
                          </Link>
                        </div>
                      ) : sp.status === 'pending' ? (
                        <span className="text-xs text-slate-400 italic">Dalam Review</span>
                      ) : (
                        <Link
                          href="/dasbor/kirim"
                          className="text-xs text-blue-600 hover:underline font-medium"
                        >
                          Kirim Ulang
                        </Link>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
