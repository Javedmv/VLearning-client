import React, { useState, Fragment } from 'react';
import { Dialog, Transition, TransitionChild } from '@headlessui/react';

interface ConfirmationModalProps {
  triggerText?: string;
  title?: string;
  description?: string;
  onConfirm: () => void;
}

const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  triggerText = 'Delete',
  title = 'Are You Sure?', 
  description = 'This action cannot be undone.',
  onConfirm,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const handleOpen = () => setIsOpen(true);
  const handleClose = () => setIsOpen(false);
  const handleConfirm = () => {
    onConfirm();
    handleClose();
  };

  return (
    <>
      <button type="button" onClick={handleOpen}
        className={`px-3 py-2 rounded transition ${
          triggerText === "Unblock" || triggerText === "Approve"
            ? "bg-green-700 hover:bg-green-800" 
            : "bg-red-600 hover:bg-red-700"
        } text-white`}
      >
        {triggerText}
      </button>

      <Transition show={isOpen} as={Fragment}>
        <Dialog 
          open={isOpen} 
          onClose={handleClose} 
          className="fixed inset-0 z-50 flex items-center justify-center"
        >
          <div className="fixed inset-0 bg-black bg-opacity-30"></div>

          <TransitionChild
            as={Fragment}
            enter="transition-opacity ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="bg-white rounded-lg shadow-lg max-w-md w-full mx-auto p-6 z-50">
              <h2 className="text-lg font-medium">{title}</h2>
              <p className="mt-2 text-sm text-gray-500">{description}</p>

              <div className="mt-4 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={handleClose}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirm}
                  className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                >
                  Confirm
                </button>
              </div>
            </div>
          </TransitionChild>
        </Dialog>
      </Transition>
    </>
  );
};

export default ConfirmationModal;