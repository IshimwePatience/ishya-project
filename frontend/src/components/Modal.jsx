import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';

const Modal = ({ isOpen, onClose, title, children }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 md:p-10">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-5xl bg-[#111111] border border-theme-border shadow-2xl overflow-hidden flex flex-col max-h-full"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-8 py-6 border-b border-theme-border-light">
              <div>
                <h2 className="text-xl font-black uppercase tracking-widest text-theme-text italic">{title}</h2>
                <div className="h-1 w-12 bg-[#e5a00d] mt-2" />
              </div>
              <button 
                onClick={onClose}
                className="p-2 text-theme-text-muted hover:text-theme-text transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default Modal;
