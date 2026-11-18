import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, X, Sparkles } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'info' | 'celebrate';

interface Toast {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  toast: (message: string, type?: ToastType) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const toast = useCallback((message: string, type: ToastType = 'info') => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => { removeToast(id); }, 4500);
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ toast, removeToast }}>
      {children}
      <div className="fixed bottom-24 md:bottom-6 right-4 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
        {toasts.map(t => {
          const styles = {
            // Celebration — olive-100 butter tint, olive-700 text
            celebrate: {
              container: 'bg-[#EEEBC0] border border-[#B8B240]',
              text:      'text-[#2A2815]',
              iconColor: '#7A781F',
            },
            // Success — good status (olive-700 on olive-100)
            success: {
              container: 'bg-[#EEEBC0] border border-[#7A781F]',
              text:      'text-[#2A2815]',
              iconColor: '#7A781F',
            },
            // Error — alert status
            error: {
              container: 'bg-[#FBE1DB] border border-[#C2412E]',
              text:      'text-[#2A2815]',
              iconColor: '#C2412E',
            },
            // Info — card-soft with line border
            info: {
              container: 'bg-[#FBF5EC] border border-[#E8D9C5]',
              text:      'text-[#2A2815]',
              iconColor: '#6B6755',
            },
          };

          const s = styles[t.type];

          return (
            <div
              key={t.id}
              className={`pointer-events-auto flex items-start gap-3 p-4
                rounded-[20px] shadow-[0_4px_16px_rgba(51,50,30,0.12)]
                text-sm fade-in ${s.container}`}
            >
              <div className="shrink-0 mt-0.5">
                {t.type === 'celebrate' && (
                  <Sparkles className="w-4 h-4" style={{ color: s.iconColor }} />
                )}
                {t.type === 'success' && (
                  <CheckCircle2 className="w-4 h-4" style={{ color: s.iconColor }} />
                )}
                {t.type === 'error' && (
                  <AlertCircle className="w-4 h-4" style={{ color: s.iconColor }} />
                )}
                {t.type === 'info' && (
                  <Info className="w-4 h-4" style={{ color: s.iconColor }} />
                )}
              </div>
              <p className={`flex-1 font-medium leading-snug ${s.text}`}>{t.message}</p>
              <button
                onClick={() => removeToast(t.id)}
                className="text-[#9A9582] hover:text-[#2A2815] shrink-0 transition-colors duration-[120ms]"
                aria-label="Close toast"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
