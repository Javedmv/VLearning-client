import React, { useState, useEffect, useRef } from "react";
import { Mic, MicOff, Video, VideoOff, PhoneOff, Users, RefreshCw } from "lucide-react";
import { useSocketContext } from "../../../context/SocketProvider";
import { useSelector } from "react-redux";
import { RootState } from "../../../redux/store";
import { toast } from "react-hot-toast";

interface VideoCallModalProps {
  localStream: MediaStream | null;
  remoteStream: MediaStream | null;
  onEndCall: () => void;
  isInstructor?: boolean;
}

const VideoCallModal: React.FC<VideoCallModalProps> = ({
  localStream,
  remoteStream,
  onEndCall,
  isInstructor,
}) => {
  // Get socket from context once at component level
  const { 
    participantStreams, 
    toggleAudio, 
    toggleVideo, 
    isAudioEnabled, 
    isVideoEnabled,
    currentChatId,
    callStatus,
    callParticipants,
    reconnectToCall,
    socket,
    joinVideoCall,
    endVideoCall,
    cleanupAllPeerConnections
  } = useSocketContext();
  
  const [showParticipants, setShowParticipants] = useState(false);
  const [gridLayout, setGridLayout] = useState("grid-cols-1");
  const [participantNames, setParticipantNames] = useState<{[userId: string]: string}>({});
  const [hasConnectionIssue, setHasConnectionIssue] = useState(false);
  const [showEndCallConfirm, setShowEndCallConfirm] = useState(false);
  
  const { user } = useSelector((state: RootState) => state.user);
  
  const localVideoRef = useRef<HTMLVideoElement | null>(null);
  const participantsSidebarRef = useRef<HTMLDivElement | null>(null);
  const participantsButtonRef = useRef<HTMLButtonElement | null>(null);
  
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
  
  // Determine grid layout based on number of participants
  useEffect(() => {
    const participantCount = Object.keys(participantStreams).length;
    const totalStreams = participantCount + 1; // +1 for local stream
    
    if (totalStreams <= 1) {
      setGridLayout("grid-cols-1");
    } else if (totalStreams === 2) {
      setGridLayout("grid-cols-2");
    } else if (totalStreams <= 4) {
      setGridLayout("grid-cols-2");
    } else if (totalStreams <= 9) {
      setGridLayout("grid-cols-3");
    } else {
      setGridLayout("grid-cols-4");
    }
    
    // Check for connection issues
    if (callParticipants.length > 1 && participantCount === 0 && callStatus === 'connected') {
      setHasConnectionIssue(true);
    } else {
      setHasConnectionIssue(false);
    }
  }, [participantStreams, callParticipants, callStatus]);

  // Fetch participant names
  useEffect(() => {
    const names: {[userId: string]: string} = {};
    
    callParticipants.forEach(userId => {
      if (userId === user?._id) return;
      
      // Set default names first
      if (isInstructor && userId !== user?._id) {
        names[userId] = `Student ${userId.substring(0, 4)}`;
      } else if (!isInstructor && userId !== user?._id) {
        names[userId] = `Instructor`;
      } else {
        names[userId] = `User ${userId.substring(0, 4)}`;
      }
    });
    
    setParticipantNames(names);
  }, [callParticipants, isInstructor, user]);

  // Handle click outside to close participants sidebar
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showParticipants &&
        participantsSidebarRef.current && 
        participantsButtonRef.current &&
        !participantsSidebarRef.current.contains(event.target as Node) &&
        !participantsButtonRef.current.contains(event.target as Node)
      ) {
        setShowParticipants(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showParticipants]);

  // Clean up resources when component unmounts
  useEffect(() => {
    return () => {
      if (localStream) {
        localStream.getTracks().forEach(track => {
          track.stop();
        });
      }
    };
  }, []);
  
  // Function to handle reconnection
  const handleReconnect = () => {
    if (currentChatId) {
      reconnectToCall(currentChatId);
      setHasConnectionIssue(false);
      toast.success("Attempting to reconnect to all participants...");
    }
  };

  // Listen for instructor leaving
  useEffect(() => {
    const handleCallEnded = (data: { chatId: string, userId: string, role: string }) => {
      if (data.role === 'instructor' && !isInstructor) {
        toast.error("The instructor has ended the call");
        onEndCall();
      }
    };
    
    if (socket) {
      socket.on("videoCallEnded", handleCallEnded);
      
      return () => {
        socket.off("videoCallEnded", handleCallEnded);
      };
    }
  }, [isInstructor, onEndCall, socket]);

  // Add this function to handle instructor ending call
  const handleEndCallClick = () => {
    if (isInstructor) {
      setShowEndCallConfirm(true);
    } else {
      onEndCall();
    }
  };

  const forceReconnect = () => {
    if (currentChatId) {
      // Clear existing connections
      cleanupAllPeerConnections();
      // Rejoin the call
      joinVideoCall(currentChatId);
      toast.success("Attempting to reconnect all participants...");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-50">
      <div className="w-full max-w-6xl p-6 relative">
        {/* Header */}
        <div className="absolute top-4 right-4 flex items-center space-x-4 z-10">
          {hasConnectionIssue && (
            <button
              onClick={handleReconnect}
              className="bg-yellow-500 hover:bg-yellow-600 text-white p-2 rounded-full transition-colors"
              title="Connection issues detected. Click to reconnect"
            >
              <RefreshCw className="w-6 h-6" />
            </button>
          )}
          <button
            ref={participantsButtonRef}
            onClick={() => setShowParticipants(!showParticipants)}
            className="bg-gray-700 hover:bg-gray-600 text-white p-2 rounded-full transition-colors"
            title="Show participants"
          >
            <Users className="w-6 h-6" />
          </button>
          <button
            onClick={handleEndCallClick}
            className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-colors"
            title={isInstructor ? "End call for everyone" : "Leave call"}
          >
            <PhoneOff className="w-6 h-6" />
          </button>
        </div>
        
        {/* Call status indicator */}
        {callStatus === 'connecting' && (
          <div className="absolute top-4 left-4 bg-yellow-500 text-white px-3 py-1 rounded-full text-sm">
            Connecting...
          </div>
        )}
        
        {/* Participants sidebar */}
        {showParticipants && (
          <div 
            ref={participantsSidebarRef}
            className="absolute top-0 right-0 h-full w-64 bg-gray-900/80 backdrop-blur-sm p-4 z-10 overflow-y-auto"
          >
            <h3 className="text-white font-medium mb-4 text-lg">Participants ({callParticipants.length})</h3>
            <ul className="space-y-2">
              <li className="flex items-center text-white p-2 bg-gray-800/50 rounded">
                <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center mr-2">
                  <span className="text-white text-sm font-medium">
                    {user?.username?.charAt(0) || user?.firstName?.charAt(0) || "Y"}
                  </span>
                </div>
                <span>
                  {user?.username || `${user?.firstName} ${user?.lastName}` || "You"} (You)
                  {isInstructor ? " - Instructor" : ""}
                </span>
              </li>
              
              {callParticipants
                .filter(id => id !== user?._id)
                .map(userId => (
                  <li key={userId} className="flex items-center text-white p-2 bg-gray-800/50 rounded">
                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center mr-2">
                      <span className="text-white text-sm font-medium">
                        {participantNames[userId]?.charAt(0) || userId.charAt(0)}
                      </span>
                    </div>
                    <div className="flex flex-col">
                      <span>{participantNames[userId] || userId}</span>
                      <span className="text-xs text-gray-400">
                        {participantStreams[userId] ? "Connected" : "Connecting..."}
                      </span>
                    </div>
                  </li>
                ))}
            </ul>
          </div>
        )}

        {/* Video Grid */}
        <div className={`grid ${gridLayout} gap-4 h-[80vh] overflow-auto p-2`}>
          {/* Local Video */}
          <div className="relative bg-gray-900 rounded-lg overflow-hidden shadow-lg">
            <video
              ref={localVideoRef}
              autoPlay
              playsInline
              muted
              className={`w-full h-full object-cover ${!isVideoEnabled ? 'invisible' : ''}`}
            />
            <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
              {user?.username || `${user?.firstName} ${user?.lastName}` || "You"} (You)
              {isInstructor ? " - Instructor" : ""}
            </div>
            {!isVideoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80">
                <div className="w-20 h-20 rounded-full bg-purple-600 flex items-center justify-center">
                  <span className="text-white text-2xl font-medium">
                    {user?.username?.charAt(0) || user?.firstName?.charAt(0) || "Y"}
                  </span>
                </div>
              </div>
            )}
            
            {/* Audio indicator */}
            <div className={`absolute top-4 right-4 w-4 h-4 rounded-full ${isAudioEnabled ? 'bg-green-500' : 'bg-red-500'}`}></div>
          </div>

          {/* Participant Videos */}
          {Object.entries(participantStreams).map(([userId, stream]) => {
            // Check if stream has active video tracks
            const hasVideoTracks = stream.getVideoTracks().length > 0;
            const isVideoActive = hasVideoTracks && stream.getVideoTracks()[0].enabled;
            const hasAudioTracks = stream.getAudioTracks().length > 0;
            
            return (
              <div key={userId} className="relative bg-gray-900 rounded-lg overflow-hidden shadow-lg">
                <video
                  ref={(video) => {
                    if (video) {
                      video.srcObject = stream;
                      // Handle autoplay issues
                      video.play().catch(e => {
                        console.error("Error auto-playing video:", e);
                        // Try playing on user interaction
                        const playOnInteraction = () => {
                          video.play();
                          document.removeEventListener('click', playOnInteraction);
                        };
                        document.addEventListener('click', playOnInteraction);
                      });
                    }
                  }}
                  autoPlay
                  playsInline
                  className={`w-full h-full object-cover ${!isVideoActive ? 'invisible' : ''}`}
                />
                <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded-full text-white text-sm">
                  {participantNames[userId] || `User ${userId.substring(0, 4)}`}
                </div>
                {!isVideoActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-800/80">
                    <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center">
                      <span className="text-white text-2xl font-medium">
                        {participantNames[userId]?.charAt(0) || userId.charAt(0)}
                      </span>
                    </div>
                  </div>
                )}
                
                {/* Audio indicator */}
                <div className={`absolute top-4 right-4 w-4 h-4 rounded-full ${
                  hasAudioTracks && stream.getAudioTracks()[0].enabled ? 'bg-green-500' : 'bg-red-500'
                }`}></div>
              </div>
            );
          })}
          
          {/* Show empty placeholders for participants that have not connected yet */}
          {callParticipants
            .filter(id => id !== user?._id && !participantStreams[id])
            .map(userId => (
              <div key={userId} className="relative bg-gray-900 rounded-lg overflow-hidden shadow-lg">
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-800/80">
                  <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mb-4">
                    <span className="text-white text-2xl font-medium">
                      {participantNames[userId]?.charAt(0) || userId.charAt(0)}
                    </span>
                  </div>
                  <div className="text-white text-center">
                    <p>{participantNames[userId] || `User ${userId.substring(0, 4)}`}</p>
                    <p className="text-sm text-gray-400 mt-1">Connecting...</p>
                    <div className="mt-2 flex justify-center space-x-1">
                      <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce"></div>
                      <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 rounded-full bg-white/50 animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
        </div>

        {/* Controls */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center space-x-4">
          <button
            onClick={toggleAudio}
            className={`p-4 rounded-full ${
              !isAudioEnabled ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"
            } text-white transition-colors`}
            title={isAudioEnabled ? "Mute microphone" : "Unmute microphone"}
          >
            {!isAudioEnabled ? <MicOff className="w-6 h-6" /> : <Mic className="w-6 h-6" />}
          </button>
          <button
            onClick={toggleVideo}
            className={`p-4 rounded-full ${
              !isVideoEnabled ? "bg-red-500 hover:bg-red-600" : "bg-gray-700 hover:bg-gray-600"
            } text-white transition-colors`}
            title={isVideoEnabled ? "Turn off camera" : "Turn on camera"}
          >
            {!isVideoEnabled ? <VideoOff className="w-6 h-6" /> : <Video className="w-6 h-6" />}
          </button>
          <button
            onClick={handleEndCallClick}
            className="bg-red-500 hover:bg-red-600 text-white p-4 rounded-full transition-colors"
            title={isInstructor ? "End call for everyone" : "Leave call"}
          >
            <PhoneOff className="w-6 h-6" />
          </button>
          {hasConnectionIssue && (
            <button
              onClick={handleReconnect}
              className="bg-yellow-500 hover:bg-yellow-600 text-white p-4 rounded-full transition-colors"
              title="Connection issues detected. Click to reconnect"
            >
              <RefreshCw className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>

      {/* Confirmation dialog */}
      {showEndCallConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full">
            <h3 className="text-xl font-semibold mb-4">End Call for Everyone?</h3>
            <p className="mb-6">
              As the instructor, ending this call will disconnect all participants. 
              Are you sure you want to end the call for everyone?
            </p>
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowEndCallConfirm(false)}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowEndCallConfirm(false);
                  onEndCall();
                }}
                className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
              >
                End Call for Everyone
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoCallModal; 