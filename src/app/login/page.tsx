'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch('http://localhost:3001/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login Gagal');
      }

      // SIMPAN TIKET VIP (TOKEN) DI BROWSER
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('userName', data.user.name);

      Swal.fire({
        icon: 'success',
        title: 'Login Berhasil!',
        text: `Selamat datang, ${data.user.name}`,
        timer: 1500,
        showConfirmButton: false
      }).then(() => {
        router.push('/students'); // Arahkan ke halaman mahasiswa
      });

    } catch (error: any) {
      Swal.fire('Akses Ditolak', error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9ff] flex items-center justify-center p-4 font-sans">
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md border border-[#c3c6d7]/40">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-[#004ac6] flex items-center justify-center text-white text-3xl mx-auto mb-4 shadow-lg shadow-[#004ac6]/30">
            🎓
          </div>
          <h1 className="text-2xl font-extrabold text-[#0b1c30]">AEWS Portal</h1>
          <p className="text-sm text-[#434655] mt-1">Silakan masuk ke akun Anda</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#434655] uppercase mb-1">Email</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#c3c6d7] px-4 py-3 text-sm focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] transition"
              placeholder="admin@aews.com"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-[#434655] uppercase mb-1">Password</label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full rounded-xl border border-[#c3c6d7] px-4 py-3 text-sm focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] transition"
              placeholder="••••••••"
            />
          </div>
          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-[#004ac6] text-white py-3 rounded-xl font-bold hover:bg-[#003998] transition shadow-md shadow-[#004ac6]/30 mt-2 disabled:opacity-70"
          >
            {isLoading ? 'Memeriksa Kredensial...' : 'Masuk Sistem'}
          </button>
        </form>
      </div>
    </div>
  );
}