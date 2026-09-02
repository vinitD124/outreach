import Link from 'next/link';
import { Map, Users, LogOut, Upload, Zap } from 'lucide-react';
import { signOut } from './actions';

export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen bg-[#f8fafc] font-sans text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-[280px] bg-white border-r border-slate-200/60 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
        <div className="p-8 pb-6">
          <Link href="/admin" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Zap size={18} fill="currentColor" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
              Outreach<span className="text-blue-600">HQ</span>
            </h1>
          </Link>
        </div>
        
        <div className="px-6 mb-2">
          <p className="text-[10px] uppercase font-bold tracking-widest text-slate-400">Navigation</p>
        </div>

        <nav className="flex-1 px-4 space-y-1.5 overflow-y-auto">
          <Link href="/admin" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all font-medium border border-transparent hover:border-slate-100 group">
            <Users size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span>My Leads</span>
          </Link>
          <Link href="/admin/scraper" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all font-medium border border-transparent hover:border-slate-100 group">
            <Map size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span>Map Scraper</span>
          </Link>
          <Link href="/admin/import" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 hover:text-slate-900 rounded-xl transition-all font-medium border border-transparent hover:border-slate-100 group">
            <Upload size={18} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
            <span>Bulk Import</span>
          </Link>
        </nav>

        <div className="p-4 border-t border-slate-100/50 m-4">
          <form action={signOut}>
            <button type="submit" className="flex items-center gap-3 px-4 py-3 w-full text-slate-500 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all font-medium group border border-transparent hover:border-red-100">
              <LogOut size={18} className="text-slate-400 group-hover:text-red-500 transition-colors" />
              <span>Sign Out</span>
            </button>
          </form>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-[#f8fafc] relative">
        <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-white to-transparent pointer-events-none opacity-50"></div>
        <div className="relative min-h-full">
          {children}
        </div>
      </main>
    </div>
  );
}
