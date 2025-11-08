"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  Home,
  Lightbulb,
  TrendingUp,
  Calculator,
  Radar,
  FileText,
  Users,
  SearchX,
  Settings,
  LogOut,
  Menu,
  X
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: "/home", icon: Home, label: "Home" },
    { href: "/ideas", icon: Lightbulb, label: "Ideas" },
    { href: "/market-research", icon: TrendingUp, label: "Market Research" },
    { href: "/tam-calculator", icon: Calculator, label: "TAM Calculator" },
    { href: "/trend-radar", icon: Radar, label: "Trend Radar" },
    { href: "/industry-reports", icon: FileText, label: "Industry Reports" },
    { href: "/persona-builder", icon: Users, label: "Persona Builder" },
    { href: "/gap-finder", icon: SearchX, label: "Gap Finder" },
  ];

  const handleLogout = () => {
    localStorage.clear();
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 glass-card rounded-lg text-white hover:text-mint-primary transition-colors"
      >
        {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed left-0 top-0 h-screen w-64 glass-card border-r border-white/10 flex flex-col p-6 z-40 transition-transform duration-300
        ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
      {/* Logo */}
      <div className="mb-8">
        <Link href="/home" className="flex items-center gap-2 group">
          <span className="text-3xl">🚀</span>
          <div>
            <h1 className="text-xl font-bold text-white group-hover:text-mint-primary transition-colors">
              IdeaValidator
            </h1>
            <p className="text-xs text-white/50">Basecamp to Summit</p>
          </div>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href || pathname?.startsWith(item.href + "/");

          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={`
                flex items-center gap-3 px-4 py-3 rounded-lg transition-all
                ${isActive
                  ? "bg-mint-primary/10 border-l-3 border-mint-primary text-mint-primary"
                  : "text-white/70 hover:bg-white/5 hover:text-white"
                }
              `}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="border-t border-white/10 pt-4 space-y-1">
        <Link
          href="/settings"
          onClick={() => setIsMobileMenuOpen(false)}
          className={`
            flex items-center gap-3 px-4 py-3 rounded-lg transition-all
            ${pathname === "/settings"
              ? "bg-mint-primary/10 border-l-3 border-mint-primary text-mint-primary"
              : "text-white/70 hover:bg-white/5 hover:text-white"
            }
          `}
        >
          <Settings size={20} />
          <span className="text-sm font-medium">Settings</span>
        </Link>

        <button
          onClick={() => {
            handleLogout();
            setIsMobileMenuOpen(false);
          }}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-white/70 hover:bg-white/5 hover:text-white transition-all"
        >
          <LogOut size={20} />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
    </>
  );
}
