import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Newspaper } from 'lucide-react'

interface KategoriPageProps {
  params: Promise<{ slug: string }>
}

const slugToCategoryMap: Record<string, string> = {
  'paud': 'PAUD',
  'dikdas': 'DIKDAS',
  'dikmen': 'DIKMEN',
  'dikmas': 'DIKMAS',
  'journal': 'Journal',
  'opini': 'Opini',
  'prestasi': 'Prestasi',
  'kegiatan': 'Kegiatan',
  'pengumuman': 'Pengumuman',
  'profil': 'Profil',
  'fasilitas': 'Fasilitas',
  'lainnya': 'Lainnya'
}

const kategoriColorMap: Record<string, string> = {
  'PAUD': 'bg-pink-600',
  'DIKDAS': 'bg-blue-600',
  'DIKMEN': 'bg-emerald-600',
  'DIKMAS': 'bg-amber-600',
  'Journal': 'bg-purple-600',
  'Opini': 'bg-indigo-600',
  'Prestasi': 'bg-yellow-600',
  'Kegiatan': 'bg-teal-600',
  'Pengumuman': 'bg-orange-600',
  'Profil': 'bg-cyan-600',
  'Fasilitas': 'bg-slate-600',
  'Lainnya': 'bg-gray-600'
}

export default async function KategoriPage({ params }: KategoriPageProps) {
  const { slug } = await params
  
  const kategoriName = slugToCategoryMap[slug.toLowerCase()]

  if (!kategoriName) {
    notFound()
  }

  const badgeColor = kategoriColorMap[kategoriName] || 'bg-blue-600'

  const supabase = await createClient()

  const { data: berita } = await supabase
    .from('siaran_pers')
    .select(`
      id, 
      judul, 
      kategori, 
      tgl_posting, 
      foto_url, 
      sekolah (nama_sekolah)
    `)
    .eq('status', 'approved')
    .eq('kategori', kategoriName)
    .order('tgl_posting', { ascending: false })

  const formatTanggal = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch { return dateStr }
  }

  return (
    <div className="min-h-[70vh] bg-slate-50">
      {/* Hero Header */}
      <div className="bg-slate-900 text-white py-12 lg:py-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(59,130,246,0.15),transparent)] pointer-events-none"></div>
        <div className="container mx-auto px-4 lg:px-8 relative z-10">
          <Link href="/" className="inline-flex items-center text-slate-400 hover:text-white text-xs font-medium mb-6 transition-colors">
             <ArrowLeft size={14} className="mr-1.5" />
             Kembali ke Beranda
          </Link>
          <div className="flex items-center space-x-4">
            <div className={`w-12 h-12 ${badgeColor} rounded-xl flex items-center justify-center shadow-lg`}>
              <Newspaper size={22} />
            </div>
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold font-[family-name:var(--font-oswald)] uppercase tracking-wide">
                 {kategoriName}
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                 Kumpulan Siaran Pers terverifikasi kategori {kategoriName}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 lg:px-8 py-10">
        {!berita || berita.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-slate-200 shadow-sm max-w-lg mx-auto">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Newspaper size={28} className="text-slate-300" />
            </div>
            <h2 className="text-xl font-bold text-slate-700">Belum Ada Publikasi</h2>
            <p className="text-slate-500 text-sm mt-2 max-w-sm mx-auto leading-relaxed">
              Belum ada Siaran Pers yang dirilis pada kanal <strong className="text-slate-700">{kategoriName}</strong>. Coba kunjungi kanal lainnya.
            </p>
            <Link href="/" className="inline-block mt-6 bg-slate-800 hover:bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-lg transition">
               Jelajahi Beranda
            </Link>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-8">
              <p className="text-sm text-slate-500 font-medium">
                Menampilkan <span className="text-slate-800 font-bold">{berita.length}</span> siaran pers
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {berita.map((item: Record<string, unknown>) => (
                <Link 
                  key={item.id as string} 
                  href={`/berita/${item.id}`}
                  className="group flex flex-col bg-white rounded-xl overflow-hidden border border-slate-200/80 shadow-sm hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300 h-full"
                >
                  <div className="relative w-full aspect-[16/10] bg-slate-100 overflow-hidden">
                    {(item.foto_url as string) ? (
                      <img 
                        src={item.foto_url as string} 
                        alt={item.judul as string} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-300 bg-gradient-to-br from-slate-50 to-slate-100">
                        <Newspaper size={32} />
                      </div>
                    )}
                    <div className="absolute top-3 left-3">
                      <span className={`${badgeColor} text-white text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded`}>
                        {item.kategori as string}
                      </span>
                    </div>
                  </div>
                  <div className="p-4 flex flex-col flex-grow">
                    <h3 className="text-slate-900 font-bold font-[family-name:var(--font-oswald)] text-base leading-snug line-clamp-2 mb-3 group-hover:text-blue-700 transition-colors">
                      {item.judul as string}
                    </h3>
                    <div className="mt-auto flex items-center justify-between text-xs text-slate-400 font-medium">
                      <span className="truncate max-w-[60%]">{(item.sekolah as Record<string, string>)?.nama_sekolah || 'Anonim'}</span>
                      <span className="whitespace-nowrap">{formatTanggal(item.tgl_posting as string)}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
