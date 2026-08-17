'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Swal from 'sweetalert2';

const AI_API_URL = process.env.NEXT_PUBLIC_AI_API_URL || 'http://localhost:8001';

export default function PredictionsPage() {
  // 6 State untuk 6 Variabel (termasuk weekNumber dan mataKuliah)
  const [weekNumber, setWeekNumber] = useState<number>(12); // Default ke minggu 12
  const [mataKuliah, setMataKuliah] = useState<string>('Pemrograman Web');
  const [ipk, setIpk] = useState(3.5);
  const [targetAttendance, setTargetAttendance] = useState(88);
  const [targetAssignment, setTargetAssignment] = useState(85);
  const [quizScore, setQuizScore] = useState(80);
  const [atsScore, setAtsScore] = useState(75);

  const [predictedScore, setPredictedScore] = useState(0);
  const [riskStatus, setRiskStatus] = useState('SAFE');
  const [recommendation, setRecommendation] = useState('Menghubungkan ke AI...');

  const [userName, setUserName] = useState('');
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

    // Panggil AI pertama kali halaman dimuat
    fetchPredictionFromAI(weekNumber, mataKuliah, ipk, targetAttendance, targetAssignment, quizScore, atsScore);

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const fetchPredictionFromAI = async (
    currentWeek: number,
    currentMatkul: string,
    currentIpk: number,
    attendance: number,
    assignment: number,
    quiz: number,
    ats: number
  ) => {
    try {
      const response = await fetch(`${AI_API_URL}/predict`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          weekNumber: currentWeek,
          mataKuliah: currentMatkul,
          ipk: currentIpk,
          attendanceRate: attendance,
          assignmentScore: assignment,
          quizScore: quiz,
          atsScore: ats,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setPredictedScore(data.predictedScore);
        setRiskStatus(data.riskStatus);
        setRecommendation(data.recommendation);
      }
    } catch (error) {
      console.error('FastAPI tidak merespons. Pastikan server berjalan di port 8001.', error);
      setRecommendation('Gagal terhubung ke AI Engine (FastAPI).');
    }
  };

  const handleControlChange = (type: string, val: string | number) => {
    let newWeek = weekNumber;
    let newMatkul = mataKuliah;
    let newIpk = ipk;
    let newAttendance = targetAttendance;
    let newAssignment = targetAssignment;
    let newQuiz = quizScore;
    let newAts = atsScore;

    if (type === 'week') {
      newWeek = Number(val);
      setWeekNumber(newWeek);
    } else if (type === 'matkul') {
      newMatkul = String(val);
      setMataKuliah(newMatkul);
    } else if (type === 'ipk') {
      newIpk = Number(val);
      setIpk(newIpk);
    } else if (type === 'attendance') {
      newAttendance = Number(val);
      setTargetAttendance(newAttendance);
    } else if (type === 'assignment') {
      newAssignment = Number(val);
      setTargetAssignment(newAssignment);
    } else if (type === 'quiz') {
      newQuiz = Number(val);
      setQuizScore(newQuiz);
    } else if (type === 'ats') {
      newAts = Number(val);
      setAtsScore(newAts);
    }

    fetchPredictionFromAI(newWeek, newMatkul, newIpk, newAttendance, newAssignment, newQuiz, newAts);
  };

  const handleLogout = () => {
    Swal.fire({
      title: 'Keluar dari Sistem?',
      text: 'Anda harus masuk kembali untuk mengakses panel ini.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#004ac6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, Keluar!',
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.removeItem('token');
        localStorage.removeItem('userName');
        localStorage.removeItem('userRole');
        document.cookie = 'token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        document.cookie = 'userRole=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
        router.push('/login');
      }
    });
  };

  const getInitials = (str: string) => {
    if (!str) return '...';
    return str
      .split(' ')
      .map((n) => n[0])
      .join('')
      .substring(0, 2)
      .toUpperCase();
  };

  let circleColor = 'border-emerald-500';
  let statusTextColor = 'text-emerald-600';
  let badgeBg = 'bg-emerald-50 border-emerald-200';

  if (riskStatus === 'MEDIUM RISK') {
    circleColor = 'border-amber-400';
    statusTextColor = 'text-amber-500';
    badgeBg = 'bg-amber-50 border-amber-200';
  } else if (riskStatus === 'HIGH RISK') {
    circleColor = 'border-rose-600';
    statusTextColor = 'text-rose-600';
    badgeBg = 'bg-rose-50 border-rose-200';
  }

  return (
    <div className="flex h-screen bg-[#f4f6fb]">
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 bg-[#0b1c30]/50 z-40 md:hidden transition-opacity"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR (TETAP SAMA SEPERTI SEBELUMNYA) */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-[#c3c6d7]/40 p-6 flex flex-col justify-between shadow-lg md:shadow-sm transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
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
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="md:hidden text-gray-500 hover:text-gray-800 text-2xl leading-none"
            >
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
          <button onClick={handleLogout} className="w-full flex items-center justify-center gap-2 rounded-xl bg-red-50 border border-red-200 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-100 transition shadow-sm">
            <span>🚪</span> Keluar
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 md:h-20 bg-white border-b border-[#c3c6d7]/40 px-4 md:px-8 flex justify-between items-center sticky top-0 z-10 shadow-xs">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsMobileMenuOpen(true)} className="md:hidden p-2 -ml-2 rounded-lg text-gray-600 hover:bg-gray-100 transition flex items-center justify-center">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <h2 className="text-lg md:text-xl font-bold text-[#0b1c30] truncate">
              Machine Learning Simulator
            </h2>
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
            <h3 className="text-xl md:text-2xl font-extrabold text-[#0b1c30]">
              Interactive Predictor Engine
            </h3>
            <p className="text-xs md:text-sm text-[#434655] mt-1">
              Gunakan simulator ini untuk melihat pengaruh parameter akademik terhadap status risiko mahasiswa.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
            <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl p-5 md:p-8 shadow-xs lg:col-span-2 space-y-5 md:space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-[#c3c6d7]/30 pb-4 gap-3">
                <div>
                  <h4 className="font-bold text-base md:text-lg text-[#0b1c30]">
                    🎯 Scenario Parameters
                  </h4>
                  <p className="text-[11px] md:text-xs text-[#434655]">
                    Pilih konteks mata kuliah dan atur nilai.
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-50 text-emerald-600 rounded-full text-xs font-bold border border-emerald-200 self-start sm:self-center whitespace-nowrap">
                  ⚡ API Connected
                </span>
              </div>

              {/* INPUT BARU: PILIH MINGGU & MATKUL */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pb-2 border-b border-[#c3c6d7]/30">
                <div className="space-y-1">
                  <label className="text-xs md:text-sm font-semibold text-[#0b1c30]">Fase Minggu</label>
                  <select
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-sm focus:ring-[#004ac6] focus:border-[#004ac6]"
                    value={weekNumber}
                    onChange={(e) => handleControlChange('week', e.target.value)}
                  >
                    <option value="4">Minggu 4 (Pre-UTS)</option>
                    <option value="8">Minggu 8 (UTS)</option>
                    <option value="12">Minggu 12 (Post-UTS)</option>
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-xs md:text-sm font-semibold text-[#0b1c30]">Mata Kuliah</label>
                  <select
                    className="w-full bg-gray-50 border border-gray-300 rounded-lg p-2 text-sm focus:ring-[#004ac6] focus:border-[#004ac6]"
                    value={mataKuliah}
                    onChange={(e) => handleControlChange('matkul', e.target.value)}
                  >
                    <option value="Analisis dan Perancangan Sistem">Analisis & Perancangan Sistem</option>
                    <option value="Pemrograman Web">Pemrograman Web</option>
                    <option value="Sistem Operasi">Sistem Operasi</option>
                    <option value="Jaringan Komputer">Jaringan Komputer</option>
                    <option value="Kecerdasan Buatan">Kecerdasan Buatan</option>
                  </select>
                </div>
              </div>

              {/* SLIDER 1: IPK */}
              <div className="space-y-2 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
                <div className="flex justify-between text-xs md:text-sm font-semibold">
                  <span className="text-[#0b1c30] flex items-center gap-2">🎓 Baseline IPK (Semester Lalu)</span>
                  <span className="text-[#004ac6] font-black">{ipk.toFixed(2)}</span>
                </div>
                <input type="range" min="0" max="4" step="0.01" value={ipk} onChange={(e) => handleControlChange('ipk', e.target.value)} className="w-full accent-[#004ac6] cursor-pointer" />
              </div>

              {/* SLIDER 2 & 3 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs md:text-sm font-semibold">
                    <span className="text-[#0b1c30]">Kehadiran (%)</span>
                    <span className="text-[#004ac6]">{targetAttendance}%</span>
                  </div>
                  <input type="range" min="0" max="100" value={targetAttendance} onChange={(e) => handleControlChange('attendance', e.target.value)} className="w-full accent-[#004ac6] cursor-pointer" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs md:text-sm font-semibold">
                    <span className="text-[#0b1c30]">Nilai Tugas</span>
                    <span className="text-[#004ac6]">{targetAssignment}</span>
                  </div>
                  <input type="range" min="0" max="100" value={targetAssignment} onChange={(e) => handleControlChange('assignment', e.target.value)} className="w-full accent-[#004ac6] cursor-pointer" />
                </div>
              </div>

              {/* SLIDER 4 & 5 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
                <div className="space-y-2">
                  <div className="flex justify-between text-xs md:text-sm font-semibold">
                    <span className="text-[#0b1c30]">Nilai Kuis</span>
                    <span className="text-[#004ac6]">{quizScore}</span>
                  </div>
                  <input type="range" min="0" max="100" value={quizScore} onChange={(e) => handleControlChange('quiz', e.target.value)} className="w-full accent-[#004ac6] cursor-pointer" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs md:text-sm font-semibold">
                    <span className="text-[#0b1c30]">Nilai ATS (UTS)</span>
                    <span className="text-[#004ac6]">{atsScore}</span>
                  </div>
                  <input
                    type="range" min="0" max="100" value={atsScore} onChange={(e) => handleControlChange('ats', e.target.value)}
                    disabled={weekNumber < 8}
                    className={`w-full cursor-pointer ${weekNumber < 8 ? 'accent-gray-300' : 'accent-[#004ac6]'}`}
                  />
                  {weekNumber < 8 && <p className="text-[10px] text-gray-400">Dimatikan pada Fase Pre-UTS</p>}
                </div>
              </div>
            </div>

            {/* PANEL HASIL PREDIKSI (KANAN) TETAP SAMA */}
            <div className="bg-white border border-[#c3c6d7]/40 rounded-2xl p-5 md:p-8 shadow-xs lg:col-span-1 flex flex-col justify-between">
              <div>
                <h4 className="font-bold text-base md:text-lg text-[#0b1c30] mb-1 md:mb-2">Predicted Outcome</h4>
                <p className="text-[11px] md:text-xs text-[#434655] mb-6">Skor risiko ditenagai oleh Random Forest Engine.</p>

                <div className="flex flex-col items-center justify-center my-6">
                  <div className={`w-32 h-32 md:w-44 md:h-44 rounded-full border-[6px] md:border-8 ${circleColor} bg-[#f8f9ff] flex flex-col items-center justify-center shadow-inner transition-colors duration-500`}>
                    <span className="text-3xl md:text-5xl font-extrabold text-[#0b1c30]">{predictedScore}%</span>
                    <span className={`text-[9px] md:text-xs ${statusTextColor} font-bold uppercase tracking-wider mt-1 transition-colors duration-500`}>{riskStatus}</span>
                  </div>
                </div>

                <div className={`p-4 mt-6 rounded-xl border ${badgeBg} transition-colors duration-300`}>
                  <p className={`text-[11px] md:text-xs font-bold uppercase tracking-wider mb-2 ${statusTextColor}`}>💡 AI Analysis</p>
                  <p className="text-xs md:text-sm text-[#0b1c30] font-medium leading-relaxed">{recommendation}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}