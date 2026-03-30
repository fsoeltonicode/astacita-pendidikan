'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import toast from 'react-hot-toast'
import { submitSiaranPers } from '@/app/actions/sp'
import RichTextEditor from '@/components/dashboard/RichTextEditor'
import { Eye, Edit3, Send, Image as ImageIcon, CheckCircle2, AlertCircle } from 'lucide-react'

export default function KirimSPPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [isPreview, setIsPreview] = useState(false)
  
  // Form State
  const [judul, setJudul] = useState('')
  const [kategori, setKategori] = useState('Kegiatan')
  const [isi, setIsi] = useState('')
  const [fotoUrl, setFotoUrl] = useState<string | null>(null)
  const [fotoFile, setFotoFile] = useState<File | null>(null)

  const KATEGORI_OPSI = ['Prestasi', 'Kegiatan', 'Pengumuman', 'Opini', 'Profil', 'Fasilitas', 'Lainnya']

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      if (!file.type.startsWith('image/')) {
        toast.error('Harap unggah file dokumen gambar.')
        return
      }
      if (file.size > 2 * 1024 * 1024) { // 2MB
        toast.error('Ukuran foto terlalu besar. Maksimal 2MB.')
        return
      }
      setFotoFile(file)
      setFotoUrl(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    
    if (!judul || judul.length < 5) return toast.error('Judul terlalu pendek. Minimal 5 karakter.')
    if (isi.replace(/<[^>]*>?/gm, '').trim() === '') return toast.error('Isi berita tidak boleh dibiarkan kosong.')
    if (!fotoFile) return toast.error('Mohon unggah satu foto utama untuk sampul berita Anda.')

    setLoading(true)
    
    // Siapkan FormData
    const formData = new FormData()
    formData.append('judul', judul)
    formData.append('kategori', kategori)
    formData.append('isi_sp', isi)
    formData.append('foto', fotoFile)

    const res = await submitSiaranPers(null, formData)
    
    if (res?.error) {
      toast.error(res.error)
      setLoading(false)
    } else {
      toast.success('Hebat! Siaran Pers berhasil dikirim ke ruang redaksi.')
      router.push('/dasbor/riwayat') // Arahkan ke riwayat nanti
    }
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col space-y-6">
      <div className="flex items-center justify-between pb-4 border-b border-slate-200">
        <div>
           <h1 className="text-2xl font-bold text-slate-800 font-[family-name:var(--font-oswald)] uppercase">
             {isPreview ? 'Pratinjau Berita' : 'Tulis Siaran Pers Baru'}
           </h1>
           <p className="text-sm text-slate-500 mt-1">
             {isPreview ? 'Pastikan ejaan dan gambar sudah sempurna sebelum dikirim ke redaksi.' : 'Berita Anda akan dibaca oleh ribuan orang. Pastikan berkualitas.'}
           </p>
        </div>
        <button
          type="button"
          onClick={() => setIsPreview(!isPreview)}
          className={`flex items-center space-x-2 px-4 py-2 rounded-full text-sm font-medium transition ${
             isPreview 
               ? 'bg-slate-100 text-slate-700 hover:bg-slate-200' 
               : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
          }`}
        >
          {isPreview ? (
            <><Edit3 size={16} /><span>Kembali Edit</span></>
          ) : (
            <><Eye size={16} /><span>Lihat Pratinjau</span></>
          )}
        </button>
      </div>

      {!isPreview ? (
        // MODE EDIT
        <form onSubmit={(e) => { e.preventDefault(); setIsPreview(true); }} className="space-y-6 bg-white p-6 md:p-8 rounded-xl border border-slate-200 shadow-sm relative">
           
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
             <div className="md:col-span-2 flex flex-col space-y-2">
                <label className="text-sm font-bold text-slate-700">Judul Berita Singkat & Menarik <span className="text-red-500">*</span></label>
                <input 
                  type="text"
                  value={judul}
                  onChange={(e) => setJudul(e.target.value)}
                  placeholder="Contoh: Siswa SMAN 1 Jakarta Juarai Lomba Robotik Nasional..."
                  className="w-full border-slate-300 rounded-lg px-4 py-3 bg-slate-50 border focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition font-medium"
                  required
                />
             </div>
             
             <div className="flex flex-col space-y-2">
                <label className="text-sm font-bold text-slate-700">Kategori <span className="text-red-500">*</span></label>
                <select 
                  value={kategori}
                  onChange={(e) => setKategori(e.target.value)}
                  className="w-full border-slate-300 rounded-lg px-4 py-3 bg-slate-50 border focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500 outline-none transition"
                >
                  {KATEGORI_OPSI.map(kat => (
                    <option key={kat} value={kat}>{kat}</option>
                  ))}
                </select>
             </div>
           </div>

           <div className="flex flex-col space-y-2">
              <label className="text-sm font-bold text-slate-700">Foto Utama (Sampul) <span className="text-red-500">*</span></label>
              
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-slate-300 border-dashed rounded-lg bg-slate-50 hover:bg-slate-100 transition relative overflow-hidden group cursor-pointer">
                 {fotoUrl ? (
                   <>
                     <Image src={fotoUrl} alt="Preview Foto" fill className="object-cover z-0 opacity-40 group-hover:opacity-20 transition" />
                     <div className="z-10 relative flex flex-col items-center">
                        <CheckCircle2 size={40} className="text-emerald-500 mb-2" />
                        <span className="text-sm font-medium text-slate-800 bg-white/90 px-3 py-1 rounded-full">Foto telah dipilih (Klik untuk ganti)</span>
                     </div>
                   </>
                 ) : (
                   <div className="space-y-2 text-center z-10">
                    <ImageIcon className="mx-auto h-12 w-12 text-slate-400" />
                    <div className="flex text-sm text-slate-600 justify-center">
                      <span className="relative font-medium text-blue-600 hover:text-blue-500">
                        Unggah gambar
                      </span>
                      <p className="pl-1">atau tarik dan letakkan di sini</p>
                    </div>
                    <p className="text-xs text-slate-500">PNG, JPG up to 2MB. Resolusi Lanskap direkomendasikan.</p>
                  </div>
                 )}
                 <input 
                   type="file" 
                   accept="image/png, image/jpeg, image/webp" 
                   onChange={handleFotoChange}
                   className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20" 
                 />
              </div>
           </div>

           <div className="flex flex-col space-y-2">
              <label className="text-sm font-bold text-slate-700">Isi Berita (Teks Editor Premium) <span className="text-red-500">*</span></label>
              <div className="min-h-[300px]">
                 <RichTextEditor value={isi} onChange={setIsi} />
              </div>
           </div>

           <div className="pt-8 border-t border-slate-100 flex items-center justify-between">
              <div className="text-sm text-slate-500 flex items-center space-x-2">
                 <AlertCircle size={16} className="text-blue-500" />
                 <span>Pastikan Anda mereviu berita di Pratinjau.</span>
              </div>
              <button 
                type="submit" 
                className="bg-slate-800 hover:bg-slate-900 text-white font-medium px-8 py-3 rounded-lg transition"
              >
                Lanjut ke Pratinjau
              </button>
           </div>
        </form>
      ) : (
        // MODE REVIEW
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
           {/* Simulasi Tampilan Berita */}
           <div className="bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden max-w-3xl mx-auto">
              {fotoUrl && (
                <div className="w-full h-[400px] relative bg-slate-100">
                   <Image src={fotoUrl} alt={judul} fill className="object-cover" />
                </div>
              )}
              <div className="p-8 md:p-12">
                 <div className="mb-6 flex flex-wrap gap-2 text-sm text-slate-500">
                    <span className="font-semibold text-blue-700">{kategori}</span>
                    <span>•</span>
                    <span>Tgl. Rilis (Otomatis)</span>
                 </div>
                 <h1 className="text-3xl md:text-4xl font-bold text-slate-900 font-[family-name:var(--font-oswald)] uppercase leading-tight mb-8">
                    {judul || 'Judul Berita Belum Diisi'}
                 </h1>
                 
                 {/* Render HTML dari Quill */}
                 <div 
                   className="prose prose-slate prose-blue max-w-none text-slate-700" 
                   dangerouslySetInnerHTML={{ __html: isi || '<p class="text-slate-400 italic">Isi berita Anda masih kosong.</p>' }} 
                 />
              </div>
           </div>

           {/* Aksi Final */}
           <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-4 max-w-3xl mx-auto">
              <div>
                 <h3 className="font-bold text-blue-900">Siaran Pers Sudah Sempurna?</h3>
                 <p className="text-sm text-blue-800 mt-1">Mengklik Kirim akan otomatis <strong>memotong 1 kuota</strong> Anda bulan ini.</p>
              </div>
              <div className="flex items-center space-x-3 w-full md:w-auto">
                 <button 
                   onClick={() => setIsPreview(false)}
                   disabled={loading}
                   className="flex-1 md:flex-none px-6 py-3 border border-blue-300 text-blue-700 font-medium rounded-lg hover:bg-blue-100 transition"
                 >
                   Edit Lagi
                 </button>
                 <button 
                   onClick={() => handleSubmit()}
                   disabled={loading}
                   className="flex-1 md:flex-none px-6 py-3 bg-blue-700 hover:bg-blue-800 text-white font-medium rounded-lg shadow-md shadow-blue-200 flex items-center justify-center space-x-2 transition disabled:opacity-50"
                 >
                   {loading ? (
                     <span>Memproses...</span>
                   ) : (
                     <><Send size={18} /><span>Sudah Tepat & Kirim</span></>
                   )}
                 </button>
              </div>
           </div>
        </div>
      )}

    </div>
  )
}
