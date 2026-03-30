'use server'

import { createServiceClient } from '@/utils/supabase/server'
import { revalidatePath } from 'next/cache'

export async function approveSiaranPers(id: string, linkUrl?: string) {
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('siaran_pers')
    .update({
      status: 'approved',
      tgl_posting: new Date().toISOString(),
      link_url_publikasi: linkUrl || null,
    })
    .eq('id', id)

  if (error) return { error: 'Gagal menyetujui: ' + error.message }

  revalidatePath('/')
  revalidatePath('/admin')
  return { success: true }
}

export async function rejectSiaranPers(id: string) {
  const supabase = createServiceClient()

  const { error } = await supabase
    .from('siaran_pers')
    .update({ status: 'rejected' })
    .eq('id', id)

  if (error) return { error: 'Gagal menolak: ' + error.message }

  revalidatePath('/admin')
  return { success: true }
}

export async function getSiaranPersByStatus(status: 'pending' | 'approved' | 'rejected') {
  const supabase = createServiceClient()

  const { data, error } = await supabase
    .from('siaran_pers')
    .select(`
      id, judul, kategori, status, created_at, foto_url, isi_sp, link_url_publikasi, tgl_posting,
      sekolah (nama_sekolah, npsn)
    `)
    .eq('status', status)
    .order('created_at', { ascending: false })

  if (error) return { data: [], error: error.message }
  return { data: data || [], error: null }
}
