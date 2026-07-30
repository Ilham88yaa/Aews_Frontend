'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import Swal from 'sweetalert2';

export default function SettingsPage() {
  const [userName, setUserName] = useState('');
  const [newUserName, setNewUserName] = useState('');
  
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // State untuk Show/Hide Password
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // State Mobile Menu
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const savedName = localStorage.getItem('userName');
    if (savedName) {
      setUserName(savedName);
      setNewUserName(savedName);
    }
  }, [router]);

  const handleLogout = () => {
    Swal.fire({
      title: 'Keluar dari Sistem?',
      text: 'Anda akan dialihkan ke halaman login.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#004ac6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Keluar'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        router.push('/login');
      }
    });
  };

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName.trim()) {
      Swal.fire('Peringatan', 'Nama tidak boleh kosong.', 'warning');
      return;
    }

    Swal.fire({
      title: 'Menyimpan Profil...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    setTimeout(() => {
      localStorage.setItem('userName', newUserName);
      setUserName(newUserName);
      Swal.fire('Berhasil!', 'Nama profil berhasil diperbarui.', 'success');
    }, 1000);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword || !confirmPassword) {
      Swal.fire('Peringatan', 'Harap isi semua kolom password.', 'warning');
      return;
    }
    if (newPassword !== confirmPassword) {
      Swal.fire('Error', 'Konfirmasi password baru tidak cocok.', 'error');
      return;
    }

    const token = localStorage.getItem('token');
    
    Swal.fire({
      title: 'Memverifikasi Keamanan...',
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); }
    });

    try {
      const response = await fetch('http://localhost:3001/users/change-password', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          currentPassword: currentPassword,
          newPassword: newPassword
        })
      });

      if (response.ok) {
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        Swal.fire('Berhasil!', 'Password Anda telah diperbarui. Silakan login kembali.', 'success')
          .then(() => {
            localStorage.removeItem('token');
            router.push('/login');
          });
      } else {
        const errorData = await response.json();
        Swal.fire('Gagal', errorData.message || 'Password saat ini salah.', 'error');
      }
    } catch (error) {
      Swal.fire('Error', 'Gagal menghubungi server.', 'error');
    }
  };

  const getInitials = (str: string) => {
    if (!str) return '...';
    return str.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  // Komponen Icon Mata
  const EyeIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );

  const EyeSlashIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4 md:w-5 md:h-5">
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
    </svg>
  );

  return (
    <div className="min-h-screen bg-[#f8f9ff] text-[#0b1c30] flex font-sans">
      
      {/* OVERLAY UNTUK MOBILE */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-[#0b1c30]/50 z-40 md:hidden transition-opacity" 
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR LENGKAP */}
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
            <a href="/reports" className="flex items-center gap-3 px-4 py-3 rounded-xl text-[#516070] hover:bg-[#eff4ff] hover:text-[#0b1c30] transition font-medium text-sm">
              <span>📑</span> Reports
            </a>
            <a href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#e5eeff] text-[#004ac6] font-semibold text-sm">
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

      {/* KONTEN UTAMA */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 md:h-20 bg-white border-b border-[#c3c6d7]/40 px-4 md:px-8 flex justify-between items-center sticky top-0 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsMobileMenuOpen(true)} 
              className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 transition flex items-center justify-center"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h2 className="text-lg md:text-xl font-bold text-[#0b1c30] truncate">System Settings</h2>
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

        <div className="p-4 md:p-8 space-y-4 md:space-y-6 max-w-4xl mx-auto w-full">
          <div>
            <h3 className="text-xl md:text-2xl font-extrabold text-[#0b1c30]">Pengaturan Akun</h3>
            <p className="text-xs md:text-sm text-[#516070] mt-1">Kelola informasi profil dan keamanan akses administrator.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-8 mt-4 md:mt-6">
            
            {/* KARTU PROFIL */}
            <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl shadow-sm p-5 md:p-7">
              <div className="flex items-center gap-4 mb-6 pb-6 border-b border-gray-100">
                <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-gradient-to-br from-[#004ac6] to-[#002f80] text-white flex items-center justify-center font-bold text-xl md:text-2xl shadow-lg shadow-[#004ac6]/20 shrink-0">
                  {getInitials(userName)}
                </div>
                <div>
                  <h4 className="text-base md:text-lg font-bold text-[#0b1c30]">Profil Pengguna</h4>
                  <p className="text-xs text-[#516070]">Perbarui nama tampilan Anda</p>
                </div>
              </div>

              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div>
                  <label className="block text-[11px] md:text-xs font-bold text-[#516070] mb-2 uppercase tracking-wide">Nama Lengkap</label>
                  <input 
                    type="text" 
                    value={newUserName}
                    onChange={(e) => setNewUserName(e.target.value)}
                    className="w-full px-4 py-2.5 md:py-3 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#004ac6]/50 focus:border-[#004ac6] transition outline-none text-sm font-medium text-gray-800"
                  />
                </div>
                <button 
                  type="submit" 
                  className="w-full py-2.5 md:py-3 bg-[#004ac6] text-white rounded-xl text-xs md:text-sm font-bold hover:bg-[#003998] transition shadow-md shadow-[#004ac6]/20 mt-2"
                >
                  Simpan Perubahan
                </button>
              </form>
            </div>

            {/* KARTU KEAMANAN (PASSWORD) */}
            <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl shadow-sm p-5 md:p-7">
              <div className="mb-6 pb-6 border-b border-gray-100">
                <h4 className="text-base md:text-lg font-bold text-[#0b1c30]">Keamanan Akses</h4>
                <p className="text-xs text-[#516070]">Perbarui password secara berkala</p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <div>
                  <label className="block text-[11px] md:text-xs font-bold text-[#516070] mb-2 uppercase tracking-wide">Password Saat Ini</label>
                  <div className="relative">
                    <input 
                      type={showCurrent ? "text" : "password"} 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full px-4 py-2.5 md:py-3 pr-10 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#004ac6]/50 focus:border-[#004ac6] transition outline-none text-sm"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowCurrent(!showCurrent)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#004ac6] transition"
                    >
                      {showCurrent ? <EyeSlashIcon /> : <EyeIcon />}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] md:text-xs font-bold text-[#516070] mb-2 uppercase tracking-wide">Password Baru</label>
                    <div className="relative">
                      <input 
                        type={showNew ? "text" : "password"} 
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 md:py-3 pr-10 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#004ac6]/50 focus:border-[#004ac6] transition outline-none text-sm"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowNew(!showNew)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#004ac6] transition"
                      >
                        {showNew ? <EyeSlashIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] md:text-xs font-bold text-[#516070] mb-2 uppercase tracking-wide">Konfirmasi</label>
                    <div className="relative">
                      <input 
                        type={showConfirm ? "text" : "password"} 
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••"
                        className="w-full px-4 py-2.5 md:py-3 pr-10 rounded-xl border border-gray-300 bg-gray-50 focus:bg-white focus:ring-2 focus:ring-[#004ac6]/50 focus:border-[#004ac6] transition outline-none text-sm"
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirm(!showConfirm)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#004ac6] transition"
                      >
                        {showConfirm ? <EyeSlashIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                </div>
                <button 
                  type="submit" 
                  className="w-full py-2.5 md:py-3 bg-white text-[#004ac6] border-2 border-[#004ac6] rounded-xl text-xs md:text-sm font-bold hover:bg-[#e5eeff] transition mt-2"
                >
                  Perbarui Password
                </button>
              </form>
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}