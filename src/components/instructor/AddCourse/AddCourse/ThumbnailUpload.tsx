// ThumbnailUpload.tsx
import React, { useRef } from 'react';
import { Upload, X } from 'lucide-react';

interface ThumbnailUploadProps {
  thumbnailPreview: string | null;
  onThumbnailChange: (file: File) => void;
  onThumbnailRemove: () => void;
}

const ThumbnailUpload: React.FC<ThumbnailUploadProps> = ({
  thumbnailPreview,
  onThumbnailChange,
  onThumbnailRemove
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="mb-4">
      <label className="block text-gray-700 font-medium mb-2">Upload Thumbnail</label>
      <div className="flex flex-col items-center gap-2">
        {thumbnailPreview ? (
          <>
            <img src={thumbnailPreview} alt="Thumbnail preview" className="w-40 h-40 object-cover" />
            <button
              type="button"
              onClick={onThumbnailRemove}
              className="absolute top-0 right-0 text-red-500"
            >
              <X />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="px-6 py-2 bg-fuchsia-600 text-white rounded-md hover:bg-fuchsia-700"
          >
            <div className="flex items-center">
              <Upload className="w-5 h-5 mr-2" />
              <span>Upload Thumbnail</span>
            </div>
          </button>
        )}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={(e) => e.target.files && onThumbnailChange(e.target.files[0])}
          className="hidden"
        />
      </div>
    </div>
  );
};

export default ThumbnailUpload;
