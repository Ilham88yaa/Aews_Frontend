'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import React from 'react';
import Swal from 'sweetalert2';

export default function PredictionsPage() {
  const [targetAttendance, setTargetAttendance] = useState(88);
  const [targetAssignment, setTargetAssignment] = useState(85);
  const [discussionScore, setDiscussionScore] = useState(75);
  
  const [predictedScore, setPredictedScore] = useState(92);
  const [riskStatus, setRiskStatus] = useState('SAFE');
  const [recommendation, setRecommendation] = useState('Menghubungkan ke AI...');
  
  const [userName, setUserName] = useState('');
  
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
    if (savedName) setUserName(savedName);
    
    fetchPredictionFromAI(targetAttendance, targetAssignment, discussionScore);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchPredictionFromAI = async (attendance: number, assignment: number, discussion: number) => {
    try {
      const response = await fetch('http://localhost:8001/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          attendanceRate: attendance,
          assignmentScore: assignment,
          discussionScore: discussion 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPredictedScore(data.predictedScore);
        setRiskStatus(data.riskStatus);
        setRecommendation(data.recommendation);
      }
    } catch (error) {
      console.error("FastAPI tidak merespons. Pastikan server berjalan di port 8001.", error);
      setRecommendation("Gagal terhubung ke AI Engine (FastAPI).");
    }
  };

  const handleSliderChange = (type: string, val: number) => {
    let newAttendance = targetAttendance;
    let newAssignment = targetAssignment;
    let newDiscussion = discussionScore;

    if (type === 'attendance') {
      setTargetAttendance(val);
      newAttendance = val;
    } else if (type === 'assignment') {
      setTargetAssignment(val);
      newAssignment = val;
    } else if (type === 'discussion') {
      setDiscussionScore(val);
      newDiscussion = val;
    }

    fetchPredictionFromAI(newAttendance, newAssignment, newDiscussion);
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
    if (!str) return '...';
    return str.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  let circleColor = 'border-emerald-500';
  let statusTextColor = 'text-emerald-600';
  
  if (riskStatus === 'MEDIUM RISK') {
    circleColor = 'border-amber-400';
    statusTextColor = 'text-amber-500';
  } else if (riskStatus === 'HIGH RISK') {
    circleColor = 'border-rose-600';
    statusTextColor = 'text-rose-600';
  }

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
            <h2 className="text-lg md:text-xl font-bold text-[#0b1c30] truncate">Machine Learning & Predictions Hub</h2>
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

        <div className="p-4 md:p-8 space-y-4 md:space-y-8 max-w-7xl mx-auto w-full">
          <div>
            <h3 className="text-xl md:text-2xl font-extrabold text-[#0b1c30]">Simulasi & Model Early Warning</h3>
            <p className="text-xs md:text-sm text-[#434655] mt-1">Gunakan simulator ini untuk memproyeksikan tingkat keberhasilan studi mahasiswa secara real-time via FastAPI.</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl p-5 md:p-8 shadow-xs lg:col-span-2 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#c3c6d7]/30 pb-4 gap-3">
                <div>
                  <h4 className="font-bold text-base md:text-lg text-[#0b1c30]">🎯 'What If' Behavior Simulator</h4>
                  <p className="text-[11px] md:text-xs text-[#434655]">Geser slider di bawah untuk melihat kalkulasi AI.</p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-200 self-start sm:self-center whitespace-nowrap">
                  ⚡ API Connected
                </span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs md:text-sm font-semibold">
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
                <div className="flex justify-between text-xs md:text-sm font-semibold">
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
                <div className="flex justify-between text-xs md:text-sm font-semibold">
                  <span className="text-[#0b1c30]">Avg. Discussion Score</span>
                  <span className="text-[#004ac6]">{discussionScore} / 100</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={discussionScore} 
                  onChange={(e) => handleSliderChange('discussion', Number(e.target.value))}
                  className="w-full accent-[#004ac6] cursor-pointer"
                />
              </div>

              <div className={`p-4 rounded-xl border ${riskStatus === 'HIGH RISK' ? 'bg-rose-50 border-rose-200' : 'bg-[#eff4ff] border-[#c3c6d7]/30'} space-y-2 transition-colors duration-300`}>
                <p className={`text-[11px] md:text-xs font-bold uppercase tracking-wider ${riskStatus === 'HIGH RISK' ? 'text-rose-600' : 'text-[#004ac6]'}`}>
                  💡 AI Recommendation
                </p>
                <p className="text-xs md:text-sm text-[#0b1c30] font-medium leading-relaxed">
                  {recommendation}
                </p>
              </div>
            </div>

            <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl p-5 md:p-8 shadow-xs lg:col-span-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-base md:text-lg text-[#0b1c30] mb-1 md:mb-2">Predicted Outcome</h4>
                <p className="text-[11px] md:text-xs text-[#434655] mb-6">Skor kalkulasi ditenagai oleh FastAPI Machine Learning Engine.</p>

                <div className="flex flex-col items-center justify-center my-6">
                  <div className={`w-32 h-32 md:w-40 md:h-40 rounded-full border-[6px] md:border-8 ${circleColor} bg-[#f8f9ff] flex flex-col items-center justify-center shadow-inner transition-colors duration-500`}>
                    <span className="text-3xl md:text-4xl font-extrabold text-[#0b1c30]">{predictedScore}%</span>
                    <span className={`text-[9px] md:text-[10px] ${statusTextColor} font-bold uppercase tracking-wider mt-1 transition-colors duration-500`}>
                      {riskStatus}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-4 border-t border-[#c3c6d7]/30">
                <button className="w-full py-2.5 md:py-3 bg-[#004ac6] text-white rounded-xl text-xs md:text-sm font-semibold hover:bg-[#003998] transition shadow-md shadow-[#004ac6]/30">
                  Save Simulation Scenario
                </button>
                <button className="w-full py-2.5 md:py-3 bg-[#e5eeff] text-[#004ac6] rounded-xl text-xs md:text-sm font-semibold hover:bg-[#d5e4f8] transition">
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