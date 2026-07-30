'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import Swal from 'sweetalert2';

import { jsPDF } from 'jspdf'; 
import { toPng } from 'html-to-image'; 

interface Student {
  id: string;
  nim: string;
  name: string;
  attendanceRate: number;
  assignmentScore: number;
  discussionPart: number;
  predictedScore: number;
  riskStatus: string;
}

export default function ReportsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  
  // State Mobile Menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const router = useRouter();
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const savedName = localStorage.getItem('userName');
    if (savedName) setUserName(savedName);
    
    fetchStudents();
  }, [router]);

  const fetchStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3001/students', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data);
      } else {
        if (response.status === 401) {
          Swal.fire('Sesi Berakhir', 'Token login Anda kedaluwarsa. Silakan login ulang.', 'warning').then(() => {
            handleLogout();
          });
        }
      }
    } catch (error) {
      console.error("Gagal mengambil data laporan:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userName');
    router.push('/login');
  };

  const getInitials = (str: string) => {
    if (!str) return '...';
    return str.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  const totalStudents = students.length;
  const highRiskCount = students.filter(s => s.riskStatus === 'HIGH RISK').length;

  const currentDate = new Date().toLocaleDateString('id-ID', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
  });

  const handleExportPDF = async () => {
    if (!reportRef.current) return;

    try {
      Swal.fire({
        title: 'Menyiapkan Dokumen PDF...',
        text: 'Mohon tunggu, sistem sedang me-render laporan.',
        allowOutsideClick: false,
        didOpen: () => { Swal.showLoading(); }
      });

      const element = reportRef.current;
      
      const imgData = await toPng(element, { 
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff'
      });
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      
      const imgProps = pdf.getImageProperties(imgData);
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Laporan_Risiko_Akademik_${new Date().getTime()}.pdf`);

      Swal.fire('Berhasil!', 'Dokumen Laporan PDF telah diunduh.', 'success');
    } catch (error: any) {
      console.error('Error generating PDF:', error);
      Swal.fire('Gagal', `Terjadi kesalahan rendering: ${error.message || error}`, 'error');
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex font-sans">
      
      {/* OVERLAY UNTUK MOBILE */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-[#0b1c30]/50 z-40 md:hidden transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#c3c6d7]/40 p-6 flex flex-col justify-between shadow-lg md:shadow-sm transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div>
          <div className="flex items-center justify-between mb-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#004ac6] flex items-center justify-center text-white shadow-md shadow-[#004ac6]/30">
                <span className="font-bold text-lg">🎓</span>
              </div>
              <div>
                <h1 className="font-extrabold text-lg text-[#0b1c30] tracking-wide">AEWS</h1>
                <p className="text-[11px] text-[#434655]">Academic Early Warning</p>
              </div>
            </div>
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500 hover:text-gray-800 text-2xl leading-none">
              &times;
            </button>
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

        <div className="space-y-2 border-t border-[#c3c6d7]/30 pt-4 mt-8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition shadow-sm"
          >
            <span>🚪</span> Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 md:h-20 bg-white border-b border-[#c3c6d7]/40 px-4 md:px-8 flex justify-between items-center sticky top-0 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 transition flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h2 className="text-lg md:text-xl font-bold text-[#0b1c30] truncate">Institutional Reports</h2>
          </div>
          
          <div className="flex items-center gap-3 md:gap-4 ml-4">
            <div className="text-right hidden sm:block">
              <p className="text-sm font-bold text-[#0b1c30]">{userName}</p>
              <p className="text-[11px] text-[#434655]">Administrator</p>
            </div>
            <div className="w-8 h-8 md:w-10 md:h-10 shrink-0 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold shadow-md text-sm md:text-base">
              {getInitials(userName)}
            </div>
          </div>
        </header>

        <div className="p-4 md:p-8 space-y-4 md:space-y-6 max-w-5xl mx-auto w-full">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 bg-white p-5 md:p-6 rounded-2xl border border-[#c3c6d7]/40 shadow-sm">
            <div>
              <h3 className="text-lg md:text-xl font-extrabold text-[#0b1c30]">Laporan Rekapitulasi Akademik</h3>
              <p className="text-xs md:text-sm text-[#516070] mt-1">Cetak dokumen resmi hasil evaluasi Early Warning System.</p>
            </div>
            <button 
              onClick={handleExportPDF}
              className="w-full sm:w-auto px-6 py-2.5 md:py-3 bg-red-600 text-white rounded-xl text-xs md:text-sm font-bold hover:bg-red-700 transition shadow-md shadow-red-600/30 flex items-center justify-center gap-2"
            >
              <span>📄</span> Cetak Dokumen PDF
            </button>
          </div>

          <div className="bg-white border border-[#c3c6d7]/40 shadow-sm rounded-2xl overflow-x-auto p-4 md:p-6">
            {/* Wrapper with fixed minimum width for the PDF layout to prevent text squashing on mobile */}
            <div className="min-w-[800px]">
              <div ref={reportRef} className="bg-white p-8 md:p-12 text-[#0b1c30]" style={{ width: '100%', minHeight: '800px' }}>
                
                <div className="border-b-4 border-double border-gray-800 pb-6 mb-8 text-center flex flex-col items-center">
                  <h1 className="text-2xl md:text-3xl font-black uppercase tracking-widest text-gray-900">Academic Early Warning System</h1>
                  <h2 className="text-base md:text-lg font-bold text-gray-700 mt-2 uppercase tracking-wider">Laporan Hasil Prediksi Risiko Akademik Mahasiswa</h2>
                  <p className="text-xs md:text-sm text-gray-500 mt-2">Dihasilkan oleh Machine Learning Engine (Random Forest Algorithm)</p>
                </div>

                <div className="flex justify-between items-end mb-8 text-sm">
                  <div>
                    <p className="mb-1"><span className="font-bold w-32 inline-block">Tanggal Cetak</span>: {currentDate}</p>
                    <p className="mb-1"><span className="font-bold w-32 inline-block">Dosen Wali</span>: {userName}</p>
                    <p><span className="font-bold w-32 inline-block">Semester/TA</span>: Ganjil / 2025-2026</p>
                  </div>
                  <div className="text-right bg-gray-50 p-3 rounded-lg border border-gray-200">
                    <p className="text-xs font-bold text-gray-500 uppercase">Ringkasan Sistem</p>
                    <div className="flex gap-4 mt-2 font-bold text-sm">
                      <span className="text-blue-700">Total: {totalStudents}</span>
                      <span className="text-rose-600">Kritis: {highRiskCount}</span>
                    </div>
                  </div>
                </div>

                <div className="mb-10">
                  <table className="w-full text-left border-collapse border border-gray-300">
                    <thead className="bg-gray-100 border-b-2 border-gray-400 text-gray-800 text-[11px] uppercase">
                      <tr>
                        <th className="p-3 border-r border-gray-300 w-10 text-center">No</th>
                        <th className="p-3 border-r border-gray-300">NIM</th>
                        <th className="p-3 border-r border-gray-300">Nama Lengkap</th>
                        <th className="p-3 border-r border-gray-300 text-center">Absen</th>
                        <th className="p-3 border-r border-gray-300 text-center">Tugas</th>
                        <th className="p-3 border-r border-gray-300 text-center">Diskusi</th>
                        <th className="p-3 border-r border-gray-300 text-center">Skor AI</th>
                        <th className="p-3 text-center">Status Prediksi</th>
                      </tr>
                    </thead>
                    <tbody className="text-sm divide-y divide-gray-200">
                      {loading ? (
                        <tr><td colSpan={8} className="p-4 text-center text-gray-500">Memuat data...</td></tr>
                      ) : students.length === 0 ? (
                        <tr><td colSpan={8} className="p-4 text-center text-gray-500">Tidak ada data mahasiswa.</td></tr>
                      ) : (
                        students.map((student, index) => (
                          <tr key={student.id} className="hover:bg-gray-50">
                            <td className="p-3 border-r border-gray-200 text-center text-gray-500">{index + 1}</td>
                            <td className="p-3 border-r border-gray-200 font-semibold text-gray-700">{student.nim}</td>
                            <td className="p-3 border-r border-gray-200 text-gray-900">{student.name}</td>
                            <td className="p-3 border-r border-gray-200 text-center text-gray-600">{student.attendanceRate}%</td>
                            <td className="p-3 border-r border-gray-200 text-center text-gray-600">{student.assignmentScore}</td>
                            <td className="p-3 border-r border-gray-200 text-center text-gray-600">{student.discussionPart}</td>
                            <td className="p-3 border-r border-gray-200 text-center font-bold text-gray-900">{student.predictedScore}%</td>
                            <td className="p-3 text-center font-bold text-[11px]">
                              {student.riskStatus === 'HIGH RISK' ? (
                                <span className="text-rose-600">Kritis (Tindak Lanjut)</span>
                              ) : student.riskStatus === 'SAFE' ? (
                                <span className="text-emerald-600">Aman</span>
                              ) : (
                                <span className="text-amber-500">Peringatan</span>
                              )}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

                <div className="flex justify-end mt-16 pt-8 text-sm">
                  <div className="text-center w-64">
                    <p className="mb-16 text-gray-700">Bandung, {currentDate}</p>
                    <p className="font-bold underline text-gray-900">{userName}</p>
                    <p className="text-gray-500">Dosen Wali Akademik</p>
                  </div>
                </div>

              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  );
}