
import React, { useEffect } from 'react';
import { ToastMessage } from '../types';

interface ToastProps {
  toast: ToastMessage | null;
  onDismiss: () => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        onDismiss();
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast, onDismiss]);

  if (!toast) return null;

  let bgColor = 'bg-blue-500'; // Default for info
  if (toast.type === 'success') bgColor = 'bg-green-500';
  else if (toast.type === 'error') bgColor = 'bg-red-500';
  else if (toast.type === 'warning') bgColor = 'bg-yellow-500';


  return (
    <div 
      className={`fixed bottom-5 right-5 p-4 rounded-lg shadow-lg text-white text-sm z-[2000] transition-opacity duration-300 ease-in-out ${bgColor} opacity-0 animate-toastShow`}
      style={{ animationFillMode: 'forwards' }}
    >
      {toast.message}
      <style>{`
        @keyframes toastShow {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
};

export default Toast;