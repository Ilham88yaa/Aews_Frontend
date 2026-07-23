'use client';

import { useEffect, useState, Fragment } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog, Transition } from '@headlessui/react';
import React from 'react';
import Swal from 'sweetalert2';

export default function StudentManagementPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('Administrator');
  const [isModalOpen, setIsModalOpen] = useState(false); 
  
  // State untuk menangkap input form
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentNim, setNewStudentNim] = useState('');
  
  const router = useRouter();

  // FUNGSI GET: Memuat data dari Database (NestJS)
  const fetchStudents = () => {
    fetch('http://localhost:3001/students')
      .then(async (res) => {
        if (!res.ok) throw new Error('Gagal memuat data mahasiswa');
        return res.json();
      })
      .then((data) => {
        setStudents(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    // Abaikan token JWT sementara biar testing lu mulus
    const savedName = localStorage.getItem('userName');
    if (savedName) setUserName(savedName);

    fetchStudents(); // Panggil fungsi get data saat halaman dibuka
  }, []);

  const handleLogout = () => {
    Swal.fire({
      title: 'Keluar dari Sistem?',
      text: 'Anda harus masuk kembali menggunakan kredensial admin.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#004ac6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Keluar!',
      cancelButtonText: 'Batal',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        Swal.fire({
          title: 'Berhasil Keluar!',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        }).then(() => router.push('/login'));
      }
    });
  };

  const getInitials = (str: string) => {
    return str.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // FUNGSI POST: Menyimpan data RIIL ke Backend Database
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault(); 
    
    try {
      const response = await fetch('http://localhost:3001/students', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newStudentName,
          nim: newStudentNim,
        }),
      });

      if (!response.ok) {
        throw new Error('Gagal menyimpan data ke backend');
      }

      // Tutup modal & bersihkan form
      setIsModalOpen(false);
      setNewStudentName('');
      setNewStudentNim('');

      // Tarik ulang data dari database biar tabel langsung update
      fetchStudents(); 

      // Perhatikan pesannya sekarang berubah jadi data riil!
      Swal.fire('Berhasil!', 'Data mahasiswa riil telah disimpan ke database!', 'success');
    } catch (error) {
      console.error(error);
      Swal.fire('Error!', 'Gagal menyimpan data. Pastikan Backend NestJS di port 3001 menyala.', 'error');
    }
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
              <p className="text-[11px] text-[#434655]">Academic Support</p>
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
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition shadow-sm">
            <span>🚪</span> Keluar (Logout)
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto relative">
        <header className="h-20 bg-white border-b border-[#c3c6d7]/40 px-8 flex justify-between items-center sticky top-0 z-10 shadow-xs">
          <h2 className="text-xl font-bold text-[#0b1c30]">Student Management & Registry</h2>
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
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <h3 className="text-2xl font-extrabold text-[#0b1c30]">Daftar Mahasiswa</h3>
              <p className="text-sm text-[#434655]">Kelola data akademik dan pantau status risiko mahasiswa secara langsung.</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2.5 bg-white border border-[#c3c6d7] text-[#0b1c30] rounded-xl text-sm font-semibold hover:bg-[#eff4ff] transition shadow-xs">
                📥 Import Excel
              </button>
              <button 
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2.5 bg-[#004ac6] text-white rounded-xl text-sm font-semibold hover:bg-[#003998] transition shadow-md shadow-[#004ac6]/30"
              >
                + Add Student
              </button>
            </div>
          </div>

          <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl shadow-xs overflow-hidden">
            <div className="p-6 border-b border-[#c3c6d7]/30 flex justify-between items-center">
              <h4 className="font-bold text-[#0b1c30]">Registry Database</h4>
              <span className="text-xs font-semibold bg-[#e5eeff] text-[#004ac6] px-3 py-1 rounded-full">
                {loading ? 'Memuat...' : `${students.length} Mahasiswa Terdaftar`}
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-[#f8f9ff] border-b border-[#c3c6d7]/30 text-xs font-bold text-[#434655] uppercase">
                    <th className="py-4 px-6">Student Name</th>
                    <th className="py-4 px-6">ID / NIM</th>
                    <th className="py-4 px-6">Attendance Rate</th>
                    <th className="py-4 px-6">Assignment Score</th>
                    <th className="py-4 px-6">Discussion Part</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#c3c6d7]/20 text-sm">
                  {loading ? (
                    <tr><td colSpan={6} className="py-8 text-center text-[#434655]">Menyiapkan data mahasiswa...</td></tr>
                  ) : students.length === 0 ? (
                    <tr><td colSpan={6} className="py-8 text-center text-[#434655]">Belum ada data mahasiswa di database.</td></tr>
                  ) : (
                    students.map((student, idx) => (
                      <tr key={idx} className="hover:bg-[#eff4ff]/50 transition">
                        <td className="py-4 px-6 font-semibold text-[#0b1c30]">{student.name}</td>
                        <td className="py-4 px-6 text-[#434655]">{student.nim}</td>
                        <td className="py-4 px-6 font-medium text-[#0b1c30]">{student.attendanceRate}%</td>
                        <td className="py-4 px-6 font-medium text-[#0b1c30]">{student.assignmentScore}</td>
                        <td className="py-4 px-6 font-medium text-[#0b1c30]">{student.discussionPart}</td>
                        <td className="py-4 px-6 text-right">
                          <button className="px-3 py-1.5 bg-[#e5eeff] text-[#004ac6] rounded-lg text-xs font-bold hover:bg-[#d5e4f8] transition">View Analysis</button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* MODAL HEADLESS UI */}
        <Transition appear show={isModalOpen} as={Fragment}>
          <Dialog as="div" className="relative z-50" onClose={() => setIsModalOpen(false)}>
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0"
              enterTo="opacity-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <div className="fixed inset-0 bg-[#0b1c30]/40 backdrop-blur-sm" />
            </Transition.Child>

            <div className="fixed inset-0 overflow-y-auto">
              <div className="flex min-h-full items-center justify-center p-4 text-center">
                <Transition.Child
                  as={Fragment}
                  enter="ease-out duration-300"
                  enterFrom="opacity-0 scale-95 translateY-4"
                  enterTo="opacity-100 scale-100 translateY-0"
                  leave="ease-in duration-200"
                  leaveFrom="opacity-100 scale-100 translateY-0"
                  leaveTo="opacity-0 scale-95 translateY-4"
                >
                  <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                    <Dialog.Title as="h3" className="text-lg font-bold text-[#0b1c30] leading-6 mb-2">
                      Tambahkan Data Mahasiswa
                    </Dialog.Title>
                    <div className="mt-2 mb-6">
                      <p className="text-sm text-[#434655]">
                        Masukkan informasi akademik mahasiswa baru. Sistem akan otomatis mengevaluasi risiko setelah data disimpan.
                      </p>
                    </div>

                    <form onSubmit={handleAddStudent} className="space-y-4">
                      <div>
                        <label className="block text-xs font-bold text-[#434655] uppercase mb-1">Nama Lengkap</label>
                        <input 
                          required 
                          type="text" 
                          value={newStudentName}
                          onChange={(e) => setNewStudentName(e.target.value)}
                          className="w-full rounded-xl border border-[#c3c6d7] px-4 py-2 text-sm text-[#0b1c30] focus:outline-none focus:border-[#004ac6]" 
                          placeholder="Misal: Budi Santoso" 
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#434655] uppercase mb-1">NIM</label>
                        <input 
                          required 
                          type="text" 
                          value={newStudentNim}
                          onChange={(e) => setNewStudentNim(e.target.value)}
                          className="w-full rounded-xl border border-[#c3c6d7] px-4 py-2 text-sm text-[#0b1c30] focus:outline-none focus:border-[#004ac6]" 
                          placeholder="Misal: 11223344" 
                        />
                      </div>
                      
                      <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-[#c3c6d7]/30">
                        <button
                          type="button"
                          className="px-4 py-2 rounded-xl bg-white text-[#516070] border border-[#c3c6d7] hover:bg-[#f8f9ff] transition font-semibold text-sm"
                          onClick={() => setIsModalOpen(false)}
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 rounded-xl bg-[#004ac6] text-white hover:bg-[#003998] transition shadow-md shadow-[#004ac6]/30 font-semibold text-sm"
                        >
                          Simpan Data
                        </button>
                      </div>
                    </form>
                  </Dialog.Panel>
                </Transition.Child>
              </div>
            </div>
          </Dialog>
        </Transition>

      </main>
    </div>
  );
}