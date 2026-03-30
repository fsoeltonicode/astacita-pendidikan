'use client'

import { useState } from 'react'
import { PlusCircle, ShoppingCart, ShieldCheck, Zap, ArrowRight, Wallet } from 'lucide-react'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { createPaymentLink } from '@/app/actions/payment'

export default function OrderSPPage() {
  const [loading, setLoading] = useState(false)
  const [selectedPaket, setSelectedPaket] = useState<number | null>(null)

  const HARGA_PER_SP = 35000
  const PILIHAN_PAKET = [5, 10, 15, 20, 24]

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(angka)
  }

  const handleBeli = async () => {
    if (!selectedPaket) {
      toast.error('Silakan pilih salah satu paket terlebih dahulu.')
      return
    }

    setLoading(true)
    
    try {
      const result = await createPaymentLink({ jumlah_sp: selectedPaket })
      
      if (result.success && result.url) {
        toast.success('Pemesanan dicatat! Membuka gerbang pembayaran...')
        // Secara normal, untuk Mayar.id redirect total window:
        window.location.href = result.url
      } else {
        toast.error(result.error || 'Gagal memulai pemesanan. Coba lagi.')
      }
    } catch (err: any) {
      toast.error('Masalah koneksi jaringan ke gateway pembayaran.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto flex flex-col space-y-8">
      
      {/* Header */}
      <div className="flex flex-col flex-wrap border-b border-slate-200 pb-5">
         <h1 className="text-2xl font-bold text-slate-800 font-[family-name:var(--font-oswald)] uppercase flex items-center mb-1">
            <ShoppingCart className="mr-3 text-blue-700" />
            Top Up Saldo Kuota
         </h1>
         <p className="text-slate-500 text-sm">
            Beli saldo kuota rilis Siaran Pers untuk dibagikan secara berkala ke portal utama. Pembayaran akan didistribusikan langsung ke sistem manajemen via <strong className="text-blue-600">Mayar.id</strong>.
         </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {/* Left Side: Pilihan Paket */}
         <div className="md:col-span-2 flex flex-col space-y-4">
            <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-2">Pilih Jumlah Saldo SP</h2>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
               {PILIHAN_PAKET.map((jml) => {
                 const harga = jml * HARGA_PER_SP
                 const isSelected = selectedPaket === jml
                 
                 return (
                   <div 
                     key={jml}
                     onClick={() => setSelectedPaket(jml)}
                     className={`
                       relative cursor-pointer rounded-2xl border-2 transition-all duration-200 overflow-hidden bg-white hover:border-blue-700 hover:shadow-lg hover:shadow-blue-100 flex flex-col justify-between
                       ${isSelected ? 'border-blue-700 shadow-lg shadow-blue-100 bg-blue-50/50 scale-[1.02]' : 'border-slate-200'}
                     `}
                   >
                     {/* Badge Populer */}
                     {jml === 10 && (
                       <div className="absolute top-0 right-0 bg-amber-400 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl-lg uppercase tracking-wider">
                         Paling Laris
                       </div>
                     )}
                     
                     <div className="p-5 flex flex-col items-center justify-center text-center space-y-1">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-2 ${isSelected ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-500'}`}>
                           <span className="font-bold text-xl">{jml}</span>
                        </div>
                        <p className={`font-medium text-sm ${isSelected ? 'text-blue-800' : 'text-slate-600'}`}>Siaran Pers</p>
                        <p className={`text-xs ${isSelected ? 'text-blue-600/70' : 'text-slate-400'}`}>Tanpa Kedaluwarsa Saldo Master</p>
                     </div>
                     <div className={`py-3 text-center border-t border-slate-100 ${isSelected ? 'bg-blue-700 text-white' : 'bg-slate-50 text-slate-700'}`}>
                        <span className="font-bold text-base">{formatRupiah(harga)}</span>
                     </div>
                   </div>
                 )
               })}
            </div>
         </div>

         {/* Right Side: Ringkasan & Pembayaran */}
         <div className="flex flex-col space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden sticky top-8">
               <div className="p-5 border-b border-slate-100 bg-slate-50">
                  <h3 className="font-bold text-slate-800 flex items-center text-sm uppercase">
                    <Wallet size={16} className="mr-2 text-blue-600" /> Ringkasan Order
                  </h3>
               </div>
               
               <div className="p-5 space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500">Jumlah SP</span>
                    <span className="font-bold text-slate-800">{selectedPaket || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm border-b border-slate-100 pb-4">
                    <span className="text-slate-500">Harga Satuan</span>
                    <span className="font-medium text-slate-800">{formatRupiah(HARGA_PER_SP)}</span>
                  </div>
                  <div className="flex items-center justify-between text-lg pt-2">
                    <span className="font-bold text-slate-800 font-[family-name:var(--font-oswald)] uppercase">Total Bayar</span>
                    <span className="font-bold text-blue-700">
                      {selectedPaket ? formatRupiah(selectedPaket * HARGA_PER_SP) : 'Rp0'}
                    </span>
                  </div>
               </div>
               
               <div className="p-5 pt-0">
                  <button 
                    onClick={handleBeli}
                    disabled={!selectedPaket || loading}
                    className="w-full bg-blue-700 hover:bg-blue-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-3.5 rounded-xl shadow-md flex items-center justify-center transition-all group"
                  >
                    {loading ? (
                      <span className="animate-pulse">Menyiapkan Tagihan...</span>
                    ) : (
                      <>
                        <span>Lanjut ke Pembayaran</span>
                        <ArrowRight size={18} className="ml-2 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>
               </div>
            </div>

            <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl border border-emerald-100 flex items-start space-x-3 text-sm">
               <ShieldCheck size={20} className="shrink-0 mt-0.5 text-emerald-600" />
               <p className="leading-relaxed font-medium">
                 Transaksi aman & otomatis. Nomor Virtual Account, E-Wallet, atau QRIS diterbitkan resmi oleh Mayar.
               </p>
            </div>
         </div>
      </div>
    </div>
  )
}
