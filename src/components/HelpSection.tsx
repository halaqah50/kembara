import React from "react";
import { Info, HelpCircle, Phone, BookOpen, MapPin, Tent, ShieldCheck } from "lucide-react";

interface HelpSectionProps {
  spreadsheetId: string | null;
}

export default function HelpSection({ spreadsheetId }: HelpSectionProps) {
  const sheetLink = spreadsheetId 
    ? `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit` 
    : null;

  return (
    <div className="space-y-6">
      {/* Quick Info Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Contact and Logistics */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h3 className="text-slate-800 font-bold mb-4 flex items-center space-x-2 text-sm uppercase tracking-wider">
            <Phone className="w-4 h-4 text-emerald-600" />
            <span>Kontak & Logistik Penting</span>
          </h3>
          
          <div className="space-y-4 text-slate-600 text-sm">
            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl flex items-start space-x-3 shadow-sm">
              <Tent className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block text-xs font-mono uppercase tracking-wide">Sewa Tenda Regu</strong>
                <p className="mt-1 text-xs text-slate-600">Untuk pemesanan / penyewaan tenda regu kembara, silakan langsung hubungi panitia:</p>
                <div className="mt-2.5 flex items-center space-x-2 bg-emerald-50 px-3 py-1.5 rounded border border-emerald-200 text-emerald-800 font-mono text-xs w-fit shadow-sm font-semibold">
                  <span>Kusbiantoro: +62 857-7696-0436</span>
                </div>
              </div>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 p-3.5 rounded-xl flex items-start space-x-3 shadow-sm">
              <MapPin className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-800 block text-xs font-mono uppercase tracking-wide">Lokasi Kembara</strong>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Kemah Bela Negara (KEMBARA) CM3105. Pastikan seluruh perlengkapan tahan air (waterproof) atau dibungkus plastik rapat untuk mengantisipasi cuaca ekstrem.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Database & Integration */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-slate-800 font-bold mb-3 flex items-center space-x-2 text-sm uppercase tracking-wider">
              <BookOpen className="w-4 h-4 text-emerald-600" />
              <span>Integrasi Google Sheets</span>
            </h3>
            <p className="text-slate-600 text-xs leading-relaxed mb-4">
              Aplikasi ini terhubung langsung ke Google Drive Anda. Seluruh perubahan checklist, catatan, dan PIC disimpan di dalam spreadsheet bernama <strong className="text-slate-800 font-semibold">"kembara 2026"</strong> secara real-time.
            </p>

            {sheetLink ? (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl shadow-sm">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block mb-1 font-bold">
                  Spreadsheet ID Terdeteksi:
                </span>
                <span className="font-mono text-xs text-slate-600 break-all select-all block mb-3 bg-white border border-slate-200 px-3 py-1.5 rounded shadow-inner">
                  {spreadsheetId}
                </span>
                <a
                  href={sheetLink}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center space-x-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-2 rounded shadow-sm transition-all mt-1 cursor-pointer"
                >
                  <span>Buka Google Sheets Asli</span>
                  <span>↗</span>
                </a>
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 p-4 rounded-xl text-slate-400 text-xs text-center font-mono">
                Menghubungkan ke Google Sheets...
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center space-x-2 text-emerald-600 text-xs font-mono font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Koneksi Aman & Terenskripsi</span>
          </div>
        </div>
      </div>

      {/* Camping tips / guide */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h3 className="text-slate-800 font-bold mb-4 flex items-center space-x-2 text-sm uppercase tracking-wider">
          <Info className="w-4 h-4 text-amber-500" />
          <span>Tips Packing & Kesiapan Fisik</span>
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs text-slate-600 leading-relaxed">
          <div className="bg-slate-50/70 border border-slate-200/80 p-4 rounded-xl shadow-sm">
            <h4 className="font-bold text-slate-800 mb-1.5 uppercase font-mono tracking-wide text-[11px]">
              1. Teknik Trash Bag (Waterproofing)
            </h4>
            <p className="text-slate-600">
              Gunakan trash bag besar sebagai inner-lining (lapisan dalam) di dalam carrier Anda sebelum memasukkan pakaian. Bungkus pakaian dalam dan perlengkapan tidur secara terpisah dengan plastik klip kecil agar tetap kering total meski hujan lebat.
            </p>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 p-4 rounded-xl shadow-sm">
            <h4 className="font-bold text-slate-800 mb-1.5 uppercase font-mono tracking-wide text-[11px]">
              2. Manajemen Berat Ransel
            </h4>
            <p className="text-slate-600">
              Letakkan barang-barang ringan namun memakan ruang (seperti sleeping bag atau matras) di bagian paling bawah ransel. Barang terberat (makanan kaleng, air cadangan) letakkan di bagian tengah dekat dengan punggung Anda agar stabil saat mendaki.
            </p>
          </div>

          <div className="bg-slate-50/70 border border-slate-200/80 p-4 rounded-xl shadow-sm">
            <h4 className="font-bold text-slate-800 mb-1.5 uppercase font-mono tracking-wide text-[11px]">
              3. Kesehatan & Obat Pribadi
            </h4>
            <p className="text-slate-600">
              Meskipun regu membawa P3K umum, Anda wajib mengemas obat khusus jika memiliki riwayat asma, alergi dingin, asam lambung, atau kram otot. Konsumsi suplemen/vitamin penunjang sejak 3 hari sebelum keberangkatan.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
