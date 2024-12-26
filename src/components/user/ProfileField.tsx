import React from 'react';
import { clsx } from 'clsx';

interface ProfileFieldProps {
  label: string;
  value: string | undefined | null;
  isEditing: boolean;
  onChange?: (value: string) => void;
  disabled?: boolean;
  type?: 'text' | 'dropdown' | 'date';
  options?: string[];
  min?: string;
  max?: string;
  error?: string;
  required?: boolean;
}

export const ProfileField: React.FC<ProfileFieldProps> = ({
  label,
  value,
  isEditing,
  onChange,
  disabled = false,
  type = 'text',
  options = [],
  min,
  max,
  error,
  required = false
}) => {
  const formatValue = (val: string | undefined | null) => {
    if (!val || val.trim() === '') {
      return 'Value Not Provided';
    }
    return val;
  };

  const renderInput = () => {
    const baseInputStyles = clsx(
      "w-full px-3 py-2 border rounded-md transition-all",
      "focus:outline-none focus:ring-2",
      {
        "border-red-500 focus:ring-red-200 focus:border-red-500": error,
        "border-gray-300 focus:ring-fuchsia-200 focus:border-fuchsia-700": !error,
        "bg-gray-100 cursor-not-allowed": disabled,
        "bg-white": !disabled
      }
    );

    switch (type) {
      case 'dropdown':
        return (
          <select
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className={baseInputStyles}
            aria-invalid={!!error}
            aria-describedby={error ? `${label}-error` : undefined}
          >
            <option value="">Select {label}</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      
      case 'date':
        return (
          <input
            type="date"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            min={min}
            max={max}
            className={baseInputStyles}
            aria-invalid={!!error}
            aria-describedby={error ? `${label}-error` : undefined}
          />
        );
      
      default:
        return (
          <input
            type="text"
            value={value || ''}
            onChange={(e) => onChange?.(e.target.value)}
            disabled={disabled}
            className={baseInputStyles}
            aria-invalid={!!error}
            aria-describedby={error ? `${label}-error` : undefined}
          />
        );
    }
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-baseline mb-2">
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        {error && (
          <span 
            className="text-sm text-red-500"
            id={`${label}-error`}
          >
            {error}
          </span>
        )}
      </div>
      {isEditing ? (
        renderInput()
      ) : (
        <div className={clsx(
          "w-full px-3 py-2 border rounded-md bg-gray-50",
          { "border-red-300": error }
        )}>
          {formatValue(value)}
        </div>
      )}
      {isEditing && (
        <div className="mt-1 min-h-[1.25rem]">
          {/* This empty div maintains consistent spacing when there's no error */}
        </div>
      )}
    </div>
  );
};