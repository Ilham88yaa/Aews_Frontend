'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface Student {
  id: string;
  nim: string;
  name: string;
}

interface InterventionLog {
  id: string;
  studentId: string;
  date: string;
  actionType: string;
  notes: string;
  handledBy: string;
  student: Student;
}

export default function InterventionsHistoryPage() {
  const [logs, setLogs] = useState<InterventionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Dosen Wali');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('ALL');

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    if (!token) {
      router.push('/login');
      return;
    }
    if (userRole !== 'DOSEN') {
      Swal.fire('Akses Ditolak', 'Halaman ini khusus Dosen Wali.', 'error');
      router.push('/dashboard');
      return;
    }

    const savedName = localStorage.getItem('userName');
    if (savedName) setUserName(savedName);

    fetchInterventions(token);
  }, [router]);

  const fetchInterventions = async (token: string) => {
    try {
      const response = await fetch(`${API_URL}/students/interventions`, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });
      if (response.ok) {
        const data: InterventionLog[] = await response.json();
        setLogs(data);
      } else {
        console.error('Gagal mengambil data riwayat intervensi');
      }
    } catch (error) {
      console.error('Gagal menghubungi server:', error);
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

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase();

  // Filter logs berdasarkan input pencarian dan jenis tindakan
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.student.nim.includes(searchQuery);

    const matchesFilter = filterType === 'ALL' || log.actionType === filterType;

    return matchesSearch && matchesFilter;
  });

  const getBadgeClass = (actionType: string) => {
    switch (actionType) {
      case 'Surat Peringatan (SP 1)':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'Pemanggilan Konseling':
        return 'bg-amber-100 text-amber-800 border border-amber-200';
      case 'Diskusi dengan Orang Tua':
        return 'bg-purple-100 text-purple-800 border border-purple-200';
      default:
        return 'bg-blue-100 text-blue-800 border border-blue-200';
    }
  };

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
            <a href="/dosen/dashboard" className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-600 hover:bg-slate-50 font-semibold text-sm transition-all">
              <span>📊</span> Dashboard
            </a>
            <a href="/dosen/interventions" className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#1d4ed8] to-blue-500 text-white font-semibold text-sm shadow-md shadow-blue-200/50">
              <span>📝</span> Histori Intervensi
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
              <h2 className="text-base md:text-lg font-extrabold text-[#0b1c30]">Histori Intervensi Akademik</h2>
              <p className="text-[11px] text-slate-400 hidden sm:block">{today}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 md:gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#1d4ed8] to-sky-400 text-white flex items-center justify-center font-bold text-sm shadow cursor-pointer">
              {getInitials(userName)}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto w-full">
          {/* FILTER & SEARCH CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">🔍</span>
              <input
                type="text"
                placeholder="Cari NIM atau nama mahasiswa..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full border border-slate-200 rounded-xl py-2 pl-9 pr-4 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none"
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Filter Tindakan:</span>
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="border border-slate-200 rounded-xl py-2 px-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none bg-white font-semibold text-slate-700"
              >
                <option value="ALL">Semua Tindakan</option>
                <option value="Teguran Lisan/Chat">Teguran Lisan / Chat WA</option>
                <option value="Pemanggilan Konseling">Pemanggilan Konseling</option>
                <option value="Surat Peringatan (SP 1)">Surat Peringatan (SP 1)</option>
                <option value="Diskusi dengan Orang Tua">Diskusi dengan Orang Tua</option>
              </select>
            </div>
          </div>

          {/* TABLE CARD */}
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 md:p-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-base font-extrabold text-[#0b1c30]">Daftar Riwayat Pembinaan</h3>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Daftar laporan intervensi mahasiswa bimbingan yang telah diinput ke dalam database.
                </p>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-full shrink-0">
                {filteredLogs.length} Entri Ditemukan
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-100">
                    <th className="px-6 py-4 font-bold">#</th>
                    <th className="px-6 py-4 font-bold">Waktu Catat</th>
                    <th className="px-6 py-4 font-bold">Mahasiswa</th>
                    <th className="px-6 py-4 font-bold">Jenis Tindakan</th>
                    <th className="px-6 py-4 font-bold">Catatan Pembinaan</th>
                    <th className="px-6 py-4 font-bold">Dicatat Oleh</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {loading ? (
                    [1, 2, 3].map((i) => (
                      <tr key={i}>
                        <td colSpan={6} className="px-6 py-4">
                          <div className="h-8 bg-slate-100 rounded-lg animate-pulse"></div>
                        </td>
                      </tr>
                    ))
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-16 text-center">
                        <div className="flex flex-col items-center gap-2">
                          <span className="text-4xl opacity-50">📝</span>
                          <p className="text-sm font-bold text-slate-500">Tidak ada riwayat intervensi</p>
                          <p className="text-xs text-slate-400">Silakan catat intervensi terlebih dahulu pada dashboard Dosen Wali.</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    filteredLogs.map((log, index) => (
                      <tr key={log.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                        <td className="px-6 py-4 font-bold text-slate-400">{index + 1}</td>
                        <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                          {new Date(log.date).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                          })}
                          <span className="block text-[10px] text-slate-400 mt-0.5">
                            {new Date(log.date).toLocaleTimeString('id-ID', {
                              hour: '2-digit',
                              minute: '2-digit',
                            })} WIB
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-bold text-blue-600">{log.student.nim}</div>
                          <div className="text-[#0b1c30] font-semibold">{log.student.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-block px-2.5 py-1 rounded-full text-[10px] font-bold ${getBadgeClass(log.actionType)}`}>
                            {log.actionType}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 max-w-xs md:max-w-md break-words font-medium leading-relaxed">
                          {log.notes}
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-semibold whitespace-nowrap">
                          👤 {log.handledBy}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Footer tabel */}
            {!loading && filteredLogs.length > 0 && (
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                <span>
                  Menampilkan <span className="font-bold text-slate-700">{filteredLogs.length}</span> dari {logs.length} riwayat
                </span>
                <span>AEWS · Academic Early Warning System</span>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
