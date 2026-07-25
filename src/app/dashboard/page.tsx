'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import Swal from 'sweetalert2';

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    const savedName = localStorage.getItem('userName');
    if (savedName) setUserName(savedName);

    fetch('http://localhost:3001/dashboard/summary', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Gagal memuat data dashboard');
        return res.json();
      })
      .then((data) => {
        setSummary(data);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
      });
  }, [router]);

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
    if (!str) return '...';
    return str.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // =====================================================================
  // PERHITUNGAN MATEMATIKA DATA DINAMIS
  // =====================================================================
  // Mengambil data dari backend dengan fallback angka 0 jika belum ada data
  const totalStudents = summary?.totalStudents || 0;
  const highRiskCount = summary?.highRiskCount || 0;
  const mediumRiskCount = summary?.mediumRiskCount || 0;
  const safeCount = summary?.safeCount || 0;
  
  // Asumsi backend mengirim rata-rata kehadiran, jika tidak kita set default 0
  const avgAttendance = summary?.averageAttendance || 0; 

  // Kalkulasi persentase untuk chart dan progress bar
  const safePercent = totalStudents > 0 ? Math.round((safeCount / totalStudents) * 100) : 0;
  const mediumPercent = totalStudents > 0 ? Math.round((mediumRiskCount / totalStudents) * 100) : 0;
  const highPercent = totalStudents > 0 ? Math.round((highRiskCount / totalStudents) * 100) : 0;

  // Rumus untuk lingkaran SVG (Keliling Lingkaran = 2 * PI * r)
  // r = 40, Keliling = ~251.2
  const CIRCUMFERENCE = 251.2;
  const safeStroke = (safePercent / 100) * CIRCUMFERENCE;
  const mediumStroke = (mediumPercent / 100) * CIRCUMFERENCE;
  const highStroke = (highPercent / 100) * CIRCUMFERENCE;

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex font-sans">
      
      {/* SIDEBAR KIRI */}
      <aside className="w-64 bg-white border-r border-[#c3c6d7]/40 p-6 flex flex-col justify-between hidden md:flex shadow-sm z-20">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#004ac6] to-[#002f80] flex items-center justify-center text-white shadow-md shadow-[#004ac6]/30 hover:scale-105 transition-transform">
              <span className="font-bold text-lg">🎓</span>
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-[#0b1c30] tracking-wide">AEWS</h1>
              <p className="text-[11px] text-[#434655]">Academic Early Warning System</p>
            </div>
          </div>

          <nav className="space-y-1">
            <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#e5eeff] text-[#004ac6] font-semibold text-sm shadow-sm transition-all hover:bg-blue-100">
              <span>📊</span> Dashboard
            </a>
            <a href="/students" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#516070] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-all font-medium text-sm hover:pl-5">
              <span>👥</span> Student Management
            </a>
            <a href="/predictions" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#516070] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-all font-medium text-sm hover:pl-5">
              <span>📈</span> Predictions
            </a>
            <a href="/reports" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#516070] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-all font-medium text-sm hover:pl-5">
              <span>📑</span> Reports
            </a>
            <a href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#516070] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition-all font-medium text-sm hover:pl-5">
              <span>⚙️</span> Settings
            </a>
          </nav>
        </div>

        <div className="space-y-2 border-t border-[#c3c6d7]/30 pt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-100 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition-all hover:shadow-md"
          >
            <span>🚪</span> Keluar 
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA KANAN */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        <header className="h-20 bg-white/80 backdrop-blur-md border-b border-[#c3c6d7]/40 px-8 flex justify-between items-center sticky top-0 z-10 shadow-xs">
          <h2 className="text-xl font-extrabold text-[#0b1c30] bg-clip-text text-transparent bg-gradient-to-r from-[#004ac6] to-slate-800">
            Institutional Dashboard
          </h2>
          
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-blue-50 text-[#516070] transition-colors relative">
              🔔
              {highRiskCount > 0 && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full animate-ping"></span>
              )}
            </button>
            <div className="flex items-center gap-3 pl-3 border-l border-[#c3c6d7]/40">
              <div className="text-right">
                <p className="text-sm font-bold text-[#0b1c30]">{userName}</p>
                <p className="text-[11px] text-[#434655]">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#004ac6] to-sky-500 text-white flex items-center justify-center font-bold shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                {getInitials(userName)}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-7xl mx-auto w-full">
          
          {/* STATISTIK ATAS */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            
            <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-blue-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 bg-gradient-to-br from-[#e5eeff] to-blue-100 text-[#004ac6] rounded-xl shadow-inner">👥</div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                </span>
              </div>
              <p className="text-xs font-bold text-[#516070] uppercase tracking-wider relative z-10">Total Registered Students</p>
              <h3 className="text-4xl font-black text-[#0b1c30] mt-1 tracking-tight relative z-10">
                {loading ? <span className="animate-pulse text-gray-300">...</span> : totalStudents}
              </h3>
            </div>

            <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 bg-gradient-to-br from-amber-50 to-amber-100 text-amber-600 rounded-xl shadow-inner">📅</div>
                <span className="text-xs font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full border border-amber-200">Real-time</span>
              </div>
              <p className="text-xs font-bold text-[#516070] uppercase tracking-wider relative z-10">Avg. Attendance Rate</p>
              <h3 className="text-4xl font-black text-[#0b1c30] mt-1 tracking-tight relative z-10">
                {loading ? <span className="animate-pulse text-gray-300">...</span> : `${avgAttendance}%`}
              </h3>
            </div>

            <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl p-6 shadow-sm hover:-translate-y-1 hover:shadow-xl transition-all duration-300 relative overflow-hidden group">
              <div className="absolute -right-4 -top-4 w-24 h-24 bg-rose-50 rounded-full opacity-50 group-hover:scale-150 transition-transform duration-500"></div>
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="p-3 bg-gradient-to-br from-rose-50 to-red-100 text-rose-600 rounded-xl shadow-inner">⚠️</div>
                <span className="text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-full border border-rose-200 animate-pulse">Action Needed</span>
              </div>
              <p className="text-xs font-bold text-[#516070] uppercase tracking-wider relative z-10">High Risk Academic Cases</p>
              <h3 className="text-4xl font-black text-rose-600 mt-1 tracking-tight relative z-10">
                {loading ? <span className="animate-pulse text-rose-200">...</span> : highRiskCount}
              </h3>
            </div>

          </div>

          {/* BAGIAN TENGAH (CHART & LOG) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* KARTU CHART DISTRIBUSI (SVG DINAMIS) */}
            <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl p-7 shadow-sm lg:col-span-1 flex flex-col justify-between hover:shadow-md transition-shadow">
              <div>
                <h3 className="text-lg font-extrabold text-[#0b1c30] mb-1">Student Risk Distribution</h3>
                <p className="text-xs text-[#516070] mb-8 font-medium">Klasifikasi status dini berdasarkan prediksi Random Forest.</p>
                
                {/* SVG DONUT CHART */}
                <div className="flex flex-col items-center justify-center my-4 relative">
                  <svg width="180" height="180" viewBox="0 0 100 100" className="transform -rotate-90 filter drop-shadow-md">
                    {/* Background Circle */}
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="12" />
                    
                    {/* Safe Circle (Green) */}
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="12" 
                      strokeDasharray={`${safeStroke} ${CIRCUMFERENCE}`}
                      strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                    
                    {/* Medium Risk Circle (Yellow) - Offset by Safe */}
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#fbbf24" strokeWidth="12"
                      strokeDasharray={`${mediumStroke} ${CIRCUMFERENCE}`} strokeDashoffset={-safeStroke}
                      strokeLinecap="round" className="transition-all duration-1000 ease-out delay-300" />
                    
                    {/* High Risk Circle (Red) - Offset by Safe + Medium */}
                    <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e11d48" strokeWidth="12"
                      strokeDasharray={`${highStroke} ${CIRCUMFERENCE}`} strokeDashoffset={-(safeStroke + mediumStroke)}
                      strokeLinecap="round" className="transition-all duration-1000 ease-out delay-700" />
                  </svg>
                  
                  {/* Teks di tengah Donut */}
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-black text-[#0b1c30] leading-none">{totalStudents}</span>
                    <span className="text-[10px] text-[#516070] font-bold uppercase tracking-widest mt-1">Total</span>
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-6 mt-4 border-t border-[#c3c6d7]/30 text-sm">
                <div className="flex justify-between items-center group cursor-default">
                  <span className="flex items-center gap-3 text-[#434655] font-medium group-hover:text-emerald-600 transition-colors">
                    <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></span> Low Risk (Safe)
                  </span>
                  <span className="font-bold text-[#0b1c30] group-hover:text-emerald-600">{safePercent}%</span>
                </div>
                <div className="flex justify-between items-center group cursor-default">
                  <span className="flex items-center gap-3 text-[#434655] font-medium group-hover:text-amber-500 transition-colors">
                    <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-200"></span> Medium Risk
                  </span>
                  <span className="font-bold text-[#0b1c30] group-hover:text-amber-500">{mediumPercent}%</span>
                </div>
                <div className="flex justify-between items-center group cursor-default">
                  <span className="flex items-center gap-3 text-[#434655] font-medium group-hover:text-rose-600 transition-colors">
                    <span className="w-3 h-3 rounded-full bg-rose-600 shadow-sm shadow-rose-200"></span> High Risk (Critical)
                  </span>
                  <span className="font-bold text-[#0b1c30] group-hover:text-rose-600">{highPercent}%</span>
                </div>
              </div>
            </div>

            {/* KARTU LOG AKTIVITAS AI */}
            <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl p-7 shadow-sm lg:col-span-2 flex flex-col">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-extrabold text-[#0b1c30]">Machine Learning Integration</h3>
                  <p className="text-xs text-[#516070] mt-1 font-medium">Monitoring koneksi FastAPI & Algoritma</p>
                </div>
                <span className="flex items-center gap-2 text-xs font-bold text-sky-700 bg-sky-50 px-3 py-1.5 rounded-full border border-sky-200 shadow-sm">
                  <span className="w-2 h-2 rounded-full bg-sky-500 animate-pulse"></span> Engine Online
                </span>
              </div>

              <div className="flex-1 flex flex-col gap-4">
                
                {/* Notifikasi Sistem Aktif */}
                <div className="p-5 rounded-2xl bg-gradient-to-r from-[#eff4ff] to-white border border-blue-100 flex gap-4 items-start shadow-sm">
                  <div className="p-2 bg-blue-100 text-blue-600 rounded-lg shrink-0">⚡</div>
                  <div>
                    <p className="text-sm font-bold text-[#0b1c30] mb-1">Algoritma Random Forest Siap</p>
                    <p className="text-xs text-[#516070] leading-relaxed">
                      Sistem terhubung penuh dengan <em>engine</em> AI. Silakan tambahkan atau impor data mahasiswa melalui menu <strong>Student Management</strong> untuk menjalankan proses kalkulasi secara <em>real-time</em>.
                    </p>
                  </div>
                </div>

                {/* Simulasi List Peringatan Terbaru */}
                <h4 className="text-xs font-bold text-[#516070] uppercase tracking-wider mt-2 px-1">Recent AI Alerts</h4>
                
                {highRiskCount > 0 ? (
                  <div className="flex-1 space-y-3 overflow-y-auto pr-2 custom-scrollbar">
                    {/* Baris ini akan dirender dari data backend nanti, ini mockup dinamisnya */}
                    <div className="p-4 rounded-xl border border-rose-100 bg-rose-50/30 flex justify-between items-center hover:bg-rose-50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-rose-500"></div>
                        <div>
                          <p className="text-sm font-bold text-[#0b1c30]">Deteksi Anomali Nilai</p>
                          <p className="text-[11px] text-[#516070] mt-0.5">Model memprediksi potensi kegagalan dari absensi rendah.</p>
                        </div>
                      </div>
                      <a href="/students" className="text-xs font-bold text-rose-600 hover:underline">Lihat Data</a>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center p-6 rounded-xl border border-dashed border-[#c3c6d7] bg-gray-50/50">
                    <span className="text-3xl mb-2 opacity-50">✨</span>
                    <p className="text-sm font-bold text-[#516070]">Semua Parameter Terpantau Aman</p>
                    <p className="text-[11px] text-[#9ca3af] mt-1 text-center">Belum ada data peringatan kritis baru yang tercatat oleh sistem AI pada sesi ini.</p>
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}