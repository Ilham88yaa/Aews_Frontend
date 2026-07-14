'use client'

export default function Home() {
  return (
    <>
      {/* 4 Kartu Statistik Atas */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { title: 'Total Students', value: '2,450', icon: 'group', color: 'text-primary', bg: 'bg-primary-container/10', stat: '+4%', statColor: 'text-success', trend: 'trending_up' },
          { title: 'Avg GPA', value: '3.42', icon: 'school', color: 'text-tertiary', bg: 'bg-tertiary-container/10', stat: 'Steady', statColor: 'text-on-surface-variant', trend: 'horizontal_rule' },
          { title: 'Avg Attendance', value: '88%', icon: 'calendar_today', color: 'text-secondary', bg: 'bg-secondary-container/20', stat: '-2%', statColor: 'text-error', trend: 'trending_down' },
          { title: 'E-Learning Activity', value: '92%', icon: 'computer', color: 'text-primary', bg: 'bg-primary-container/10', stat: '+12%', statColor: 'text-success', trend: 'trending_up' },
        ].map((card, idx) => (
          <div key={idx} className="bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant transition-transform hover:-translate-y-1 hover:shadow-lg cursor-pointer">
            <div className="flex justify-between items-start mb-4">
              <div className={`p-2 rounded-lg ${card.bg}`}>
                <span className={`material-symbols-outlined ${card.color}`}>{card.icon}</span>
              </div>
              <span className={`text-xs font-bold flex items-center gap-1 ${card.statColor}`}>
                <span className="material-symbols-outlined text-sm">{card.trend}</span> {card.stat}
              </span>
            </div>
            <h3 className="text-xs font-semibold text-on-surface-variant uppercase tracking-wider">{card.title}</h3>
            <p className="text-3xl font-bold text-on-surface mt-1">{card.value}</p>
          </div>
        ))}
      </section>

      {/* Grid Tengah: Pie Chart & Line Chart */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Pie Chart (Kiri) */}
        <div className="lg:col-span-4 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant hover:shadow-md transition-shadow">
          <h2 className="text-xl font-bold mb-6">Academic Status</h2>
          <div className="relative h-64 flex items-center justify-center">
            <div 
              className="w-48 h-48 rounded-full border-[18px] border-surface-container-high relative" 
              style={{ background: 'conic-gradient(#004ac6 0% 65%, #2563eb 65% 85%, #ffb596 85% 95%, #ba1a1a 95% 100%)' }}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-white rounded-full m-1 shadow-inner">
                <span className="text-2xl font-bold">2,450</span>
                <span className="text-[10px] uppercase text-outline">Students</span>
              </div>
            </div>
          </div>
        </div>

        {/* Line Chart (Kanan) */}
        <div className="lg:col-span-8 bg-surface-container-lowest p-6 rounded-2xl border border-outline-variant hover:shadow-md transition-shadow">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold">GPA Trends over Semesters</h2>
          </div>
          <div className="h-64 w-full flex items-end justify-between px-4 relative mt-12">
            <div className="absolute inset-x-0 bottom-0 top-0 flex flex-col justify-between pointer-events-none border-b border-outline-variant">
              {[1,2,3,4].map((line) => <div key={line} className="border-t border-outline-variant/30 w-full"></div>)}
            </div>
            <svg className="absolute inset-0 w-full h-full" preserveAspectRatio="none" viewBox="0 0 800 250">
              <path d="M0,150 Q100,140 200,120 T400,100 T600,110 T800,90" fill="none" stroke="#004ac6" strokeLinecap="round" strokeWidth="4"></path>
              <circle cx="200" cy="120" fill="#004ac6" r="6"></circle>
              <circle cx="400" cy="100" fill="#004ac6" r="6"></circle>
              <circle cx="600" cy="110" fill="#004ac6" r="6"></circle>
              <circle cx="800" cy="90" fill="#004ac6" r="6"></circle>
            </svg>
            <div className="absolute -bottom-8 w-full flex justify-between text-xs text-on-surface-variant font-medium">
              <span>Fall 2022</span><span>Spring 2023</span><span>Summer 2023</span><span>Fall 2023</span><span>Spring 2024</span>
            </div>
          </div>
        </div>
      </section>

      {/* Tombol Aksi Tambahan */}
      <button className="fixed bottom-10 right-10 bg-primary text-white w-14 h-14 rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50 group">
        <span className="material-symbols-outlined">add</span>
        <span className="absolute right-full mr-4 bg-inverse-surface text-inverse-on-surface px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
          Create Intervention
        </span>
      </button>
    </>
  )
}