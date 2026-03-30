'use client'

import { useState } from 'react'
import { CheckCircle2, XCircle, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react'
import { approveSiaranPers, rejectSiaranPers } from '@/app/actions/admin'
import toast from 'react-hot-toast'

interface SP {
  id: string
  judul: string
  kategori: string
  status: string
  created_at: string
  foto_url: string | null
  isi_sp: string
  link_url_publikasi: string | null
  tgl_posting: string | null
  sekolah: { nama_sekolah: string; npsn: string } | null
}

export default function AdminSPCard({ sp }: { sp: SP }) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState<'approve' | 'reject' | null>(null)
  const [linkUrl, setLinkUrl] = useState(sp.link_url_publikasi || '')
  const [done, setDone] = useState(false)
  const [doneStatus, setDoneStatus] = useState<'approved' | 'rejected' | null>(null)

  if (done) {
    return (
      <div className={`rounded-xl border p-4 flex items-center space-x-3 text-sm font-medium ${doneStatus === 'approved' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'}`}>
        {doneStatus === 'approved' ? <CheckCircle2 size={18} /> : <XCircle size={18} />}
        <span>{doneStatus === 'approved' ? 'Disetujui' : 'Ditolak'} — {sp.judul}</span>
      </div>
    )
  }

  const handleApprove = async () => {
    setLoading('approve')
    const res = await approveSiaranPers(sp.id, linkUrl || undefined)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Siaran Pers berhasil disetujui dan dipublikasikan!')
      setDone(true)
      setDoneStatus('approved')
    }
    setLoading(null)
  }

  const handleReject = async () => {
    if (!confirm('Yakin ingin menolak siaran pers ini?')) return
    setLoading('reject')
    const res = await rejectSiaranPers(sp.id)
    if (res.error) {
      toast.error(res.error)
    } else {
      toast.success('Siaran Pers telah ditolak.')
      setDone(true)
      setDoneStatus('rejected')
    }
    setLoading(null)
  }

  // Strip HTML for preview
  const previewText = sp.isi_sp.replace(/<[^>]*>/g, '').substring(0, 200) + '...'

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="flex items-start gap-4 p-5">
        {/* Foto Thumbnail */}
        {sp.foto_url && (
          <div className="w-24 h-20 shrink-0 rounded-lg overflow-hidden bg-slate-100">
            <img src={sp.foto_url} alt={sp.judul} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2 mb-1">
            <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-wide">
              {sp.kategori}
            </span>
            <span className="text-[10px] text-slate-400">{new Date(sp.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
          </div>
          <h3 className="font-bold text-slate-900 text-sm leading-snug line-clamp-2">{sp.judul}</h3>
          <p className="text-xs text-blue-600 font-medium mt-1">
            {sp.sekolah?.nama_sekolah || 'Sekolah Tidak Diketahui'} · NPSN {sp.sekolah?.npsn}
          </p>
        </div>

        <button onClick={() => setExpanded(!expanded)} className="text-slate-400 hover:text-slate-600 shrink-0">
          {expanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="px-5 pb-5 border-t border-slate-100 pt-4 space-y-4">
          <div className="bg-slate-50 rounded-lg p-4 text-sm text-slate-700 max-h-48 overflow-y-auto">
            <p className="text-xs text-slate-400 font-bold uppercase mb-2">Pratinjau Isi Berita</p>
            <p>{previewText}</p>
          </div>

          {/* Input Link URL Publikasi (Opsional) */}
          <div>
            <label className="text-xs font-bold text-slate-600 uppercase tracking-wide mb-1 block">
              Link URL Publikasi di Blog (Opsional)
            </label>
            <div className="flex items-center space-x-2">
              <ExternalLink size={16} className="text-slate-400 shrink-0" />
              <input
                type="url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="https://blog.astacita.id/berita/..."
                className="flex-1 text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3 pt-2">
            <button
              onClick={handleReject}
              disabled={!!loading}
              className="flex items-center space-x-2 px-4 py-2 rounded-lg border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition disabled:opacity-50"
            >
              <XCircle size={16} />
              <span>{loading === 'reject' ? 'Memproses...' : 'Tolak'}</span>
            </button>
            <button
              onClick={handleApprove}
              disabled={!!loading}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition disabled:opacity-50 shadow-md shadow-emerald-100"
            >
              <CheckCircle2 size={16} />
              <span>{loading === 'approve' ? 'Memproses...' : 'Setujui & Publikasikan'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
