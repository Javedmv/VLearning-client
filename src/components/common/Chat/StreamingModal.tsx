import React from "react";
import { X } from "lucide-react";

// Define props for the Whereby version
export interface StreamingModalProps {
  roomUrl: string; // Whereby room URL is now the primary prop
  onClose: () => void;
  isInstructor?: boolean; // Might still be useful for styling/minor logic
}

const StreamingModal: React.FC<StreamingModalProps> = ({
  roomUrl,
  onClose,
  isInstructor = false, // Keep default, might use later
}) => {

  // Removed all WebRTC related state, refs, context usage, and effects.

  // Basic structure for the modal, focusing on the iframe
  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col p-4 items-center justify-center">
        {/* Modal Content Box */}
        <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl h-[85vh] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex justify-between items-center p-3 bg-gray-900 text-white flex-shrink-0">
                <h3 className="text-lg font-semibold">
                {isInstructor ? "Your Live Stream" : "Joining Live Stream"}
                </h3>
                <button
                    onClick={onClose} // Use the onClose prop directly
                    className="p-1 rounded-full text-gray-400 hover:bg-gray-700 hover:text-white transition-colors"
                    title="Close Stream Window"
                >
                    <X className="w-5 h-5" />
                </button>
            </div>

            {/* Whereby Iframe Container */}
            <div className="flex-grow bg-black relative">
                {roomUrl ? (
                    <iframe
                        src={roomUrl} // Use the passed roomUrl
                        allow="camera; microphone; fullscreen; speaker; display-capture" // Standard permissions
                        className="absolute top-0 left-0 w-full h-full border-none" // Fill container, remove border
                        title="Whereby Embedded Stream"
                    />
                ) : (
                    // Optional: Show a loading or error state if URL is missing
                    <div className="flex items-center justify-center h-full text-white">
                        <p>Loading stream...</p> 
                    </div>
                )}
            </div>
        </div>
    </div>
  );
};

export default StreamingModal; 