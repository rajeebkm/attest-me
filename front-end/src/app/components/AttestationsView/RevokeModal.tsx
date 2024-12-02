"use client"
import React from 'react';
interface RevokeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

function RevokeModal({ isOpen, onClose, onConfirm }: RevokeModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 font-serif flex items-center justify-center z-50 ">
      <div className="absolute inset-0 bg-gradient-to-b from-blue-100 to-blue-300 dark:from-gray-800 dark:to-gray-900 opacity-90"></div>
      <div className="bg-gradient-to-b from-gray-100 to-blue-300 dark:from-gray-200 dark:to-blue-400 py-12 mt-10 px-10 p-6 rounded-lg shadow-lg z-50 relative">
        <h2 className="text-2xl text-center font-semibold text-gray-800 dark:text-gray-800 mb-4">Revoke Attestation</h2>
        <p className="text-gray-600 dark:text-gray-600 mb-6 text-lg">Are you sure you want to revoke this attestation?</p>
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-300 dark:bg-gray-100 py-2 px-4 rounded text-gray-800 dark:text-gray-600 hover:bg-green-500 dark:hover:bg-green-600 transition duration-300 ease-in-out"
          >
            No
          </button>
          <button
            onClick={onConfirm}
            className="bg-blue-600 py-2 px-4 rounded text-white hover:bg-blue-700 transition duration-300 ease-in-out"
          >
            Yes
          </button>
        </div>
      </div>
    </div>
  );
}

export default RevokeModal;
