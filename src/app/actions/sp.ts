'use server'

import { createClient, createServiceClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'
import crypto from 'crypto'

export async function submitSiaranPers(prevState: any, formData: FormData) {
  const judul = formData.get('judul') as string
  const kategori = formData.get('kategori') as string
  const isi_sp = formData.get('isi_sp') as string
  const foto = formData.get('foto') as File | null

  if (!judul || !kategori || !isi_sp) {
    return { error: 'Judul, Kategori, dan Isi Berita wajib diisi.' }
  }

  const supabase = await createClient()
  const serviceRole = createServiceClient() // Gunakan service role untuk memotong RLS saat pencarian data internal

  // 1. Dapatkan Data User dari Auth yang sedang aktif
  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return { error: 'Sesi Anda telah berakhir. Silakan login kembali.' }
  }

  // Cari profil di tabel users menggunakan service_role
  // Menggunakan limit(1) daripada .single() untuk menghindari Error JSON Coerce
  const { data: usersData, error: userError } = await serviceRole
    .from('users')
    .select('npsn')
    .eq('id', user.id)
    .limit(1)

  if (userError || !usersData || usersData.length === 0) {
    return { 
       error: `Sistem Gagal Menemukan Profil Anda. (Error: ${userError?.message || 'Kosong'}) (ID: ${user.id})`
    }
  }

  const npsn = usersData[0].npsn

  // 2. Cek Kuota di Tabel kuota_sp menggunakan service_role
  const { data: listKuota, error: kuotaError } = await serviceRole
    .from('kuota_sp')
    .select('jatah_bulan_ini, terpakai_bulan_ini')
    .eq('npsn', npsn)
    .limit(1)

  if (kuotaError || !listKuota || listKuota.length === 0) {
    return { error: `Data dompet kuota tidak ditemukan untuk NPSN ${npsn}. Harap ke Supabase dan buat barisnya manual atau hubungi admin.` }
  }

  const kuotaData = listKuota[0]

  if (kuotaData.terpakai_bulan_ini >= kuotaData.jatah_bulan_ini) {
    return { error: 'Gagal Mengirim: Kuota rilis bulan ini telah habis.' }
  }

  // 3. Logika Upload Gambar ke Storage (jika ada file yang dipilih)
  let foto_url = null
  if (foto && foto.size > 0) {
    // Validasi Tipe File (hanya gambar)
    if (!foto.type.startsWith('image/')) {
       return { error: 'File yang diunggah harus berupa gambar (JPG/PNG/WebP).' }
    }

    // Buat nama file unik
    const fileExtension = foto.name.split('.').pop()
    const fileName = `${npsn}_${crypto.randomUUID()}.${fileExtension}`

    const { data: uploadData, error: uploadError } = await serviceRole.storage
      .from('sp-images')
      .upload(fileName, foto)

    if (uploadError) {
      if (uploadError.stack?.includes('Bucket not found') || uploadError.message.includes('Bucket not found')) {
         return { error: 'ERROR SISTEM: Bucket `sp-images` belum dibuat oleh Admin.' }
      }
      return { error: 'Gagal mengunggah foto: ' + uploadError.message }
    }

    // Dapatkan Public URL
    const { data: publicUrlData } = serviceRole.storage
       .from('sp-images')
       .getPublicUrl(uploadData.path)

    foto_url = publicUrlData.publicUrl
  }

  // 4. Insert Berita ke tabel siaran_pers (Status: 'pending')
  // Menggunakan serviceRole untuk insert agar konsisten bypass intervensi RLS jika error policy
  const { error: insertError } = await serviceRole
    .from('siaran_pers')
    .insert({
      npsn,
      judul,
      kategori,
      isi_sp,
      foto_url,     // Bisa null jika user tidak upload foto
      status: 'pending' // Default tunggu ACC admin
    })

  if (insertError) {
    return { error: 'Gagal menyimpan berita: ' + insertError.message }
  }

  // 5. Potong Kuota: Naikkan `terpakai_bulan_ini` + 1 (Pakai serviceRole)
  const { error: updateKuotaError } = await serviceRole
    .from('kuota_sp')
    .update({ terpakai_bulan_ini: kuotaData.terpakai_bulan_ini + 1 })
    .eq('npsn', npsn)

  if (updateKuotaError) {
    // Kita catat saja error ini (atau buat mekanisme retry), asumsikan SP sudah berhasil masuk
    console.error('Gagal update kuota terpakai:', updateKuotaError.message)
  }

  // Revalidasi Paths agar dashboard auto-update status kuotanya
  revalidatePath('/dasbor')
  revalidatePath('/dasbor/riwayat')

  return { success: true }
}
