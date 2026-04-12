import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { Menu, X, LogOut, User, BarChart3, PlusCircle } from "lucide-react";

export default function Navbar() {
  const { user, logout, isInstructor, isCoordinator } = useAuth();
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="container mx-auto flex h-14 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight group">
          <img
            src="/fossee-logo.png"
            alt="FOSSEE Logo"
            className="h-[72px] w-[72px] sm:h-20 sm:w-20 object-contain drop-shadow-sm transition-transform duration-200 group-hover:scale-105"
          />
          <span className="hidden sm:inline">FOSSEE Workshops</span>
          <span className="sm:hidden">FOSSEE</span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden md:flex items-center gap-1">
          {user ? (
            <>
              <Link to="/" className="px-3 py-2 text-sm hover:bg-accent transition-colors">Dashboard</Link>
              <Link to="/workshops/types" className="px-3 py-2 text-sm hover:bg-accent transition-colors">Workshop Types</Link>
              {isCoordinator && <Link to="/workshops/propose" className="px-3 py-2 text-sm hover:bg-accent transition-colors">Propose</Link>}
              <Link to="/statistics" className="px-3 py-2 text-sm hover:bg-accent transition-colors">Statistics</Link>
              <Link to="/profile" className="px-3 py-2 text-sm hover:bg-accent transition-colors">Profile</Link>
              <div className="ml-2 flex items-center gap-2">
                <ThemeToggle />
                <button onClick={handleLogout} className="inline-flex items-center gap-1 px-3 py-2 text-sm border border-input hover:bg-accent cursor-pointer">
                  <LogOut className="h-3.5 w-3.5" /> Logout
                </button>
              </div>
            </>
          ) : (
            <>
              <Link to="/statistics" className="px-3 py-2 text-sm hover:bg-accent transition-colors">Statistics</Link>
              <ThemeToggle />
              <Link to="/login" className="ml-2 px-4 py-2 text-sm bg-primary text-primary-foreground hover:bg-primary/80 transition-colors">Sign In</Link>
              <Link to="/register" className="px-4 py-2 text-sm border border-input hover:bg-accent transition-colors">Register</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setOpen(!open)} className="h-9 w-9 inline-flex items-center justify-center border border-input cursor-pointer">
            {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-border bg-background animate-slide-down">
          <div className="flex flex-col p-4 gap-1">
            {user ? (
              <>
                <Link to="/" onClick={() => setOpen(false)} className="px-3 py-2 text-sm hover:bg-accent">Dashboard</Link>
                <Link to="/workshops/types" onClick={() => setOpen(false)} className="px-3 py-2 text-sm hover:bg-accent">Workshop Types</Link>
                {isCoordinator && <Link to="/workshops/propose" onClick={() => setOpen(false)} className="px-3 py-2 text-sm hover:bg-accent">Propose Workshop</Link>}
                <Link to="/statistics" onClick={() => setOpen(false)} className="px-3 py-2 text-sm hover:bg-accent">Statistics</Link>
                <Link to="/profile" onClick={() => setOpen(false)} className="px-3 py-2 text-sm hover:bg-accent">Profile</Link>
                <button onClick={() => { setOpen(false); handleLogout(); }} className="px-3 py-2 text-sm text-left hover:bg-accent cursor-pointer flex items-center gap-2">
                  <LogOut className="h-3.5 w-3.5" /> Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/statistics" onClick={() => setOpen(false)} className="px-3 py-2 text-sm hover:bg-accent">Statistics</Link>
                <Link to="/login" onClick={() => setOpen(false)} className="px-3 py-2 text-sm hover:bg-accent">Sign In</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="px-3 py-2 text-sm hover:bg-accent">Register</Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}