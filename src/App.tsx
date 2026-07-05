/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { createClient, User } from "@supabase/supabase-js";
import {
  Cpu,
  Trash2,
  Download,
  Copy,
  Search,
  CheckCircle,
  AlertTriangle,
  Briefcase,
  Plus,
  ArrowLeft,
  Code,
  Command,
  Edit3,
  Menu,
} from "lucide-react";

import { Project } from "./types";
import {
  exportToMarkdown,
  INITIAL_SEEDED_PROJECTS,
} from "./data";

import Cursor from "./components/Cursor";
import MagneticButton from "./components/MagneticButton";
import SpotlightCard from "./components/SpotlightCard";
import { ThemeToggle } from "./components/ThemeToggle";
import { MobileDrawer } from "./components/MobileDrawer";

import { Landing } from "./pages/Landing";
import { Auth } from "./pages/Auth";
import { EditProject } from "./pages/EditProject";

// Initialize Supabase Client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "";
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export default function App() {
  // ─── Navigation ─────────────────────────────────────────────────────────────
  const [currentView, setCurrentView] = useState<
    "landing" | "login" | "dashboard" | "new" | "view" | "edit"
  >("landing");

  // ─── Auth State ─────────────────────────────────────────────────────────────
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [authMode, setAuthMode] = useState<"login" | "signup" | "forgot">("login");
  const [authLoading, setAuthLoading] = useState(false);
  const [authInitialized, setAuthInitialized] = useState(false);
  const authInFlight = React.useRef(false);

  // ─── Projects ────────────────────────────────────────────────────────────────
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);

  // ─── Edit Project ────────────────────────────────────────────────────────────
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);

  // ─── Creation Wizard ─────────────────────────────────────────────────────────
  const [wizardName, setWizardName] = useState("");
  const [wizardDesc, setWizardDesc] = useState("");
  const [wizardAudience, setWizardAudience] = useState("");
  const [generationLoading, setGenerationLoading] = useState(false);
  const [engineStep, setEngineStep] = useState(0);
  const [engineStatusLogs, setEngineStatusLogs] = useState<string[]>([]);
  const [compilationError, setCompilationError] = useState<string | null>(null);

  // ─── Dashboard ───────────────────────────────────────────────────────────────
  const [searchQuery, setSearchQuery] = useState("");
  const [activeViewerTab, setActiveViewerTab] = useState<
    "strategy" | "team" | "workflow" | "deliverables" | "gates" | "handoffs" | "risks"
  >("strategy");
  const [copiedHandoffId, setCopiedHandoffId] = useState<string | null>(null);
  const [copiedMarkdown, setCopiedMarkdown] = useState(false);
  const [copiedJson, setCopiedJson] = useState(false);

  // ─── System Status ───────────────────────────────────────────────────────────
  const [activeDatabase, setActiveDatabase] = useState<"supabase" | "local-file-fallback" | "offline">("offline");
  const [supabaseConfigured, setSupabaseConfigured] = useState(false);
  const [systemStatusOpen, setSystemStatusOpen] = useState(false);

  // ─── Mobile Drawer ───────────────────────────────────────────────────────────
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ─── AUTH STATE LISTENER ────────────────────────────────────────────────────
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        setCurrentUser(session.user);
        setSessionToken(session.access_token);
        setCurrentView("dashboard");
      }
      setAuthInitialized(true);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        setCurrentUser(session.user);
        setSessionToken(session.access_token);
        if (event === "SIGNED_IN") setCurrentView("dashboard");
      } else {
        setCurrentUser(null);
        setSessionToken(null);
        setCurrentView("landing");
      }
      setAuthInitialized(true);
    });

    return () => subscription.unsubscribe();
  }, []);



  // Cross-browser UUID helper — uses crypto.randomUUID() when available (fast path),
  // falls back to crypto.getRandomValues() for older mobile browsers (iOS <15.4, etc.).
  const generateUUID = (): string => {
    if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
      return crypto.randomUUID();
    }
    // RFC 4122 v4 fallback via getRandomValues
    return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, (c) => {
      const n = Number(c);
      return (n ^ (crypto.getRandomValues(new Uint8Array(1))[0] & (15 >> (n / 4)))).toString(16);
    });
  };

  const syncWithServer = async (token: string | null) => {
    setProjectsLoading(true);
    try {
      const headers: Record<string, string> = {};
      if (token) headers["Authorization"] = `Bearer ${token}`;
      const resp = await fetch("/api/projects", { headers });
      if (resp.ok) {
        const resData = await resp.json();
        if (resData.success && resData.projects) {
          const db = resData.database || "offline";
          setActiveDatabase(db as any);
          setSupabaseConfigured(db === "supabase");
          setProjects(resData.projects);
          return;
        }
      }
    } catch (e) {
      console.warn("Server connection failed.", e);
      setActiveDatabase("offline");
    } finally {
      setProjectsLoading(false);
    }
    setProjects([]);
  };

  useEffect(() => {
    if (!authInitialized) return;
    if (sessionToken && currentUser) {
      syncWithServer(sessionToken);
    } else if (currentUser === null) {
      setProjects([]);
    }
  }, [sessionToken, authInitialized, currentUser]);

  // ─── USER-FRIENDLY ERROR MAPPER ─────────────────────────────────────────────
  const mapAuthError = (raw: string): string => {
    const msg = raw.toLowerCase();
    if (msg.includes("invalid login credentials") || msg.includes("invalid email or password"))
      return "Incorrect email or password. Please try again.";
    if (msg.includes("email not confirmed"))
      return "Please confirm your email address before signing in. Check your inbox.";
    if (msg.includes("for security purposes") || msg.includes("rate limit") || msg.includes("too many requests") || msg.includes("after"))
      return "Too many attempts. Please wait a moment before trying again.";
    if (msg.includes("user already registered") || msg.includes("already been registered"))
      return "An account with this email already exists. Try signing in instead.";
    if (msg.includes("password should be") || msg.includes("password must be"))
      return "Password must be at least 6 characters long.";
    if (msg.includes("network") || msg.includes("failed to fetch"))
      return "Network error. Check your connection and try again.";
    return "An unexpected error occurred. Please try again.";
  };

  // ─── AUTH HANDLERS ──────────────────────────────────────────────────────────
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authInFlight.current) return;
    authInFlight.current = true;
    setAuthError(""); setAuthSuccess(""); setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithPassword({ email: authEmail.trim(), password: authPassword });
      if (error) throw error;
    } catch (err: unknown) {
      setAuthError(mapAuthError(err instanceof Error ? err.message : ""));
    } finally {
      setAuthLoading(false);
      authInFlight.current = false;
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authInFlight.current) return;
    authInFlight.current = true;
    setAuthError(""); setAuthSuccess(""); setAuthLoading(true);
    try {
      const { data, error } = await supabase.auth.signUp({ email: authEmail.trim(), password: authPassword });
      if (error) throw error;
      if (data.user && data.user.identities && data.user.identities.length === 0) {
        setAuthError("An account with this email already exists. Try signing in instead.");
        return;
      }
      setAuthSuccess("Account created! Check your inbox for a confirmation email, then sign in.");
      setAuthMode("login");
      setAuthPassword("");
    } catch (err: unknown) {
      setAuthError(mapAuthError(err instanceof Error ? err.message : ""));
    } finally {
      setAuthLoading(false);
      authInFlight.current = false;
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (authInFlight.current) return;
    authInFlight.current = true;
    setAuthError(""); setAuthSuccess(""); setAuthLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(authEmail.trim(), { redirectTo: `${window.location.origin}/` });
      if (error) throw error;
      setAuthSuccess("Password reset email sent! Check your inbox.");
    } catch (err: unknown) {
      setAuthError(mapAuthError(err instanceof Error ? err.message : ""));
    } finally {
      setAuthLoading(false);
      authInFlight.current = false;
    }
  };

  const handleLogout = async () => {
    setCurrentUser(null);
    setSessionToken(null);
    setProjects([]);
    setCurrentView("landing");
    await supabase.auth.signOut();
  };

  const handleGoogleSignIn = async () => {
    if (authInFlight.current) return;
    authInFlight.current = true;
    setAuthError(""); setAuthSuccess(""); setAuthLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin, queryParams: { prompt: "select_account" } },
      });
      if (error) throw error;
    } catch (err: unknown) {
      setAuthError(mapAuthError(err instanceof Error ? err.message : ""));
      setAuthLoading(false);
      authInFlight.current = false;
    }
  };

  const handleAuthSubmit = (e: React.FormEvent) => {
    if (authMode === "login") return handleLogin(e);
    if (authMode === "signup") return handleSignup(e);
    if (authMode === "forgot") return handleForgotPassword(e);
  };

  const switchAuthMode = (mode: "login" | "signup" | "forgot") => {
    setAuthMode(mode);
    setAuthError("");
    setAuthSuccess("");
  };

  // ─── GENERATION ─────────────────────────────────────────────────────────────
  const generationSteps = [
    { label: "Initializing OS Foundation...", duration: 2500 },
    { label: "Formulating architectural vision...", duration: 3000 },
    { label: "Assembling execution teams...", duration: 3000 },
    { label: "Mapping sprint workflows...", duration: 2500 },
    { label: "Synthesizing deep deliverables...", duration: 3200 },
    { label: "Structuring quality gates...", duration: 2400 },
    { label: "Compiling AI handoff prompts...", duration: 2200 },
    { label: "Calculating risk mitigations...", duration: 2000 },
    { label: "Finalizing boot sequence...", duration: 1500 },
  ];

  const handleTriggerGeneration = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wizardName.trim() || !wizardDesc.trim()) return;

    setGenerationLoading(true);
    setCompilationError(null);
    setEngineStep(0);
    setEngineStatusLogs(["Establishing root shell environment..."]);

    let currentLogIndex = 0;
    const logInterval = setInterval(() => {
      if (currentLogIndex < generationSteps.length - 1) {
        currentLogIndex++;
        setEngineStep(currentLogIndex);
        setEngineStatusLogs((prev) => [
          ...prev,
          `> ${generationSteps[currentLogIndex - 1].label} [OK]`,
          `> ${generationSteps[currentLogIndex].label}`,
        ]);
      }
    }, 2800);

    try {
      const response = await fetch("/api/projects/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: wizardName.trim(),
          description: wizardDesc.trim(),
          targetAudience: wizardAudience.trim() || "General builders, early adopters",
        }),
      });

      clearInterval(logInterval);

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData?.details || errData?.error || "Failed to parse API responses");
      }

      const rawResult = await response.json();
      if (rawResult.success && rawResult.project) {
        const newProject: Project = {
          ...rawResult.project,
          id: generateUUID(),
          status: "active",
          aiMetadata: rawResult.metadata
            ? { model: rawResult.metadata.model, provider: rawResult.metadata.provider, generationTime: rawResult.metadata.timestamp, durationMs: rawResult.metadata.durationMs }
            : { model: "studio-os-engine-v4", provider: "StudioOS", generationTime: new Date().toISOString(), durationMs: 0 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        if (currentUser) {
          try {
            const headers: Record<string, string> = { "Content-Type": "application/json" };
            if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;
            const res = await fetch("/api/projects", { method: "POST", headers, body: JSON.stringify({ project: newProject }) });
            if (!res.ok) throw new Error("Failed to save to Supabase");
            
            setProjects((prev) => [newProject, ...prev]);
            setSelectedProjectId(newProject.id);
            setWizardName("");
            setWizardDesc("");
            setWizardAudience("");
            setCurrentView("view");
            setActiveViewerTab("strategy");
          } catch (syncErr) {
            console.error("Failed to sync project to server", syncErr);
            throw new Error("Failed to save project to server.");
          }
        } else {
            setProjects((prev) => [newProject, ...prev]);
            setSelectedProjectId(newProject.id);
            setWizardName("");
            setWizardDesc("");
            setWizardAudience("");
            setCurrentView("view");
            setActiveViewerTab("strategy");
        }
      } else {
        throw new Error("Invalid project structure returned by the analysis engine.");
      }
    } catch (err: unknown) {
      clearInterval(logInterval);
      setCompilationError(err instanceof Error ? err.message : "Unexpected failure compiling OS.");
    } finally {
      setGenerationLoading(false);
    }
  };

  // ─── PROJECT ACTIONS ─────────────────────────────────────────────────────────
  const handleDeleteProject = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Purge this operating system?")) {
      if (currentUser) {
        try {
          const headers: Record<string, string> = {};
          if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;
          const res = await fetch(`/api/projects/${id}`, { method: "DELETE", headers });
          if (res.ok) {
            setProjects((prev) => prev.filter((p) => p.id !== id));
            if (selectedProjectId === id) setSelectedProjectId(null);
          } else {
            console.error("Failed to delete from server");
          }
        } catch (_) {}
      } else {
        setProjects((prev) => prev.filter((p) => p.id !== id));
        if (selectedProjectId === id) setSelectedProjectId(null);
      }
    }
  };

  const handleOpenEdit = (id: string) => {
    setEditingProjectId(id);
    setCurrentView("edit");
  };

  const handleSaveEditedProject = async (updatedProject: Project): Promise<void> => {
    const withTimestamp: Project = { ...updatedProject, updatedAt: new Date().toISOString() };

    if (currentUser) {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;
        const res = await fetch(`/api/projects/${withTimestamp.id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ project: withTimestamp }),
        });
        if (res.ok) {
          setProjects((prev) => prev.map((p) => (p.id === withTimestamp.id ? withTimestamp : p)));
          setSelectedProjectId(withTimestamp.id);
        } else {
          console.error("Failed to update on server");
        }
      } catch (syncErr) {
        console.error("Failed to sync updated project to server", syncErr);
      }
    } else {
      setProjects((prev) => prev.map((p) => (p.id === withTimestamp.id ? withTimestamp : p)));
      setSelectedProjectId(withTimestamp.id);
    }

    setCurrentView("view");
    setActiveViewerTab("strategy");
  };

  const handleCopyText = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHandoffId(id);
    setTimeout(() => setCopiedHandoffId(null), 2000);
  };

  const handleDownloadMarkdown = (project: Project) => {
    const md = exportToMarkdown(project);
    const blob = new Blob([md], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${project.name.toLowerCase().replace(/\s+/g, "-")}-os.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setCopiedMarkdown(true);
    setTimeout(() => setCopiedMarkdown(false), 2000);
  };

  const handleCopyJson = (project: Project) => {
    navigator.clipboard.writeText(JSON.stringify(project, null, 2));
    setCopiedJson(true);
    setTimeout(() => setCopiedJson(false), 2000);
  };

  const handleUseTemplate = async (template: Project) => {
    const newProject: Project = {
      ...template,
      id: generateUUID(),
      name: `${template.name} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    if (currentUser) {
      try {
        const headers: Record<string, string> = { "Content-Type": "application/json" };
        if (sessionToken) headers["Authorization"] = `Bearer ${sessionToken}`;
        const res = await fetch("/api/projects", { method: "POST", headers, body: JSON.stringify({ project: newProject }) });
        if (res.ok) {
          setProjects((prev) => [newProject, ...prev]);
          setSelectedProjectId(newProject.id);
        } else {
          console.error("Failed to duplicate on server");
        }
      } catch (syncErr) {
        console.error("Failed to sync project to server", syncErr);
      }
    } else {
      setProjects((prev) => [newProject, ...prev]);
      setSelectedProjectId(newProject.id);
    }
  };

  // ─── DERIVED STATE ────────────────────────────────────────────────────────────
  const allProjects = [...projects, ...INITIAL_SEEDED_PROJECTS];
  const selectedProject =
    projects.find((p) => p.id === selectedProjectId) ||
    INITIAL_SEEDED_PROJECTS.find((p) => p.id === selectedProjectId);
  const editingProject = projects.find((p) => p.id === editingProjectId);
  const isTemplate = INITIAL_SEEDED_PROJECTS.some((p) => p.id === selectedProjectId);

  const filteredProjects = projects.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredTemplates = INITIAL_SEEDED_PROJECTS.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // ─── ANIMATION VARIANTS ───────────────────────────────────────────────────────
  const pageTransition = {
    initial: { opacity: 0, y: 10, filter: "blur(4px)" },
    animate: { opacity: 1, y: 0, filter: "blur(0px)", transition: { type: "spring", damping: 25, stiffness: 200 } },
    exit: { opacity: 0, y: -10, filter: "blur(4px)", transition: { duration: 0.2 } },
  };

  const listContainer = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.05 } },
  };

  const listItem = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0, transition: { type: "spring", damping: 25, stiffness: 200 } },
  };

  // ─── RENDER ───────────────────────────────────────────────────────────────────
  return (
    <div
      className="min-h-screen font-sans selection:bg-white/20"
      style={{ backgroundColor: "var(--bg-base)", color: "var(--text-primary)" }}
    >
      <Cursor />

      {/* Mobile Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
        currentView={currentView}
        currentUser={currentUser}
        onNavigate={(view) => {
          if (view === "landing") setCurrentView("landing");
          else { setCurrentView(view); if (view === "dashboard") setSelectedProjectId(null); }
        }}
        onLogout={handleLogout}
      />

      {/* Header */}
      <header
        className="h-12 border-b sticky top-0 z-40 flex items-center px-4 md:px-6 justify-between"
        style={{ backgroundColor: "var(--header-bg)", borderColor: "var(--border-subtle)", backdropFilter: "blur(16px)", WebkitBackdropFilter: "blur(16px)" }}
      >
        <div className="flex items-center gap-3">
          {/* Mobile hamburger */}
          {currentUser && (
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-1.5 rounded-md transition-colors"
              style={{ color: "var(--text-tertiary)" }}
              aria-label="Open menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          )}

          {/* Logo */}
          <button
            onClick={() => setCurrentView(currentUser ? "dashboard" : "landing")}
            className="flex items-center gap-2 group focus:outline-none"
          >
            <div
              className="w-5 h-5 rounded-[4px] flex items-center justify-center font-bold text-[10px] transition-opacity group-hover:opacity-80"
              style={{ backgroundColor: "var(--text-primary)", color: "var(--bg-base)" }}
            >
              S
            </div>
            <span
              className="font-semibold text-sm tracking-tight"
              style={{ color: "var(--text-primary)" }}
            >
              StudioOS
            </span>
          </button>

          {/* Desktop nav */}
          {currentUser && (
            <nav className="hidden md:flex items-center gap-4 text-xs font-medium" style={{ color: "var(--text-tertiary)" }}>
              <button
                onClick={() => { setCurrentView("dashboard"); setSelectedProjectId(null); }}
                className="transition-colors hover:text-[var(--text-primary)]"
                style={{ color: currentView === "dashboard" ? "var(--text-primary)" : undefined }}
              >
                Projects
              </button>
            </nav>
          )}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />

          {currentUser ? (
            <div className="flex items-center gap-2">
              <div className="relative">
                <button
                  onClick={() => setSystemStatusOpen((v) => !v)}
                  className="hidden sm:flex items-center gap-1.5 px-2 h-6 rounded border text-[10px] font-mono transition-colors"
                  style={{ backgroundColor: "var(--bg-surface-hover)", borderColor: "var(--border-subtle)", color: "var(--text-tertiary)" }}
                >
                  <div className={`w-1.5 h-1.5 rounded-full ${activeDatabase === "supabase" ? "bg-emerald-500" : "bg-amber-500"}`} />
                  {activeDatabase === "supabase" ? "Operational" : "Degraded"}
                </button>
                <AnimatePresence>
                  {systemStatusOpen && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setSystemStatusOpen(false)} />
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        transition={{ duration: 0.15 }}
                        className="absolute right-0 top-full mt-2 w-64 rounded-xl border shadow-xl z-50 overflow-hidden"
                        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
                      >
                        <div className="p-3 border-b text-xs font-semibold" style={{ borderColor: "var(--border-subtle)", color: "var(--text-primary)" }}>
                          System Status
                        </div>
                        <div className="p-3 space-y-3">
                          <div className="flex items-center justify-between text-xs">
                            <span style={{ color: "var(--text-secondary)" }}>AI Services</span>
                            <span className="flex items-center gap-1 text-emerald-500"><CheckCircle className="w-3 h-3" /> Operational</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span style={{ color: "var(--text-secondary)" }}>Database</span>
                            <span className={`flex items-center gap-1 ${activeDatabase === "supabase" ? "text-emerald-500" : "text-amber-500"}`}>
                              <CheckCircle className="w-3 h-3" /> {activeDatabase === "supabase" ? "Connected" : "Local Sync"}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span style={{ color: "var(--text-secondary)" }}>Authentication</span>
                            <span className="flex items-center gap-1 text-emerald-500"><CheckCircle className="w-3 h-3" /> Active</span>
                          </div>
                          <div className="flex items-center justify-between text-xs">
                            <span style={{ color: "var(--text-secondary)" }}>Cloud Sync</span>
                            <span className="flex items-center gap-1 text-emerald-500"><CheckCircle className="w-3 h-3" /> Available</span>
                          </div>
                        </div>
                        <div className="p-2 border-t text-[10px] flex justify-between" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-surface-hover)", color: "var(--text-tertiary)" }}>
                          <span>Region: us-east-1</span>
                          <span>Latency: 24ms</span>
                        </div>
                      </motion.div>
                    </>
                  )}
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2 border-l pl-2" style={{ borderColor: "var(--border-subtle)" }}>
                <div
                  className="w-6 h-6 rounded-md flex items-center justify-center text-[9px] font-bold"
                  style={{ backgroundColor: "var(--bg-surface-active)", color: "var(--text-primary)" }}
                >
                  {currentUser.email?.slice(0, 2).toUpperCase()}
                </div>
                <button
                  onClick={handleLogout}
                  className="hidden sm:block text-xs transition-colors"
                  style={{ color: "var(--text-tertiary)" }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                  onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
                >
                  Log out
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentView("login")}
                className="text-xs font-medium transition-colors"
                style={{ color: "var(--text-secondary)" }}
              >
                Log in
              </button>
              <MagneticButton onClick={() => setCurrentView("login")} className="btn-primary">
                Get Started
              </MagneticButton>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-12">
        <AnimatePresence mode="wait">

          {/* LANDING */}
          {currentView === "landing" && (
            <Landing onGetStarted={() => setCurrentView("login")} pageTransition={pageTransition} />
          )}

          {/* AUTH */}
          {currentView === "login" && (
            <Auth
              authMode={authMode}
              authEmail={authEmail}
              setAuthEmail={setAuthEmail}
              authPassword={authPassword}
              setAuthPassword={setAuthPassword}
              authLoading={authLoading}
              authError={authError}
              authSuccess={authSuccess}
              handleAuthSubmit={handleAuthSubmit}
              handleGoogleSignIn={handleGoogleSignIn}
              switchAuthMode={switchAuthMode}
              pageTransition={pageTransition}
            />
          )}

          {/* DASHBOARD */}
          {currentView === "dashboard" && (
            <motion.div key="dashboard" variants={pageTransition} initial="initial" animate="animate" exit="exit" className="space-y-8">
              {/* Header row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight" style={{ color: "var(--text-primary)" }}>Projects</h1>
                  <p className="text-xs mt-1" style={{ color: "var(--text-tertiary)" }}>Manage and access your generated systems.</p>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5" style={{ color: "var(--text-tertiary)" }} />
                    <input
                      type="text"
                      placeholder="Search…"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="linear-input w-44 sm:w-52 pl-8"
                    />
                  </div>
                  <MagneticButton onClick={() => setCurrentView("new")} className="btn-primary whitespace-nowrap">
                    <Plus className="w-3.5 h-3.5" /> New Project
                  </MagneticButton>
                </div>
              </div>

              {/* Templates */}
              <div>
                <h2 className="text-base font-semibold tracking-tight mb-3" style={{ color: "var(--text-primary)" }}>StudioOS Templates</h2>
                {filteredTemplates.length > 0 ? (
                  <motion.div variants={listContainer} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTemplates.map((project) => (
                      <motion.div key={project.id} variants={listItem}>
                        <SpotlightCard
                          onClick={() => { setSelectedProjectId(project.id); setCurrentView("view"); setActiveViewerTab("strategy"); }}
                          className="h-44 p-5 flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="flex items-center gap-1.5 text-[10px] font-medium text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded border border-blue-400/20">
                                <Command className="w-3 h-3" /> System Template
                              </span>
                            </div>
                            <h3 className="text-sm font-semibold mb-1.5 line-clamp-1" style={{ color: "var(--text-primary)" }}>{project.name}</h3>
                            <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: "var(--text-tertiary)" }}>{project.description}</p>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-mono pt-3 mt-3 border-t" style={{ color: "var(--text-tertiary)", borderColor: "var(--border-subtle)" }}>
                            <span className="truncate pr-2">{project.targetAudience}</span>
                          </div>
                        </SpotlightCard>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <p className="text-xs" style={{ color: "var(--text-tertiary)" }}>No templates match your search.</p>
                )}
              </div>

              {/* My Projects */}
              <div>
                <h2 className="text-base font-semibold tracking-tight mb-3" style={{ color: "var(--text-primary)" }}>My Projects</h2>
                {projectsLoading ? (
                  /* Loading skeleton — shown while the initial Supabase fetch is in flight.
                     Prevents the "No Projects Yet" empty state from flashing before data arrives. */
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="h-44 rounded-xl border animate-pulse"
                        style={{ backgroundColor: "var(--bg-surface)", borderColor: "var(--border-subtle)" }}
                      />
                    ))}
                  </div>
                ) : filteredProjects.length > 0 ? (
                  <motion.div variants={listContainer} initial="hidden" animate="show" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredProjects.map((project) => (
                      <motion.div key={project.id} variants={listItem}>
                        <SpotlightCard
                          onClick={() => { setSelectedProjectId(project.id); setCurrentView("view"); setActiveViewerTab("strategy"); }}
                          className="h-44 p-5 flex flex-col justify-between group"
                        >
                          <div>
                            <div className="flex items-center justify-between mb-3">
                              <span className="flex items-center gap-1.5 text-[10px] font-medium text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20">
                                <div className="w-1 h-1 rounded-full bg-emerald-400 animate-pulse" /> Live
                              </span>
                              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleOpenEdit(project.id); }}
                                  className="p-1 rounded hover:bg-white/10 transition-colors"
                                  style={{ color: "var(--text-tertiary)" }}
                                  title="Edit project"
                                >
                                  <Edit3 className="w-3 h-3" />
                                </button>
                                <button
                                  onClick={(e) => handleDeleteProject(project.id, e)}
                                  className="p-1 rounded hover:bg-red-500/10 text-[var(--text-tertiary)] hover:text-red-400 transition-colors"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              </div>
                            </div>
                            <h3 className="text-sm font-semibold mb-1.5 line-clamp-1" style={{ color: "var(--text-primary)" }}>{project.name}</h3>
                            <p className="text-xs line-clamp-2 leading-relaxed" style={{ color: "var(--text-tertiary)" }}>{project.description}</p>
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-mono pt-3 mt-3 border-t" style={{ color: "var(--text-tertiary)", borderColor: "var(--border-subtle)" }}>
                            <span className="truncate pr-2">{project.targetAudience}</span>
                            <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                          </div>
                        </SpotlightCard>
                      </motion.div>
                    ))}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-20 text-center rounded-xl border border-dashed"
                    style={{ borderColor: "var(--border-moderate)" }}
                  >
                    <div className="w-10 h-10 rounded-lg border flex items-center justify-center mb-4" style={{ backgroundColor: "var(--bg-surface-hover)", borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
                      <Briefcase className="w-5 h-5" />
                    </div>
                    <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>No Projects Yet</h3>
                    <p className="text-xs max-w-sm mb-4" style={{ color: "var(--text-tertiary)" }}>
                      Generate your first OS from a prompt, or duplicate a template to get started.
                    </p>
                    <MagneticButton onClick={() => setCurrentView("new")} className="btn-secondary">
                      Create Project
                    </MagneticButton>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* NEW PROJECT WIZARD */}
          {currentView === "new" && (
            <motion.div key="new" variants={pageTransition} initial="initial" animate="animate" exit="exit" className="max-w-xl mx-auto">
              <button
                onClick={() => setCurrentView("dashboard")}
                className="flex items-center gap-1.5 text-xs mb-6 transition-colors"
                style={{ color: "var(--text-tertiary)" }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "var(--text-primary)")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-tertiary)")}
              >
                <ArrowLeft className="w-3.5 h-3.5" /> Back
              </button>

              <div className="linear-card p-6 md:p-8">
                {!generationLoading ? (
                  <>
                    <h2 className="text-lg font-semibold mb-1" style={{ color: "var(--text-primary)" }}>System Configuration</h2>
                    <p className="text-xs mb-6" style={{ color: "var(--text-tertiary)" }}>Define the core parameters of your application.</p>

                    <form onSubmit={handleTriggerGeneration} className="space-y-5">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium" style={{ color: "var(--text-primary)" }}>Project Name</label>
                        <input type="text" value={wizardName} onChange={(e) => setWizardName(e.target.value)} placeholder="e.g. Acme Billing Dashboard" required autoFocus className="linear-input w-full" />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium" style={{ color: "var(--text-primary)" }}>Architecture Description</label>
                        <textarea
                          rows={4}
                          value={wizardDesc}
                          onChange={(e) => setWizardDesc(e.target.value)}
                          placeholder="Detail the technical requirements and business logic..."
                          required
                          className="w-full p-2.5 rounded-lg text-xs resize-none focus:outline-none focus:ring-1 transition-all"
                          style={{ backgroundColor: "var(--bg-surface-hover)", border: "1px solid var(--border-subtle)", color: "var(--text-primary)" }}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-medium" style={{ color: "var(--text-primary)" }}>Target Persona</label>
                        <input type="text" value={wizardAudience} onChange={(e) => setWizardAudience(e.target.value)} placeholder="e.g. Enterprise DevOps Teams" className="linear-input w-full" />
                      </div>

                      {compilationError && (
                        <div className="p-3 rounded-md text-xs flex items-start gap-2" style={{ backgroundColor: "var(--error-bg)", border: "1px solid var(--error-border)", color: "var(--error-base)" }}>
                          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                          <span>{compilationError}</span>
                        </div>
                      )}

                      <div className="pt-2">
                        <MagneticButton type="submit" disabled={!wizardName.trim() || !wizardDesc.trim()} className="btn-primary w-full h-9">
                          <Cpu className="w-4 h-4" /> Compile OS Environment
                        </MagneticButton>
                      </div>
                    </form>
                  </>
                ) : (
                  <div className="py-12 flex flex-col items-center text-center">
                    <div className="relative w-12 h-12 mb-6">
                      <div className="absolute inset-0 rounded-md border" style={{ borderColor: "var(--border-moderate)" }} />
                      <div className="absolute inset-0 rounded-md border-t border-white/80 animate-spin" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Command className="w-4 h-4 animate-pulse" style={{ color: "var(--text-primary)" }} />
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>Compiling {wizardName}</h3>
                    <p className="text-xs mb-8 font-mono" style={{ color: "var(--text-tertiary)" }}>Initializing kernel modules...</p>

                    <div className="w-full h-1 rounded-full overflow-hidden mb-4" style={{ backgroundColor: "var(--bg-surface-active)" }}>
                      <motion.div
                        className="h-full"
                        style={{ backgroundColor: "var(--text-primary)" }}
                        initial={{ width: 0 }}
                        animate={{ width: `${((engineStep + 1) / generationSteps.length) * 100}%` }}
                        transition={{ ease: "linear", duration: 1 }}
                      />
                    </div>

                    <div className="w-full text-left rounded-md p-3 font-mono text-[10px] h-32 overflow-y-auto" style={{ backgroundColor: "var(--bg-base)", border: "1px solid var(--border-subtle)", color: "var(--text-secondary)" }}>
                      {engineStatusLogs.map((log, i) => (
                        <div key={i} className="mb-1" style={{ color: i === engineStatusLogs.length - 1 ? "var(--text-primary)" : "var(--text-tertiary)" }}>
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* PROJECT VIEWER */}
          {currentView === "view" && selectedProject && (
            <motion.div key="view" variants={pageTransition} initial="initial" animate="animate" exit="exit" className="space-y-6">
              {/* Viewer header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3 min-w-0">
                  <button
                    onClick={() => setCurrentView("dashboard")}
                    className="flex-shrink-0 p-1.5 rounded-md transition-colors"
                    style={{ color: "var(--text-secondary)" }}
                  >
                    <ArrowLeft className="w-4 h-4" />
                  </button>
                  <h1 className="text-xl font-semibold tracking-tight truncate" style={{ color: "var(--text-primary)" }}>{selectedProject.name}</h1>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {isTemplate && (
                    <MagneticButton onClick={() => handleUseTemplate(selectedProject)} className="btn-primary">
                      <Copy className="w-3.5 h-3.5" /> Use Template
                    </MagneticButton>
                  )}
                  {!isTemplate && (
                    <MagneticButton onClick={() => handleOpenEdit(selectedProject.id)} className="btn-secondary">
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </MagneticButton>
                  )}
                  <button onClick={() => handleCopyJson(selectedProject)} className="btn-ghost">
                    <Code className="w-3.5 h-3.5" /> {copiedJson ? "Copied" : "JSON"}
                  </button>
                  <MagneticButton onClick={() => handleDownloadMarkdown(selectedProject)} className="btn-secondary">
                    <Download className="w-3.5 h-3.5" /> Markdown
                  </MagneticButton>
                </div>
              </div>

              {/* Tabs */}
              <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pb-px border-b" style={{ borderColor: "var(--border-subtle)" }}>
                {[
                  { id: "strategy", label: "Strategy" },
                  { id: "team", label: "Team" },
                  { id: "workflow", label: "Workflows" },
                  { id: "deliverables", label: "Deliverables" },
                  { id: "gates", label: "Quality" },
                  { id: "handoffs", label: "AI Prompts" },
                  { id: "risks", label: "Risks" },
                ].map((tab) => {
                  const isActive = activeViewerTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveViewerTab(tab.id as typeof activeViewerTab)}
                      className="relative px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap focus:outline-none"
                      style={{ color: isActive ? "var(--text-primary)" : "var(--text-tertiary)" }}
                    >
                      {tab.label}
                      {isActive && (
                        <motion.div
                          layoutId="tab-indicator"
                          className="absolute bottom-0 left-0 right-0 h-0.5"
                          style={{ backgroundColor: "var(--text-primary)" }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Tab Content */}
              <div className="pt-2">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeViewerTab}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -5 }}
                    transition={{ duration: 0.15 }}
                    className="space-y-4"
                  >
                    {activeViewerTab === "strategy" && selectedProject.strategy && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="linear-card p-5 space-y-2">
                          <div className="text-[10px] font-mono" style={{ color: "var(--text-tertiary)" }}>VISION</div>
                          <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{selectedProject.strategy.vision}</p>
                        </div>
                        <div className="linear-card p-5 space-y-2">
                          <div className="text-[10px] font-mono" style={{ color: "var(--text-tertiary)" }}>MISSION</div>
                          <p className="text-sm leading-relaxed" style={{ color: "var(--text-primary)" }}>{selectedProject.strategy.mission}</p>
                        </div>
                        <div className="linear-card p-5 space-y-2 md:col-span-2">
                          <div className="text-[10px] font-mono" style={{ color: "var(--text-tertiary)" }}>VALUE PROPOSITION</div>
                          <p className="text-sm font-medium" style={{ color: "var(--text-primary)" }}>{selectedProject.strategy.uniqueValueProp}</p>
                        </div>
                        <div className="md:col-span-2">
                          <div className="text-xs font-semibold mb-3 mt-2" style={{ color: "var(--text-primary)" }}>Strategic Pillars</div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                            {selectedProject.strategy.strategicPillars.map((p, idx) => (
                              <div key={idx} className="p-4 rounded-lg border" style={{ backgroundColor: "var(--bg-surface-hover)", borderColor: "var(--border-subtle)" }}>
                                <h4 className="text-xs font-semibold mb-1.5" style={{ color: "var(--text-primary)" }}>{p.title}</h4>
                                <p className="text-xs leading-relaxed" style={{ color: "var(--text-tertiary)" }}>{p.explanation}</p>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {activeViewerTab === "team" && selectedProject.team && (
                      <div className="space-y-4">
                        <div className="linear-card p-5 flex flex-col sm:flex-row justify-between gap-3">
                          <div>
                            <div className="text-[10px] font-mono mb-1" style={{ color: "var(--text-tertiary)" }}>TEAM MONIKER</div>
                            <h3 className="text-lg font-semibold" style={{ color: "var(--text-primary)" }}>{selectedProject.team.teamName}</h3>
                          </div>
                          <div className="sm:text-right sm:max-w-xs">
                            <div className="text-[10px] font-mono mb-1" style={{ color: "var(--text-tertiary)" }}>PROTOCOL</div>
                            <p className="text-xs" style={{ color: "var(--text-primary)" }}>{selectedProject.team.workflowRule}</p>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {selectedProject.team.roles.map((role) => (
                            <div key={role.id} className="linear-card p-5">
                              <div className="flex justify-between items-start mb-2">
                                <h4 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{role.title}</h4>
                                <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: "var(--bg-surface-active)", color: "var(--text-primary)" }}>×{role.count}</span>
                              </div>
                              <p className="text-xs italic mb-4" style={{ color: "var(--text-secondary)" }}>"{role.vibe}"</p>
                              <div className="flex flex-wrap gap-1">
                                {role.tools.map((t, i) => (
                                  <span key={i} className="text-[9px] px-1.5 py-0.5 rounded border" style={{ backgroundColor: "var(--bg-surface-hover)", borderColor: "var(--border-subtle)", color: "var(--text-tertiary)" }}>{t}</span>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {activeViewerTab === "workflow" && selectedProject.workflow && (
                      <div className="space-y-3">
                        {selectedProject.workflow.map((phase, idx) => (
                          <div key={phase.id} className="linear-card p-5 flex gap-4">
                            <div className="w-6 h-6 rounded border flex-shrink-0 flex items-center justify-center text-xs font-mono" style={{ borderColor: "var(--border-subtle)", backgroundColor: "var(--bg-surface-hover)", color: "var(--text-secondary)" }}>{idx + 1}</div>
                            <div className="flex-1 space-y-2 min-w-0">
                              <div className="flex justify-between gap-2">
                                <h4 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{phase.phaseName}</h4>
                                <span className="text-[10px] flex-shrink-0" style={{ color: "var(--text-tertiary)" }}>{phase.timelineEstimate}</span>
                              </div>
                              <p className="text-xs leading-relaxed" style={{ color: "var(--text-secondary)" }}>{phase.description}</p>
                              <div className="p-3 rounded text-xs mt-2 border" style={{ backgroundColor: "var(--bg-surface-hover)", borderColor: "var(--border-subtle)" }}>
                                <span className="font-medium" style={{ color: "var(--text-primary)" }}>Output: </span>
                                <span style={{ color: "var(--text-tertiary)" }}>{phase.output}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeViewerTab === "deliverables" && selectedProject.deliverables && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {selectedProject.deliverables.map((del) => (
                          <div key={del.id} className="linear-card p-4">
                            <h4 className="text-sm font-semibold mb-1" style={{ color: "var(--text-primary)" }}>{del.name}</h4>
                            <p className="text-xs mb-3 line-clamp-2" style={{ color: "var(--text-tertiary)" }}>{del.description}</p>
                            <span className="text-[10px] border px-1.5 py-0.5 rounded" style={{ borderColor: "var(--border-subtle)", color: "var(--text-tertiary)" }}>{del.category}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeViewerTab === "handoffs" && selectedProject.aiHandoffs && (
                      <div className="space-y-4">
                        {selectedProject.aiHandoffs.map((handoff) => (
                          <div key={handoff.id} className="linear-card p-5">
                            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-3">
                              <h4 className="text-sm font-semibold" style={{ color: "var(--text-primary)" }}>{handoff.taskName}</h4>
                              <MagneticButton onClick={() => handleCopyText(handoff.promptTemplate, handoff.id)} className="btn-secondary h-7 text-xs flex-shrink-0">
                                <Copy className="w-3 h-3" /> {copiedHandoffId === handoff.id ? "Copied" : "Copy Prompt"}
                              </MagneticButton>
                            </div>
                            <div className="p-4 rounded border font-mono text-[11px] whitespace-pre-wrap max-h-40 overflow-y-auto" style={{ backgroundColor: "var(--bg-base)", borderColor: "var(--border-subtle)", color: "var(--text-secondary)" }}>
                              {handoff.promptTemplate}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeViewerTab === "gates" && selectedProject.qualityGates && (
                      <div className="grid grid-cols-1 gap-3">
                        {selectedProject.qualityGates.map((gate) => (
                          <div key={gate.id} className="linear-card p-4">
                            <h4 className="text-sm font-semibold mb-3" style={{ color: "var(--text-primary)" }}>Gate: {gate.phase}</h4>
                            <ul className="space-y-1">
                              {gate.criteria.map((c, i) => (
                                <li key={i} className="text-xs flex gap-2" style={{ color: "var(--text-secondary)" }}>
                                  <CheckCircle className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: "var(--text-tertiary)" }} /> {c}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeViewerTab === "risks" && selectedProject.risks && (
                      <div className="grid grid-cols-1 gap-3">
                        {selectedProject.risks.map((risk) => (
                          <div key={risk.id} className="linear-card p-4 flex gap-4">
                            <div className="w-1.5 rounded-full flex-shrink-0" style={{ backgroundColor: "var(--border-moderate)" }} />
                            <div className="min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <h4 className="text-sm font-semibold capitalize" style={{ color: "var(--text-primary)" }}>{risk.category}</h4>
                                <span className="text-[10px] font-medium" style={{ color: risk.impact === "High" ? "#f87171" : risk.impact === "Medium" ? "#fbbf24" : "#34d399" }}>{risk.impact} Impact</span>
                              </div>
                              <p className="text-xs mb-2" style={{ color: "var(--text-secondary)" }}>{risk.description}</p>
                              <div className="text-[10px] p-2 rounded border" style={{ backgroundColor: "var(--bg-surface-hover)", borderColor: "var(--border-subtle)" }}>
                                <span className="font-semibold" style={{ color: "var(--text-primary)" }}>Mitigation:</span>{" "}
                                <span style={{ color: "var(--text-tertiary)" }}>{risk.mitigation}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </motion.div>
                </AnimatePresence>
              </div>
            </motion.div>
          )}

          {/* EDIT PROJECT */}
          {currentView === "edit" && editingProject && (
            <EditProject
              key={`edit-${editingProject.id}`}
              project={editingProject}
              pageTransition={pageTransition}
              onSave={handleSaveEditedProject}
              onCancel={() => { setCurrentView("view"); }}
            />
          )}

        </AnimatePresence>
      </main>


    </div>
  );
}
