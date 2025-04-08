import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, X } from "lucide-react";
import { useSocketContext } from "../../../contexts/SocketContext";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { toast } from "react-hot-toast";

interface StreamingModalProps {
  chatId: string;
  onClose: () => void;
  isInstructor?: boolean;
}

const StreamingModal: React.FC<StreamingModalProps> = ({
  chatId,
  onClose,
  isInstructor = false,
}) => {
  // Get socket from context
  const { 
    toggleAudio, 
    toggleVideo, 
    isAudioEnabled, 
    isVideoEnabled,
    currentChatId,
    callStatus,
    socket,
    localStream,
    streamViewers,
    streamViewerNames,
    isStreaming,                                                                                                                                                                                                                                                                                                                                                            
    initiateStream,
    joinStream,
    endStream,
    leaveStream,
  } = useSocketContext();
  
  // UI state
  const [showViewers, setShowViewers] = useState(false);
  const [showEndStreamConfirm, setShowEndStreamConfirm] = useState(false);
  
  // Refs
  const showViewersRef = useRef(false);
  const showEndStreamConfirmRef = useRef(false);
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const viewersSidebarRef = useRef<HTMLDivElement | null>(null);
  const viewersButtonRef = useRef<HTMLButtonElement | null>(null);
  
  const { user } = useSelector((state: RootState) => state.user);
  
  // Keep refs in sync with state
  useEffect(() => {
    showViewersRef.current = showViewers;
  }, [showViewers]);
  
  useEffect(() => {
    showEndStreamConfirmRef.current = showEndStreamConfirm;
  }, [showEndStreamConfirm]);

  // Initialize the stream when component mounts
  const isInitializedRef = useRef(false);
  
  useEffect(() => {
    // Start or join the stream
    const initializeStream = async () => {
      // Only initialize once and if not already streaming in this chat
      if (isInitializedRef.current || (isInstructor && isStreaming && currentChatId === chatId) || 
          (!isInstructor && currentChatId === chatId)) {
        return;
      }
      
      isInitializedRef.current = true;
      
      try {
        if (isInstructor) {
          console.log("Instructor initiating stream for", chatId);
          await initiateStream(chatId);
        } else {
          console.log("Student joining stream for", chatId);
          await joinStream(chatId);
        }
      } catch (error) {
        console.error("Failed to initialize stream:", error);
        // Reset initialized flag on error so user can try again
        isInitializedRef.current = false;
        toast.error("Failed to initialize stream. Please try again.");
      }
    };
    
    initializeStream();
    
    // Cleanup on unmount
    return () => {
      console.log("StreamingModal unmounting", {isInstructor, isStreaming, currentChatId, chatId});
      
      if (isInitializedRef.current) {
        // Only instructor should end the stream, others just leave
        if (isInstructor && isStreaming && currentChatId === chatId) {
          console.log("Instructor ending stream on unmount");
          endStream(chatId);
        } else if (!isInstructor && currentChatId === chatId) {
          console.log("Student leaving stream on unmount");
          leaveStream(chatId);
        }
        isInitializedRef.current = false;
      }
    };
  }, [chatId, isInstructor, initiateStream, joinStream, endStream, leaveStream, isStreaming, currentChatId]);
  
  // Update local video stream
  useEffect(() => {
    if (localVideoRef.current && localStream) {
      localVideoRef.current.srcObject = localStream;
      
      // Handle autoplay issues
      localVideoRef.current.play().catch(e => {
        console.error("Error auto-playing local video:", e);
        // Try playing on user interaction
        const playOnInteraction = () => {
          if (localVideoRef.current) {
            localVideoRef.current.play();
          }
          document.removeEventListener('click', playOnInteraction);
        };
        document.addEventListener('click', playOnInteraction);
      });
    }
  }, [localStream]);

  // Handle click outside to close viewers sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showViewersRef.current &&
        viewersSidebarRef.current && 
        viewersButtonRef.current &&
        !viewersSidebarRef.current.contains(event.target as Node) &&
        !viewersButtonRef.current.contains(event.target as Node)
      ) {
        setShowViewers(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Handle instructor ending stream
  const handleEndStreamClick = () => {
    if (isInstructor) {
      setShowEndStreamConfirm(true);
    } else {
      // For students, just leave the stream
      leaveStream(chatId);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex flex-col">
      <div className="flex justify-between items-center p-4 bg-gray-800 text-white">
        <h3 className="text-lg font-semibold">
          {isInstructor ? "Streaming to Students" : "Instructor's Live Stream"}
        </h3>
        <div className="flex space-x-3">
          {isInstructor && (
            <>
              <button
                onClick={toggleAudio}
                className={`p-2 rounded-full ${isAudioEnabled ? 'bg-gray-700' : 'bg-red-500'}`}
                title={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
              >
                {isAudioEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
              </button>
              <button
                onClick={toggleVideo}
                className={`p-2 rounded-full ${isVideoEnabled ? 'bg-gray-700' : 'bg-red-500'}`}
                title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
              >
                {isVideoEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
              </button>
            </>
          )}
          {isInstructor && (
            <button
              ref={viewersButtonRef}
              onClick={() => setShowViewers(!showViewers)}
              className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 relative"
              title="Show viewers"
            >
              <Users className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {streamViewers.length}
              </span>
            </button>
          )}
          <button
            onClick={handleEndStreamClick}
            className="p-2 rounded-full bg-red-500 hover:bg-red-600"
            title={isInstructor ? "End stream" : "Leave stream"}
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="flex-1 p-4 flex flex-wrap justify-center items-center gap-4 overflow-auto">
        {/* Connection status message */}
        {callStatus === 'connecting' && (
          <div className="absolute top-20 left-0 right-0 text-center text-white bg-gray-800/70 py-2">
            {isInstructor ? "Starting stream..." : "Connecting to stream..."}
          </div>
        )}

        {/* Video container */}
        <div className="relative w-4/5 h-4/5">
          {isInstructor ? (
            // Instructor sees their own video
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`rounded-lg w-full h-full object-cover bg-gray-700 ${!isVideoEnabled ? 'invisible' : ''}`}
            />
          ) : (
            // Students see instructor's video
            <div className="w-full h-full flex items-center justify-center bg-gray-800 rounded-lg">
              {localStream ? (
                <video
                  ref={localVideoRef}
                  autoPlay
                  playsInline
                  muted={!isInstructor} // Mute for students to prevent feedback
                  className="rounded-lg w-full h-full object-cover"
                />
              ) : (
                <div className="text-center">
                  <p className="text-white text-xl mb-2">
                    {callStatus === 'connected' 
                      ? "Waiting for instructor's video..." 
                      : "Connecting to instructor's stream..."}
                  </p>
                  {callStatus === 'connected' && (
                    <button 
                      onClick={() => {
                        if (localVideoRef.current) {
                          localVideoRef.current.play().catch(e => {
                            console.error("Error playing video:", e);
                            toast.error("Error playing video. Please try refreshing the page.");
                          });
                        }
                      }}
                      className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Play Video
                    </button>
                  )}
                </div>
              )}
            </div>
          )}
          
          <div className="absolute bottom-2 left-2 text-white bg-black/50 px-2 py-1 rounded text-sm">
            {isInstructor ? `You ${!isAudioEnabled ? '(muted)' : ''}` : 'Instructor'}
          </div>
          
          {/* Viewer count badge */}
          <div className="absolute top-2 right-2 bg-black/50 px-2 py-1 rounded text-sm text-white flex items-center">
            <Users className="w-4 h-4 mr-1" /> {streamViewers.length} viewer{streamViewers.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Viewers sidebar */}
      {showViewers && (
        <div 
          ref={viewersSidebarRef}
          className="absolute right-0 top-0 h-full w-64 bg-gray-800 text-white p-4 overflow-y-auto"
        >
          <h4 className="text-lg font-semibold mb-4">Viewers ({streamViewers.length})</h4>
          <div className="space-y-2">
            {streamViewers.map(viewerId => (
              <div 
                key={viewerId} 
                className="flex items-center justify-between p-2 bg-gray-700 rounded"
              >
                <span className="truncate">
                  {streamViewerNames[viewerId] || 'Anonymous User'}
                </span>
                {isInstructor && (
                  <button
                    onClick={() => {
                      // Notify server to remove this viewer
                      socket?.emit("removeViewer", { 
                        chatId, 
                        userId: viewerId 
                      });
                    }}
                    className="p-1 text-red-400 hover:text-red-300"
                    title="Remove viewer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
            {streamViewers.length === 0 && (
              <p className="text-gray-400 text-center py-4">No viewers yet</p>
            )}
          </div>
        </div>
      )}

      {/* Confirmation dialog */}
      {showEndStreamConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">End Stream for Everyone?</h3>
            <p className="mb-6">
              As the instructor, ending this stream will disconnect all viewers. 
              Are you sure you want to end the stream for everyone?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowEndStreamConfirm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEndStreamConfirm(false);
                  endStream(chatId);
                  onClose();
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                End Stream for Everyone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StreamingModal; 