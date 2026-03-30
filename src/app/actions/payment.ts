'use server'

import { createClient, createServiceClient } from '@/utils/supabase/server'

interface OrderSPParams {
  jumlah_sp: number;
}

export async function createPaymentLink(params: OrderSPParams) {
  const { jumlah_sp } = params;
  const HARGA_PER_SP = 35000;
  const total_harga = jumlah_sp * HARGA_PER_SP;
  
  if (![5, 10, 15, 20, 24].includes(jumlah_sp)) {
     return { success: false, url: null, error: 'Jumlah SP tidak valid.' };
  }

  const sessionClient = await createClient()
  const { data: { user } } = await sessionClient.auth.getUser()

  if (!user) {
    return { success: false, url: null, error: 'Sesi kedaluwarsa. Silakan login kembali.' };
  }

  const supabase = createServiceClient()

  // 1. Ambil Data Sekolah/User untuk referensi pembayaran
  const { data: userData } = await supabase
    .from('users')
    .select('npsn, nama_narahubung, email, no_wa, sekolah(nama_sekolah)')
    .eq('id', user.id)
    .single()

  if (!userData) {
    return { success: false, url: null, error: 'Data profil sekolah tidak valid.' };
  }

  const transaksiId = crypto.randomUUID()

  // 2. Insert ke tabel transaksi_order (Status: Pending)
  const { error: insertError } = await supabase
    .from('transaksi_order')
    .insert({
      id: transaksiId,
      npsn: userData.npsn,
      jumlah_sp,
      total_harga,
      status: 'pending'
    })

  if (insertError) {
    console.error('Insert Transaksi Error:', insertError)
    return { success: false, url: null, error: 'Gagal membuat transaksi baru di sistem.' };
  }

  // 3. TODO: Panggil API Mayar.id di sini secara nyata
  // Saat ini menggunakan simulasi / mock API untuk keperluan tes
  
  /* CONTOH PAYLOAD MAYAR.ID:
     const mayarPayload = {
        amount: total_harga,
        customer_name: userData.sekolah.nama_sekolah,
        customer_email: userData.email,
        customer_phone: userData.no_wa,
        description: `Pembelian ${jumlah_sp} Saldo Siaran Pers Astacita Pendidikan (NPSN: ${userData.npsn})`,
        webhook_id: transaksiId
     }
  */
  
  // URL simulasi. Di production, ini link asli Mayar.id (contoh: https://pay.mayar.id/link/xxx)
  const mockMayarUrl = `https://mock-payment-gateway.web.app/bayar?trx=${transaksiId}&npsn=${userData.npsn}&total=${total_harga}`

  return { success: true, url: mockMayarUrl, error: null }
}
