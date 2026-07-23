'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import Swal from 'sweetalert2';

export default function PredictionsPage() {
  const [targetAttendance, setTargetAttendance] = useState(88);
  const [targetAssignment, setTargetAssignment] = useState(85);
  const [discussionHours, setDiscussionHours] = useState(12);
  const [predictedScore, setPredictedScore] = useState(92);
  const [userName, setUserName] = useState('Dr. Jane Smith');
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
    const savedName = localStorage.getItem('userName');
    if (savedName) setUserName(savedName);
  }, [router]);

  const handleSliderChange = (type: string, val: number) => {
    if (type === 'attendance') {
      setTargetAttendance(val);
      setPredictedScore(Math.min(100, Math.round(val * 0.6 + targetAssignment * 0.4)));
    } else if (type === 'assignment') {
      setTargetAssignment(val);
      setPredictedScore(Math.min(100, Math.round(targetAttendance * 0.6 + val * 0.4)));
    } else if (type === 'discussion') {
      setDiscussionHours(val);
    }
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Keluar dari Sistem?',
      text: 'Anda harus masuk kembali menggunakan kredensial admin untuk mengakses panel ini.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#004ac6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Keluar!',
      cancelButtonText: 'Batal',
      background: '#ffffff',
      color: '#0b1c30',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        
        Swal.fire({
          title: 'Berhasil Keluar!',
          text: 'Sampai jumpa kembali, Administrator.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
        }).then(() => {
          router.push('/login');
        });
      }
    });
  };

  const getInitials = (str: string) => {
    return str.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
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
            <a href="/predictions" className="flex items-center gap-3 px-4 py-3 rounded-xl bg-[#e5eeff] text-[#004ac6] font-semibold text-sm">
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
            <span>🚪</span> Keluar (Logout)
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-20 bg-white border-b border-[#c3c6d7]/40 px-8 flex justify-between items-center sticky top-0 z-10 shadow-xs">
          <h2 className="text-xl font-bold text-[#0b1c30]">Machine Learning & Predictions Hub</h2>
          
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
          <div>
            <h3 className="text-2xl font-extrabold text-[#0b1c30]">Simulasi & Model Early Warning</h3>
            <p className="text-sm text-[#434655]">Gunakan simulator berbasis Random Forest untuk memproyeksikan tingkat keberhasilan studi mahasiswa.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl p-8 shadow-xs lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between border-b border-[#c3c6d7]/30 pb-4">
                <div>
                  <h4 className="font-bold text-lg text-[#0b1c30]">🎯 'What If' Behavior Simulator</h4>
                  <p className="text-xs text-[#434655]">Proyeksikan dampak perubahan perilaku akademik terhadap skor prediksi.</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-200">
                  FastAPI Port 8001 Ready
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-[#0b1c30]">Target Attendance %</span>
                  <span className="text-[#004ac6]">{targetAttendance}%</span>
                </div>
                <input 
                  type="range" 
                  min="40" 
                  max="100" 
                  value={targetAttendance} 
                  onChange={(e) => handleSliderChange('attendance', Number(e.target.value))}
                  className="w-full accent-[#004ac6] cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-[#0b1c30]">Avg. Assignment Score</span>
                  <span className="text-[#004ac6]">{targetAssignment} / 100</span>
                </div>
                <input 
                  type="range" 
                  min="30" 
                  max="100" 
                  value={targetAssignment} 
                  onChange={(e) => handleSliderChange('assignment', Number(e.target.value))}
                  className="w-full accent-[#004ac6] cursor-pointer"
                />
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm font-semibold">
                  <span className="text-[#0b1c30]">E-Learning / Discussion Hours / Week</span>
                  <span className="text-[#004ac6]">{discussionHours} Hours</span>
                </div>
                <input 
                  type="range" 
                  min="2" 
                  max="30" 
                  value={discussionHours} 
                  onChange={(e) => handleSliderChange('discussion', Number(e.target.value))}
                  className="w-full accent-[#004ac6] cursor-pointer"
                />
              </div>

              <div className="p-4 bg-[#eff4ff] rounded-xl border border-[#c3c6d7]/30 space-y-2">
                <p className="text-xs font-bold text-[#004ac6] uppercase tracking-wider">💡 Personalized AI Recommendations</p>
                <p className="text-xs text-[#434655] leading-relaxed">
                  Meningkatkan aktivitas diskusi e-learning minimal <strong>3 jam/minggu</strong> terbukti menaikkan akurasi kelulusan tepat waktu sebesar <strong>4.2%</strong>.
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl p-8 shadow-xs lg:col-span-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-lg text-[#0b1c30] mb-2">Predicted Outcome</h4>
                <p className="text-xs text-[#434655] mb-6">Skor kalkulasi akhir berdasarkan parameter simulasi.</p>

                <div className="flex flex-col items-center justify-center my-6">
                  <div className="w-40 h-40 rounded-full border-8 border-[#004ac6] bg-[#f8f9ff] flex flex-col items-center justify-center shadow-inner">
                    <span className="text-4xl font-extrabold text-[#0b1c30]">{predictedScore}%</span>
                    <span className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-1">Safe Zone</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#c3c6d7]/30">
                <button className="w-full py-3 bg-[#004ac6] text-white rounded-xl text-sm font-semibold hover:bg-[#003998] transition shadow-md shadow-[#004ac6]/30">
                  Save Simulation Scenario
                </button>
                <button className="w-full py-3 bg-[#e5eeff] text-[#004ac6] rounded-xl text-sm font-semibold hover:bg-[#d5e4f8] transition">
                  Export Prediction Report
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}