import React from "react";
import { motion, HTMLMotionProps } from "motion/react";

interface CardProps extends HTMLMotionProps<"div"> {
  hoverable?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className = "", hoverable = false, children, ...props }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={`
          rounded-2xl border border-white/[0.08] bg-[#0A0A0A]/60 overflow-hidden backdrop-blur-xl shadow-lg
          ${hoverable ? "hover:border-white/[0.15] hover:bg-[#0A0A0A]/80 transition-all cursor-pointer group" : ""}
          ${className}
        `}
        whileHover={hoverable ? { y: -4, boxShadow: "0 12px 40px -8px rgba(0,0,0,0.5)" } : {}}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
        {...props}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
        <div className="relative z-10">
          {children}
        </div>
      </motion.div>
    );
  }
);
Card.displayName = "Card";

export const CardHeader = ({ className = "", children }: { className?: string, children: React.ReactNode }) => (
  <div className={`p-6 pb-0 ${className}`}>
    {children}
  </div>
);

export const CardContent = ({ className = "", children }: { className?: string, children: React.ReactNode }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const CardFooter = ({ className = "", children }: { className?: string, children: React.ReactNode }) => (
  <div className={`p-6 pt-0 mt-auto border-t border-white/[0.05] bg-white/[0.01] flex items-center ${className}`}>
    {children}
  </div>
);
