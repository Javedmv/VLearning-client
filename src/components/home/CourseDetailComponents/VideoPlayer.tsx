import React from 'react';

interface VideoPlayerProps {
  videoUrl: string | File | null; // Allow string, File, or null
}

const VideoPlayer: React.FC<VideoPlayerProps> = ({ videoUrl }) => {
  if (!videoUrl) return <p>No video available</p>;

  // If the videoUrl is a File, create a temporary URL for it
  const videoSrc = videoUrl instanceof File ? URL.createObjectURL(videoUrl) : videoUrl;

  return (
    <div>
      <video
        controls
        style={{
          width: "100vw",
          height: "300px",
          boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
          cursor: "pointer", // Added cursor style
          marginBottom:"1.5rem",
          border:'2px solid-white'
        }}
      >
        <source src={videoSrc} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoPlayer;
