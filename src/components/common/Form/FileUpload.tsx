import React from 'react';
import { FileText, Upload, X } from 'lucide-react';

interface FileUploadProps {
  value: File | null;
  onChange: (file: File | null) => void;
}

const FileUpload: React.FC<FileUploadProps> = ({ value, onChange }) => {
  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-gray-700">Upload CV/Resume</label>
      {!value ? (
        <div 
          onClick={() => document.getElementById('cv-upload')?.click()}
          className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 p-2 border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-indigo-500 transition-colors duration-200"
        >
          <div className="space-y-1 text-center">
            <Upload className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label className="relative cursor-pointer rounded-md font-medium text-indigo-600 hover:text-indigo-500">
                <span>Upload CV</span>
                <input
                  id="cv-upload"
                  type="file"
                  className="sr-only"
                  accept=".pdf,.doc,.docx"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      onChange(file);
                    }
                  }}
                />
              </label>
            </div>
            <p className="text-xs text-gray-500">PDF or Word up to 10MB</p>
          </div>
        </div>
      ) : (
        <div className="relative flex items-center p-4 bg-gray-50 rounded-lg">
          <FileText className="h-8 w-8 text-gray-400 mr-3" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{value.name}</p>
          </div>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="ml-4 bg-red-100 p-1 rounded-full text-red-600 hover:bg-red-200"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default FileUpload;