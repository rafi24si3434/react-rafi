import React from "react";

export default function FiturXyz() {
  return (
    // Container utama dengan background abu-abu terang agar card lebih menonjol
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 flex justify-center items-start">
      
      {/* Card Utama */}
      <div className="bg-white rounded-2xl shadow-lg border border-slate-100 p-6 md:p-8 w-full max-w-4xl transition-all hover:shadow-xl">
        
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-8 border-b border-slate-100 pb-6 gap-4">
          <div className="flex items-center gap-4">
            {/* Ikon Placeholder */}
            <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
                Fitur XYZ
              </h1>
              <p className="text-sm font-medium text-blue-600 mt-1">
                Versi 2.0 • Status: Aktif
              </p>
            </div>
          </div>
          {/* Badge Status */}
          <span className="px-4 py-1.5 bg-green-100 text-green-700 text-sm font-bold rounded-full border border-green-200">
            Premium
          </span>
        </div>

        {/* Content Section */}
        <div className="mb-8">
          <p className="text-slate-600 leading-relaxed text-lg">
            Fitur XYZ dirancang khusus untuk memaksimalkan produktivitas Anda. Dengan antarmuka yang intuitif dan integrasi yang mulus, Anda dapat mengelola tugas sehari-hari dengan lebih efisien.
          </p>
        </div>

        {/* Grid/Fitur Tambahan Section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[
            { title: 'Performa Kilat', desc: 'Sistem dioptimalkan untuk respons dalam hitungan milidetik.' },
            { title: 'Keamanan Ekstra', desc: 'Data Anda dienkripsi dengan standar keamanan industri terbaru.' },
            { title: 'Laporan Detail', desc: 'Dapatkan wawasan komprehensif dari setiap aktivitas Anda.' }
          ].map((item, index) => (
            <div key={index} className="p-5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-blue-50 hover:border-blue-200 transition-colors duration-200 cursor-pointer group">
              <h3 className="font-bold text-slate-800 mb-2 group-hover:text-blue-700">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mt-8 pt-6 border-t border-slate-100">
          <button className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-sm transition-colors duration-200 flex items-center justify-center gap-2">
            <span>Mulai Gunakan</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <button className="px-6 py-3 bg-white hover:bg-slate-50 text-slate-700 font-semibold rounded-xl border border-slate-200 shadow-sm transition-colors duration-200 text-center">
            Pelajari Lebih Lanjut
          </button>
        </div>

      </div>
    </div>
  );
}