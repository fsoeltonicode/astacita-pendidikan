'use server'

import { createClient, createServiceClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

// Aksi untuk lookup data Sekolah ketika mengetik NPSN
export async function autoFetchSekolah(npsn: string) {
  if (!npsn || npsn.length < 8) return { success: false, data: null, error: null }
  
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('sekolah')
    .select('prov, kab_kot, kec, nama_sekolah, kepala_sekolah, status_ns')
    .eq('npsn', npsn)
    .single()

  if (error || !data) {
    return { success: false, data: null, error: 'Data sekolah tidak ditemukan.' }
  }

  return { success: true, data, error: null }
}

// Ambil profil user yang sedang login (untuk header dasbor)
export async function getUserProfile() {
  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()
  if (!user) return null

  const supabase = createServiceClient()
  const { data } = await supabase
    .from('users')
    .select('nama_narahubung, npsn, role, sekolah(nama_sekolah, status_dapodik)')
    .eq('id', user.id)
    .limit(1)

  if (!data || data.length === 0) return null

  return {
    nama_narahubung: data[0].nama_narahubung as string,
    npsn: data[0].npsn as string,
    role: data[0].role as string,
    nama_sekolah: (data[0].sekolah as any)?.nama_sekolah as string | null,
    status_dapodik: (data[0].sekolah as any)?.status_dapodik as string | null,
  }
}

// Aksi Pendaftaran Humas
export async function registerHumas(prevState: any, formData: FormData) {
  const npsn = formData.get('npsn') as string
  const email = formData.get('email') as string
  const nama_narahubung = formData.get('nama_narahubung') as string
  const no_wa = formData.get('no_wa') as string
  const password = formData.get('password') as string

  if (!npsn || !email || !nama_narahubung) {
    return { error: 'Harap lengkapi seluruh field wajib.' }
  }

  // Gunakan ServiceClient untuk SignUp dan Insert (karena Insert users butuh privilages auth)
  const supabase = createServiceClient()

  // 1. Create User di Supabase Auth menggunakan Admin API (Bypass konfirmasi email)
  const { data: authData, error: authError } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true, // Langsung konfirmasi agar user bisa login
    user_metadata: {
      nama_narahubung,
      role: 'humas',
    }
  })
  
  if (authError) {
    if (authError.message.includes('already registered')) {
       // Jika user sudah ada di Auth tapi tidak ada di table public.users, 
       // kita mungkin perlu melakukan sinkronisasi, tapi untuk sekarang kita beri pesan error.
       return { error: 'Email ini sudah terdaftar di sistem Auth.' }
    }
    return { error: 'Gagal membuat akun: ' + authError.message }
  }

  const userId = authData.user?.id

  if (!userId) {
     return { error: 'Gagal membuat user ID.' }
  }

  // 2. Insert into Tabel public.users
  const { error: dbError } = await supabase
    .from('users')
    .insert({
      id: userId,
      npsn,
      email,
      nama_narahubung,
      no_wa,
      role: 'humas' // Strict string 'humas'
    })

  if (dbError) {
    if (dbError.code === '23505') {
        return { error: 'NPSN atau Email ini sudah teregistrasi di database.'}
    }
    return { error: 'Terjadi kegagalan menyimpan profil: ' + dbError.message }
  }

  // 3. Inisialisasi Data Kuota (0) untuk sekolah baru
  const { error: kuotaError } = await supabase
    .from('kuota_sp')
    .insert({
      npsn,
      total_saldo_kuota: 0,
      jatah_bulan_ini: 0,
      terpakai_bulan_ini: 0
    })

  // Kita tidak perlu hentikan flow jika inisialisasi kuota gagal karena duplicate (siapa tahu sudah ada sebelumnya via admin)
  if (kuotaError && kuotaError.code !== '23505') {
     console.error("Gagal inisialisasi baris kuota:", kuotaError)
  }

  return { success: true }
}

// Aksi Login menggunakan NPSN
export async function loginWithNpsn(prevState: any, formData: FormData) {
  const npsn = formData.get('npsn') as string
  const password = formData.get('password') as string

  if (!npsn || !password) {
    return { error: 'NPSN dan kata sandi wajib diisi.' }
  }

  // 1. Lookup Email dari tabel Users menggunakan Service Client 
  // (Karena user belum login, mereka mungkin terblokir RLS `users` table jika menggunakan standard client)
  const serviceClient = createServiceClient()

  const { data: usersData, error: userError } = await serviceClient
    .from('users')
    .select('email')
    .eq('npsn', npsn)
    .limit(1)

  if (userError || !usersData || usersData.length === 0) {
    // Tampilkan pesan error bahasa Indonesia
    return { error: 'NPSN atau kata sandi salah.' }
  }

  const email = usersData[0].email

  // 2. Setelah dapat Email, lakukan standar Auth signIn (Client Biasa yang melampirkan Cookie user)
  const supabase = await createClient()

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError) {
    // Menyerap segala error invalid credentials
    return { error: 'NPSN atau kata sandi salah.' }
  }

  return { success: true }
}

// Aksi Login Khusus Email Terbatas (Super Admin / Manajemen)
export async function loginEmail(formData: FormData) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  const supabase = await createClient()

  const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (signInError || !authData.user) {
    return { error: 'Kredensial akses ditolak.' }
  }

  // Cek Role di tabel public.users untuk memastikan ini Manajemen
  const serviceClient = createServiceClient()
  const { data: userData } = await serviceClient
    .from('users')
    .select('role')
    .eq('id', authData.user.id)
    .limit(1)

  const role = userData?.[0]?.role
  
  if (role !== 'manajemen') {
    // Kalau dia bukan manajemen
    await supabase.auth.signOut()
    return { error: 'Otorisasi gagal. Anda tidak memiliki izin akses zona ini.' }
  }

  return { success: true }
}

// Aksi Logout
export async function logout() {
  const supabase = await createClient()
  await supabase.auth.signOut()
  revalidatePath('/', 'layout')
  return { success: true }
}

// Aksi Lupa Kata Sandi (Kirim Email Reset menggunakan NPSN)
export async function sendResetPasswordEmail(npsn: string) {
  if (!npsn || npsn.length < 8) return { error: 'Format NPSN tidak valid.' }

  const serviceClient = createServiceClient()

  // 1. Cari dulu email berdasarkan NPSN di tabel public.users
  const { data: userData, error: userError } = await serviceClient
    .from('users')
    .select('email, nama_narahubung')
    .eq('npsn', npsn)
    .limit(1)

  if (userError || !userData || userData.length === 0) {
    return { error: 'NPSN tidak terdaftar dalam sistem. Hubungi administrator.' }
  }

  const email = userData[0].email

  // 2. Suruh Supabase mengirimkan tautan reset ke Email tersebut
  const supabase = await createClient()
  
  const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/callback?next=/ganti-sandi-baru`,
  })

  if (resetError) {
    return { error: 'Sistem email pemulihan sedang sibuk. Coba beberapa saat lagi.' }
  }

  return { 
    success: true, 
    message: `Tautan pemulihan sandi telah dikirim ke email terdaftar milik Sdr/i. ${userData[0].nama_narahubung}. Silakan cek kotak masuk email Anda.` 
  }
}

// Aksi Update Sandi Baru (Digunakan setelah reset / di dalam Pengaturan)
export async function updateUserPassword(newPassword: string) {
  if (!newPassword || newPassword.length < 6) {
    return { error: 'Kata sandi minimal berisi 6 karakter.' }
  }

  const supabase = await createClient()
  
  const { error } = await supabase.auth.updateUser({
    password: newPassword
  })

  if (error) {
    return { error: 'Gagal memperbarui kata sandi. Sesi Anda mungkin sudah kedaluwarsa, silakan ulangi proses dari awal.' }
  }

  return { success: true, message: 'Kata sandi berhasil diperbarui.' }
}
