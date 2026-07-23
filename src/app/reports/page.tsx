'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import Swal from 'sweetalert2';

export default function ReportsPage() {
  const [userName, setUserName] = useState('Dr. Jane Smith');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const savedName = localStorage.getItem('userName');
    if (savedName) setUserName(savedName);
  }, [router]);

  const handleExport = (type: string) => {
    Swal.fire({
      title: 'Unduhan Diproses',
      text: `Berhasil! Mempersiapkan dokumen laporan format ${type}...`,
      icon: 'success',
      confirmButtonColor: '#004ac6',
    });
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Keluar dari Sistem?',
      text: 'Anda harus masuk kembali menggunakan kredensial admin untuk mengakses panel ini.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#004ac6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Keluar!',
      cancelButtonText: 'Batal',
      background: '#ffffff',
      color: '#0b1c30',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        
        Swal.fire({
          title: 'Berhasil Keluar!',
          text: 'Sampai jumpa kembali, Administrator.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          router.push('/login');
        });
      }
    });
  };

  const getInitials = (str: string) => {
    return str.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex font-sans">
      <aside className="w-64 bg-white border-r border-[#c3c6d7]/40 p-6 flex flex-col justify-between hidden md:flex shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-[#004ac6] flex items-center justify-center text-white shadow-md shadow-[#004ac6]/30">
              <span className="font-bold text-lg">🎓</span>
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-[#0b1c30] tracking-wide">AEWS</h1>
              <p className="text-[11px] text-[#434655]">Academic Early Warning System</p>
            </div>
          </div>

          <nav className="space-y-1">
            <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#516070] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition font-medium text-sm">
              <span>📊</span> Dashboard
            </a>
            <a href="/students" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#516070] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition font-medium text-sm">
              <span>👥</span> Student Management
            </a>
            <a href="/predictions" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#516070] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition font-medium text-sm">
              <span>📈</span> Predictions
            </a>
            <a href="/reports" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#e5eeff] text-[#004ac6] font-semibold text-sm">
              <span>📑</span> Reports
            </a>
            <a href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#516070] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition font-medium text-sm">
              <span>⚙️</span> Settings
            </a>
          </nav>
        </div>

        <div className="space-y-2 border-t border-[#c3c6d7]/30 pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition shadow-sm"
          >
            <span>🚪</span> Keluar (Logout)
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-20 bg-white border-b border-[#c3c6d7]/40 px-8 flex justify-between items-center sticky top-0 z-10 shadow-xs">
          <h2 className="text-xl font-bold text-[#0b1c30]">Institutional Reports & Export</h2>
          
          <div className="flex items-center gap-4">
            <div className="text-right">
              <p className="text-sm font-bold text-[#0b1c30]">{userName}</p>
              <p className="text-[11px] text-[#434655]">Administrator</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold shadow-md">
              {getInitials(userName)}
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div>
            <h3 className="text-2xl font-extrabold text-[#0b1c30]">Rekapitulasi & Unduhan Laporan</h3>
            <p className="text-sm text-[#434655]">Unduh laporan intervensi akademik dan rekam jejak performa mahasiswa secara berkala.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-[#e5eeff] text-[#004ac6] rounded-xl font-bold">📑</div>
                  <div>
                    <h4 className="font-bold text-lg text-[#0b1c30]">Laporan Risiko Akademik Bulanan</h4>
                    <p className="text-xs text-[#434655]">Rekapitulasi mahasiswa status *High Risk* dan catatan kehadiran.</p>
                  </div>
                </div>
                <p className="text-xs text-[#434655] leading-relaxed">
                  Laporan komprehensif berisi daftar mahasiswa yang memerlukan intervensi dini beserta persentase penurunan performa tugas dan e-learning.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[#c3c6d7]/30">
                <button 
                  onClick={() => handleExport('PDF')}
                  className="flex-1 py-2.5 bg-[#004ac6] text-white rounded-xl text-sm font-semibold hover:bg-[#003998] transition shadow-md shadow-[#004ac6]/30 text-center"
                >
                  Download PDF
                </button>
                <button 
                  onClick={() => handleExport('Excel')}
                  className="flex-1 py-2.5 bg-[#e5eeff] text-[#004ac6] rounded-xl text-sm font-semibold hover:bg-[#d5e4f8] transition text-center"
                >
                  Export Excel
                </button>
              </div>
            </div>

            <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl p-6 shadow-xs flex flex-col justify-between space-y-6">
              <div>
                <div className="flex items-center gap-3 mb-3">
                  <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl font-bold">📊</div>
                  <div>
                    <h4 className="font-bold text-lg text-[#0b1c30]">Evaluasi Akurasi Model Machine Learning</h4>
                    <p className="text-xs text-[#434655]">Analisis performa algoritma Random Forest dan FastAPI.</p>
                  </div>
                </div>
                <p className="text-xs text-[#434655] leading-relaxed">
                  Metrik evaluasi lengkap termasuk tingkat akurasi prediksi, *confusion matrix*, serta tingkat keberhasilan intervensi yang telah dijalankan.
                </p>
              </div>

              <div className="flex items-center gap-3 pt-4 border-t border-[#c3c6d7]/30">
                <button 
                  onClick={() => handleExport('ML-Summary-PDF')}
                  className="flex-1 py-2.5 bg-[#0b1c30] text-white rounded-xl text-sm font-semibold hover:bg-black transition text-center"
                >
                  Download Summary PDF
                </button>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl p-6 shadow-xs">
            <h4 className="font-bold text-lg text-[#0b1c30] mb-4">Riwayat Unduhan Sistem</h4>
            <div className="p-4 rounded-xl border border-dashed border-[#c3c6d7] text-center">
              <p className="text-xs text-[#434655]">Belum ada laporan yang diunduh pada sesi aktif ini.</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}