'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import Swal from 'sweetalert2';

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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
    return str.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const totalStudentsCount = summary?.totalStudents || 1;
  const highRiskCount = summary?.highRiskCount || 0;

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex font-sans">
      
      {/* SIDEBAR KIRI */}
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
            <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#e5eeff] text-[#004ac6] font-semibold text-sm">
              <span>📊</span> Dashboard
            </a>
            <a href="/students" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#516070] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition font-medium text-sm">
              <span>👥</span> Student Management
            </a>
            <a href="/predictions" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#516070] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition font-medium text-sm">
              <span>📈</span> Predictions
            </a>
            <a href="/reports" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#516070] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition font-medium text-sm">
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

      {/* KONTEN UTAMA KANAN */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        <header className="h-20 bg-white border-b border-[#c3c6d7]/40 px-8 flex justify-between items-center sticky top-0 z-10 shadow-xs">
          <h2 className="text-xl font-bold text-[#0b1c30]">Academic Institutional Overview</h2>
          
          <div className="flex items-center gap-4">
            <button className="p-2 rounded-full hover:bg-[#eff4ff] text-[#516070]">🔔</button>
            <button className="p-2 rounded-full hover:bg-[#eff4ff] text-[#516070]">❓</button>
            <div className="flex items-center gap-3 pl-3 border-l border-[#c3c6d7]/40">
              <div className="text-right">
                <p className="text-sm font-bold text-[#0b1c30]">{userName}</p>
                <p className="text-[11px] text-[#434655]">Administrator</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold shadow-md">
                {getInitials(userName)}
              </div>
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl p-6 shadow-xs">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[#e5eeff] text-[#004ac6] rounded-xl">👥</div>
                <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg">Active System</span>
              </div>
              <p className="text-xs font-bold text-[#434655] uppercase tracking-wider">Total Registered Students</p>
              <h3 className="text-3xl font-extrabold text-[#0b1c30] mt-1">
                {loading ? '...' : totalStudentsCount}
              </h3>
            </div>

            <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl p-6 shadow-xs">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-[#e5eeff] text-[#004ac6] rounded-xl">📅</div>
                <span className="text-xs font-bold text-[#004ac6] bg-[#e5eeff] px-2 py-1 rounded-lg">Real-time</span>
              </div>
              <p className="text-xs font-bold text-[#434655] uppercase tracking-wider">Avg. Attendance Rate</p>
              <h3 className="text-3xl font-extrabold text-[#0b1c30] mt-1">88.5%</h3>
            </div>

            <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl p-6 shadow-xs">
              <div className="flex justify-between items-start mb-4">
                <div className="p-3 bg-red-50 text-red-600 rounded-xl">⚠️</div>
                <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded-lg">Action Needed</span>
              </div>
              <p className="text-xs font-bold text-[#434655] uppercase tracking-wider">High Risk Academic Cases</p>
              <h3 className="text-3xl font-extrabold text-red-600 mt-1">
                {loading ? '...' : highRiskCount}
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl p-6 shadow-xs lg:col-span-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-[#0b1c30] mb-2">Student Risk Distribution</h3>
                <p className="text-xs text-[#434655] mb-6">Klasifikasi status dini berdasarkan prediksi model ML.</p>
                
                <div className="flex flex-col items-center justify-center my-4">
                  <div className="w-36 h-36 rounded-full border-8 border-emerald-500 border-t-amber-400 border-r-rose-600 flex flex-col items-center justify-center shadow-inner">
                    <span className="text-2xl font-extrabold text-[#0b1c30]">{totalStudentsCount}</span>
                    <span className="text-[10px] text-[#434655] font-bold uppercase tracking-wider">Evaluated</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#c3c6d7]/30 text-sm">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-[#434655]"><span className="w-3 h-3 rounded-full bg-emerald-500"></span> Low Risk (Safe)</span>
                  <span className="font-bold text-[#0b1c30]">85%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-[#434655]"><span className="w-3 h-3 rounded-full bg-amber-400"></span> Medium Risk</span>
                  <span className="font-bold text-[#0b1c30]">10%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-[#434655]"><span className="w-3 h-3 rounded-full bg-rose-600"></span> High Risk (Critical)</span>
                  <span className="font-bold text-[#0b1c30]">5%</span>
                </div>
              </div>
            </div>

            <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl p-6 shadow-xs lg:col-span-2 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-bold text-[#0b1c30]">Early Warning System Log</h3>
                  <span className="text-xs font-semibold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">FastAPI Connected</span>
                </div>

                <div className="p-4 rounded-xl bg-[#eff4ff] border border-[#c3c6d7]/30 mb-6">
                  <p className="text-sm font-semibold text-[#0b1c30] mb-1">Status Integrasi Machine Learning</p>
                  <p className="text-xs text-[#434655] leading-relaxed">
                    Sistem siap memproses data mahasiswa baru melalui menu <strong>Student Management</strong>. Anda dapat mengimpor data nilai dan absensi untuk melihat hasil kalkulasi peringatan dini secara otomatis.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-dashed border-[#c3c6d7] text-center">
                <p className="text-xs text-[#434655]">Belum ada data peringatan kritis baru yang tercatat pada sesi ini.</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}