import { createClient } from '@/utils/supabase/server'
import NewsCard from '@/components/portal/NewsCard'
import Link from 'next/link'
import { Search, AlertCircle } from 'lucide-react'

// Next.js 15 Server Component Params/SearchParams
interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export default async function PencarianPage({ searchParams }: SearchPageProps) {
  const resolvedParams = await searchParams
  const query = typeof resolvedParams.q === 'string' ? resolvedParams.q : ''
  const isSearchEmpty = query.trim() === ''

  const supabase = await createClient()

  let results: any[] = []

  if (!isSearchEmpty) {
    // 1. Cari berdasarkan Judul SP
    const { data: byTitle } = await supabase
      .from('siaran_pers')
      .select(`id, judul, kategori, tgl_posting, foto_url, sekolah(nama_sekolah, npsn)`)
      .eq('status', 'approved')
      .ilike('judul', `%${query}%`)
      .order('tgl_posting', { ascending: false })

    // 2. Cari berdasarkan Nama Sekolah (Ketik NPSN/Sekolah)
    const { data: bySchool } = await supabase
      .from('siaran_pers')
      .select(`id, judul, kategori, tgl_posting, foto_url, sekolah!inner(nama_sekolah, npsn)`)
      .eq('status', 'approved')
      .or(`nama_sekolah.ilike.%${query}%,npsn.ilike.%${query}%`, { foreignTable: 'sekolah' })
      .order('tgl_posting', { ascending: false })

    // Gabungkan array & buang duplikat berdasarkan ID
    const combined = [...(byTitle || []), ...(bySchool || [])]
    results = combined.filter((v, i, a) => a.findIndex(t => (t.id === v.id)) === i)
    // Urut ulang hasil gabungan
    results.sort((a, b) => new Date(b.tgl_posting).getTime() - new Date(a.tgl_posting).getTime())
  }

  return (
    <div className="min-h-[60vh] bg-slate-50 py-12">
      <div className="container mx-auto px-4 lg:px-8">
        
        {/* Header Pencarian */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-8 text-center max-w-3xl mx-auto mb-12">
          <div className="w-16 h-16 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center mx-auto mb-4">
             <Search size={32} />
          </div>
          <h1 className="text-3xl font-bold text-slate-900 font-[family-name:var(--font-oswald)] uppercase mb-2">
            Hasil Pencarian
          </h1>
          <p className="text-slate-500 text-lg">
            Menampilkan hasil untuk: <span className="font-bold text-blue-700">"{query}"</span>
          </p>
        </div>

        {isSearchEmpty ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200 shadow-sm max-w-3xl mx-auto">
             <AlertCircle size={48} className="text-amber-400 mx-auto mb-4" />
             <h2 className="text-xl font-bold text-slate-700">Kata kunci kosong</h2>
             <p className="text-slate-500 mt-2">Silakan ketik sesuatu di kotak pencarian di atas untuk mulai mencari berita.</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl border border-slate-200 shadow-sm max-w-3xl mx-auto">
             <div className="text-6xl mb-4">🕵️‍♂️</div>
             <h2 className="text-2xl font-bold text-slate-800">Tidak ada berita yang cocok</h2>
             <p className="text-slate-500 mt-2 max-w-md mx-auto">
               Maaf, kami tidak menemukan siaran pers yang mengandung kata kunci <strong className="text-slate-800">{query}</strong> pada judul maupun profil instansi sekolah.
             </p>
             <Link href="/" className="inline-block mt-6 px-6 py-2 bg-blue-700 text-white rounded-full font-medium hover:bg-blue-800 transition">
               Kembali ke Beranda
             </Link>
          </div>
        ) : (
          <div>
            <div className="flex items-center justify-between border-b-2 border-slate-200 pb-2 mb-8">
               <h2 className="text-lg font-bold text-slate-800">
                 Ditemukan {results.length} berita
               </h2>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {results.map((item: any) => (
                <NewsCard 
                  key={item.id}
                  id={item.id}
                  judul={item.judul}
                  kategori={item.kategori}
                  tgl_posting={item.tgl_posting}
                  nama_sekolah={(item.sekolah as any)?.nama_sekolah || 'Anonim'}
                  foto_url={item.foto_url}
                />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}
