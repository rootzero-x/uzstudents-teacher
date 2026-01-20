import { useEffect } from "react";

export default function ToastLite({ open, onClose, text = "Done ✅" }) {
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => onClose?.(), 2200);
    return () => clearTimeout(t);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed bottom-5 left-1/2 z-50 w-[calc(100%-24px)] max-w-md -translate-x-1/2">
      <div className="rounded-2xl border border-white/10 bg-slate-950/70 px-4 py-3 text-sm text-slate-100 shadow-[0_25px_70px_rgba(0,0,0,0.55)] backdrop-blur-xl">
        {text}
      </div>
    </div>
  );
}
