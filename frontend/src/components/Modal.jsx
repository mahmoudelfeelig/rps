import React from "react";
import { X } from "lucide-react";

const Modal = ({ 
  isOpen, 
  title, 
  message, 
  onConfirm, 
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel"
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center px-4">
      <div className="bg-white/5 border border-white/10 text-white rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-fade-in">
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={20} />
        </button>
        <h2 className="text-2xl font-bold mb-4 text-green-400">{title}</h2>
        <p className="mb-6 text-gray-300 text-base">{message}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors text-sm"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-lg bg-green-600 hover:bg-green-700 transition-colors text-white text-sm"
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Modal;