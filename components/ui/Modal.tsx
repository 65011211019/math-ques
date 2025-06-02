import React from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg'; // Optional size prop
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, size = 'md' }) => {
  if (!isOpen) return null;

  let sizeClass = 'max-w-lg'; // Default md
  if (size === 'sm') sizeClass = 'max-w-sm';
  if (size === 'lg') sizeClass = 'max-w-xl';


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-3 sm:p-4 backdrop-blur-sm animate-fade-in">
      <div className={`bg-gradient-to-br from-slate-50 via-gray-50 to-stone-100 rounded-xl shadow-2xl p-5 sm:p-6 md:p-8 w-full ${sizeClass} transform transition-all scale-100 opacity-100 border border-slate-300`}>
        <div className="flex justify-between items-center mb-4 sm:mb-5">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">{title}</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-red-500 text-2xl sm:text-3xl transition-colors duration-150"
            aria-label="Close modal"
          >
            &times;
          </button>
        </div>
        <div className="text-gray-700 space-y-3 text-sm sm:text-base leading-relaxed max-h-[70vh] overflow-y-auto pr-2">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;