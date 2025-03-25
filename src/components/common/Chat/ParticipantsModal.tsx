// ParticipantsModal.tsx
import React from "react";
import { X } from "lucide-react";
import { useSocketContext } from "../../../context/SocketProvider";

interface ChatMember {
  _id: string;
  firstName?: string;
  lastName?: string;
  username?: string;
  profileImage?: string;
  role?: string;
}

interface ParticipantsModalProps {
  isOpen: boolean;
  onClose: () => void;
  participants: ChatMember[];
}

const ParticipantsModal: React.FC<ParticipantsModalProps> = ({ isOpen, onClose, participants }) => {
  const { onlineUsers } = useSocketContext();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900">
            Participants ({participants.length})
          </h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors duration-200"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Scrollable Participants List */}
        <ul className="space-y-3 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100">
          {participants.length > 0 ? (
            participants.map((participant) => {
              const isOnline = onlineUsers.includes(participant._id);
              const displayName = participant.username
                ? participant.username
                : `${participant.firstName || "Unknown"} ${participant.lastName || ""}`.trim() || "Unknown User";

              return (
                <li
                  key={participant._id}
                  className="flex items-center space-x-3 py-2 border-b border-gray-100 last:border-b-0"
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 font-medium flex-shrink-0">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-gray-900 truncate flex-1">{displayName}</span>
                  {isOnline && (
                    <span className="w-2 h-2 bg-green-500 rounded-full flex-shrink-0 ml-2"></span>
                  )}
                </li>
              );
            })
          ) : (
            <li className="text-gray-500 text-center py-4">No participants available.</li>
          )}
        </ul>
      </div>
    </div>
  );
};

export default ParticipantsModal;