import { useState } from 'react';
import { 
  BarChart3, Users, Settings, Ticket, Zap, 
  LogOut, Menu, X, Clock, ChevronLeft, ListChecks
} from 'lucide-react';
import { useStore } from '../../store/useStore';
import AdminStats from './AdminStats';
import AdminRequests from './AdminRequests';
import AdminMembers from './AdminMembers';
import AdminSettings from './AdminSettings';
import AdminAllTickets from './AdminAllTickets';
import LuckyWheel from './LuckyWheel';
import toast from 'react-hot-toast';

type AdminPage = 'stats' | 'requests' | 'members' | 'settings' | 'draw' | 'all-tickets';

export default function AdminDashboard() {
  const { logout, tickets, settings } = useStore();
  const [page, setPage] = useState<AdminPage>('stats');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const pendingCount = tickets.filter(t => t.status === 'pending').length;
  const approvedCount = tickets.filter(t => t.status === 'approved').length;

  const navItems = [
    { id: 'stats' as AdminPage, label: 'الإحصائيات', icon: BarChart3, badge: null },
    { id: 'requests' as AdminPage, label: 'الطلبات المعلقة', icon: Clock, badge: pendingCount || null },
    { id: 'all-tickets' as AdminPage, label: 'جميع الطلبات', icon: ListChecks, badge: null },
    { id: 'members' as AdminPage, label: 'الأعضاء', icon: Users, badge: null },
    { id: 'draw' as AdminPage, label: 'عجلة الحظ', icon: Zap, badge: null },
    { id: 'settings' as AdminPage, label: 'الإعدادات', icon: Settings, badge: null },
  ];

  const handleLogout = () => {
    logout();
    toast.success('تم تسجيل الخروج');
  };

  const currentPage = navItems.find(n => n.id === page);

  return (
    <div className="min-h-screen flex" style={{ background: '#0a0f1e' }}>
      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 right-0 h-full w-64 z-50 transition-transform duration-300 lg:relative lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'
        }`}
        style={{ background: 'linear-gradient(180deg, #0f172a, #1e1b4b)', borderLeft: '1px solid rgba(99,102,241,0.2)' }}
      >
        {/* Logo */}
        <div className="p-5 border-b border-slate-700/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center">
                <Ticket size={18} className="text-white" />
              </div>
              <div>
                <div className="text-white font-bold text-sm">{settings.competitionName}</div>
                <div className="text-indigo-400 text-xs">لوحة التحكم</div>
              </div>
            </div>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden p-1 hover:bg-white/10 rounded-lg">
              <X size={18} className="text-slate-400" />
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="p-3 border-b border-slate-700/30">
          <div className="grid grid-cols-2 gap-2">
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(245,158,11,0.15)' }}>
              <div className="text-amber-400 font-bold">{pendingCount}</div>
              <div className="text-slate-500 text-xs">معلق</div>
            </div>
            <div className="rounded-lg p-2 text-center" style={{ background: 'rgba(34,197,94,0.15)' }}>
              <div className="text-green-400 font-bold">{approvedCount}</div>
              <div className="text-slate-500 text-xs">مقبول</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 flex-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => { setPage(item.id); setSidebarOpen(false); }}
                className={`sidebar-link w-full text-right flex items-center gap-3 px-4 py-3 rounded-xl mb-1 transition-all ${
                  isActive ? 'active text-white' : 'text-slate-400 hover:text-white'
                }`}
                style={isActive ? { background: 'rgba(99,102,241,0.2)' } : {}}
              >
                <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-slate-500'} />
                <span className="text-sm font-medium flex-1">{item.label}</span>
                {item.badge !== null && item.badge! > 0 && (
                  <span className="w-5 h-5 rounded-full bg-amber-500 text-white text-xs font-bold flex items-center justify-center">
                    {item.badge}
                  </span>
                )}
                {isActive && <ChevronLeft size={14} className="text-indigo-400" />}
              </button>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-slate-700/30">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all text-sm"
          >
            <LogOut size={17} />
            تسجيل الخروج
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 min-w-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-700/30 lg:px-6" style={{ background: 'rgba(15,23,42,0.8)', backdropFilter: 'blur(10px)' }}>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-white/10 rounded-xl transition-colors"
            >
              <Menu size={20} className="text-slate-300" />
            </button>
            <div>
              <h1 className="text-white font-bold text-base">{currentPage?.label}</h1>
              <p className="text-slate-500 text-xs hidden sm:block">لوحة تحكم {settings.competitionName}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-500 hidden sm:block">
              {new Date().toLocaleDateString('ar-SA', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </div>

        {/* Page Content */}
        <div className="p-4 lg:p-6 overflow-y-auto" style={{ height: 'calc(100vh - 57px)' }}>
          {page === 'stats' && <AdminStats />}
          {page === 'requests' && <AdminRequests />}
          {page === 'all-tickets' && <AdminAllTickets />}
          {page === 'members' && <AdminMembers />}
          {page === 'draw' && <LuckyWheel />}
          {page === 'settings' && <AdminSettings />}
        </div>
      </main>
    </div>
  );
}
