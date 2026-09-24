import * as React from "react"
import { cn } from "@/lib/utils"

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm" onClick={() => onOpenChange?.(false)}>
      <div className="relative w-full max-w-md rounded-xl border border-[#174450] bg-[#0C232A] p-6 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}

const DialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("space-y-4 text-[#E7F1F3]", className)}>{children}</div>
)

const DialogHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn("space-y-1.5 text-center sm:text-left", className)}>{children}</div>
)

const DialogTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h2 className={cn("text-lg font-extrabold text-[#FF7A1A]", className)}>{children}</h2>
)

const DialogDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={cn("text-xs text-[#7A9CA5]", className)}>{children}</p>
)

export { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription }