'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import Swal from 'sweetalert2';

interface HighRiskStudent {
  id: string;
  nim: string;
  name: string;
  attendanceRate: number;
  assignmentScore: number;
  discussionPart: number;
  predictedScore: number;
  riskStatus: string;
}

// Tipe notifikasi
interface Notif {
  id: number;
  type: 'danger' | 'success' | 'info';
  title: string;
  message: string;
  time: string;
  read: boolean;
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [highRiskStudents, setHighRiskStudents] = useState<HighRiskStudent[]>([]);
  const [loadingHighRisk, setLoadingHighRisk] = useState(true);

  // State notifikasi
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const prevHighRiskCountRef = useRef<number | null>(null);
  const notifIdRef = useRef(0);
  const notifPanelRef = useRef<HTMLDivElement>(null);

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
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Gagal memuat data dashboard');
        return res.json();
      })
      .then((data) => {
        setSummary(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));

    // Ambil SEMUA mahasiswa, filter HANYA HIGH RISK (initial)
    const fetchHighRisk = async (isInitial: boolean) => {
      try {
        const res = await fetch('http://localhost:3001/students', {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) return;
        const data: HighRiskStudent[] = await res.json();
        const filtered = data
          .filter((s) => s.riskStatus === 'HIGH RISK')
          .sort((a, b) => b.predictedScore - a.predictedScore);
        setHighRiskStudents(filtered);
        setLoadingHighRisk(false);

        const currentCount = filtered.length;

        // Ambil count terakhir dari localStorage (persisten antar sesi)
        const savedCount = localStorage.getItem('aews_admin_hr_count');
        const prevCount = savedCount !== null ? parseInt(savedCount, 10) : null;

        if (prevCount !== null && currentCount !== prevCount) {
          if (currentCount > prevCount) {
            const diff = currentCount - prevCount;
            addNotif(
              'danger',
              `🚨 HIGH RISK Bertambah +${diff}`,
              `Data baru diinput. Kini ada ${currentCount} mahasiswa berisiko tinggi yang membutuhkan tindak lanjut segera.`
            );
          } else {
            const diff = prevCount - currentCount;
            addNotif(
              'success',
              `✅ Update Data: -${diff} HIGH RISK`,
              `${diff} mahasiswa berhasil diperbarui statusnya. Jumlah HIGH RISK saat ini: ${currentCount} mahasiswa.`
            );
          }
        }

        // Simpan count terbaru ke localStorage
        localStorage.setItem('aews_admin_hr_count', String(currentCount));
      } catch (e) {
        setLoadingHighRisk(false);
      }
    };

    fetchHighRisk(true);

    // Polling setiap 5 menit (cukup untuk skenario update 4 minggu sekali)
    const intervalId = setInterval(() => {
      fetchHighRisk(false);
      fetch('http://localhost:3001/dashboard/summary', {
        headers: { Authorization: `Bearer ${token}` },
      }).then(r => r.ok ? r.json() : null).then(d => { if (d) setSummary(d); }).catch(() => {});
    }, 5 * 60 * 1000);

    return () => clearInterval(intervalId);
  }, [router]);

  // Tutup panel notifikasi jika klik di luar
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifPanelRef.current && !notifPanelRef.current.contains(e.target as Node)) {
        setShowNotifPanel(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addNotif = useCallback((type: Notif['type'], title: string, message: string) => {
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    setNotifications(prev => [
      { id: ++notifIdRef.current, type, title, message, time: now, read: false },
      ...prev.slice(0, 19),
    ]);
  }, []);

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
        localStorage.removeItem('userRole');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';

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

  const totalStudents = summary?.totalStudents || 0;
  const highRiskCount = summary?.highRiskCount || 0;
  const mediumRiskCount = summary?.mediumRiskCount || 0;
  const safeCount = summary?.safeCount || 0;
  const avgAttendance = summary?.averageAttendance || 0;

  const safePercent = totalStudents > 0 ? Math.round((safeCount / totalStudents) * 100) : 0;
  const mediumPercent = totalStudents > 0 ? Math.round((mediumRiskCount / totalStudents) * 100) : 0;
  const highPercent = totalStudents > 0 ? Math.round((highRiskCount / totalStudents) * 100) : 0;

  const CIRCUMFERENCE = 251.2;
  const safeStroke = (safePercent / 100) * CIRCUMFERENCE;
  const mediumStroke = (mediumPercent / 100) * CIRCUMFERENCE;
  const highStroke = (highPercent / 100) * CIRCUMFERENCE;

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-[#f0f4ff] text-[#0b1c30] flex font-sans">

      {/* OVERLAY MOBILE */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#0b1c30]/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* ────────────── SIDEBAR ────────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between shadow-xl md:shadow-sm transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#004ac6] to-[#003090] flex items-center justify-center text-white shadow-lg shadow-blue-300/40">
                <span className="font-bold text-lg">🎓</span>
              </div>
              <div>
                <h1 className="font-extrabold text-lg text-[#0b1c30] tracking-wide">AEWS</h1>
                <p className="text-[10px] text-slate-400 font-medium">Academic Early Warning</p>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-gray-700 text-2xl leading-none">
              &times;
            </button>
          </div>

          {/* Nav */}
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Main Menu</p>
          <nav className="space-y-1">
            <a href="/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#004ac6] to-blue-600 text-white font-semibold text-sm shadow-md shadow-blue-200/50">
              <span>📊</span> Dashboard
            </a>
            <a href="/students" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:bg-blue-50 hover:text-[#004ac6] transition-all font-medium text-sm">
              <span>👥</span> Student Management
            </a>
            <a href="/predictions" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:bg-blue-50 hover:text-[#004ac6] transition-all font-medium text-sm">
              <span>📈</span> Predictions
            </a>
            <a href="/reports" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:bg-blue-50 hover:text-[#004ac6] transition-all font-medium text-sm">
              <span>📑</span> Reports
            </a>
            <a href="/settings" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:bg-blue-50 hover:text-[#004ac6] transition-all font-medium text-sm">
              <span>⚙️</span> Settings
            </a>
          </nav>
        </div>

        {/* Logout */}
        <div className="border-t border-slate-100 pt-4 mt-4">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-100 py-2.5 text-sm font-semibold text-red-500 hover:bg-red-100 transition-all"
          >
            <span>🚪</span> Keluar
          </button>
        </div>
      </aside>

      {/* ────────────── MAIN CONTENT ────────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* HEADER */}
        <header className="h-16 md:h-[68px] bg-white border-b border-slate-200 px-4 md:px-8 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div>
              <h2 className="text-base md:text-lg font-extrabold text-[#0b1c30]">Admin Dashboard</h2>
              <p className="text-[11px] text-slate-400 hidden sm:block">{today}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Notif bell + panel */}
            <div className="relative" ref={notifPanelRef}>
              <button
                onClick={() => {
                  setShowNotifPanel(p => !p);
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                }}
                className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-blue-50 hover:border-blue-200 transition-all"
              >
                🔔
              </button>
              {/* Badge unread */}
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-500 text-white text-[9px] font-black rounded-full flex items-center justify-center shadow-sm animate-bounce">
                  {notifications.filter(n => !n.read).length > 9 ? '9+' : notifications.filter(n => !n.read).length}
                </span>
              )}

              {/* Dropdown panel notifikasi */}
              {showNotifPanel && (
                <div className="absolute right-0 top-11 w-80 bg-white border border-slate-200 rounded-2xl shadow-2xl shadow-slate-300/40 z-50 overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                    <h4 className="text-sm font-extrabold text-[#0b1c30]">Notifikasi Admin</h4>
                    {notifications.length > 0 && (
                      <button
                        onClick={() => setNotifications([])}
                        className="text-[10px] text-slate-400 hover:text-rose-500 font-semibold transition-colors"
                      >
                        Hapus Semua
                      </button>
                    )}
                  </div>
                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-50">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 px-4">
                        <span className="text-3xl opacity-40 mb-2">🔔</span>
                        <p className="text-xs text-slate-400 font-medium text-center">Belum ada notifikasi.</p>
                        <p className="text-[10px] text-slate-300 text-center mt-1">Sistem akan memberi tahu jika jumlah HIGH RISK berubah.</p>
                      </div>
                    ) : (
                      notifications.map(notif => (
                        <div key={notif.id} className={`px-4 py-3 flex gap-3 hover:bg-slate-50 transition-colors ${
                          !notif.read ? 'bg-blue-50/30' : ''
                        }`}>
                          <div className={`w-8 h-8 shrink-0 rounded-full flex items-center justify-center text-sm ${
                            notif.type === 'danger' ? 'bg-rose-100 text-rose-600' :
                            notif.type === 'success' ? 'bg-emerald-100 text-emerald-600' :
                            'bg-blue-100 text-blue-600'
                          }`}>
                            {notif.type === 'danger' ? '🚨' : notif.type === 'success' ? '✅' : 'ℹ️'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-[#0b1c30] leading-snug">{notif.title}</p>
                            <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">{notif.message}</p>
                            <p className="text-[9px] text-slate-300 mt-1 font-medium">{notif.time}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
                    <p className="text-[9px] text-slate-400 text-center">Polling otomatis setiap 30 detik · AI: Random Forest</p>
                  </div>
                </div>
              )}
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#004ac6] to-sky-400 text-white flex items-center justify-center font-bold text-sm shadow cursor-pointer">
              {getInitials(userName)}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">

          {/* ── ALERT BANNER HIGH RISK ── */}
          {!loading && highRiskCount > 0 && (
            <div className="flex items-start gap-4 bg-gradient-to-r from-rose-600 to-red-500 text-white rounded-2xl p-4 md:p-5 shadow-lg shadow-rose-300/30 animate-pulse-once">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-white/20 flex items-center justify-center text-xl">
                🚨
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm md:text-base">Peringatan: {highRiskCount} Mahasiswa Terdeteksi Berisiko Tinggi!</p>
                <p className="text-xs text-red-100 mt-0.5">Sistem AI mendeteksi mahasiswa dengan kemungkinan kegagalan akademik. Segera lakukan tindak lanjut dan intervensi.</p>
              </div>
              <a href="/students" className="shrink-0 bg-white text-rose-600 text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-red-50 transition-colors">
                Lihat →
              </a>
            </div>
          )}

          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Total */}
            <div className="col-span-2 lg:col-span-1 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">👥</div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Active</span>
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Mahasiswa</p>
              <h3 className="text-3xl font-black text-[#0b1c30] mt-0.5">
                {loading ? <span className="animate-pulse text-slate-200">--</span> : totalStudents}
              </h3>
            </div>

            {/* High Risk Card — menonjol */}
            <div className="col-span-2 lg:col-span-1 bg-gradient-to-br from-rose-500 to-red-600 rounded-2xl p-5 shadow-lg shadow-rose-300/30 hover:shadow-xl hover:-translate-y-0.5 transition-all relative overflow-hidden">
              <div className="absolute -right-3 -bottom-3 w-20 h-20 bg-white/10 rounded-full"></div>
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center text-xl">🚨</div>
                <span className="text-[10px] font-bold text-white bg-white/20 px-2 py-0.5 rounded-full animate-pulse">Kritis</span>
              </div>
              <p className="text-[11px] font-bold text-red-100 uppercase tracking-wider">High Risk</p>
              <h3 className="text-3xl font-black text-white mt-0.5">
                {loading ? <span className="animate-pulse text-red-300">--</span> : highRiskCount}
              </h3>
              <p className="text-[10px] text-red-200 mt-1">{highPercent}% dari total mahasiswa</p>
            </div>

            {/* Medium Risk */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-xl">⚠️</div>
                <span className="text-[10px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">Monitor</span>
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Medium Risk</p>
              <h3 className="text-3xl font-black text-amber-500 mt-0.5">
                {loading ? <span className="animate-pulse text-slate-200">--</span> : mediumRiskCount}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">{mediumPercent}% dari total</p>
            </div>

            {/* Safe */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-xl">✅</div>
                <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">Aman</span>
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Low Risk (Safe)</p>
              <h3 className="text-3xl font-black text-emerald-600 mt-0.5">
                {loading ? <span className="animate-pulse text-slate-200">--</span> : safeCount}
              </h3>
              <p className="text-[10px] text-slate-400 mt-1">{safePercent}% dari total</p>
            </div>

          </div>

          {/* ── CHART + TABEL HIGH RISK ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6">

            {/* Donut Chart */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm flex flex-col">
              <h3 className="text-base font-extrabold text-[#0b1c30]">Risk Distribution</h3>
              <p className="text-[11px] text-slate-400 mt-0.5 mb-5">Klasifikasi status AI seluruh mahasiswa</p>

              <div className="flex flex-col items-center justify-center flex-1 relative">
                <svg width="160" height="160" viewBox="0 0 100 100" className="transform -rotate-90 drop-shadow-md">
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#f1f5f9" strokeWidth="13" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#10b981" strokeWidth="13"
                    strokeDasharray={`${safeStroke} ${CIRCUMFERENCE}`}
                    strokeLinecap="round" className="transition-all duration-1000 ease-out" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#fbbf24" strokeWidth="13"
                    strokeDasharray={`${mediumStroke} ${CIRCUMFERENCE}`} strokeDashoffset={-safeStroke}
                    strokeLinecap="round" className="transition-all duration-1000 ease-out delay-300" />
                  <circle cx="50" cy="50" r="40" fill="transparent" stroke="#e11d48" strokeWidth="13"
                    strokeDasharray={`${highStroke} ${CIRCUMFERENCE}`} strokeDashoffset={-(safeStroke + mediumStroke)}
                    strokeLinecap="round" className="transition-all duration-1000 ease-out delay-700" />
                </svg>
                <div className="absolute flex flex-col items-center">
                  <span className="text-2xl font-black text-[#0b1c30] leading-none">{totalStudents}</span>
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">Total</span>
                </div>
              </div>

              <div className="space-y-3 pt-5 mt-4 border-t border-slate-100 text-sm">
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-slate-600 font-medium text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-200"></span> Low Risk (Safe)
                  </span>
                  <span className="font-extrabold text-emerald-600 text-xs">{safePercent}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-slate-600 font-medium text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span> Medium Risk
                  </span>
                  <span className="font-extrabold text-amber-500 text-xs">{mediumPercent}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="flex items-center gap-2 text-slate-600 font-medium text-xs">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-600"></span> High Risk (Critical)
                  </span>
                  <span className="font-extrabold text-rose-600 text-xs">{highPercent}%</span>
                </div>
              </div>

              {/* Avg Attendance */}
              <div className="mt-4 pt-4 border-t border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Avg. Attendance Rate</p>
                <div className="flex items-end gap-2">
                  <span className="text-2xl font-black text-[#0b1c30]">{avgAttendance}%</span>
                  <div className="flex-1 h-2 bg-slate-100 rounded-full mb-1.5 overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-[#004ac6] rounded-full transition-all duration-700"
                      style={{ width: `${avgAttendance}%` }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Tabel HIGH RISK ONLY */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 md:p-6 shadow-sm lg:col-span-2 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div>
                  <h3 className="text-base font-extrabold text-[#0b1c30]">Daftar Mahasiswa High Risk</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Hanya menampilkan mahasiswa dengan status kritis yang butuh intervensi segera.</p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <span className="flex items-center gap-1.5 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                    {highRiskStudents.length} Kasus Kritis
                  </span>
                </div>
              </div>

              {loadingHighRisk ? (
                <div className="flex-1 flex flex-col gap-3">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-16 rounded-xl bg-slate-100 animate-pulse"></div>
                  ))}
                </div>
              ) : highRiskStudents.length > 0 ? (
                <div className="flex-1 overflow-y-auto space-y-2.5 max-h-[380px] pr-1">
                  {highRiskStudents.map((student, index) => (
                    <div
                      key={student.id}
                      className="p-3.5 rounded-xl border border-rose-100 bg-gradient-to-r from-rose-50/60 to-white flex items-center justify-between gap-3 hover:border-rose-300 hover:shadow-sm transition-all group"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 shrink-0 rounded-full bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center text-xs font-black shadow-sm shadow-rose-200">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-[#0b1c30] truncate">{student.name}</p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            NIM: {student.nim} &nbsp;·&nbsp; Kehadiran {student.attendanceRate}% &nbsp;·&nbsp; Tugas {student.assignmentScore}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        <div className="text-right">
                          <p className="text-sm font-black text-rose-600 leading-none">{student.predictedScore}%</p>
                          <p className="text-[9px] text-slate-400 mt-0.5">AI Score</p>
                        </div>
                        <span className="text-[10px] font-bold text-rose-600 bg-rose-50 border border-rose-200 px-2 py-0.5 rounded-md hidden sm:block">
                          HIGH RISK
                        </span>
                        <a href="/students" className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center text-xs font-bold hover:bg-rose-700 transition-colors shadow-sm opacity-0 group-hover:opacity-100">
                          →
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center p-8 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50/50 min-h-[200px]">
                  <span className="text-4xl mb-3 opacity-60">✨</span>
                  <p className="text-sm font-bold text-slate-500">Semua Mahasiswa Terpantau Aman</p>
                  <p className="text-xs text-slate-400 mt-1 text-center max-w-xs">Belum ada mahasiswa dengan status High Risk yang terdeteksi oleh sistem AI.</p>
                </div>
              )}

              {highRiskStudents.length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-100">
                  <a href="/students" className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl border border-rose-200 text-rose-600 text-sm font-bold hover:bg-rose-50 transition-colors">
                    Lihat Semua Mahasiswa di Student Management →
                  </a>
                </div>
              )}
            </div>

          </div>

        </div>
      </main>
    </div>
  );
}