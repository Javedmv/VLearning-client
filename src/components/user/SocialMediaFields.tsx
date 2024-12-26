import React from 'react';

interface SocialMediaFieldProps {
  label: string;
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
}

export const SocialMediaField: React.FC<SocialMediaFieldProps> = ({
  label,
  value,
  isEditing,
  onChange,
}) => {

  const formatValue = (val: string | undefined | null) => {
    if (!val || val.trim() === '') {
      return <span className="text-gray-500 italic">Value Not Provided</span>;
    }
    return val;
  };
  return (
    <div className="p-3 border-2 border-white rounded-lg hover:border-fuchsia-900 hover:border-2 transition-colors">
      <label className="block text-sm font-medium text-gray-700 mb-1 capitalize">
        {label}
      </label>
      {isEditing ? (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={`Enter your ${label} profile URL`}
          className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      ) : (
        <p className="text-gray-900 px-3 py-2 bg-gray-50 rounded-md truncate">
          {formatValue(value)}
        </p>
      )}
    </div>
  );
};