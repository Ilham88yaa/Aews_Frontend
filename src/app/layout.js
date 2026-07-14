import './globals.css'

export const metadata = {
  title: 'AEWS - Academic Institutional Overview',
  description: 'Academic Early Warning System Dashboard',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="overflow-x-hidden">
        
        {/* SIDEBAR */}
        <aside className="fixed left-0 top-0 h-full flex flex-col w-[280px] z-40 bg-surface border-r border-outline-variant">
          <div className="px-6 py-8 flex flex-col items-start gap-2">
            <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white">
              <span className="material-symbols-outlined text-3xl">school</span>
            </div>
            <div className="mt-4">
              <h1 className="text-xl font-bold text-primary">AEWS</h1>
              <p className="text-sm font-medium text-on-surface-variant">Academic Support</p>
            </div>
          </div>
          <nav className="flex-1 flex flex-col mt-4">
            <a href="#" className="flex items-center gap-3 bg-surface-container-low text-primary border-l-4 border-primary px-4 py-3 font-semibold">
              <span className="text-sm font-medium">Dashboard</span>
            </a>
            <a href="#" className="flex items-center gap-3 text-secondary px-4 py-3 hover:bg-surface-container-low transition-colors">
              <span className="text-sm font-medium">Student Management</span>
            </a>
            <a href="#" className="flex items-center gap-3 text-secondary px-4 py-3 hover:bg-surface-container-low transition-colors">
              <span className="material-symbols-outlined">analytics</span>
              <span className="text-sm font-medium">Predictions</span>
            </a>
            <a href="#" className="flex items-center gap-3 text-secondary px-4 py-3 hover:bg-surface-container-low transition-colors mt-auto mb-6">
              <span className="material-symbols-outlined">settings</span>
              <span className="text-sm font-medium">Settings</span>
            </a>
          </nav>
        </aside>

        {/* MAIN AREA */}
        <main className="ml-[280px] min-h-screen flex flex-col bg-surface">
          
          {/* TOP HEADER */}
          <header className="flex justify-between items-center w-full px-8 h-16 sticky top-0 z-50 bg-surface border-b border-outline-variant">
            <div className="flex items-center gap-4">
              <span className="text-xl font-bold text-primary">Academic Institutional Overview</span>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-on-surface-variant hover:bg-surface-container-low p-2 rounded-full cursor-pointer transition-colors">
                <span className="material-symbols-outlined">notifications</span>
              </div>
              <div className="flex items-center gap-3 pl-4 border-l border-outline-variant">
                <div className="text-right hidden lg:block">
                  <p className="text-sm font-bold text-on-surface">Dr. Jane Smith</p>
                  <p className="text-xs text-on-surface-variant">Administrator</p>
                </div>
                <img 
                  className="w-10 h-10 rounded-full object-cover" 
                  alt="Profile" 
                  src="https://ui-avatars.com/api/?name=Jane+Smith&background=004ac6&color=fff" 
                />
              </div>
            </div>
          </header>

          {/* PAGE CONTENT */}
          <div className="p-8 max-w-[1440px] mx-auto w-full flex flex-col gap-8">
            {children}
          </div>

        </main>
      </body>
    </html>
  )
}