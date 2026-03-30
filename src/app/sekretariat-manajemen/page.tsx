import { createServiceClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { Wallet, PieChart, ArrowUpRight, Calendar, Coins, Activity } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ManajemenDashboard() {
  const serviceClient = createServiceClient()

  // Ambil user dari sesi (Walau sudah dilindungi middleware, kita butuh pastikan role manajemen)
  const { data: { user } } = await serviceClient.auth.getUser()

  if (!user) {
    redirect('/sekretariat-manajemen/login')
  }

  // Double check role
  const { data: userData } = await serviceClient
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single()

  if (userData?.role !== 'manajemen') {
    redirect('/')
  }

  // Ambil Data Laporan Harian (Diurutkan dari terbaru, misal 30 hari terakhir)
  const { data: harianLaporan, error } = await serviceClient
    .from('laporan_keuangan')
    .select('*')
    .order('tanggal', { ascending: false })
    .limit(30)

  // Hitung Akumulasi Total
  let totalSpAccumulated = 0
  let totalDonasiAccumulated = 0
  let totalPos1 = 0; let totalPos2 = 0; let totalPos3 = 0; let totalPos4 = 0; let totalPos5 = 0;
  let totalPos6 = 0; let totalPos7 = 0; let totalPos8 = 0; let totalPos9 = 0;

  if (harianLaporan && harianLaporan.length > 0) {
     harianLaporan.forEach((lap: any) => {
        totalSpAccumulated += lap.total_sp || 0
        totalDonasiAccumulated += lap.total_donasi || 0
        totalPos1 += lap.p1_rp || 0
        totalPos2 += lap.p2_rp || 0
        totalPos3 += lap.p3_rp || 0
        totalPos4 += lap.p4_rp || 0
        totalPos5 += lap.p5_rp || 0
        totalPos6 += lap.p6_rp || 0
        totalPos7 += lap.p7_rp || 0
        totalPos8 += lap.p8_rp || 0
        totalPos9 += lap.p9_rp || 0
     })
  }

  const formatIDR = (num: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(num)
  }

  const POS_NAMES = [
     { key: 'p1', nama: 'Biaya Web Server', nilai: totalPos1, pct: 20 },
     { key: 'p2', nama: 'Dana Tabungan Pengembangan', nilai: totalPos2, pct: 15 },
     { key: 'p3', nama: 'Biaya Developer A', nilai: totalPos3, pct: 10 },
     { key: 'p4', nama: 'Biaya Developer B', nilai: totalPos4, pct: 10 },
     { key: 'p5', nama: 'Tim Promosi Luar', nilai: totalPos5, pct: 10 },
     { key: 'p6', nama: 'Editor Berita', nilai: totalPos6, pct: 10 },
     { key: 'p7', nama: 'Customer Service', nilai: totalPos7, pct: 10 },
     { key: 'p8', nama: 'Humas Utama Pusat', nilai: totalPos8, pct: 10 },
     { key: 'p9', nama: 'Donasi Yatim Web', nilai: totalPos9, pct: 5 }
  ]

  return (
    <div className="flex flex-col space-y-8 pb-20">

      {/* Hero Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
         
         <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition group-hover:scale-110">
               <Wallet size={80} className="text-blue-500" />
            </div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1 z-10 relative">Total Pemasukan Kotor</p>
            <h2 className="text-3xl font-bold text-white z-10 relative font-[family-name:var(--font-oswald)] tracking-wide">
               {formatIDR(totalDonasiAccumulated)}
            </h2>
            <div className="mt-4 flex items-center text-xs font-bold text-emerald-400 bg-emerald-400/10 w-fit px-2 py-1 rounded">
               <ArrowUpRight size={14} className="mr-1" />
               Total {totalSpAccumulated} Kuota SP Terjual
            </div>
         </div>

         <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition group-hover:scale-110">
               <PieChart size={80} className="text-amber-500" />
            </div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1 z-10 relative">Estimasi Bersih Developer</p>
            <h2 className="text-3xl font-bold text-white z-10 relative font-[family-name:var(--font-oswald)] tracking-wide">
               {formatIDR(totalPos3 + totalPos4)}
            </h2>
            <div className="mt-4 flex items-center text-xs font-bold text-amber-400 bg-amber-400/10 w-fit px-2 py-1 rounded">
               <Activity size={14} className="mr-1" />
               Pos 3 & Pos 4 (20%)
            </div>
         </div>

         <div className="bg-slate-800 border border-slate-700 p-8 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-6 opacity-10 group-hover:opacity-20 transition group-hover:scale-110">
               <Coins size={80} className="text-purple-500" />
            </div>
            <p className="text-slate-400 font-bold text-xs uppercase tracking-widest mb-1 z-10 relative">Dana Sosial (Pos 9)</p>
            <h2 className="text-3xl font-bold text-white z-10 relative font-[family-name:var(--font-oswald)] tracking-wide">
               {formatIDR(totalPos9)}
            </h2>
            <div className="mt-4 flex items-center text-xs font-bold text-purple-400 bg-purple-400/10 w-fit px-2 py-1 rounded">
               <Calendar size={14} className="mr-1" />
               Persentase Tetap (5%)
            </div>
         </div>

      </div>

      {/* Grid: Akumulasi per Pos (Kiri) & Laporan Harian (Kanan) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         
         <div className="col-span-1 border border-slate-800 bg-slate-800/50 rounded-2xl p-6 h-fit">
            <div className="mb-6 flex justify-between items-center border-b border-slate-700 pb-4">
               <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Detail 9 Pos Keuangan</h3>
               <span className="bg-slate-700 text-xs px-2 py-1 rounded font-bold text-slate-300">Akumulatif</span>
            </div>
            <div className="space-y-4">
               {POS_NAMES.map(pos => (
                 <div key={pos.key} className="flex flex-col">
                    <div className="flex justify-between text-sm mb-1">
                       <span className="text-slate-400 font-medium">{pos.nama} <span className="text-xs text-slate-500">[{pos.pct}%]</span></span>
                       <span className="text-slate-200 font-bold">{formatIDR(pos.nilai)}</span>
                    </div>
                    {/* Visual Bar */}
                    <div className="w-full bg-slate-700 h-1.5 rounded-full overflow-hidden">
                       <div 
                         className="bg-blue-500 h-full rounded-full" 
                         style={{ 
                            width: totalDonasiAccumulated === 0 
                              ? '0%' 
                              : `${(pos.nilai / totalDonasiAccumulated) * 100}%` 
                         }} 
                       />
                    </div>
                 </div>
               ))}
            </div>
         </div>

         <div className="col-span-1 lg:col-span-2 border border-slate-800 bg-slate-800/50 rounded-2xl overflow-hidden flex flex-col">
            <div className="p-6 border-b border-slate-700 flex justify-between items-center bg-slate-900/30">
               <h3 className="text-sm font-bold text-slate-200 uppercase tracking-widest">Tabel Buku Besar (Harian)</h3>
               <button className="text-xs bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1.5 rounded shadow-lg transition">Export Data</button>
            </div>
            
            <div className="overflow-x-auto flex-1 custom-scrollbar">
               <table className="w-full text-left text-sm text-slate-300 border-collapse">
                 <thead className="bg-slate-900/80 text-xs uppercase font-bold text-slate-500 border-b border-slate-700">
                    <tr>
                       <th className="px-6 py-4">Tanggal Order</th>
                       <th className="px-6 py-4 text-center">Jml SP</th>
                       <th className="px-6 py-4">Masuk Kotor</th>
                       <th className="px-6 py-4">Pos 1 (Web)</th>
                       <th className="px-6 py-4 text-red-400">Pos 9 (Sedekah)</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-800 font-medium">
                    {harianLaporan && harianLaporan.length > 0 ? (
                      harianLaporan.map((row: any) => (
                        <tr key={row.id} className="hover:bg-slate-800/30 transition">
                           <td className="px-6 py-4 whitespace-nowrap">
                             {new Date(row.tanggal).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                           </td>
                           <td className="px-6 py-4 text-center">
                             <span className="bg-blue-900/30 text-blue-400 w-6 h-6 rounded flex items-center justify-center mx-auto text-xs">{row.total_sp}</span>
                           </td>
                           <td className="px-6 py-4 text-emerald-400 font-bold whitespace-nowrap">
                             {formatIDR(row.total_donasi)}
                           </td>
                           <td className="px-6 py-4 text-slate-400 whitespace-nowrap">
                             {formatIDR(row.p1_rp)}
                           </td>
                           <td className="px-6 py-4 text-purple-400 whitespace-nowrap">
                             {formatIDR(row.p9_rp)}
                           </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                           <Activity size={32} className="mx-auto mb-2 text-slate-700" />
                           Belum ada catatan buku besar. Sistem menunggu transaksi SP pertama.
                        </td>
                      </tr>
                    )}
                 </tbody>
               </table>
            </div>
         </div>

      </div>
    </div>
  )
}
