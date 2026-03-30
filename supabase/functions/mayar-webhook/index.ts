import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

// Kunci rahasia dari Mayar.id untuk verifikasi Webhook
const MAYAR_WEBHOOK_SECRET = Deno.env.get('MAYAR_WEBHOOK_SECRET') || 'secret123'

console.log("Menjalankan Fungsi Webhook Mayar.id!")

serve(async (req) => {
  // Hanya menerima metode POST
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 })
  }

  try {
    const signature = req.headers.get('x-mayar-signature')
    const payload = await req.json()

    // TODO: Verifikasi signature kriptografis dari Mayar
    // if (!verifySignature(payload, signature, MAYAR_WEBHOOK_SECRET)) throw Error...

    // Asumsi payload dari Mayar.id jika status pembayaran sukses adalah:
    // payload.status === 'PAID' atau 'SETTLED'
    // payload.webhook_id = id transaksi yang kita pass dari Frontend

    if (payload.status === 'PAID' || payload.status === 'SETTLED') {
       const transactionId = payload.webhook_id

       // Inisialisasi Supabase Client dengan Service Role Key untuk bypass RLS
       const supabaseAdmin = createClient(
          Deno.env.get('SUPABASE_URL') ?? '',
          Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
       )

       // Update tabel transaksi (Trigger DB akan jalan otomatis untuk atur Laporan Keuangan)
       const { error: updateError } = await supabaseAdmin
         .from('transaksi_order')
         .update({ status: 'settlement' })
         .eq('id', transactionId)

       if (updateError) {
         console.error('Error updating transaction:', updateError)
         return new Response(JSON.stringify({ error: 'Gagal update transaksi' }), { status: 500 })
       }

       // (Opsional) Kirim Email via SMTP / Resend Webhook di sini
       return new Response(JSON.stringify({ success: true, message: 'Transaksi berhasil disettlement' }), {
         headers: { "Content-Type": "application/json" },
         status: 200,
       })
    }

    return new Response(JSON.stringify({ success: true, message: 'Status tidak memerlukan tindakan' }), {
      headers: { "Content-Type": "application/json" },
      status: 200,
    })

  } catch (error: any) {
    console.error('Webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { "Content-Type": "application/json" },
      status: 400,
    })
  }
})
