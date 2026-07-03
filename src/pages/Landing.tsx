import React from "react";
import { motion } from "motion/react";
import { Sparkles, ArrowRight, Command, LayoutGrid, Terminal } from "lucide-react";
import { Button } from "../components/ui/Button";

interface LandingProps {
  onGetStarted: () => void;
  pageTransition: any;
}

export const Landing = ({ onGetStarted, pageTransition }: LandingProps) => {
  return (
    <motion.div 
      key="landing" 
      variants={pageTransition} 
      initial="initial" 
      animate="animate" 
      exit="exit" 
      className="flex flex-col items-center text-center max-w-5xl mx-auto pt-20 pb-32 px-4 relative"
    >
      {/* Background Orbs */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-indigo-500/10 blur-[100px] rounded-[100%] pointer-events-none" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[300px] h-[300px] bg-white/5 blur-[80px] rounded-[100%] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 10 }} 
        animate={{ opacity: 1, scale: 1, y: 0 }} 
        transition={{ delay: 0.1, type: "spring", stiffness: 300, damping: 25 }} 
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.02] text-xs font-medium mb-10 backdrop-blur-xl shadow-2xl relative z-10"
      >
        <Sparkles className="w-3.5 h-3.5 text-indigo-400 drop-shadow-md" />
        <span className="text-white/90 tracking-wide uppercase text-[10px]">StudioOS Engine v4.0</span>
      </motion.div>

      <motion.h1 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="text-6xl md:text-8xl font-bold tracking-tighter text-white mb-6 leading-[1.05] relative z-10"
      >
        Compile your <br className="hidden md:block" />
        <span className="text-transparent bg-clip-text bg-gradient-to-b from-white via-white/90 to-white/30">Product OS.</span>
      </motion.h1>

      <motion.p 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="text-lg md:text-xl text-[#A1A1AA] max-w-2xl mx-auto mb-12 leading-relaxed font-light relative z-10"
      >
        StudioOS is an operating system for builders. Generate precise engineering strategies, team structures, and executable workflow protocols from a single prompt.
      </motion.p>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full max-w-md relative z-10"
      >
        <Button onClick={onGetStarted} size="lg" className="w-full sm:w-auto h-12 px-8 text-sm group">
          Start Building 
          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
        </Button>
        <Button variant="secondary" size="lg" className="w-full sm:w-auto h-12 px-8 text-sm">
          View Documentation
        </Button>
      </motion.div>

      {/* Minimalist Feature Grid */}
      <motion.div 
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left w-full mt-32 relative z-10"
      >
        {[
          { icon: Command, title: "Architecture", desc: "Generates long-term vision and tactical engineering pillars." },
          { icon: LayoutGrid, title: "Workflow", desc: "Compiles sprint schemas and quality gate invariants." },
          { icon: Terminal, title: "Execution", desc: "Exports copy-pasteable AI handoff prompt templates." }
        ].map((ft, i) => (
          <motion.div 
            key={i} 
            whileHover={{ y: -6, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="glass-card rounded-2xl p-8 transition-all group"
          >
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 flex items-center justify-center mb-6 border border-indigo-500/20 group-hover:border-indigo-500/40 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.2)] transition-all">
              <ft.icon className="w-6 h-6 text-indigo-400" />
            </div>
            <h3 className="text-base font-semibold text-white mb-3 tracking-tight">{ft.title}</h3>
            <p className="text-sm text-[#A1A1AA] leading-relaxed font-light">{ft.desc}</p>
          </motion.div>
        ))}
      </motion.div>
    </motion.div>
  );
};
