import React, { useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Briefcase, Plus, LogOut } from "lucide-react";

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  currentView: string;
  currentUser: { email?: string | null } | null;
  onNavigate: (view: "dashboard" | "new" | "landing") => void;
  onLogout: () => void;
}

export const MobileDrawer = ({
  isOpen,
  onClose,
  currentView,
  currentUser,
  onNavigate,
  onLogout,
}: MobileDrawerProps) => {
  // Lock body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  const navItem = (label: string, view: "dashboard" | "new", icon: React.ReactNode) => (
    <button
      onClick={() => { onNavigate(view); onClose(); }}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
        currentView === view
          ? "bg-[var(--bg-surface-active)] text-[var(--text-primary)]"
          : "text-[var(--text-secondary)] hover:bg-[var(--bg-surface-hover)] hover:text-[var(--text-primary)]"
      }`}
    >
      <span className="text-[var(--text-tertiary)]">{icon}</span>
      {label}
    </button>
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="drawer-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Drawer Panel */}
          <motion.div
            key="drawer-panel"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed left-0 top-0 bottom-0 z-50 w-72 flex flex-col border-r border-[var(--border-subtle)]"
            style={{ backgroundColor: "var(--bg-surface)" }}
            role="dialog"
            aria-modal="true"
            aria-label="Navigation menu"
          >
            {/* Header */}
            <div className="h-14 flex items-center justify-between px-4 border-b border-[var(--border-subtle)]">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 bg-[var(--text-primary)] rounded-[4px] flex items-center justify-center font-bold text-[10px]" style={{ color: "var(--bg-base)" }}>
                  S
                </div>
                <span className="font-semibold text-sm tracking-tight text-[var(--text-primary)]">StudioOS</span>
              </div>
              <button
                onClick={onClose}
                className="w-7 h-7 rounded-md flex items-center justify-center text-[var(--text-tertiary)] hover:text-[var(--text-primary)] hover:bg-[var(--bg-surface-hover)] transition-colors"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Nav Items */}
            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {currentUser && (
                <>
                  {navItem("Projects", "dashboard", <Briefcase className="w-4 h-4" />)}
                  {navItem("New Project", "new", <Plus className="w-4 h-4" />)}
                </>
              )}
            </nav>

            {/* Footer */}
            {currentUser && (
              <div className="p-3 border-t border-[var(--border-subtle)]">
                <div className="flex items-center gap-3 px-3 py-2 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center text-[10px] font-bold flex-shrink-0" style={{ backgroundColor: "var(--bg-surface-active)", color: "var(--text-primary)" }}>
                    {currentUser.email?.slice(0, 2).toUpperCase()}
                  </div>
                  <span className="text-xs text-[var(--text-secondary)] truncate flex-1">{currentUser.email}</span>
                </div>
                <button
                  onClick={() => { onLogout(); onClose(); }}
                  className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm text-[var(--text-secondary)] hover:text-red-400 hover:bg-red-500/5 transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign out
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
