-- Mengaktifkan ekstensi yang diperlukan
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_cron";

-- 1. Tabel Sekolah (Master Data)
CREATE TABLE public.sekolah (
    npsn TEXT PRIMARY KEY,
    prov TEXT,
    kab_kot TEXT,
    kec TEXT,
    nama_sekolah TEXT NOT NULL,
    alamat TEXT,
    status_ns TEXT,
    kepala_sekolah TEXT,
    status_dapodik TEXT CHECK (status_dapodik IN ('Terdaftar', 'Belum Terdaftar'))
);

-- 2. Tabel Users (Extend auth.users)
CREATE TABLE public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    npsn TEXT REFERENCES public.sekolah(npsn) ON DELETE SET NULL,
    email TEXT UNIQUE NOT NULL,
    nama_narahubung TEXT NOT NULL,
    no_wa TEXT,
    role TEXT NOT NULL CHECK (role IN ('humas', 'admin', 'manajemen')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Tabel Transaksi Order
CREATE TABLE public.transaksi_order (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    npsn TEXT REFERENCES public.sekolah(npsn) ON DELETE CASCADE,
    jumlah_sp INT NOT NULL CHECK (jumlah_sp IN (5, 10, 15, 20, 24)),
    total_harga INT NOT NULL, -- Di Frontend diisi: jumlah_sp * 35000
    status TEXT NOT NULL CHECK (status IN ('pending', 'settlement', 'expired')) DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Tabel Kuota SP
CREATE TABLE public.kuota_sp (
    npsn TEXT PRIMARY KEY REFERENCES public.sekolah(npsn) ON DELETE CASCADE,
    total_saldo_kuota INT DEFAULT 0,
    jatah_bulan_ini INT DEFAULT 0 CHECK (jatah_bulan_ini <= 2),
    terpakai_bulan_ini INT DEFAULT 0,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Tabel Siaran Pers
CREATE TABLE public.siaran_pers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    npsn TEXT REFERENCES public.sekolah(npsn) ON DELETE CASCADE,
    judul TEXT NOT NULL,
    foto_url TEXT,
    kategori TEXT NOT NULL CHECK (kategori IN ('Prestasi', 'Kegiatan', 'Pengumuman', 'Opini', 'Profil', 'Fasilitas', 'Lainnya')),
    isi_sp TEXT NOT NULL,
    status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'pending', 'approved', 'rejected')),
    tgl_posting TIMESTAMPTZ,
    link_url_publikasi TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Tabel Laporan Keuangan
-- Menyimpan agregasi harian berdasarkan donasi yang masuk
CREATE TABLE public.laporan_keuangan (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tanggal DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
    total_sp INT DEFAULT 0,
    total_donasi INT DEFAULT 0,
    -- Pos 1-9 disiapkan kolom persentase, total masuk (rp), terpakai (used), dan sisa
    p1_pct NUMERIC(5,2) DEFAULT 0, p1_rp INT DEFAULT 0, p1_used INT DEFAULT 0, p1_sisa INT DEFAULT 0,
    p2_pct NUMERIC(5,2) DEFAULT 0, p2_rp INT DEFAULT 0, p2_used INT DEFAULT 0, p2_sisa INT DEFAULT 0,
    p3_pct NUMERIC(5,2) DEFAULT 0, p3_rp INT DEFAULT 0, p3_used INT DEFAULT 0, p3_sisa INT DEFAULT 0,
    p4_pct NUMERIC(5,2) DEFAULT 0, p4_rp INT DEFAULT 0, p4_used INT DEFAULT 0, p4_sisa INT DEFAULT 0,
    p5_pct NUMERIC(5,2) DEFAULT 0, p5_rp INT DEFAULT 0, p5_used INT DEFAULT 0, p5_sisa INT DEFAULT 0,
    p6_pct NUMERIC(5,2) DEFAULT 0, p6_rp INT DEFAULT 0, p6_used INT DEFAULT 0, p6_sisa INT DEFAULT 0,
    p7_pct NUMERIC(5,2) DEFAULT 0, p7_rp INT DEFAULT 0, p7_used INT DEFAULT 0, p7_sisa INT DEFAULT 0,
    p8_pct NUMERIC(5,2) DEFAULT 0, p8_rp INT DEFAULT 0, p8_used INT DEFAULT 0, p8_sisa INT DEFAULT 0,
    p9_pct NUMERIC(5,2) DEFAULT 0, p9_rp INT DEFAULT 0, p9_used INT DEFAULT 0, p9_sisa INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security (RLS) Enable
ALTER TABLE public.sekolah ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transaksi_order ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kuota_sp ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.siaran_pers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.laporan_keuangan ENABLE ROW LEVEL SECURITY;

-- RLS POLICIES
-- Sekolah: Publik bisa SELECT (untuk pendaftaran)
CREATE POLICY "Allow public select on sekolah" ON public.sekolah FOR SELECT USING (true);

-- Siaran Pers: Publik bisa SELECT yang statusnya 'approved'
CREATE POLICY "Allow public select on approved siaran_pers" ON public.siaran_pers FOR SELECT USING (status = 'approved');

-- Siaran Pers: Humas bisa SELECT/INSERT/UPDATE miliknya sendiri
CREATE POLICY "Allow users to manage their own siaran_pers" ON public.siaran_pers 
FOR ALL TO authenticated 
USING (auth.uid() IN (SELECT id FROM public.users WHERE npsn = public.siaran_pers.npsn));

-- Logic Kuota Hangus & Alokasi (pg_cron)
-- Dijalankan tiap tanggal 1 awal bulan jam 00:00 (UTC)
SELECT cron.schedule(
    'reset_dan_alokasi_kuota',
    '0 0 1 * *',
    $$
    UPDATE public.kuota_sp
    SET 
        -- Jatah sebelumnya yang belum dipakai HANGUS (tidak masuk ke saldo).
        -- Set ulang jatah bulan ini dari total saldo kuota:
        jatah_bulan_ini = CASE 
            WHEN total_saldo_kuota >= 2 THEN 2
            WHEN total_saldo_kuota = 1 THEN 1
            ELSE 0 
        END,
        -- Kurangi saldo kuota dengan jatah yang baru dialokasikan:
        total_saldo_kuota = CASE
            WHEN total_saldo_kuota >= 2 THEN total_saldo_kuota - 2
            WHEN total_saldo_kuota = 1 THEN 0
            ELSE total_saldo_kuota
        END,
        -- Reset yang terpakai:
        terpakai_bulan_ini = 0,
        updated_at = NOW();
    $$
);

-- Logic Alokasi Keuangan (PostgreSQL Trigger)
CREATE OR REPLACE FUNCTION alokasi_donasi_settlement()
RETURNS TRIGGER AS $$
DECLARE
    nilai_donasi INT;
    tgl DATE := CURRENT_DATE;
    
    -- Definisi Persentase (Mudah diubah)
    pct_p1 NUMERIC := 20.0;
    pct_p2 NUMERIC := 15.0;
    pct_p3 NUMERIC := 10.0;
    pct_p4 NUMERIC := 10.0;
    pct_p5 NUMERIC := 10.0;
    pct_p6 NUMERIC := 10.0;
    pct_p7 NUMERIC := 10.0;
    pct_p8 NUMERIC := 10.0;
    pct_p9 NUMERIC := 5.0;

    -- Variabel Nominal
    rp_p1 INT; rp_p2 INT; rp_p3 INT; rp_p4 INT;
    rp_p5 INT; rp_p6 INT; rp_p7 INT; rp_p8 INT; rp_p9 INT;
BEGIN
    IF NEW.status = 'settlement' AND OLD.status != 'settlement' THEN
        nilai_donasi := NEW.total_harga; 
        
        -- Hitung Nominal Alokasi
        rp_p1 := (nilai_donasi * pct_p1 / 100)::INT;
        rp_p2 := (nilai_donasi * pct_p2 / 100)::INT;
        rp_p3 := (nilai_donasi * pct_p3 / 100)::INT;
        rp_p4 := (nilai_donasi * pct_p4 / 100)::INT;
        rp_p5 := (nilai_donasi * pct_p5 / 100)::INT;
        rp_p6 := (nilai_donasi * pct_p6 / 100)::INT;
        rp_p7 := (nilai_donasi * pct_p7 / 100)::INT;
        rp_p8 := (nilai_donasi * pct_p8 / 100)::INT;
        rp_p9 := (nilai_donasi * pct_p9 / 100)::INT;
        
        -- Insert atau Update laporan_keuangan
        INSERT INTO public.laporan_keuangan (
            tanggal, total_sp, total_donasi,
            p1_pct, p1_rp, p1_sisa,
            p2_pct, p2_rp, p2_sisa,
            p3_pct, p3_rp, p3_sisa,
            p4_pct, p4_rp, p4_sisa,
            p5_pct, p5_rp, p5_sisa,
            p6_pct, p6_rp, p6_sisa,
            p7_pct, p7_rp, p7_sisa,
            p8_pct, p8_rp, p8_sisa,
            p9_pct, p9_rp, p9_sisa
        )
        VALUES (
            tgl, NEW.jumlah_sp, nilai_donasi,
            pct_p1, rp_p1, rp_p1,
            pct_p2, rp_p2, rp_p2,
            pct_p3, rp_p3, rp_p3,
            pct_p4, rp_p4, rp_p4,
            pct_p5, rp_p5, rp_p5,
            pct_p6, rp_p6, rp_p6,
            pct_p7, rp_p7, rp_p7,
            pct_p8, rp_p8, rp_p8,
            pct_p9, rp_p9, rp_p9
        )
        ON CONFLICT (tanggal) DO UPDATE
        SET 
            total_sp = public.laporan_keuangan.total_sp + EXCLUDED.total_sp,
            total_donasi = public.laporan_keuangan.total_donasi + EXCLUDED.total_donasi,
            p1_rp = public.laporan_keuangan.p1_rp + EXCLUDED.p1_rp, p1_sisa = public.laporan_keuangan.p1_sisa + EXCLUDED.p1_rp, p1_pct = EXCLUDED.p1_pct,
            p2_rp = public.laporan_keuangan.p2_rp + EXCLUDED.p2_rp, p2_sisa = public.laporan_keuangan.p2_sisa + EXCLUDED.p2_rp, p2_pct = EXCLUDED.p2_pct,
            p3_rp = public.laporan_keuangan.p3_rp + EXCLUDED.p3_rp, p3_sisa = public.laporan_keuangan.p3_sisa + EXCLUDED.p3_rp, p3_pct = EXCLUDED.p3_pct,
            p4_rp = public.laporan_keuangan.p4_rp + EXCLUDED.p4_rp, p4_sisa = public.laporan_keuangan.p4_sisa + EXCLUDED.p4_rp, p4_pct = EXCLUDED.p4_pct,
            p5_rp = public.laporan_keuangan.p5_rp + EXCLUDED.p5_rp, p5_sisa = public.laporan_keuangan.p5_sisa + EXCLUDED.p5_rp, p5_pct = EXCLUDED.p5_pct,
            p6_rp = public.laporan_keuangan.p6_rp + EXCLUDED.p6_rp, p6_sisa = public.laporan_keuangan.p6_sisa + EXCLUDED.p6_rp, p6_pct = EXCLUDED.p6_pct,
            p7_rp = public.laporan_keuangan.p7_rp + EXCLUDED.p7_rp, p7_sisa = public.laporan_keuangan.p7_sisa + EXCLUDED.p7_rp, p7_pct = EXCLUDED.p7_pct,
            p8_rp = public.laporan_keuangan.p8_rp + EXCLUDED.p8_rp, p8_sisa = public.laporan_keuangan.p8_sisa + EXCLUDED.p8_rp, p8_pct = EXCLUDED.p8_pct,
            p9_rp = public.laporan_keuangan.p9_rp + EXCLUDED.p9_rp, p9_sisa = public.laporan_keuangan.p9_sisa + EXCLUDED.p9_rp, p9_pct = EXCLUDED.p9_pct,
            updated_at = NOW();

        -- Tambahkan Kuota ke Sekolah
        UPDATE public.kuota_sp
        SET total_saldo_kuota = total_saldo_kuota + NEW.jumlah_sp,
            updated_at = NOW()
        WHERE npsn = NEW.npsn;

    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_alokasi_donasi
AFTER UPDATE ON public.transaksi_order
FOR EACH ROW
EXECUTE FUNCTION alokasi_donasi_settlement();
