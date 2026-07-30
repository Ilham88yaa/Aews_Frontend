'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import Swal from 'sweetalert2';
import * as XLSX from 'xlsx'; 

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

export default function StudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  
  // State baru untuk Hamburger Menu di Mobile
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const [showCheckboxes, setShowCheckboxes] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const savedName = localStorage.getItem('userName');
    if (savedName) setUserName(savedName);
    
    fetchStudents();

    const handleClickOutside = () => setActiveDropdown(null);
    window.addEventListener('click', handleClickOutside);
    return () => window.removeEventListener('click', handleClickOutside);
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
        setSelectedIds([]);
        setShowCheckboxes(false);
      }
    } catch (error) {
      console.error("Gagal mengambil data mahasiswa:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedIds(students.map(s => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleDeleteAction = async (singleId?: string, singleName?: string) => {
    if (showCheckboxes && selectedIds.length > 0) {
      const result = await Swal.fire({
        title: 'Hapus Data Terpilih?',
        text: `Anda akan menghapus ${selectedIds.length} data mahasiswa sekaligus.`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Ya, Hapus Semua!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        const token = localStorage.getItem('token');
        try {
          const deletePromises = selectedIds.map(id =>
            fetch(`http://localhost:3001/students/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            })
          );
          await Promise.all(deletePromises);
          Swal.fire('Terhapus!', `${selectedIds.length} data mahasiswa berhasil dihapus.`, 'success');
          fetchStudents();
        } catch (error) {
          Swal.fire('Error', 'Terjadi kesalahan saat menghapus data.', 'error');
        }
      }
    } else if (!showCheckboxes && singleId) {
      setShowCheckboxes(true);
      setSelectedIds([singleId]);
      
      Swal.fire({
        toast: true,
        position: 'top-end',
        icon: 'info',
        title: 'Mode Hapus Aktif. Centang data lain jika ingin menghapus banyak.',
        showConfirmButton: false,
        timer: 4000
      });
    } else {
      Swal.fire('Peringatan', 'Silakan centang setidaknya satu data mahasiswa yang ingin dihapus.', 'warning');
    }
  };

  const handleAddStudent = async () => {
    const { value: formValues } = await Swal.fire({
      title: '<span style="font-size: 1.25rem; font-weight: 700; color: #0b1c30;">Tambah Mahasiswa Baru</span>',
      html: `
        <div style="display: flex; flex-direction: column; gap: 12px; text-align: left; padding: 0 10px;">
          <div>
            <label style="font-size: 12px; font-weight: 600; color: #516070; margin-bottom: 4px; display: block;">NIM</label>
            <input id="swal-nim" class="swal2-input" placeholder="Contoh: 12345678" type="text" style="margin: 0; width: 100%; height: 40px; font-size: 14px; border-radius: 8px;">
          </div>
          <div>
            <label style="font-size: 12px; font-weight: 600; color: #516070; margin-bottom: 4px; display: block;">Nama Lengkap</label>
            <input id="swal-name" class="swal2-input" placeholder="Nama mahasiswa" type="text" style="margin: 0; width: 100%; height: 40px; font-size: 14px; border-radius: 8px;">
          </div>
          <p style="font-size: 11px; color: #6b7280; margin-top: 4px;">*Nilai akademik & analisis AI otomatis menggunakan baseline awal.</p>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Simpan Mahasiswa',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#004ac6',
      cancelButtonColor: '#f1f3f9',
      customClass: { cancelButton: 'text-gray-700 font-semibold', popup: 'rounded-2xl' },
      preConfirm: () => {
        const nim = (document.getElementById('swal-nim') as HTMLInputElement).value;
        const name = (document.getElementById('swal-name') as HTMLInputElement).value;

        if (!nim || !name) {
          Swal.showValidationMessage('NIM dan Nama wajib diisi!');
          return false;
        }

        return {
          nim,
          name,
          attendanceRate: 100,
          assignmentScore: 100,
          discussionPart: 100
        };
      }
    });

    if (formValues) {
      const token = localStorage.getItem('token');
      try {
        Swal.fire({ title: 'Menyimpan data...', allowOutsideClick: false, didOpen: () => { Swal.showLoading() } });
        
        const response = await fetch('http://localhost:3001/students', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formValues)
        });

        if (response.ok) {
          Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Mahasiswa baru berhasil ditambahkan.', timer: 1500, showConfirmButton: false });
          fetchStudents();
        } else {
          const errorData = await response.json();
          const errorMessage = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message || 'Terjadi kesalahan';
          Swal.fire('Gagal', errorMessage, 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Gagal menghubungi server.', 'error');
      }
    }
  };

  const handleEdit = async (student: Student) => {
    setActiveDropdown(null);
    const { value: formValues } = await Swal.fire({
      title: `<span style="font-size: 1.25rem; font-weight: 700; color: #0b1c30;">Edit Data Utama</span>`,
      html: `
        <div style="display: flex; flex-direction: column; gap: 12px; text-align: left; padding: 0 10px;">
          <div>
            <label style="font-size: 12px; font-weight: 600; color: #516070; margin-bottom: 4px; display: block;">NIM</label>
            <input id="edit-nim" class="swal2-input" value="${student.nim}" type="text" style="margin: 0; width: 100%; height: 40px; font-size: 14px; border-radius: 8px;">
          </div>
          <div>
            <label style="font-size: 12px; font-weight: 600; color: #516070; margin-bottom: 4px; display: block;">Nama Lengkap</label>
            <input id="edit-name" class="swal2-input" value="${student.name}" type="text" style="margin: 0; width: 100%; height: 40px; font-size: 14px; border-radius: 8px;">
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Simpan Perubahan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#004ac6',
      cancelButtonColor: '#f1f3f9',
      customClass: { cancelButton: 'text-gray-700 font-semibold', popup: 'rounded-2xl' },
      preConfirm: () => {
        const nim = (document.getElementById('edit-nim') as HTMLInputElement).value;
        const name = (document.getElementById('edit-name') as HTMLInputElement).value;

        if (!nim || !name) {
          Swal.showValidationMessage('NIM dan Nama wajib diisi!');
          return false;
        }

        return { nim, name };
      }
    });

    if (formValues) {
      const token = localStorage.getItem('token');
      try {
        Swal.fire({ title: 'Menyimpan perubahan...', allowOutsideClick: false, didOpen: () => { Swal.showLoading() } });
        
        const response = await fetch(`http://localhost:3001/students/${student.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formValues)
        });

        if (response.ok) {
          Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data utama berhasil diperbarui.', timer: 1500, showConfirmButton: false });
          fetchStudents();
        } else {
          const errorData = await response.json();
          const errorMessage = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message || 'Gagal mengubah data.';
          Swal.fire('Gagal', errorMessage, 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Gagal menghubungi server.', 'error');
      }
    }
  };

  const handleUpdateProgress = async (student: Student) => {
    setActiveDropdown(null);
    const { value: formValues } = await Swal.fire({
      title: `<span style="font-size: 1.25rem; font-weight: 700; color: #0b1c30;">Catat Progress</span>`,
      html: `
        <div style="display: flex; flex-direction: column; gap: 12px; text-align: left; padding: 0 10px;">
          <div>
            <label style="font-size: 12px; font-weight: 600; color: #516070; margin-bottom: 4px; display: block;">Semester</label>
            <select id="update-semester" class="swal2-input" style="margin: 0; width: 100%; height: 40px; font-size: 14px; border-radius: 8px;">
              <option value="1">Semester 1</option>
              <option value="2">Semester 2</option>
              <option value="3">Semester 3</option>
              <option value="4">Semester 4</option>
              <option value="5">Semester 5</option>
              <option value="6">Semester 6</option>
            </select>
          </div>
          <div>
            <label style="font-size: 12px; font-weight: 600; color: #516070; margin-bottom: 4px; display: block;">Checkpoint Mingguan</label>
            <select id="update-week" class="swal2-input" style="margin: 0; width: 100%; height: 40px; font-size: 14px; border-radius: 8px;">
              <option value="4">Minggu ke-4 (Deteksi Awal)</option>
              <option value="8">Minggu ke-8 (Momen UTS)</option>
              <option value="12">Minggu ke-12 (Pra-UAS)</option>
            </select>
          </div>
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px; margin-top: 10px;">
            <div>
              <label style="font-size: 11px; font-weight: 600; color: #516070; display: block;">Hadir (%)</label>
              <input id="update-att" class="swal2-input" value="${student.attendanceRate}" type="number" style="margin: 0; width: 100%; height: 38px; font-size: 13px; border-radius: 8px;">
            </div>
            <div>
              <label style="font-size: 11px; font-weight: 600; color: #516070; display: block;">Tugas</label>
              <input id="update-ass" class="swal2-input" value="${student.assignmentScore}" type="number" style="margin: 0; width: 100%; height: 38px; font-size: 13px; border-radius: 8px;">
            </div>
            <div>
              <label style="font-size: 11px; font-weight: 600; color: #516070; display: block;">Diskusi</label>
              <input id="update-disc" class="swal2-input" value="${student.discussionPart}" type="number" style="margin: 0; width: 100%; height: 38px; font-size: 13px; border-radius: 8px;">
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Analisis & Simpan',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#004ac6',
      cancelButtonColor: '#f1f3f9',
      customClass: { cancelButton: 'text-gray-700 font-semibold', popup: 'rounded-2xl' },
      preConfirm: () => {
        const semesterNumber = (document.getElementById('update-semester') as HTMLSelectElement).value;
        const weekNumber = (document.getElementById('update-week') as HTMLSelectElement).value;
        const attendanceRate = (document.getElementById('update-att') as HTMLInputElement).value;
        const assignmentScore = (document.getElementById('update-ass') as HTMLInputElement).value;
        const discussionScore = (document.getElementById('update-disc') as HTMLInputElement).value;

        return {
          semesterNumber: Number(semesterNumber),
          weekNumber: Number(weekNumber),
          attendanceRate: Number(attendanceRate),
          assignmentScore: Number(assignmentScore),
          discussionScore: Number(discussionScore) 
        };
      }
    });

    if (formValues) {
      const token = localStorage.getItem('token');
      try {
        Swal.fire({ title: 'AI sedang memproses...', allowOutsideClick: false, didOpen: () => { Swal.showLoading() } });
        
        const response = await fetch(`http://localhost:3001/students/${student.id}/progress`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formValues)
        });

        if (response.ok) {
          Swal.fire({ icon: 'success', title: 'Tersimpan', text: 'AI telah memperbarui status risiko terbaru.', timer: 2000, showConfirmButton: false });
          fetchStudents();
        } else {
          const errorData = await response.json();
          const errorMessage = Array.isArray(errorData.message) ? errorData.message.join(', ') : errorData.message || 'Gagal menyimpan progress.';
          Swal.fire('Gagal', errorMessage, 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Gagal menghubungi server.', 'error');
      }
    }
  };

  const handleViewHistory = async (student: Student) => {
    setActiveDropdown(null);
    const token = localStorage.getItem('token');
    
    try {
      Swal.fire({ title: 'Mengambil Riwayat...', allowOutsideClick: false, didOpen: () => { Swal.showLoading() } });
      
      const response = await fetch(`http://localhost:3001/students/${student.id}/history`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        const historyData = await response.json();
        
        if (historyData.length === 0) {
          Swal.fire('Data Kosong', 'Mahasiswa ini belum memiliki catatan histori.', 'info');
          return;
        }

        const timelineHtml = historyData.map((h: any) => `
          <div style="border-left: 3px solid ${h.predictedScore >= 60 ? '#ef4444' : h.predictedScore >= 30 ? '#f59e0b' : '#10b981'}; padding-left: 16px; padding-bottom: 16px; margin-bottom: 8px; position: relative; text-align: left;">
            <div style="position: absolute; width: 12px; height: 12px; border-radius: 50%; background: white; border: 3px solid ${h.predictedScore >= 60 ? '#ef4444' : h.predictedScore >= 30 ? '#f59e0b' : '#10b981'}; left: -7.5px; top: 0;"></div>
            <p style="font-size: 11px; font-weight: bold; color: #6b7280; margin: 0 0 4px 0;">MINGGU KE-${h.weekNumber}</p>
            <p style="font-size: 14px; font-weight: 700; color: #111827; margin: 0;">AI Score: ${h.predictedScore}%</p>
            <p style="font-size: 12px; color: ${h.predictedScore >= 60 ? '#dc2626' : h.predictedScore >= 30 ? '#d97706' : '#059669'}; font-weight: 600; margin: 2px 0 0 0;">${h.riskStatus}</p>
          </div>
        `).join('');

        Swal.fire({
          title: `<span style="font-size: 1.25rem; font-weight: 800; color: #0b1c30;">Risk Journey</span>`,
          html: `<div style="max-height: 350px; overflow-y: auto; padding: 20px 10px;">${timelineHtml}</div>`,
          confirmButtonText: 'Tutup',
          confirmButtonColor: '#004ac6',
          customClass: { popup: 'rounded-2xl' }
        });

      } else {
        Swal.fire('Gagal', 'Tidak dapat mengambil data riwayat.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Server tidak merespons.', 'error');
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    const token = localStorage.getItem('token');
    try {
      Swal.fire({ 
        title: 'Memproses Excel...', 
        allowOutsideClick: false, 
        didOpen: () => { Swal.showLoading() } 
      });

      const response = await fetch('http://localhost:3001/students/import', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      if (response.ok) {
        Swal.fire('Berhasil!', 'Data Excel berhasil diimpor dan dianalisis.', 'success');
        fetchStudents();
      } else {
        Swal.fire('Gagal', 'Gagal memproses file Excel.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Server tidak merespons.', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExportExcel = () => {
    if (students.length === 0) {
      Swal.fire('Kosong', 'Tidak ada data untuk diexport.', 'warning');
      return;
    }

    const dataToExport = students.map((s, index) => ({
      No: index + 1,
      NIM: s.nim,
      'Nama Mahasiswa': s.name,
      'Kehadiran (%)': s.attendanceRate,
      'Nilai Tugas': s.assignmentScore,
      'Skor Diskusi': s.discussionPart,
      'AI Score (%)': s.predictedScore,
      'Risk Status': s.riskStatus
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Laporan Risiko Mahasiswa");
    XLSX.writeFile(workbook, "AEWS_Laporan_Mahasiswa.xlsx");

    Swal.fire({
      icon: 'success',
      title: 'Berhasil!',
      text: 'Laporan Excel berhasil diunduh.',
      timer: 2000,
      showConfirmButton: false
    });
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

  const renderRiskBadge = (status: string, score: number) => {
    if (status === 'SAFE' || score < 30) {
      return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[10px] md:text-[11px] font-bold border border-emerald-200">SAFE</span>;
    }
    if (status === 'MEDIUM RISK' || (score >= 30 && score < 60)) {
      return <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[10px] md:text-[11px] font-bold border border-amber-200">WARNING</span>;
    }
    return <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[10px] md:text-[11px] font-bold border border-rose-200 animate-pulse">HIGH RISK</span>;
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex font-sans">
      <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".xlsx, .xls, .csv" className="hidden" />

      {/* OVERLAY UNTUK MOBILE (Klik background gelap untuk tutup menu) */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-[#0b1c30]/50 z-40 md:hidden transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR LENGKAP (Support Mobile & Desktop) */}
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
            {/* Tombol Silang (Tutup) di Mobile */}
            <button onClick={() => setIsMobileMenuOpen(false)} className="md:hidden text-gray-500 hover:text-gray-800 text-2xl leading-none">
              &times;
            </button>
          </div>

          <nav className="space-y-1">
            <a href="/dashboard" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#516070] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition font-medium text-sm"><span>📊</span> Dashboard</a>
            <a href="/students" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#e5eeff] text-[#004ac6] font-semibold text-sm"><span>👥</span> Student Management</a>
            <a href="/predictions" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#516070] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition font-medium text-sm"><span>📈</span> Predictions</a>
            <a href="/reports" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#516070] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition font-medium text-sm"><span>📑</span> Reports</a>
            <a href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#516070] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition font-medium text-sm"><span>⚙️</span> Settings</a>
          </nav>
        </div>

        <div className="space-y-2 border-t border-[#c3c6d7]/30 pt-4 mt-8">
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition shadow-sm">
            <span>🚪</span> Keluar
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <main className="flex-1 flex flex-col min-w-0 w-full overflow-y-auto">
        
        {/* HEADER */}
        <header className="h-16 md:h-20 bg-white border-b border-[#c3c6d7]/40 px-4 md:px-8 flex justify-between items-center sticky top-0 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            {/* Hamburger Button untuk Mobile */}
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 transition flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h2 className="text-lg md:text-xl font-bold text-[#0b1c30] truncate">Student Management Hub</h2>
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

        {/* CONTENT */}
        <div className="p-4 md:p-8 space-y-4 md:space-y-6">
          
          {/* TITLE & ACTIONS (Responsive Flex) */}
          <div className="flex flex-col xl:flex-row justify-between xl:items-center gap-4">
            <div>
              <h3 className="text-xl md:text-2xl font-extrabold text-[#0b1c30]">Daftar Mahasiswa</h3>
              <p className="text-xs md:text-sm text-[#434655] mt-1">Data akademik dan hasil analisis Early Warning System ditenagai AI.</p>
            </div>
            
            {/* BUTTONS CONTAINER */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 md:gap-3 w-full xl:w-auto">
              {showCheckboxes && (
                <div className="flex items-center justify-between sm:justify-start gap-2 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200 w-full sm:w-auto">
                  <span className="text-xs font-bold text-red-600">{selectedIds.length} dipilih</span>
                  <div className="flex gap-2">
                    <button onClick={() => handleDeleteAction()} className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition shadow-sm">Hapus</button>
                    <button onClick={() => { setShowCheckboxes(false); setSelectedIds([]); }} className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-300 transition">Batal</button>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 sm:flex gap-2 md:gap-3 w-full sm:w-auto">
                <button onClick={() => fileInputRef.current?.click()} className="w-full sm:w-auto px-3 md:px-4 py-2 md:py-2.5 bg-sky-600 text-white rounded-xl text-xs md:text-sm font-semibold hover:bg-sky-700 transition shadow-sm flex items-center justify-center gap-2">
                  <span>📂</span> <span className="hidden sm:inline">Import Excel</span><span className="sm:hidden">Import</span>
                </button>
                <button onClick={handleExportExcel} className="w-full sm:w-auto px-3 md:px-4 py-2 md:py-2.5 bg-emerald-600 text-white rounded-xl text-xs md:text-sm font-semibold hover:bg-emerald-700 transition shadow-sm flex items-center justify-center gap-2">
                  <span>📥</span> <span className="hidden sm:inline">Export Excel</span><span className="sm:hidden">Export</span>
                </button>
                <button onClick={handleAddStudent} className="col-span-2 sm:col-span-1 w-full sm:w-auto px-4 md:px-5 py-2 md:py-2.5 bg-[#004ac6] text-white rounded-xl text-xs md:text-sm font-semibold hover:bg-[#003998] transition shadow-md shadow-[#004ac6]/30 flex items-center justify-center gap-2">
                  <span>+</span> Tambah Data
                </button>
              </div>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl shadow-xs overflow-hidden w-full">
            <div className="overflow-x-auto w-full relative">
              <table className="w-full text-left border-collapse min-w-[800px]">
                <thead className="bg-[#f8f9ff]">
                  <tr className="border-b border-[#c3c6d7]/40 text-[#434655] text-[10px] md:text-xs uppercase tracking-wider whitespace-nowrap">
                    {showCheckboxes && (
                      <th className="p-3 md:p-4 w-10 text-center sticky left-0 z-10 bg-[#f8f9ff]">
                        <input type="checkbox" onChange={handleSelectAll} checked={students.length > 0 && selectedIds.length === students.length} className="w-4 h-4 rounded text-[#004ac6] accent-[#004ac6] cursor-pointer" />
                      </th>
                    )}
                    <th className="p-3 md:p-4 font-bold">NIM</th>
                    <th className="p-3 md:p-4 font-bold">Nama Mahasiswa</th>
                    <th className="p-3 md:p-4 font-bold text-center">Kehadiran</th>
                    <th className="p-3 md:p-4 font-bold text-center">Tugas</th>
                    <th className="p-3 md:p-4 font-bold text-center">Diskusi</th>
                    <th className="p-3 md:p-4 font-bold text-center border-l border-[#c3c6d7]/30 bg-blue-50/90">AI Score</th>
                    <th className="p-3 md:p-4 font-bold text-center bg-blue-50/90">Risk Status</th>
                    <th className="p-3 md:p-4 font-bold text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c3c6d7]/20 text-xs md:text-sm">
                  {loading ? (
                    <tr><td colSpan={showCheckboxes ? 9 : 8} className="p-8 text-center text-[#516070]">Memuat data dari database...</td></tr>
                  ) : students.length === 0 ? (
                    <tr><td colSpan={showCheckboxes ? 9 : 8} className="p-8 text-center text-[#516070]">Belum ada data mahasiswa. Silakan tambahkan data.</td></tr>
                  ) : (
                    students.map((student) => {
                      const isSelected = selectedIds.includes(student.id);
                      return (
                        <tr key={student.id} className={`hover:bg-[#f8f9ff]/50 transition-colors whitespace-nowrap ${isSelected ? 'bg-blue-50/30' : ''}`}>
                          {showCheckboxes && (
                            <td className="p-3 md:p-4 text-center sticky left-0 z-10 bg-white">
                              <input type="checkbox" checked={isSelected} onChange={() => handleSelectOne(student.id)} className="w-4 h-4 rounded text-[#004ac6] accent-[#004ac6] cursor-pointer" />
                            </td>
                          )}
                          <td className="p-3 md:p-4 font-semibold text-[#004ac6]">{student.nim}</td>
                          <td className="p-3 md:p-4 font-medium text-[#0b1c30]">{student.name}</td>
                          <td className="p-3 md:p-4 text-center text-[#516070]">{student.attendanceRate}%</td>
                          <td className="p-3 md:p-4 text-center text-[#516070]">{student.assignmentScore}</td>
                          <td className="p-3 md:p-4 text-center text-[#516070]">{student.discussionPart}</td>
                          <td className="p-3 md:p-4 font-extrabold text-center border-l border-[#c3c6d7]/30 text-[#0b1c30]">{student.predictedScore}%</td>
                          <td className="p-3 md:p-4 text-center">{renderRiskBadge(student.riskStatus, student.predictedScore)}</td>
                          <td className="p-3 md:p-4 text-center relative">
                            <button onClick={(e) => { e.stopPropagation(); setActiveDropdown(activeDropdown === student.id ? null : student.id); }} className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center font-bold text-gray-600 transition mx-auto">⋮</button>
                            
                            {activeDropdown === student.id && (
                              <div className="absolute right-10 md:right-12 top-6 w-40 md:w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1.5 text-left">
                                <button onClick={() => handleUpdateProgress(student)} className="w-full px-3 md:px-4 py-2 text-[11px] md:text-xs font-semibold text-sky-700 hover:bg-sky-50 flex items-center gap-2"><span>📈</span> Catat Progress</button>
                                <button onClick={() => handleViewHistory(student)} className="w-full px-3 md:px-4 py-2 text-[11px] md:text-xs font-semibold text-emerald-700 hover:bg-emerald-50 flex items-center gap-2"><span>🕒</span> Lihat Riwayat</button>
                                <hr className="my-1 border-gray-100" />
                                <button onClick={() => handleEdit(student)} className="w-full px-3 md:px-4 py-2 text-[11px] md:text-xs font-semibold text-gray-700 hover:bg-gray-50 flex items-center gap-2"><span>✏️</span> Edit Data Utama</button>
                                <button onClick={() => { setActiveDropdown(null); handleDeleteAction(student.id, student.name); }} className="w-full px-3 md:px-4 py-2 text-[11px] md:text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2"><span>🗑️</span> Hapus</button>
                              </div>
                            )}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}