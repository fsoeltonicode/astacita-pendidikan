-- Trigger Re-creation (Menerapkan ulang untuk memuat Update penambahan saldo kuota)

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
        
        -- Insert atau Update laporan_keuangan harian (Upsert Data)
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

-- Tidak perlu CREATE TRIGGER ulang karena fungsinya REPLACE.
