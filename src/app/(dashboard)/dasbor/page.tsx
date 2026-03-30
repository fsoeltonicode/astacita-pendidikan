import { createClient, createServiceClient } from '@/utils/supabase/server'
import { redirect } from 'next/navigation'
import { 
  Trophy, 
  Send, 
  PlusCircle, 
  Clock, 
  CheckCircle2, 
  AlertCircle 
} from 'lucide-react'

export default async function DashboardPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const serviceClient = createServiceClient()

  // Ambil Data Profil User dari tabel (bypass RLS)
  const { data: usersData } = await serviceClient
    .from('users')
    .select('npsn, nama_narahubung, sekolah(nama_sekolah)')
    .eq('id', user.id)
    .limit(1)

  const userData = usersData?.[0] || null

  // Ambil Data Kuota dari tabel (bypass RLS)
  const { data: kuotaData } = await serviceClient
    .from('kuota_sp')
    .select('*')
    .eq('npsn', userData?.npsn)
    .limit(1)

  const kuota = kuotaData?.[0] || null

  const stats = [
    { name: 'Saldo Kuota', value: kuota?.total_saldo_kuota || 0, icon: PlusCircle, color: 'text-blue-600', bg: 'bg-blue-50' },
    { name: 'Kuota Bulan Ini', value: kuota?.jatah_bulan_ini || 0, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
    { name: 'Terpakai (Bulan Ini)', value: kuota?.terpakai_bulan_ini || 0, icon: Send, color: 'text-emerald-600', bg: 'bg-emerald-50' },
  ]

  return (
    <div className="flex flex-col space-y-8">
      {/* Welcome Message */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-slate-800 font-[family-name:var(--font-oswald)] uppercase">
          Selamat Datang, {userData?.nama_narahubung || 'Narahubung'}
        </h1>
        <p className="text-slate-500 text-sm">
          Sekretariat Humas: <span className="font-semibold text-blue-700">{(userData?.sekolah as any)?.nama_sekolah || 'Nama Sekolah'}</span> (NPSN: {userData?.npsn})
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center space-x-4">
            <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 uppercase tracking-wider">{stat.name}</p>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Main Actions / Quick Links */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-4">
        
        {/* Kuota Information Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-bold text-slate-800 uppercase text-sm font-[family-name:var(--font-oswald)]">Info Kuota Rilis Berita</h3>
            <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-1 rounded font-bold">STATUS AKTIF</span>
          </div>
          <div className="p-6 flex flex-col space-y-4">
             <div className="bg-blue-50 border border-blue-100 p-4 rounded-lg flex items-start space-x-3 text-sm text-blue-800">
                <AlertCircle size={20} className="shrink-0" />
                <p>
                  Sisa kuota bulan ini akan <strong>hangus</strong> otomatis setiap tanggal 1 jam 00:00. Pastikan Anda merilis Siaran Pers tepat waktu!
                </p>
             </div>
             
             <div className="flex flex-col space-y-2 pt-2">
                <button className="w-full bg-blue-700 hover:bg-blue-800 text-white font-semibold py-3 rounded-lg transition text-sm">
                   Beli Saldo Kuota Baru
                </button>
             </div>
          </div>
        </div>

        {/* Quick Help Card */}
        <div className="bg-slate-900 text-white rounded-xl shadow-xl overflow-hidden p-8 flex flex-col justify-between relative">
           <div className="relative z-10">
              <h3 className="text-xl font-bold font-[family-name:var(--font-oswald)] uppercase mb-2">Butuh Bantuan?</h3>
              <p className="text-slate-400 text-sm leading-relaxed mb-6">
                Mengalami kendala saat pendaftaran NPSN atau ingin menanyakan alur kerja sama media Astacita Pendidikan?
              </p>
              <a 
                href="https://wa.me/628123456789" 
                target="_blank" 
                className="inline-flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2.5 rounded-lg font-medium transition"
              >
                <span>Hubungi Admin WA</span>
              </a>
           </div>
           <div className="absolute -right-10 -bottom-10 opacity-10 text-white rotate-12">
              <Trophy size={180} />
           </div>
        </div>

      </div>
    </div>
  )
}
