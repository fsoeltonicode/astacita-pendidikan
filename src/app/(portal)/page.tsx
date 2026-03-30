import { createClient } from '@/utils/supabase/server'
import NewsCard from '@/components/portal/NewsCard'
import Link from 'next/link'
import { Newspaper, TrendingUp, ArrowRight } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function BerandaPortal() {
  const supabase = await createClient()

  const { data: rawNews } = await supabase
    .from('siaran_pers')
    .select(`
      id,
      judul,
      kategori,
      tgl_posting,
      foto_url,
      isi_sp,
      sekolah (
        nama_sekolah
      )
    `)
    .eq('status', 'approved')
    .order('tgl_posting', { ascending: false })

  const allNews = rawNews || []
  
  // Ambil 4 berita teratas untuk Hero Grid
  const heroNews = allNews.slice(0, 4)
  const restNews = allNews.slice(4)

  // Filter berdasarkan kolom kategori (langsung dari DB, bukan regex nama sekolah)
  const kategoriSections = [
    { key: 'DIKMEN', label: 'DIKMEN · SMA / SMK', color: 'border-emerald-500', slug: 'dikmen' },
    { key: 'DIKDAS', label: 'DIKDAS · SD / SMP', color: 'border-blue-500', slug: 'dikdas' },
    { key: 'PAUD', label: 'PAUD · TK / KB', color: 'border-pink-500', slug: 'paud' },
    { key: 'Prestasi', label: 'Prestasi', color: 'border-yellow-500', slug: 'prestasi' },
  ]

  const getSekolahName = (item: Record<string, unknown>) => {
    const sekolah = item.sekolah as unknown as { nama_sekolah: string } | null
    return sekolah?.nama_sekolah || 'Anonim'
  }

  const formatTgl = (dateStr: string) => {
    try {
      return new Date(dateStr).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' }).toUpperCase()
    } catch { return dateStr }
  }

  const kategoriColors: Record<string, string> = {
    'PAUD': 'bg-pink-600', 'DIKDAS': 'bg-blue-600', 'DIKMEN': 'bg-emerald-600',
    'Opini': 'bg-indigo-600', 'Prestasi': 'bg-yellow-500', 'Kegiatan': 'bg-teal-600',
    'Pengumuman': 'bg-orange-600', 'default': 'bg-red-600'
  }

  // Hero Tile Component (inline)
  const HeroTile = ({ item, size }: { item: Record<string, unknown>, size: 'lg' | 'md' | 'sm' }) => {
    const badge = kategoriColors[(item.kategori as string)] || kategoriColors['default']
    return (
      <Link 
        href={`/berita/${item.id}`}
        className={`group relative overflow-hidden rounded-xl block ${
          size === 'lg' ? 'row-span-2 min-h-[420px]' : 
          size === 'md' ? 'row-span-2 min-h-[420px]' : 'min-h-[200px]'
        }`}
      >
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          {(item.foto_url as string) ? (
            <img src={item.foto_url as string} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-900"></div>
          )}
          {/* Dark overlay - gradient from bottom */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent"></div>
        </div>
        
        {/* Content overlay */}
        <div className="relative z-10 h-full flex flex-col justify-end p-5">
          {/* Category Badge */}
          <div className="mb-auto pt-1">
            <span className={`${badge} text-white text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-md shadow-lg`}>
              @{item.kategori as string}
            </span>
          </div>
          
          {/* Title */}
          <h3 className={`text-white font-bold font-[family-name:var(--font-oswald)] leading-tight mb-2 group-hover:text-blue-300 transition-colors ${
            size === 'lg' ? 'text-xl lg:text-2xl' : 
            size === 'md' ? 'text-lg' : 'text-sm'
          }`}>
            {item.judul as string}
          </h3>
          
          {/* Meta */}
          <div className="flex items-center text-[10px] text-slate-300/80 font-medium space-x-2">
            <span className="uppercase font-bold">{getSekolahName(item)}</span>
            <span className="text-slate-500">◆</span>
            <span>{formatTgl(item.tgl_posting as string)}</span>
          </div>
        </div>
      </Link>
    )
  }

  return (
    <div className="bg-slate-50">
      
      {/* ═══ HERO GRID (Majalah Style) ═══ */}
      {heroNews.length > 0 ? (
        <section className="bg-slate-950 pt-4 pb-6">
          <div className="container mx-auto px-4 lg:px-8">
            {heroNews.length >= 4 ? (
              /* Full 4-tile grid: Large | Medium | 2 Small stacked */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-3 auto-rows-auto">
                {/* Large tile - left */}
                <div className="lg:col-span-5 lg:row-span-2">
                  <HeroTile item={heroNews[0]} size="lg" />
                </div>
                {/* Medium tile - center */}
                <div className="lg:col-span-4 lg:row-span-2">
                  <HeroTile item={heroNews[1]} size="md" />
                </div>
                {/* Two small tiles - right, stacked */}
                <div className="lg:col-span-3 flex flex-col gap-3">
                  <HeroTile item={heroNews[2]} size="sm" />
                  <HeroTile item={heroNews[3]} size="sm" />
                </div>
              </div>
            ) : (
              /* Fewer than 4 articles: simpler grid */
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {heroNews.map((item, i) => (
                  <HeroTile key={item.id as string} item={item} size={i === 0 ? 'lg' : 'sm'} />
                ))}
              </div>
            )}
          </div>
        </section>
      ) : (
        <section className="bg-slate-50 py-24 text-center border-b border-slate-200">
           <div className="container mx-auto px-4">
             <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
               <Newspaper size={32} className="text-slate-300" />
             </div>
             <h2 className="text-2xl font-bold text-slate-600">Belum ada Siaran Pers yang dipublikasikan.</h2>
             <p className="text-slate-400 mt-2 text-sm max-w-md mx-auto">Kembali beberapa waktu lagi untuk pembaruan jurnalistik terbaru dari satuan pendidikan.</p>
           </div>
        </section>
      )}


      {/* ═══ RILISAN TERBARU ═══ */}
      <section className="container mx-auto px-4 lg:px-8 py-14">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-3">
            <div className="w-1 h-8 bg-blue-600 rounded-full"></div>
            <h2 className="text-2xl font-bold font-[family-name:var(--font-oswald)] text-slate-900 uppercase tracking-wide">
              Rilisan Terbaru
            </h2>
          </div>
          {restNews.length > 4 && (
            <Link href="/pencarian?q=" className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1 transition">
              Lihat Semua <ArrowRight size={12} />
            </Link>
          )}
        </div>
        
        {restNews.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {restNews.slice(0, 8).map((item: Record<string, unknown>) => (
              <NewsCard 
                key={item.id as string}
                id={item.id as string}
                judul={item.judul as string}
                kategori={item.kategori as string}
                tgl_posting={item.tgl_posting as string}
                nama_sekolah={getSekolahName(item)}
                foto_url={item.foto_url as string | null}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 bg-slate-50 rounded-2xl border border-slate-100">
            <Newspaper size={36} className="text-slate-200 mx-auto mb-3" />
            <p className="text-slate-400 text-sm">Belum ada rilis berita susulan saat ini.</p>
          </div>
        )}
      </section>


      {/* ═══ KATEGORI SECTIONS ═══ */}
      {kategoriSections.map((section) => {
        const sectionNews = restNews.filter(
          (n: Record<string, unknown>) => (n.kategori as string) === section.key
        )
        if (sectionNews.length === 0) return null

        return (
          <section key={section.key} className="container mx-auto px-4 lg:px-8 py-10">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center space-x-3">
                <div className={`w-1 h-8 ${section.color} rounded-full`}></div>
                <h2 className="text-xl font-bold font-[family-name:var(--font-oswald)] text-slate-900 uppercase tracking-wide">
                  {section.label}
                </h2>
              </div>
              <Link 
                href={`/kategori/${section.slug}`} 
                className="text-xs font-semibold text-slate-500 hover:text-blue-600 flex items-center gap-1 transition"
              >
                Lihat Semua <ArrowRight size={12} />
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {sectionNews.slice(0, 4).map((item: Record<string, unknown>) => (
                <NewsCard 
                  key={item.id as string}
                  id={item.id as string}
                  judul={item.judul as string}
                  kategori={item.kategori as string}
                  tgl_posting={item.tgl_posting as string}
                  nama_sekolah={getSekolahName(item)}
                  foto_url={item.foto_url as string | null}
                />
              ))}
            </div>
          </section>
        )
      })}


      {/* ═══ CTA BANNER ═══ */}
      <section className="bg-slate-900 text-white mt-8">
        <div className="container mx-auto px-4 lg:px-8 py-16 text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-600/20">
              <TrendingUp size={24} />
            </div>
            <h2 className="text-2xl lg:text-3xl font-bold font-[family-name:var(--font-oswald)] uppercase tracking-wide mb-3">
              Publikasikan Kabar Sekolah Anda
            </h2>
            <p className="text-slate-400 text-sm leading-relaxed max-w-md mx-auto mb-8">
              Daftarkan sekolah Anda di Astacita Pendidikan dan mulai bagikan siaran pers kepada publik secara terverifikasi dan profesional.
            </p>
            <div className="flex items-center justify-center space-x-3">
              <Link href="/daftar" className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold px-6 py-3 rounded-lg transition-colors shadow-lg shadow-blue-600/20">
                Daftar Sekarang
              </Link>
              <Link href="/login" className="border border-slate-700 hover:border-slate-600 text-slate-300 hover:text-white text-sm font-medium px-6 py-3 rounded-lg transition-all">
                Masuk
              </Link>
            </div>
          </div>
        </div>
      </section>

    </div>
  )
}
