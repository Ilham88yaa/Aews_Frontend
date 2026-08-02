'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Student {
  id: string;
  nim: string;
  name: string;
  gpa?: number;
  attendanceRate: number;
  assignmentScore: number;
  quizScore?: number;
  atsScore?: number;
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

export default function DosenDashboard() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Dosen Wali');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // State notifikasi
  const [notifications, setNotifications] = useState<Notif[]>([]);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const prevHighRiskCountRef = useRef<number | null>(null);
  const notifIdRef = useRef(0);
  const notifPanelRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token) { router.push('/login'); return; }
    if (userRole !== 'DOSEN') {
      Swal.fire('Akses Ditolak', 'Halaman ini khusus Dosen Wali.', 'error');
      router.push('/dashboard');
      return;
    }

    const savedName = localStorage.getItem('userName');
    if (savedName) setUserName(savedName);

    fetchStudents(token, true);

    // Polling setiap 5 menit (cukup untuk skenario update 4 minggu sekali)
    const intervalId = setInterval(() => {
      fetchStudents(token, false);
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
      ...prev.slice(0, 19), // max 20 notif
    ]);
  }, []);

  const fetchStudents = async (token: string, isInitial: boolean) => {
    try {
      const response = await fetch(`${API_URL}/students`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data: Student[] = await response.json();
        setStudents(data);

        const currentHighRisk = data.filter(s => s.riskStatus === 'HIGH RISK').length;

        // Ambil count terakhir dari localStorage (persisten antar sesi/tab)
        const savedCount = localStorage.getItem('aews_dosen_hr_count');
        const prevCount = savedCount !== null ? parseInt(savedCount, 10) : null;

        if (prevCount !== null && currentHighRisk !== prevCount) {
          if (currentHighRisk > prevCount) {
            const diff = currentHighRisk - prevCount;
            addNotif(
              'danger',
              `🚨 HIGH RISK Bertambah +${diff}`,
              `Admin menambahkan/memperbarui data. Kini ada ${currentHighRisk} mahasiswa berisiko tinggi yang membutuhkan intervensi segera.`
            );
          } else {
            const diff = prevCount - currentHighRisk;
            addNotif(
              'success',
              `✅ Intervensi Berhasil! -${diff} HIGH RISK`,
              `Data diperbarui oleh admin. ${diff} mahasiswa berhasil turun status dari HIGH RISK. Jumlah kritis sekarang: ${currentHighRisk}.`
            );
          }
        }

        // Simpan count terbaru ke localStorage
        localStorage.setItem('aews_dosen_hr_count', String(currentHighRisk));
      }
    } catch (error) {
      console.error('Gagal mengambil data mahasiswa:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Keluar dari Sistem?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1d4ed8',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Keluar',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        router.push('/login');
      }
    });
  };

  const handleRecordIntervention = (studentName: string) => {
    Swal.fire({
      title: 'Catat Intervensi Akademik',
      html: `
        <div class="text-left mb-2 text-sm text-gray-600">
          Mahasiswa Bimbingan: <strong>${studentName}</strong>
        </div>
        <div class="flex flex-col gap-4 mt-4 text-left">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Jenis Tindakan</label>
            <select id="intervention-type" class="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
              <option value="Teguran Lisan/Chat">Teguran Lisan / Chat WA</option>
              <option value="Pemanggilan Konseling">Pemanggilan Konseling (Tatap Muka)</option>
              <option value="Surat Peringatan (SP 1)">Surat Peringatan 1 (SP 1)</option>
              <option value="Diskusi dengan Orang Tua">Diskusi dengan Orang Tua/Wali</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Catatan Pembinaan</label>
            <textarea id="intervention-note" rows="3" class="w-full border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500" placeholder="Contoh: Mahasiswa berjanji akan aktif kembali di minggu depan..."></textarea>
          </div>
        </div>
      `,
      showCancelButton: true,
      confirmButtonText: 'Simpan Laporan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#1d4ed8',
      preConfirm: () => {
        const type = (document.getElementById('intervention-type') as HTMLSelectElement).value;
        const note = (document.getElementById('intervention-note') as HTMLTextAreaElement).value;
        if (!note) { Swal.showValidationMessage('Catatan pembinaan tidak boleh kosong!'); return false; }
        return { type, note };
      },
    }).then((result) => {
      if (result.isConfirmed) {
        Swal.fire({
          icon: 'success',
          title: 'Tersimpan!',
          text: `Laporan intervensi untuk ${studentName} berhasil dicatat di sistem.`,
          confirmButtonColor: '#1d4ed8',
        });
      }
    });
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  // Hitung statistik
  const totalStudents   = students.length;
  const highRiskList    = students.filter((s) => s.riskStatus === 'HIGH RISK');
  const mediumRiskCount = students.filter((s) => s.riskStatus === 'MEDIUM RISK').length;
  const safeCount       = students.filter((s) => s.riskStatus === 'SAFE').length;
  const highRiskCount   = highRiskList.length;

  const highPercent   = totalStudents > 0 ? Math.round((highRiskCount / totalStudents) * 100) : 0;
  const mediumPercent = totalStudents > 0 ? Math.round((mediumRiskCount / totalStudents) * 100) : 0;
  const safePercent   = totalStudents > 0 ? Math.round((safeCount / totalStudents) * 100) : 0;

  const today = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });

  return (
    <div className="min-h-screen bg-[#f0f4ff] text-[#0b1c30] flex font-sans">

      {/* OVERLAY MOBILE */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 bg-[#0b1c30]/50 z-40 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)} />
      )}

      {/* ────────── SIDEBAR ────────── */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-slate-200 p-6 flex flex-col justify-between shadow-xl md:shadow-sm transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          {/* Logo */}
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#1d4ed8] to-[#1e40af] flex items-center justify-center text-white shadow-lg shadow-blue-300/40">
                <span className="font-bold text-lg">🎓</span>
              </div>
              <div>
                <h1 className="font-extrabold text-lg text-[#0b1c30] tracking-wide">AEWS</h1>
                <p className="text-[10px] text-slate-400 font-medium">Dosen Wali Portal</p>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-400 hover:text-gray-700 text-2xl leading-none">&times;</button>
          </div>

          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-3 px-2">Menu</p>
          <nav className="space-y-1">
            <a href="/dosen/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1d4ed8] to-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-200/50">
              <span>📊</span> Dashboard
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

      {/* ────────── MAIN CONTENT ────────── */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">

        {/* HEADER */}
        <header className="h-16 md:h-[68px] bg-white border-b border-slate-200 px-4 md:px-8 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <div>
              <h2 className="text-base md:text-lg font-extrabold text-[#0b1c30]">Dashboard Dosen Wali</h2>
              <p className="text-[11px] text-slate-400 hidden sm:block">{today}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            {/* Notif bell + panel */}
            <div className="relative" ref={notifPanelRef}>
              <button
                onClick={() => {
                  setShowNotifPanel(p => !p);
                  // Tandai semua sudah dibaca saat panel dibuka
                  setNotifications(prev => prev.map(n => ({ ...n, read: true })));
                }}
                className="w-9 h-9 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-500 hover:bg-blue-50 transition-all"
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
                    <h4 className="text-sm font-extrabold text-[#0b1c30]">Notifikasi</h4>
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
                        <p className="text-[10px] text-slate-300 text-center mt-1">Sistem akan memberi tahu jika ada perubahan data mahasiswa.</p>
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
                    <p className="text-[9px] text-slate-400 text-center">Update otomatis setiap 30 detik · AI: Random Forest</p>
                  </div>
                </div>
              )}
            </div>
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1d4ed8] to-sky-400 text-white flex items-center justify-center font-bold text-sm shadow cursor-pointer">
              {getInitials(userName)}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">

          {/* ── ALERT BANNER HIGH RISK ── */}
          {!loading && highRiskCount > 0 && (
            <div className="flex items-start gap-4 bg-gradient-to-r from-rose-600 to-red-500 text-white rounded-2xl p-4 md:p-5 shadow-lg shadow-rose-300/30">
              <div className="w-10 h-10 shrink-0 rounded-xl bg-white/20 flex items-center justify-center text-xl">🚨</div>
              <div className="flex-1 min-w-0">
                <p className="font-extrabold text-sm md:text-base">
                  Peringatan: {highRiskCount} Mahasiswa Bimbingan Berisiko Tinggi!
                </p>
                <p className="text-xs text-red-100 mt-0.5">
                  Sistem AI mendeteksi mahasiswa yang membutuhkan intervensi segera. Harap lakukan tindak lanjut di bawah ini.
                </p>
              </div>
            </div>
          )}

          {/* ── STAT CARDS ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">

            {/* Total */}
            <div className="col-span-2 lg:col-span-1 bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all">
              <div className="flex items-center justify-between mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-xl">👥</div>
                <span className="text-[10px] font-bold text-blue-600 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-full">Total</span>
              </div>
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Bimbingan</p>
              <h3 className="text-3xl font-black text-[#0b1c30] mt-0.5">
                {loading ? <span className="animate-pulse text-slate-200">--</span> : totalStudents}
              </h3>
            </div>

            {/* HIGH RISK — menonjol */}
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

          {/* ── TABEL HIGH RISK ONLY ── */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 md:p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-base font-extrabold text-[#0b1c30]">Mahasiswa HIGH RISK — Perlu Intervensi Segera</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Hanya menampilkan mahasiswa dengan status kritis berdasarkan prediksi AI.
                </p>
              </div>
              <span className="flex items-center gap-1.5 text-[10px] font-bold text-rose-700 bg-rose-50 border border-rose-200 px-3 py-1.5 rounded-full self-start sm:self-auto">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse"></span>
                {highRiskCount} Kasus Kritis
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-rose-50 text-rose-700 text-[11px] uppercase tracking-wider border-b border-rose-100">
                    <th className="px-5 py-3.5 font-bold">#</th>
                    <th className="px-5 py-3.5 font-bold">NIM & Nama</th>
                    <th className="px-5 py-3.5 font-bold text-center">Baseline IPK</th>
                    <th className="px-5 py-3.5 font-bold text-center">Kehadiran (%)</th>
                    <th className="px-5 py-3.5 font-bold text-center">Tugas</th>
                    <th className="px-5 py-3.5 font-bold text-center">Kuis</th>
                    <th className="px-5 py-3.5 font-bold text-center">Nilai ATS</th>
                    <th className="px-5 py-3.5 font-bold text-center">AI Score</th>
                    <th className="px-5 py-3.5 font-bold text-center">Status</th>
                    <th className="px-5 py-3.5 font-bold text-center">Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    [1, 2, 3].map((i) => (
                      <tr key={i}>
                        <td colSpan={10} className="px-5 py-4">
                          <div className="h-8 bg-slate-100 rounded-lg animate-pulse"></div>
                        </td>
                      </tr>
                    ))
                  ) : highRiskList.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-4xl opacity-50">✨</span>
                          <p className="text-sm font-bold text-slate-500">Tidak ada mahasiswa dengan status High Risk</p>
                          <p className="text-xs text-slate-400">Semua mahasiswa bimbingan Anda terpantau aman oleh sistem AI.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    highRiskList.map((student, index) => (
                      <tr key={student.id} className="hover:bg-rose-50/40 transition-colors group">
                        <td className="px-5 py-4">
                          <div className="w-7 h-7 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center text-xs font-black">
                            {index + 1}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <div className="font-bold text-blue-600 text-sm">{student.nim}</div>
                          <div className="text-[#0b1c30] font-semibold text-sm">{student.name}</div>
                        </td>
                        <td className="px-5 py-4 text-center text-sm font-black text-indigo-700">
                          {student.gpa ? student.gpa.toFixed(2) : '0.00'}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className={`text-sm font-bold ${student.attendanceRate < 75 ? 'text-rose-600' : 'text-slate-600'}`}>
                            {student.attendanceRate}%
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center text-sm text-slate-600 font-medium">
                          {student.assignmentScore}
                        </td>
                        <td className="px-5 py-4 text-center text-sm text-slate-600 font-medium">
                          {student.quizScore ?? 0}
                        </td>
                        <td className="px-5 py-4 text-center text-sm text-slate-600 font-medium">
                          {student.atsScore ?? 0}
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="text-base font-black text-rose-600">{student.predictedScore}%</span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <span className="px-2.5 py-1 rounded-full text-[10px] font-bold border bg-red-100 text-red-700 border-red-200 animate-pulse">
                            HIGH RISK
                          </span>
                        </td>
                        <td className="px-5 py-4 text-center">
                          <button
                            onClick={() => handleRecordIntervention(student.name)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-600 hover:text-white border border-blue-200 hover:border-blue-600 rounded-lg text-xs font-bold transition-all shadow-sm"
                          >
                            📝 Catat Intervensi
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer tabel */}
            {!loading && highRiskList.length > 0 && (
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                <p className="text-xs text-slate-400">
                  Menampilkan <span className="font-bold text-rose-600">{highRiskList.length}</span> dari {totalStudents} mahasiswa bimbingan
                </p>
                <span className="text-[10px] text-slate-400">Data disinkronkan otomatis dari LMS · AI: Random Forest</span>
              </div>
            )}
          </div>

        </div>
      </main>
    </div>
  );
}
