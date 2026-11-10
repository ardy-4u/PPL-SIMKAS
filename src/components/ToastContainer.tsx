import React from 'react';
import { useSimkas } from '../context/SimkasContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts } = useSimkas();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm pointer-events-none">
      {toasts.map((toast) => {
        let bgClass = 'bg-blue-600 text-white';
        let Icon = Info;

        if (toast.type === 'success') {
          bgClass = 'bg-emerald-600 text-white';
          Icon = CheckCircle2;
        } else if (toast.type === 'error') {
          bgClass = 'bg-rose-600 text-white';
          Icon = AlertCircle;
        } else if (toast.type === 'warning') {
          bgClass = 'bg-amber-500 text-slate-900';
          Icon = AlertTriangle;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl shadow-xl transition-all duration-300 animate-slideUp border border-white/20 ${bgClass}`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            <p className="text-sm font-medium leading-snug">{toast.message}</p>
          </div>
        );
      })}
    </div>
  );
};
