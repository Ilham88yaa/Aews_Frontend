'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Login Gagal');
      }

      // 1. Simpan data ke browser (termasuk role)
      localStorage.setItem('token', data.access_token);
      localStorage.setItem('userName', data.user.name);
      localStorage.setItem('userRole', data.user.role);

      // 2. Simpan token & role ke cookie agar middleware server-side bisa membacanya
      const cookieOptions = 'path=/; SameSite=Strict';
      document.cookie = `token=${data.access_token}; ${cookieOptions}`;
      document.cookie = `userRole=${data.user.role}; ${cookieOptions}`;

      // 2. Tentukan rute & label jabatan berdasarkan role
      const role = data.user.role;
      const roleConfig: Record<string, { route: string; jabatan: string }> = {
        ADMIN: { route: '/dashboard', jabatan: 'Administrator' },
        DOSEN: { route: '/dosen/dashboard', jabatan: 'Dosen Wali' },
      };

      const { route: targetRoute, jabatan } = roleConfig[role] ?? {
        route: '/',
        jabatan: '',
      };

      // 3. Tampilkan notifikasi lalu redirect
      await Swal.fire({
        icon: 'success',
        title: 'Login Berhasil!',
        text: `Selamat datang, ${jabatan} ${data.user.name}`,
        timer: 1500,
        showConfirmButton: false,
      });

      router.push(targetRoute);
    } catch (error: any) {
      Swal.fire('Akses Ditolak', error.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">
        <div className="text-center mb-6">
          <div className="text-4xl mb-2">🎓</div>
          <h1 className="text-xl font-bold text-[#434655]">AEWS Portal</h1>
          <p className="text-sm text-gray-500">Silakan masuk ke akun Anda</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-bold text-[#434655] uppercase mb-1">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full rounded-xl border border-[#c3c6d7] px-4 py-3 text-sm focus:outline-none focus:border-[#004ac6] focus:ring-1 focus:ring-[#004ac6] transition"
              placeholder="nama@ulbi.ac.id"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#434655] uppercase mb-1">
              Password
            </label>
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
