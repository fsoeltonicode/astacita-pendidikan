import Link from 'next/link'
import { Newspaper } from 'lucide-react'

interface NewsCardProps {
  id: string;
  judul: string;
  kategori: string;
  tgl_posting: string;
  nama_sekolah: string;
  foto_url?: string | null;
}

const kategoriColors: Record<string, string> = {
  'PAUD': 'bg-pink-600',
  'DIKDAS': 'bg-blue-600',
  'DIKMEN': 'bg-emerald-600',
  'Opini': 'bg-indigo-600',
  'Prestasi': 'bg-yellow-600',
  'Kegiatan': 'bg-teal-600',
  'Pengumuman': 'bg-orange-600',
}

export default function NewsCard({ id, judul, kategori, tgl_posting, nama_sekolah, foto_url }: NewsCardProps) {
  const formatTanggal = (dateStr: string) => {
    try {
      const date = new Date(dateStr)
      return date.toLocaleDateString('id-ID', {
        month: 'short',
        day: '2-digit',
        year: 'numeric'
      })
    } catch {
      return dateStr
    }
  }

  const badgeColor = kategoriColors[kategori] || 'bg-slate-600'

  return (
    <Link 
      href={`/berita/${id}`} 
      className="group flex flex-col bg-white rounded-xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-full"
    >
      
      {/* Thumbnail */}
      <div className="relative w-full aspect-[16/10] bg-slate-100 overflow-hidden">
        {foto_url ? (
          <img 
            src={foto_url} 
            alt={judul} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-slate-200 bg-gradient-to-br from-slate-50 to-slate-100">
            <Newspaper size={32} />
          </div>
        )}
        {/* Badge */}
        <div className="absolute top-3 left-3">
          <span className={`${badgeColor} text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded shadow-sm`}>
            {kategori}
          </span>
        </div>
      </div>

      {/* Konten */}
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-slate-900 font-bold font-[family-name:var(--font-oswald)] text-[15px] leading-snug line-clamp-2 mb-3 group-hover:text-blue-700 transition-colors">
          {judul}
        </h3>

        {/* Footer Card */}
        <div className="mt-auto flex items-center justify-between text-[11px] text-slate-400 font-medium">
          <span className="truncate max-w-[60%]" title={nama_sekolah}>{nama_sekolah}</span>
          <span className="whitespace-nowrap">{formatTanggal(tgl_posting)}</span>
        </div>
      </div>
    </Link>
  )
}
