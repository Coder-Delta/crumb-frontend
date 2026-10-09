import React from 'react';
import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';

const ToastContext = createContext(null);

export function useToast() {
  const showToast = useContext(ToastContext);
  if (!showToast) throw new Error('useToast must be used inside ToastProvider.');
  return showToast;
}

function ToastViewport({ messages }) {
  return (
    <div className="toast-stack" aria-live="polite" aria-atomic="false">
      <AnimatePresence>
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 18, scale: 0.94 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10 }}
            className={`toast ${message.type}`}
            role="status"
          >
            <span className="toast-check">
              <Check size={15} />
            </span>
            {message.text}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

export function ToastProvider({ children }) {
  const [messages, setMessages] = useState([]);

  const showToast = useCallback((text, type = 'success') => {
    const id = Date.now() + Math.random();
    setMessages((current) => [...current, { id, text, type }]);
    window.setTimeout(() => {
      setMessages((current) => current.filter((message) => message.id !== id));
    }, 2800);
  }, []);

  return (
    <ToastContext.Provider value={showToast}>
      {children}
      <ToastViewport messages={messages} />
    </ToastContext.Provider>
  );
}
