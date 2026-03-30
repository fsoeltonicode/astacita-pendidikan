# 🎨 BRAND GUIDELINES & DESIGN SYSTEM (brand.md)

## 1. BRAND IDENTITY & LOGO
**Brand Name:** Astacita Pendidikan (Portal Berita & Depo Siaran Pers)
**Vibe/Tone:** Jurnalistik, Edukatif, Terstruktur, dan Terpercaya.
**Logo Source (CRITICAL):** - WAJIB menggunakan logo dari website utama: `https://www.astacita-pendidikan.web.id/`
- Gunakan komponen `<Image />` dari Next.js untuk merender logo di *Header* utama dan *Footer*.
- Logo harus diletakkan sejajar dengan form pencarian (*Search*) di bagian *Header*.

## 2. COLOR PALETTE (TAILWIND CSS)
Warna harus merepresentasikan portal informasi pendidikan yang cerah dan mudah dibaca:
- **Primary (Warna Dasar & Aksen Kategori):** `blue-700` (Hex: `#1d4ed8`) untuk elemen navigasi utama, warna tombol, dan garis bawah pada judul kategori berita.
- **Secondary (Aksen Tajam):** `red-600` (Hex: `#dc2626`) untuk elemen penting, *breaking news*, atau indikator *tag* "Siaran Pers" dan "Pengumuman".
- **Background Utama:** `white` (Hex: `#ffffff`) untuk keseluruhan laman baca agar teks berita terlihat bersih.
- **Background Sekunder:** `slate-50` atau `gray-100` untuk area *Sidebar* atau latar belakang pemisah antar blok kategori berita.
- **Text:** - Teks Judul Berita: `slate-900` (Wajib pekat agar mudah dibaca).
  - Teks Meta/Tanggal/Author: `slate-500` (Lebih samar).
  - Teks Paragraf Isi Berita: `slate-700` atau `gray-800`.

## 3. TYPOGRAPHY
- **Font Family:** Gunakan kombinasi *font* modern. 
  - Judul Artikel/Heading: Font Sans-Serif yang tegas (contoh: `Roboto` atau `Oswald`).
  - Paragraf Isi: Font yang nyaman dibaca panjang (contoh: `Inter` atau `Open Sans`).
- **Hierarchy:**
  - *H1 (Judul Berita Utama/Headline):* `text-2xl font-bold md:text-3xl leading-snug`.
  - *H2 (Judul Kategori Section, misal "Siaran Pers #SD"):* `text-xl font-bold border-b-2 border-blue-700 pb-2 mb-4`.
  - *H3 (Judul Berita di Grid/List):* `text-base font-semibold line-clamp-2 hover:text-blue-700 transition-colors`.
  - *Meta Data (Tanggal/Penulis):* `text-xs text-gray-500`.

## 4. UI COMPONENTS & LAYOUT RULES (PORTAL BERITA STYLE)
- **Header & Navigasi (Mega Menu):**
  - *Top Bar:* Berisi logo di kiri, dan form *Search* di kanan.
  - *Navbar:* Menu horizontal berjajar rapi untuk kategori utama: Beranda, PAUD (TK, KB), DIKDAS (SD), DIKMEN (SMP, SMA, SMK), DIKMAS, Journal, Artikel, About Us, Layanan, Pendaftaran. Harus bersifat *sticky* atau menempel saat di-*scroll*.
- **Layout Beranda (Homepage):**
  - *Headline Section:* Berita terbaru atau yang disorot berukuran besar di bagian paling atas.
  - *Section Per Kategori:* Buat susunan blok untuk masing-masing jenjang. Contoh: Blok "Siaran Pers #SD", "Siaran Pers #SMA", "Journal".
  - *Grid System:* Gunakan tata letak *grid* (contoh: `grid-cols-1 md:grid-cols-3` atau `md:grid-cols-4`) untuk menampilkan daftar berita secara berjejer.
  - Sediakan tombol "View All" atau "Lihat Semua" di setiap pojok kanan atas blok kategori.
- **Card Berita (News Card):**
  - WAJIB memiliki susunan vertikal: Gambar *Thumbnail* (di atas) -> *Tag/Badge* Kategori (kecil di atas judul) -> Judul Berita -> Tanggal & Admin (di bawah judul).
- **Footer:**
  - Memuat informasi Alamat Kantor (Jl. Mandor Samin No. 38D, Depok), Email, Website, dan ikon media sosial.
  - Harus memiliki warna *background* yang gelap (`bg-slate-900` teks `white`) agar terlihat formal sebagai penutup halaman.

## 5. COPYWRITING & TONE OF VOICE
- Menggunakan Bahasa Indonesia formal ala portal berita.
- Format penulisan tanggal berita WAJIB menggunakan format Indonesia, misal: "Des 02, 2024".
- Indikator asal data SP (misal: "Siaran Pers, NPSN: 20108562") harus ditampilkan dalam bentuk *badge* atau *caption* kecil di bawah judul jika diperlukan.