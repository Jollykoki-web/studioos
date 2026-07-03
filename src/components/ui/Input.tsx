import React from "react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon?: React.ReactNode;
  error?: string;
  label?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className = "", icon, error, label, ...props }, ref) => {
    return (
      <div className="space-y-1.5 w-full">
        {label && (
          <label className="block text-xs font-medium text-[#EDEDED] tracking-tight">
            {label}
          </label>
        )}
        <div className="relative group">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#71717A] group-focus-within:text-white transition-colors">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={`
              w-full rounded-lg bg-[#0A0A0A] border text-sm text-white placeholder-zinc-600 shadow-sm
              focus:outline-none focus:ring-4 transition-all disabled:opacity-40 disabled:cursor-not-allowed
              ${icon ? "pl-10" : "px-3"}
              ${props.type === "search" ? "h-10" : "h-11"}
              ${
                error
                  ? "border-red-500/50 focus:border-red-500 focus:ring-red-500/10"
                  : "border-white/[0.08] hover:border-white/[0.15] focus:border-white/[0.3] focus:ring-white/[0.05]"
              }
              ${className}
            `}
            {...props}
          />
        </div>
        {error && <p className="text-[10px] font-medium text-red-400 mt-1 tracking-tight">{error}</p>}
      </div>
    );
  }
);
Input.displayName = "Input";
