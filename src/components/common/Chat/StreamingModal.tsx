import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, X, Bell } from "lucide-react";
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
      console.log(`Setting video source object. Is instructor: ${isInstructor}`);
      localVideoRef.current.srcObject = localStream;
      
      // Handle autoplay issues
      localVideoRef.current.play().catch(e => {
        console.error("Error auto-playing video:", e);
        // Try playing on user interaction
        const playOnInteraction = () => {
          if (localVideoRef.current) {
            console.log("Attempting to play video on user interaction");
            localVideoRef.current.play().catch(error => {
              console.error("Failed to play video on interaction:", error);
              toast.error("Could not play video. Try clicking the Play Video button.");
            });
          }
          document.removeEventListener('click', playOnInteraction);
        };
        document.addEventListener('click', playOnInteraction);
      });
    } else if (!localStream) {
      console.log("No localStream available yet");
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

  // Function to notify all students about the stream
  const notifyStudents = () => {
    if (socket && isInstructor) {
      socket.emit('recallStudents', {
        chatId,
        streamerId: user?._id,
        streamerName: user?.username || 'Instructor'
      });
      toast.success('Notification sent to all students in this chat');
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
              <button
                onClick={notifyStudents}
                className="p-2 rounded-full bg-blue-600 hover:bg-blue-700"
                title="Notify all students about this stream"
              >
                <Bell className="w-5 h-5" />
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
                <>
                  <video
                    ref={localVideoRef}
                    autoPlay
                    playsInline
                    className="rounded-lg w-full h-full object-cover"
                  />
                  {/* Add controls for debugging */}
                  <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded">
                    <p>Stream active: {localStream.active ? 'Yes' : 'No'}</p>
                    <p>Video tracks: {localStream.getVideoTracks().length}</p>
                    <p>Audio tracks: {localStream.getAudioTracks().length}</p>
                    <div className="mt-2 flex space-x-2">
                      <button 
                        onClick={() => {
                          if (localVideoRef.current) {
                            localVideoRef.current.play().catch(e => {
                              console.error("Error playing video:", e);
                              toast.error("Error playing video. Please try refreshing the page.");
                            });
                          }
                        }}
                        className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Play Video
                      </button>
                      <button
                        onClick={() => {
                          // Re-join the stream to force reconnection
                          leaveStream(chatId);
                          setTimeout(() => joinStream(chatId), 1000);
                          toast.success("Attempting to reconnect...");
                        }}
                        className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                      >
                        Reconnect
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center">
                  <p className="text-white text-xl mb-2">
                    {callStatus === 'connected' 
                      ? "Waiting for instructor's video..." 
                      : "Connecting to instructor's stream..."}
                  </p>
                  <p className="text-white text-sm mb-4">Connection status: {callStatus}</p>
                  <div className="bg-black/50 p-3 rounded mb-4 max-w-md mx-auto">
                    <p className="text-white text-sm text-left mb-2">Connection Diagnostics:</p>
                    <ul className="text-white text-xs text-left list-disc list-inside space-y-1">
                      <li>Chat ID: {chatId}</li>
                      <li>Socket Connected: {socket ? "Yes" : "No"}</li>
                      <li>User ID Available: {user?._id ? "Yes" : "No"}</li>
                      <li>Streaming: {isStreaming ? "Yes" : "No"}</li>
                      <li>Status: {callStatus}</li>
                    </ul>
                  </div>
                  <div className="flex items-center justify-center gap-2">
                    <div className="w-2 h-2 bg-white rounded-full animate-ping"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-ping" style={{ animationDelay: '0.4s' }}></div>
                  </div>
                  {callStatus === 'connected' || callStatus === 'connecting' ? (
                    <button 
                      onClick={() => {
                        if (localVideoRef.current) {
                          localVideoRef.current.play().catch(e => {
                            console.error("Error playing video:", e);
                            toast.error("Error playing video. Please try refreshing the page.");
                          });
                        }
                      }}
                      className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Play Video
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        // Re-join the stream to force reconnection
                        leaveStream(chatId);
                        setTimeout(() => joinStream(chatId), 1000);
                      }}
                      className="mt-4 px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                    >
                      Try Again
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
          {isInstructor && (
            <div className="absolute bottom-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
              {streamViewers.length} {streamViewers.length === 1 ? 'viewer' : 'viewers'}
            </div>
          )}
        </div>
      </div>

      {/* Viewers sidebar */}
      {showViewers && isInstructor && (
        <div 
          ref={viewersSidebarRef}
          className="absolute top-16 right-0 bottom-0 w-64 bg-gray-800 shadow-lg overflow-y-auto"
        >
          <div className="p-4 border-b border-gray-700">
            <h4 className="text-lg font-semibold text-white">Stream Viewers ({streamViewers.length})</h4>
          </div>
          <div className="divide-y divide-gray-700">
            {streamViewers.length > 0 ? (
              streamViewers.map(viewerId => (
                <div key={viewerId} className="p-3 text-white flex items-center">
                  <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-sm mr-3">
                    {(streamViewerNames[viewerId] || 'User')[0].toUpperCase()}
                  </div>
                  <span>{streamViewerNames[viewerId] || 'User'}</span>
                </div>
              ))
            ) : (
              <div className="p-4 text-gray-400 text-center">No viewers yet</div>
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