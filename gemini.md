# 🤖 SYSTEM INSTRUCTIONS FOR AI AGENT (gemini.md)

## 1. PROJECT OVERVIEW
**Name:** Astacita Pendidikan (Depo Siaran Pers)
**URL:** www.astacita-pendidikan.web.id
**Goal:** Platform portal publikasi Siaran Pers (SP) sekolah dengan sistem automasi kuota, payment gateway, dan pelaporan keuangan terintegrasi, serta berfungsi sebagai portal berita publik.
**Tech Stack:** - Frontend/Backend: Next.js 14+ (App Router), TypeScript, Tailwind CSS, Shadcn UI (opsional untuk komponen).
- Database & Auth: Supabase (PostgreSQL, Supabase Auth, Storage, Edge Functions).
- Payment Gateway: Mayar.id.
- Notifikasi: Email via Supabase SMTP / Resend (Sementara menggantikan WhatsApp).

## 2. LOCALIZATION & LANGUAGE (STRICTLY BAHASA INDONESIA)
- **UI & Copywriting:** Seluruh teks pada antarmuka (tombol, placeholder, label form, navigasi, modal konfirmasi, dll) WAJIB menggunakan Bahasa Indonesia yang baku namun mudah dipahami.
  - *DILARANG* menggunakan istilah: Submit, Cancel, Dashboard, Settings, Update, Delete.
  - *GUNAKAN* istilah: Kirim, Batal, Dasbor, Pengaturan, Perbarui, Hapus.
- **Error Messages:** Tangkap semua pesan error bawaan dari Supabase Auth atau validasi form, lalu translasikan ke Bahasa Indonesia sebelum ditampilkan ke user (toast/alert). Contoh: "Invalid login credentials" WAJIB diubah menjadi "NPSN atau kata sandi salah."
- **Currency Format:** Seluruh nominal uang WAJIB diformat ke dalam Rupiah (Rp) dengan pemisah ribuan menggunakan titik. Contoh: Rp35.000, Rp175.000.
- **Date & Time Format:** Format tanggal WAJIB menggunakan standar Indonesia (DD MMMM YYYY) dan zona waktu WIB. Contoh: 29 Maret 2026.
- **Database Enum vs UI:** Status pada database boleh menggunakan bahasa Inggris untuk kemudahan sistem (misal: `pending`, `approved`), TAPI saat dirender ke UI WAJIB diubah menjadi Bahasa Indonesia (Menunggu, Disetujui).

## 3. STRICT ARCHITECTURAL & SECURITY RULES
- **NO Client-Side Auth State:** Dilarang keras menggunakan `localStorage` untuk session. WAJIB menggunakan `@supabase/ssr` untuk manajemen HTTP-only cookies.
- **Route Protection:** Gunakan `middleware.ts` Next.js untuk memproteksi *routing* berdasarkan Role (`humas`, `admin`, `manajemen`).
- **Database Security:** Seluruh tabel WAJIB memiliki Row Level Security (RLS) yang ketat. Client (Humas) hanya boleh `SELECT`, `INSERT`, `UPDATE` datanya sendiri (berdasarkan NPSN).
- **Server Components First:** Selalu gunakan React Server Components. Gunakan `"use client"` HANYA untuk komponen interaktif (form, button onClick, hooks).
- **TypeScript Strict:** Dilarang menggunakan tipe `any`. Definisikan semua tipe data di folder `@/types`.

## 4. USER ROLES & DASHBOARDS
1.  **Humas (Narahubung):**
    - Akses: Dasbor Humas.
    - Fitur: Daftar, Masuk (User: NPSN, Sandi: 'admin'), Lupa Sandi, Ganti Sandi, Lihat Status Kuota SP, Order SP, Kirim SP, Lihat Riwayat.
2.  **Admin:**
    - Akses: Dasbor Admin.
    - Fitur: Setujui/Tolak SP masuk, input link URL postingan dari blog utama.
3.  **Manajemen:**
    - Akses: URL rahasia (contoh: `/sekretariat-manajemen`) dengan sandi khusus.
    - Fitur: Lihat Laporan Keuangan (Harian & Akumulasi). Bersifat sangat rahasia.

## 5. DATABASE SCHEMA & LOGIC (SUPABASE)
Agen WAJIB mematuhi skema dan logika berikut saat membuat SQL atau berinteraksi dengan DB:

### A. Tabel `sekolah` (Master Data - Dapodik Style)
- Fields: `npsn` (PK), `prov`, `kab_kot`, `kec`, `nama_sekolah`, `alamat`, `status_ns`, `kepala_sekolah`, `status_dapodik` (Terdaftar/Belum Terdaftar).

### B. Tabel `users` (Extend Supabase Auth)
- Fields: `id` (FK to auth.users), `npsn` (FK to sekolah), `email`, `nama_narahubung`, `no_wa` (tetap disimpan sebagai data referensi), `role` (humas/admin/manajemen).
- **Logic Daftar:** Saat Humas mendaftar, input NPSN harus men-trigger auto-fetch ke tabel `sekolah` dan menampilkan data read-only secara otomatis sebelum disubmit.

### C. Tabel `transaksi_order`
- Fields: `id`, `npsn`, `jumlah_sp` (Pilihan strict: 5, 10, 15, 20, 24), `total_harga` (jumlah * 35000), `status` (pending, settlement, expired), `created_at`.

### D. Tabel `kuota_sp` (CRITICAL BUSINESS LOGIC)
- Fields: `npsn` (PK), `total_saldo_kuota` (Total SP yang dibeli & belum dialokasikan), `jatah_bulan_ini` (Max 2), `terpakai_bulan_ini`.
- **Logic Kuota Hangus (WAJIB PAKAI pg_cron):** Batas kuota rilis adalah 2x sebulan. Setiap tanggal 1 awal bulan jam 00:00, Cron Job Supabase harus berjalan:
  1. Jika bulan lalu rilis 1, sisa 1 hangus. Jika tidak rilis sama sekali, 2 kuota alokasi bulan tersebut hangus. (Reset `terpakai_bulan_ini` dan `jatah_bulan_ini` jadi 0).
  2. Alokasikan jatah baru untuk bulan ini: Jika `total_saldo_kuota` >= 2, set `jatah_bulan_ini` = 2, kurangi `total_saldo_kuota` sebanyak 2. Jika `total_saldo_kuota` = 1, set jatah = 1, saldo = 0.

### E. Tabel `siaran_pers`
- Fields: `id`, `npsn`, `judul`, `foto_url` (Supabase Storage), `kategori` (Enum 7 kategori), `isi_sp`, `status` (Draft/Pending/Approved), `tgl_posting`, `link_url_publikasi`.

### F. Tabel `laporan_keuangan` (CRITICAL FINANCIAL LOGIC)
- Fields: `id`, `tanggal`, `total_sp`, `total_donasi`, `pos_1_pct`, `pos_1_rp`, `pos_1_used`, `pos_1_sisa` ... (sampai pos 9).
- **Logic Alokasi Otomatis (WAJIB PAKAI PostgreSQL Trigger):**
  DILARANG menghitung ini di Frontend/Backend Next.js! Buat DB Trigger: `AFTER UPDATE ON transaksi_order`. Jika `status` berubah jadi `settlement`, otomatis pecah nilai Rp35.000 per SP ke 9 kolom alokasi operasional sesuai persentase yang disepakati, lalu update laporan harian dan akumulasi.

## 6. EXTERNAL INTEGRATIONS
- **Mayar.id & Email Notifications:** Integrasi ini TIDAK BOLEH diletakkan di Next.js API Routes biasa. WAJIB menggunakan **Supabase Edge Functions**.
  - Flow: Webhook Mayar -> Edge Function -> Validasi Signature -> Update DB `transaksi_order` (Settlement) -> Trigger kirim Email Notifikasi ke email akun Humas bahwa pembayaran sukses -> Return 200 OK.

## 7. UI/UX & WORKFLOW REQUIREMENTS
- **Form Kirim SP:** Harus ada tahap *Preview* (Lihat View), tombol Edit, dan konfirmasi akhir "Sudah benar dan kirim".
- **Default Kata Sandi:** Saat akun Humas pertama kali dibuat, kata sandi bawaannya adalah 'admin'.

## 8. PUBLIC FACING PAGES (PORTAL BERITA)
- **Halaman Beranda (`/`):**
  - Ini adalah halaman publik (tanpa perlu login) yang berfungsi sebagai portal berita utama.
  - WAJIB menampilkan daftar Siaran Pers dari tabel `siaran_pers` yang statusnya HANYA `approved`.
  - Tampilkan dalam bentuk *Grid Card* yang berisi: Foto Utama, Judul, Kategori, Tanggal Posting, Nama Sekolah, dan cuplikan isi (excerpt).
  - Sediakan fitur *Search* (berdasarkan Judul atau Nama Sekolah) dan *Filter* (berdasarkan Kategori).
- **Halaman Detail Berita (`/berita/[id]` atau `/berita/[slug]`):**
  - Halaman untuk membaca isi penuh dari Siaran Pers yang dipilih.
  - Tampilkan metadata lengkap: Nama Sekolah pembuat SP, Tanggal, dan Kategori.
  - Jika `link_url_publikasi` (link blog eksternal) sudah diisi oleh Admin, sediakan tombol "Baca di Sumber Asli" yang mengarah ke link tersebut.