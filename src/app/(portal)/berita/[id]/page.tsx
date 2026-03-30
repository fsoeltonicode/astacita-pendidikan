import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, ExternalLink, Calendar, MapPin } from 'lucide-react'

// Menambahkan interface untuk Next.js 15 App Router properti page
interface PageProps {
  params: Promise<{ id: string }>
}

export default async function BeritaDetail({ params }: PageProps) {
  const { id } = await params
  
  const supabase = await createClient()

  const { data: b, error } = await supabase
    .from('siaran_pers')
    .select(`
      *,
      sekolah (
        nama_sekolah,
        alamat,
        kab_kot,
        prov
      )
    `)
    .eq('id', id)
    .single()

  if (error || !b) {
    notFound()
  }

  // Jika status masih draft/pending, kita bisa sembunyikan atau biarkan (opsional, tergantung rule business)
  // Untuk saat ini kita anggap `/berita/[id]` hanya menampilkan yg approved
  if (b.status !== 'approved') {
    notFound()
  }

  const namaSekolah = (b.sekolah as any)?.nama_sekolah || 'Anonim'
  const lokasiSekolah = (b.sekolah as any) ? `${(b.sekolah as any).kab_kot}, ${(b.sekolah as any).prov}` : ''

  const tgl = new Date(b.tgl_posting).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })

  return (
    <article className="pb-24">
      {/* Header / Thumbnail Hero */}
      <div className="bg-slate-900 border-t border-slate-800 relative w-full h-[40vh] md:h-[55vh] flex items-end justify-center">
        {b.foto_url ? (
          <>
            <div className="absolute inset-0 z-0">
               <img 
                 src={b.foto_url} 
                 alt={b.judul} 
                 className="w-full h-full object-cover opacity-40"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/70 to-transparent"></div>
            </div>
          </>
        ) : (
          <div className="absolute inset-0 z-0 bg-slate-900 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(29,78,216,0.3),rgba(255,255,255,0))]"></div>
        )}

        <div className="container mx-auto px-4 lg:px-8 relative z-10 pb-12 max-w-4xl">
           <Link href="/" className="inline-flex items-center text-blue-400 hover:text-white mb-6 text-sm font-medium transition-colors">
              <ArrowLeft size={16} className="mr-2" /> Kembali ke Portal
           </Link>
           
           <div className="mb-4">
             <span className="bg-blue-600 text-white text-xs uppercase px-3 py-1 font-bold tracking-widest rounded-sm border border-blue-500">
               {b.kategori}
             </span>
           </div>
           
           <h1 className="text-3xl md:text-5xl font-bold text-white font-[family-name:var(--font-oswald)] leading-snug lg:leading-tight mb-6">
             {b.judul}
           </h1>

           <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6 text-slate-300 text-sm font-medium">
             <div className="flex items-center">
               <span className="w-8 h-8 rounded-full bg-slate-700 font-bold flex items-center justify-center mr-3 text-slate-200 border border-slate-600">
                 {namaSekolah.charAt(0)}
               </span>
               <span className="font-semibold text-slate-100">{namaSekolah}</span>
             </div>
             
             <div className="flex items-center text-slate-400">
                <Calendar size={14} className="mr-2" />
                {tgl}
             </div>

             {lokasiSekolah && (
               <div className="flex items-center text-slate-400">
                  <MapPin size={14} className="mr-2" />
                  {lokasiSekolah}
               </div>
             )}
           </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="bg-white">
        <div className="container mx-auto px-4 lg:px-8 max-w-4xl -mt-6">
          <div className="bg-white rounded-xl shadow-lg border border-slate-100 p-6 md:p-12 relative z-20">
            
            {/* The Article Body - Render HTML dari Rich Text Editor */}
            <div 
              className="prose prose-slate prose-blue max-w-none text-slate-700 leading-relaxed lg:prose-lg font-sans"
              dangerouslySetInnerHTML={{ __html: b.isi_sp }}
            />

            {/* External Call to Action */}
            {b.link_url_publikasi && (
              <div className="mt-12 pt-8 border-t border-slate-200">
                <div className="bg-blue-50 rounded-lg p-6 border border-blue-100 flex flex-col sm:flex-row items-center justify-between">
                  <div className="mb-4 sm:mb-0">
                    <h4 className="text-slate-800 font-bold text-lg">Tertarik membaca rilis purnanya?</h4>
                    <p className="text-slate-600 text-sm mt-1">Sekolah yang bersangkutan mungkin mengunggah lampiran atau galeri tambahan di blog utama mereka.</p>
                  </div>
                  <a 
                    href={b.link_url_publikasi} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full sm:w-auto shrink-0 inline-flex items-center justify-center space-x-2 bg-slate-900 hover:bg-black text-white px-6 py-3 font-medium transition rounded-lg"
                  >
                    <span>Baca di Sumber Asli</span>
                    <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            )}
            
            <div className="mt-12 text-center">
              <p className="text-xs text-slate-400">Siaran Pers ID: {b.id}</p>
            </div>
            
          </div>
        </div>
      </div>
    </article>
  )
}
