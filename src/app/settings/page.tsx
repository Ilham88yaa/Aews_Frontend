'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';

export default function SettingsPage() {
  const [name, setName] = useState('Dr. Jane Smith');
  const [email, setEmail] = useState('admin@aews.com');
  const [saved, setSaved] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    // Ambil nama yang tersimpan jika ada
    const savedName = localStorage.getItem('userName');
    if (savedName) setName(savedName);
  }, [router]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('userName', name); // Simpan nama ke localStorage
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const getInitials = (str: string) => {
    return str.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

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
            <a href="/settings" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#e5eeff] text-[#004ac6] transition text-sm font-semibold">
              <span>⚙️</span> Settings
            </a>
          </nav>
        </div>

        <div className="space-y-2 border-t border-[#c3c6d7]/30 pt-4">
          <button
            onClick={() => { localStorage.removeItem('token'); router.push('/login'); }}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition shadow-sm"
          >
            <span>🚪</span> Keluar (Logout)
          </button>
        </div>
      </aside>

      {/* KONTEN UTAMA KANAN */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        <header className="h-20 bg-white border-b border-[#c3c6d7]/40 px-8 flex justify-between items-center sticky top-0 z-10 shadow-xs">
          <h2 className="text-xl font-bold text-[#0b1c30]">System & Account Settings</h2>
          
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-[#004ac6] text-white flex items-center justify-center font-bold shadow-md">
              {getInitials(name)}
            </div>
          </div>
        </header>

        <div className="p-8 space-y-8 max-w-4xl">
          
          <div>
            <h3 className="text-2xl font-extrabold text-[#0b1c30]">Pengaturan Akun Administrator</h3>
            <p className="text-sm text-[#434655]">Perbarui informasi profil dan konfigurasi koneksi layanan sistem.</p>
          </div>

          {saved && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 rounded-xl text-sm font-semibold shadow-xs">
              ✅ Perubahan profil berhasil disimpan dan disinkronkan ke seluruh halaman!
            </div>
          )}

          {/* Form Pengaturan Profil */}
          <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl p-6 shadow-xs space-y-6">
            <h4 className="font-bold text-lg text-[#0b1c30] border-b border-[#c3c6d7]/30 pb-3">Profil Pengguna</h4>
            
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#434655] uppercase mb-1">Nama Lengkap</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-[#c3c6d7] px-4 py-2.5 text-sm text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#434655] uppercase mb-1">Email Akademik</label>
                <input 
                  type="email" 
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-[#c3c6d7] px-4 py-2.5 text-sm text-[#0b1c30] focus:outline-none focus:border-[#004ac6]"
                />
              </div>

              <div className="pt-2">
                <button 
                  type="submit"
                  className="px-6 py-2.5 bg-[#004ac6] text-white rounded-xl text-sm font-semibold hover:bg-[#003998] transition shadow-md shadow-[#004ac6]/30"
                >
                  Simpan Perubahan
                </button>
              </div>
            </form>
          </div>

          {/* Status Koneksi Infrastruktur Sistem */}
          <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl p-6 shadow-xs space-y-4">
            <h4 className="font-bold text-lg text-[#0b1c30] border-b border-[#c3c6d7]/30 pb-3">Infrastruktur & Layanan Terhubung</h4>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center p-3 bg-[#f8f9ff] rounded-xl border border-[#c3c6d7]/30">
                <div>
                  <p className="font-bold text-[#0b1c30]">Backend API (NestJS)</p>
                  <p className="text-xs text-[#434655]">http://localhost:3001</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-200">Active</span>
              </div>

              <div className="flex justify-between items-center p-3 bg-[#f8f9ff] rounded-xl border border-[#c3c6d7]/30">
                <div>
                  <p className="font-bold text-[#0b1c30]">Machine Learning Service (FastAPI)</p>
                  <p className="text-xs text-[#434655]">http://localhost:8001</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-200">Connected</span>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}