import React from 'react';
import Link from 'next/link';
import { AppLayout } from '@/components/templates';
import { Button } from '@/components/atoms/Button';
import { Badge } from '@/components/atoms/Badge';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/atoms/Card';

export default function HomePage() {
  const products = [
    {
      title: 'Term Life Guard Plus',
      category: 'Asuransi Jiwa Berjangka',
      coverage: 'Hingga Rp 2.500.000.000',
      term: '5, 10, atau 20 Tahun',
      startingPrice: 'Rp 150.000 / bulan',
      badge: 'Paling Populer',
      badgeVariant: 'emerald' as const,
      features: [
        'Proteksi finansial menyeluruh bagi keluarga',
        'Tanpa perlu cek medis hingga Rp 1 Miliar',
        'Penerbitan e-Policy instan berbasis verifikasi AI',
      ],
    },
    {
      title: 'Critical Illness Shield',
      category: 'Perlindungan Penyakit Kritis',
      coverage: 'Hingga Rp 1.500.000.000',
      term: 'Hingga Usia 65 Tahun',
      startingPrice: 'Rp 220.000 / bulan',
      badge: 'Solusi Medis',
      badgeVariant: 'blue' as const,
      features: [
        'Santunan tunai 100% saat diagnosis tahap awal',
        'Melindungi dari 50+ kondisi kritis utama',
        'Dukungan klaim cashless di rumah sakit rekanan',
      ],
    },
    {
      title: 'EduCare Future',
      category: 'Proteksi Dana Pendidikan',
      coverage: 'Hingga Rp 1.000.000.000',
      term: 'Hingga Anak Usia 22 Tahun',
      startingPrice: 'Rp 300.000 / bulan',
      badge: 'Keluarga & Anak',
      badgeVariant: 'purple' as const,
      features: [
        'Jaminan kelangsungan jenjang pendidikan tinggi',
        'Pembebasan premi jika orang tua tutup usia',
        'Tahapan dana pasti sesuai jadwal pendidikan',
      ],
    },
  ];

  return (
    <AppLayout currentPath="/">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-linear-to-br from-slate-900 via-blue-950 to-slate-900 text-white p-8 sm:p-12 lg:p-16 mb-12 shadow-xl shadow-blue-950/20 border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-400/20 text-blue-300 text-xs font-semibold">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-ping" />
            Teknologi Underwriting AI Berkecepatan Tinggi
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-tight">
            Perlindungan Masa Depan Keluarga Anda,{' '}
            <span className="text-transparent bg-clip-text bg-linear-to-r from-blue-400 to-indigo-300">
              Tanpa Kerumitan Birokrasi.
            </span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
            Ajukan asuransi jiwa digital dengan verifikasi 4 Pilar otomatis (Dukcapil, DSR,
            Medical History, dan Legalitas Dokumen). Transparan, aman, dan berizin resmi OJK.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Button size="lg" variant="primary" className="shadow-lg shadow-blue-500/30">
              Hitung Simulasi Premi 🧮
            </Button>
            <Link href="/health">
              <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/20 hover:bg-white/20">
                Periksa Status Server ⚡
              </Button>
            </Link>
          </div>
        </div>

        {/* Decorative Grid Background */}
        <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
          <svg width="400" height="400" viewBox="0 0 100 100" fill="none">
            <circle cx="50" cy="50" r="48" stroke="white" strokeWidth="2" strokeDasharray="4 4" />
            <circle cx="50" cy="50" r="32" stroke="white" strokeWidth="2" />
            <circle cx="50" cy="50" r="16" stroke="white" strokeWidth="2" strokeDasharray="2 2" />
          </svg>
        </div>
      </section>

      {/* Feature Highlights */}
      <section className="mb-14">
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Pilihan Produk Perlindungan Terlengkap
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            Pilih paket proteksi yang disesuaikan secara presisi dengan kebutuhan finansial dan profil risiko Anda.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((p) => (
            <Card key={p.title} variant="default" className="flex flex-col justify-between hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="text-[11px] font-semibold text-blue-600 uppercase tracking-wider">
                    {p.category}
                  </span>
                  <Badge variant={p.badgeVariant} size="sm">
                    {p.badge}
                  </Badge>
                </div>
                <CardTitle>{p.title}</CardTitle>
                <CardDescription>Mulai dari <strong className="text-slate-900 font-semibold">{p.startingPrice}</strong></CardDescription>
              </CardHeader>

              <CardContent className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                  <span className="text-slate-400 block text-[10px] uppercase font-bold">Uang Pertanggungan</span>
                  <span className="font-bold text-slate-800 text-sm block">{p.coverage}</span>
                  <span className="text-slate-500 text-[11px] block">Masa Perlindungan: {p.term}</span>
                </div>

                <ul className="space-y-2 text-xs text-slate-600">
                  {p.features.map((feat) => (
                    <li key={feat} className="flex items-start gap-2">
                      <span className="text-emerald-500 font-bold shrink-0">✓</span>
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button size="md" variant="outline" className="w-full">
                  Lihat Rincian & Simulasi
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </section>

      {/* Trust & Compliance Banner */}
      <section className="p-6 rounded-2xl bg-white border border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xs">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-2xl shrink-0">
            🏛️
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">Kepatuhan Regulasi & Standar Keamanan Data</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Seluruh transaksi polis, enkripsi identitas KTP, dan komunikasi email dienkripsi menggunakan protokol TLS 1.3 dan mematuhi regulasi ketat OJK serta AAJI.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <Badge variant="emerald" size="md">ISO 27001 Certified</Badge>
          <Badge variant="slate" size="md">OJK Standard</Badge>
        </div>
      </section>
    </AppLayout>
  );
}
