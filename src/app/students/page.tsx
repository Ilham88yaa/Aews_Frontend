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
        title: 'Mode Hapus Aktif. Centang data lain jika ingin menghapus banyak, lalu klik Eksekusi Hapus.',
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
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            <div>
              <label style="font-size: 11px; font-weight: 600; color: #516070; display: block;">Kehadiran (%)</label>
              <input id="swal-att" class="swal2-input" placeholder="85" type="number" style="margin: 0; width: 100%; height: 38px; font-size: 13px; border-radius: 8px;">
            </div>
            <div>
              <label style="font-size: 11px; font-weight: 600; color: #516070; display: block;">Nilai Tugas</label>
              <input id="swal-ass" class="swal2-input" placeholder="80" type="number" style="margin: 0; width: 100%; height: 38px; font-size: 13px; border-radius: 8px;">
            </div>
            <div>
              <label style="font-size: 11px; font-weight: 600; color: #516070; display: block;">Skor Diskusi</label>
              <input id="swal-disc" class="swal2-input" placeholder="75" type="number" style="margin: 0; width: 100%; height: 38px; font-size: 13px; border-radius: 8px;">
            </div>
          </div>
        </div>
      `,
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: 'Simpan & Analisis',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#004ac6',
      cancelButtonColor: '#f1f3f9',
      customClass: { cancelButton: 'text-gray-700 font-semibold', popup: 'rounded-2xl' },
      preConfirm: () => {
        const nim = (document.getElementById('swal-nim') as HTMLInputElement).value;
        const name = (document.getElementById('swal-name') as HTMLInputElement).value;
        const attendanceRate = (document.getElementById('swal-att') as HTMLInputElement).value;
        const assignmentScore = (document.getElementById('swal-ass') as HTMLInputElement).value;
        const discussionPart = (document.getElementById('swal-disc') as HTMLInputElement).value;

        if (!nim || !name) {
          Swal.showValidationMessage('NIM dan Nama wajib diisi!');
          return false;
        }

        return {
          nim,
          name,
          attendanceRate: attendanceRate ? Number(attendanceRate) : 100,
          assignmentScore: assignmentScore ? Number(assignmentScore) : 100,
          discussionPart: discussionPart ? Number(discussionPart) : 10
        };
      }
    });

    if (formValues) {
      const token = localStorage.getItem('token');
      try {
        Swal.fire({ title: 'AI sedang menganalisis...', allowOutsideClick: false, didOpen: () => { Swal.showLoading() } });
        
        const response = await fetch('http://localhost:3001/students', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(formValues)
        });

        if (response.ok) {
          Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data & Analisis AI tersimpan.', timer: 1500, showConfirmButton: false });
          fetchStudents();
        } else {
          Swal.fire('Gagal', 'NIM sudah terdaftar atau terjadi kesalahan.', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Gagal menghubungi server.', 'error');
      }
    }
  };

  const handleEdit = async (student: Student) => {
    setActiveDropdown(null);
    const { value: formValues } = await Swal.fire({
      title: `<span style="font-size: 1.25rem; font-weight: 700; color: #0b1c30;">Edit Data: ${student.name}</span>`,
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
          <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;">
            <div>
              <label style="font-size: 11px; font-weight: 600; color: #516070; display: block;">Kehadiran (%)</label>
              <input id="edit-att" class="swal2-input" value="${student.attendanceRate}" type="number" style="margin: 0; width: 100%; height: 38px; font-size: 13px; border-radius: 8px;">
            </div>
            <div>
              <label style="font-size: 11px; font-weight: 600; color: #516070; display: block;">Nilai Tugas</label>
              <input id="edit-ass" class="swal2-input" value="${student.assignmentScore}" type="number" style="margin: 0; width: 100%; height: 38px; font-size: 13px; border-radius: 8px;">
            </div>
            <div>
              <label style="font-size: 11px; font-weight: 600; color: #516070; display: block;">Skor Diskusi</label>
              <input id="edit-disc" class="swal2-input" value="${student.discussionPart}" type="number" style="margin: 0; width: 100%; height: 38px; font-size: 13px; border-radius: 8px;">
            </div>
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
        const attendanceRate = (document.getElementById('edit-att') as HTMLInputElement).value;
        const assignmentScore = (document.getElementById('edit-ass') as HTMLInputElement).value;
        const discussionPart = (document.getElementById('edit-disc') as HTMLInputElement).value;

        if (!nim || !name) {
          Swal.showValidationMessage('NIM dan Nama wajib diisi!');
          return false;
        }

        return {
          nim,
          name,
          attendanceRate: Number(attendanceRate),
          assignmentScore: Number(assignmentScore),
          discussionPart: Number(discussionPart)
        };
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
          Swal.fire({ icon: 'success', title: 'Berhasil', text: 'Data mahasiswa berhasil diperbarui.', timer: 1500, showConfirmButton: false });
          fetchStudents();
        } else {
          Swal.fire('Gagal', 'Terjadi kesalahan saat memperbarui data.', 'error');
        }
      } catch (error) {
        Swal.fire('Error', 'Gagal menghubungi server.', 'error');
      }
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
        title: 'Mengimpor & Menganalisis AI...', 
        text: 'Mohon tunggu sebentar, sistem sedang memproses file Excel.', 
        allowOutsideClick: false, 
        didOpen: () => { Swal.showLoading() } 
      });

      const response = await fetch('http://localhost:3001/students/import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (response.ok) {
        Swal.fire('Berhasil!', 'Data Excel berhasil diimpor dan dianalisis oleh AI.', 'success');
        fetchStudents();
      } else {
        Swal.fire('Info', 'File terpilih. Pastikan endpoint import di backend NestJS sudah aktif.', 'info');
      }
    } catch (error) {
      Swal.fire('Error', 'Gagal mengunggah file Excel.', 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleExportExcel = () => {
    if (students.length === 0) {
      Swal.fire('Kosong', 'Tidak ada data mahasiswa untuk diexport.', 'warning');
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
      title: 'Export Berhasil!',
      text: 'File laporan Excel berhasil diunduh.',
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
      return <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-[11px] font-bold border border-emerald-200">SAFE</span>;
    }
    if (status === 'MEDIUM RISK' || (score >= 30 && score < 60)) {
      return <span className="px-3 py-1 bg-amber-50 text-amber-600 rounded-full text-[11px] font-bold border border-amber-200">WARNING</span>;
    }
    return <span className="px-3 py-1 bg-rose-50 text-rose-600 rounded-full text-[11px] font-bold border border-rose-200 animate-pulse">HIGH RISK</span>;
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex font-sans">
      <input 
        type="file" 
        ref={fileInputRef} 
        onChange={handleFileChange} 
        accept=".xlsx, .xls, .csv" 
        className="hidden" 
      />

      {/* SIDEBAR */}
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
            <a href="/students" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#e5eeff] text-[#004ac6] font-semibold text-sm">
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
            <span>🚪</span> Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        {/* HEADER */}
        <header className="h-20 bg-white border-b border-[#c3c6d7]/40 px-8 flex justify-between items-center sticky top-0 z-10 shadow-xs">
          <h2 className="text-xl font-bold text-[#0b1c30]">Student Management Hub</h2>
          
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

        {/* CONTENT */}
        <div className="p-8 space-y-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div>
              <h3 className="text-2xl font-extrabold text-[#0b1c30]">Daftar Mahasiswa</h3>
              <p className="text-sm text-[#434655] mt-1">Data akademik dan hasil analisis Early Warning System ditenagai AI.</p>
            </div>
            
            <div className="flex items-center gap-3 flex-wrap">
              {showCheckboxes && (
                <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-xl border border-red-200">
                  <span className="text-xs font-bold text-red-600">{selectedIds.length} dipilih</span>
                  <button
                    onClick={() => handleDeleteAction()}
                    className="px-3 py-1 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700 transition shadow-sm"
                  >
                    Eksekusi Hapus
                  </button>
                  <button
                    onClick={() => { setShowCheckboxes(false); setSelectedIds([]); }}
                    className="px-2 py-1 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-300 transition"
                  >
                    Batal
                  </button>
                </div>
              )}

              <button 
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2.5 bg-sky-600 text-white rounded-xl text-sm font-semibold hover:bg-sky-700 transition shadow-sm flex items-center gap-2"
              >
                <span>📂</span> Import Excel
              </button>

              <button 
                onClick={handleExportExcel}
                className="px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-sm flex items-center gap-2"
              >
                <span>📥</span> Export Excel
              </button>

              <button 
                onClick={handleAddStudent} 
                className="px-5 py-2.5 bg-[#004ac6] text-white rounded-xl text-sm font-semibold hover:bg-[#003998] transition shadow-md shadow-[#004ac6]/30 flex items-center gap-2"
              >
                <span>+</span> Tambah Data
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl shadow-xs overflow-hidden">
            {/* 
                BAGIAN SCROLL: 
                max-h-[500px] membatasi tinggi tabel agar bisa di-scroll ke bawah.
                overflow-auto memungkinkan scroll vertikal & horizontal otomatis.
            */}
            <div className="overflow-auto max-h-[500px] min-h-[300px] relative">
              <table className="w-full text-left border-collapse">
                {/* 
                    STICKY HEADER: 
                    sticky top-0 membuat baris ini melayang di atas saat di-scroll.
                    z-10 mencegah header tertutup data tabel di bawahnya.
                */}
                <thead className="sticky top-0 z-10 shadow-sm bg-[#f8f9ff]">
                  <tr className="border-b border-[#c3c6d7]/40 text-[#434655] text-xs uppercase tracking-wider">
                    {showCheckboxes && (
                      <th className="p-4 w-10 text-center bg-[#f8f9ff]">
                        <input
                          type="checkbox"
                          onChange={handleSelectAll}
                          checked={students.length > 0 && selectedIds.length === students.length}
                          className="w-4 h-4 rounded text-[#004ac6] accent-[#004ac6] cursor-pointer"
                        />
                      </th>
                    )}
                    <th className="p-4 font-bold bg-[#f8f9ff]">NIM</th>
                    <th className="p-4 font-bold bg-[#f8f9ff]">Nama Mahasiswa</th>
                    <th className="p-4 font-bold text-center bg-[#f8f9ff]">Kehadiran</th>
                    <th className="p-4 font-bold text-center bg-[#f8f9ff]">Tugas</th>
                    <th className="p-4 font-bold text-center bg-[#f8f9ff]">Diskusi</th>
                    <th className="p-4 font-bold text-center border-l border-[#c3c6d7]/30 bg-blue-50/90">AI Score</th>
                    <th className="p-4 font-bold text-center bg-blue-50/90">Risk Status</th>
                    <th className="p-4 font-bold text-center bg-[#f8f9ff]">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c3c6d7]/20">
                  {loading ? (
                    <tr>
                      <td colSpan={showCheckboxes ? 9 : 8} className="p-8 text-center text-sm text-[#516070]">Memuat data dari database...</td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td colSpan={showCheckboxes ? 9 : 8} className="p-8 text-center text-sm text-[#516070]">Belum ada data mahasiswa. Silakan tambahkan data.</td>
                    </tr>
                  ) : (
                    students.map((student) => {
                      const isSelected = selectedIds.includes(student.id);
                      return (
                        <tr key={student.id} className={`hover:bg-[#f8f9ff]/50 transition-colors ${isSelected ? 'bg-blue-50/30' : ''}`}>
                          {showCheckboxes && (
                            <td className="p-4 text-center">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => handleSelectOne(student.id)}
                                className="w-4 h-4 rounded text-[#004ac6] accent-[#004ac6] cursor-pointer"
                              />
                            </td>
                          )}
                          <td className="p-4 text-sm font-semibold text-[#004ac6]">{student.nim}</td>
                          <td className="p-4 text-sm font-medium text-[#0b1c30]">{student.name}</td>
                          <td className="p-4 text-sm text-center text-[#516070]">{student.attendanceRate}%</td>
                          <td className="p-4 text-sm text-center text-[#516070]">{student.assignmentScore}</td>
                          <td className="p-4 text-sm text-center text-[#516070]">{student.discussionPart}</td>
                          <td className="p-4 text-sm font-extrabold text-center border-l border-[#c3c6d7]/30 text-[#0b1c30]">
                            {student.predictedScore}%
                          </td>
                          <td className="p-4 text-center">
                            {renderRiskBadge(student.riskStatus, student.predictedScore)}
                          </td>
                          
                          <td className="p-4 text-center relative">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveDropdown(activeDropdown === student.id ? null : student.id);
                              }}
                              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center font-bold text-gray-600 transition mx-auto"
                            >
                              ⋮
                            </button>

                            {activeDropdown === student.id && (
                              <div className="absolute right-8 top-12 w-36 bg-white border border-gray-200 rounded-xl shadow-lg z-20 py-1.5 text-left">
                                <button
                                  onClick={() => handleEdit(student)}
                                  className="w-full px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-blue-50 hover:text-blue-600 flex items-center gap-2"
                                >
                                  <span>✏️</span> Edit Data
                                </button>
                                <button
                                  onClick={() => {
                                    setActiveDropdown(null);
                                    handleDeleteAction(student.id, student.name);
                                  }}
                                  className="w-full px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-gray-100"
                                >
                                  <span>🗑️</span> Hapus
                                </button>
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