import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { BarChart3, FileText, Plus, Users, Vote } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/',            label: 'Listar Pautas', icon: FileText, end: true  },
  { to: '/pautas/nova', label: 'Adicionar',     icon: Plus,     end: false },
];

export function Layout() {
  const location = useLocation();

  return (
    <div className="min-h-screen flex flex-col bg-earth-50">
      {/* Header */}
      <header className="bg-coop-gradient text-white shadow-lg sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          {/* Top bar */}
          <div className="flex items-center justify-between py-4 gap-4">
            <NavLink to="/" className="flex items-center gap-3 group">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/15 backdrop-blur ring-1 ring-white/20 group-hover:bg-white/25 transition-colors">
                <Vote className="h-5 w-5 text-white" />
              </div>
              <div className="leading-tight">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-bold tracking-tight">CoopVoto</span>
                  <span className="rounded-full bg-gold-400 text-coop-900 text-[10px] font-bold px-1.5 py-0.5 leading-none">v1</span>
                </div>
                <p className="text-coop-200 text-xs hidden sm:block">Sistema de Votação Cooperativista</p>
              </div>
            </NavLink>

            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-white/20 text-white'
                        : 'text-coop-100 hover:text-white hover:bg-white/10',
                    )
                  }
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Page breadcrumb strip */}
          <div className="border-t border-white/10 py-2 flex items-center gap-2 text-xs text-coop-200">
            <Users className="h-3.5 w-3.5" />
            <span>Assembleia Geral</span>
            <span className="text-coop-400">•</span>
            <BarChart3 className="h-3.5 w-3.5" />
            <span>Votação Eletrônica</span>
            {location.pathname !== '/' && (
              <>
                <span className="text-coop-400">•</span>
                <span className="text-white font-medium">
                  {location.pathname.includes('/nova') ? 'Nova Pauta' : 'Detalhe da Pauta'}
                </span>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="border-t border-earth-200 bg-white py-5">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-earth-500">
          <div className="flex items-center gap-2">
            <div className="h-5 w-5 rounded bg-coop-gradient flex items-center justify-center">
              <Vote className="h-3 w-3 text-white" />
            </div>
            <span className="font-semibold text-coop-800">CoopVoto</span>
            <span className="text-earth-400">—</span>
            <span>Sistema de Votação Cooperativista</span>
          </div>
          <span>© {new Date().getFullYear()} CoopVoto</span>
        </div>
      </footer>
    </div>
  );
}
