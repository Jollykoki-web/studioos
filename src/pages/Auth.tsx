import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { CheckCircle, RefreshCw, Command, Star, Zap, Code } from "lucide-react";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";

interface AuthProps {
  authMode: "login" | "signup" | "forgot";
  authEmail: string;
  setAuthEmail: (val: string) => void;
  authPassword: string;
  setAuthPassword: (val: string) => void;
  authLoading: boolean;
  authError: string;
  authSuccess: string;
  handleAuthSubmit: (e: React.FormEvent) => void;
  handleGoogleSignIn: () => void;
  switchAuthMode: (mode: "login" | "signup" | "forgot") => void;
  pageTransition: any;
}

export const Auth = ({
  authMode,
  authEmail,
  setAuthEmail,
  authPassword,
  setAuthPassword,
  authLoading,
  authError,
  authSuccess,
  handleAuthSubmit,
  handleGoogleSignIn,
  switchAuthMode,
  pageTransition,
}: AuthProps) => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <motion.div
      key="auth"
      variants={pageTransition}
      initial="initial"
      animate="animate"
      exit="exit"
      className="flex min-h-[calc(100vh-6rem)] -mt-4 -mb-12 md:mb-0 w-full rounded-2xl overflow-hidden border"
      style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-surface)" }}
    >
      {/* ── LEFT: MARKETING PRESENTATION ─────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden flex-col justify-between p-12 bg-black text-white">
        {/* Dynamic Aurora/Gradient Background */}
        <div 
          className="absolute inset-0 opacity-40 transition-transform duration-1000 ease-out"
          style={{
            background: `radial-gradient(circle at ${mousePosition.x / 5}px ${mousePosition.y / 5}px, rgba(99, 102, 241, 0.4) 0%, transparent 50%),
                         radial-gradient(circle at ${800 - mousePosition.x / 3}px ${600 - mousePosition.y / 3}px, rgba(16, 185, 129, 0.2) 0%, transparent 40%)`,
          }}
        />
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 mix-blend-overlay"></div>
        
        {/* Animated Particles */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={i}
            animate={{
              y: ["0%", "-100%", "0%"],
              opacity: [0.1, 0.5, 0.1],
            }}
            transition={{
              duration: Math.random() * 5 + 5,
              repeat: Infinity,
              ease: "linear",
            }}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 6 + 2 + "px",
              height: Math.random() * 6 + 2 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              backgroundColor: i % 2 === 0 ? "rgba(99,102,241,0.8)" : "rgba(16,185,129,0.8)",
              boxShadow: "0 0 10px rgba(255,255,255,0.2)",
            }}
          />
        ))}

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-white text-black flex items-center justify-center font-bold text-sm">
            S
          </div>
          <span className="font-semibold text-lg tracking-tight">StudioOS</span>
        </div>

        <div className="relative z-10 max-w-md space-y-6">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/10 backdrop-blur-md text-xs font-medium"
          >
            <Star className="w-3.5 h-3.5 text-amber-400" /> Premium AI Operating System
          </motion.div>

          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="text-5xl font-semibold tracking-tighter leading-[1.1]"
          >
            Build products with an AI team.
          </motion.h1>

          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg text-zinc-400 leading-relaxed font-light"
          >
            From idea to execution. Generate precise engineering strategies, dynamic team structures, and executable workflow protocols in seconds.
          </motion.p>
        </div>

        <div className="relative z-10 flex items-center gap-6 text-sm text-zinc-500 font-medium">
          <div className="flex items-center gap-2"><Zap className="w-4 h-4 text-indigo-400" /> Lightning Fast</div>
          <div className="flex items-center gap-2"><Command className="w-4 h-4 text-emerald-400" /> AI Native</div>
          <div className="flex items-center gap-2"><Code className="w-4 h-4 text-sky-400" /> Production Ready</div>
        </div>
      </div>

      {/* ── RIGHT: AUTH FORM ─────────────────────── */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 sm:p-12 relative" style={{ backgroundColor: "var(--bg-base)" }}>
        
        <div className="w-full max-w-[380px] relative z-10">
          <div className="lg:hidden w-10 h-10 rounded-xl flex items-center justify-center font-bold text-lg mb-8 shadow-sm border" style={{ backgroundColor: "var(--text-primary)", color: "var(--bg-base)", borderColor: "var(--border-subtle)" }}>
            S
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {/* ── FORGOT PASSWORD ─────────────────────── */}
            {authMode === "forgot" && (
              <motion.div 
                key="forgot" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <h2 className="text-2xl font-semibold mb-2 tracking-tight" style={{ color: "var(--text-primary)" }}>Reset password</h2>
                <p className="text-sm mb-8 font-light" style={{ color: "var(--text-tertiary)" }}>Enter your email and we'll send a reset link.</p>
                
                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <Input 
                    type="email" 
                    required 
                    label="Email Address"
                    value={authEmail} 
                    onChange={e => setAuthEmail(e.target.value)} 
                    disabled={authLoading} 
                    placeholder="you@domain.com" 
                    autoComplete="email" 
                  />
                  
                  {authError && (
                    <div role="alert" className="text-xs p-3 border rounded-lg" style={{ backgroundColor: "var(--error-bg)", borderColor: "var(--error-border)", color: "var(--error-base)" }}>
                      {authError}
                    </div>
                  )}
                  {authSuccess && (
                    <div role="status" className="text-xs p-3 border rounded-lg flex items-center gap-2" style={{ backgroundColor: "var(--success-bg)", borderColor: "var(--success-border)", color: "var(--success-base)" }}>
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      {authSuccess}
                    </div>
                  )}
                  
                  <div className="pt-4">
                    <Button type="submit" loading={authLoading} className="w-full shadow-sm">
                      {authLoading ? "Sending..." : "Send Reset Link"}
                    </Button>
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={() => switchAuthMode("login")} 
                    disabled={authLoading} 
                    className="text-xs w-full text-center mt-6 transition-colors disabled:opacity-50 font-medium"
                    style={{ color: "var(--text-tertiary)" }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-tertiary)"}
                  >
                    &larr; Back to sign in
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── SIGN IN ─────────────────────────────── */}
            {authMode === "login" && (
              <motion.div 
                key="login-form" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <h2 className="text-2xl font-semibold mb-2 tracking-tight" style={{ color: "var(--text-primary)" }}>Sign in</h2>
                <p className="text-sm mb-8 font-light" style={{ color: "var(--text-tertiary)" }}>Enter the operating system.</p>

                {/* ── Google Sign-In Button ── */}
                <button
                  id="google-signin-btn"
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="w-full h-11 mb-6 flex items-center justify-center gap-3 rounded-xl border transition-all shadow-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed group"
                  style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                >
                  {authLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" style={{ color: "var(--text-tertiary)" }} />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="group-hover:scale-110 transition-transform">
                      <path fill="#4285F4" d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
                      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
                      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/>
                      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"/>
                    </svg>
                  )}
                  <span>Continue with Google</span>
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-[1px]" style={{ backgroundColor: "var(--border-subtle)" }} />
                  <span className="text-[10px] font-medium tracking-wider uppercase" style={{ color: "var(--text-tertiary)" }}>or continue with email</span>
                  <div className="flex-1 h-[1px]" style={{ backgroundColor: "var(--border-subtle)" }} />
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <Input 
                    type="email" 
                    required 
                    label="Email Address"
                    value={authEmail} 
                    onChange={e => setAuthEmail(e.target.value)} 
                    disabled={authLoading} 
                    placeholder="you@domain.com" 
                    autoComplete="email" 
                  />
                  
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>Password</label>
                      <button 
                        type="button" 
                        onClick={() => switchAuthMode("forgot")} 
                        disabled={authLoading} 
                        className="text-[10px] font-medium transition-colors disabled:opacity-50"
                        style={{ color: "var(--text-tertiary)" }}
                        onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                        onMouseLeave={e => e.currentTarget.style.color = "var(--text-tertiary)"}
                      >
                        Forgot password?
                      </button>
                    </div>
                    <Input 
                      type="password" 
                      required 
                      value={authPassword} 
                      onChange={e => setAuthPassword(e.target.value)} 
                      disabled={authLoading} 
                      placeholder="••••••••" 
                      autoComplete="current-password" 
                    />
                  </div>

                  {authError && (
                    <div role="alert" className="text-xs p-3 border rounded-lg" style={{ backgroundColor: "var(--error-bg)", borderColor: "var(--error-border)", color: "var(--error-base)" }}>
                      {authError}
                    </div>
                  )}
                  {authSuccess && (
                    <div role="status" className="text-xs p-3 border rounded-lg flex items-center gap-2" style={{ backgroundColor: "var(--success-bg)", borderColor: "var(--success-border)", color: "var(--success-base)" }}>
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      {authSuccess}
                    </div>
                  )}

                  <div className="pt-4">
                    <Button type="submit" loading={authLoading} className="w-full shadow-sm">
                      {authLoading ? "Signing in..." : "Sign In"}
                    </Button>
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={() => switchAuthMode("signup")} 
                    disabled={authLoading} 
                    className="text-xs w-full text-center mt-6 transition-colors disabled:opacity-50 font-medium"
                    style={{ color: "var(--text-tertiary)" }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-tertiary)"}
                  >
                    Don't have an account? Sign up
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── SIGN UP ─────────────────────────────── */}
            {authMode === "signup" && (
              <motion.div 
                key="signup-form" 
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, x: -20 }} 
                transition={{ duration: 0.2, ease: "easeOut" }}
              >
                <h2 className="text-2xl font-semibold mb-2 tracking-tight" style={{ color: "var(--text-primary)" }}>Create account</h2>
                <p className="text-sm mb-8 font-light" style={{ color: "var(--text-tertiary)" }}>Join the operating system.</p>

                {/* ── Google Sign-Up Button ── */}
                <button
                  id="google-signup-btn"
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={authLoading}
                  className="w-full h-11 mb-6 flex items-center justify-center gap-3 rounded-xl border transition-all shadow-sm text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed group"
                  style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}
                >
                  {authLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" style={{ color: "var(--text-tertiary)" }} />
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true" className="group-hover:scale-110 transition-transform">
                      <path fill="#4285F4" d="M17.64 9.205c0-.639-.057-1.252-.164-1.841H9v3.481h4.844a4.14 4.14 0 0 1-1.796 2.716v2.259h2.908c1.702-1.567 2.684-3.875 2.684-6.615Z"/>
                      <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18Z"/>
                      <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332Z"/>
                      <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58Z"/>
                    </svg>
                  )}
                  <span>Sign up with Google</span>
                </button>

                <div className="flex items-center gap-3 mb-6">
                  <div className="flex-1 h-[1px]" style={{ backgroundColor: "var(--border-subtle)" }} />
                  <span className="text-[10px] font-medium tracking-wider uppercase" style={{ color: "var(--text-tertiary)" }}>or continue with email</span>
                  <div className="flex-1 h-[1px]" style={{ backgroundColor: "var(--border-subtle)" }} />
                </div>

                <form onSubmit={handleAuthSubmit} className="space-y-4">
                  <Input 
                    type="email" 
                    required 
                    label="Email Address"
                    value={authEmail} 
                    onChange={e => setAuthEmail(e.target.value)} 
                    disabled={authLoading} 
                    placeholder="you@domain.com" 
                    autoComplete="email" 
                  />
                  
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium tracking-tight" style={{ color: "var(--text-primary)" }}>
                      Password <span className="font-light" style={{ color: "var(--text-tertiary)" }}>(min. 6 chars)</span>
                    </label>
                    <Input 
                      type="password" 
                      required 
                      minLength={6} 
                      value={authPassword} 
                      onChange={e => setAuthPassword(e.target.value)} 
                      disabled={authLoading} 
                      placeholder="••••••••" 
                      autoComplete="new-password" 
                    />
                  </div>

                  {authError && (
                    <div role="alert" className="text-xs p-3 border rounded-lg" style={{ backgroundColor: "var(--error-bg)", borderColor: "var(--error-border)", color: "var(--error-base)" }}>
                      {authError}
                    </div>
                  )}
                  {authSuccess && (
                    <div role="status" className="text-xs p-3 border rounded-lg flex items-center gap-2" style={{ backgroundColor: "var(--success-bg)", borderColor: "var(--success-border)", color: "var(--success-base)" }}>
                      <CheckCircle className="w-4 h-4 shrink-0" />
                      {authSuccess}
                    </div>
                  )}

                  <div className="pt-4">
                    <Button type="submit" loading={authLoading} className="w-full shadow-sm">
                      {authLoading ? "Creating account..." : "Create Account"}
                    </Button>
                  </div>
                  
                  <button 
                    type="button" 
                    onClick={() => switchAuthMode("login")} 
                    disabled={authLoading} 
                    className="text-xs w-full text-center mt-6 transition-colors disabled:opacity-50 font-medium"
                    style={{ color: "var(--text-tertiary)" }}
                    onMouseEnter={e => e.currentTarget.style.color = "var(--text-primary)"}
                    onMouseLeave={e => e.currentTarget.style.color = "var(--text-tertiary)"}
                  >
                    Already have an account? Sign in
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};
