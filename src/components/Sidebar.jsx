import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { Home, FileText, FlaskConical, LogOut, BookOpen } from "lucide-react";
import { base44 } from "@/api/base44Client";

const items = [
  { to: "/", icon: Home, label: "Nova entrevista" },
  { to: "/entrevistas", icon: FileText, label: "Entrevistas salvas" },
  { to: "/documentacao", icon: BookOpen, label: "Documentação" },
];

export default function Sidebar() {
  const { pathname } = useLocation();
  const handleLogout = async () => {
    await base44.auth.logout();
  };
  const carregarExemplo = () => {
    window.dispatchEvent(new Event("entrevista:carregar-exemplo"));
  };

  return (
    <header className="sticky top-0 z-20 px-3 pt-3">
      <nav className="flex items-center gap-4 rounded-2xl bg-ink px-4 py-4 text-white sm:px-6">
        <div className="ml-auto flex items-center gap-2">
          {items.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold transition ${
                  isActive ? "bg-brand text-white" : "text-brand-ink hover:bg-white/5"
                }`
              }
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:inline">{label}</span>
            </NavLink>
          ))}
          {pathname === "/" && (
            <button
              type="button"
              onClick={carregarExemplo}
              title="Carregar exemplo"
              className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-brand-ink transition hover:bg-white/5"
            >
              <FlaskConical className="h-4 w-4" />
              <span className="hidden sm:inline">Exemplo</span>
            </button>
          )}
          <button
            type="button"
            onClick={handleLogout}
            title="Sair"
            className="flex h-9 w-9 items-center justify-center rounded-xl text-brand-ink transition hover:bg-white/5"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </nav>
    </header>
  );
}