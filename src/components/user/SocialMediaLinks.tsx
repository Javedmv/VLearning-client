import React from 'react';
import { SocialMedia } from '../../types/Users';
import { SocialMediaField } from './SocialMediaFields';

interface SocialMediaLinksProps {
  socialMedia?: SocialMedia;
  isEditing: boolean;
  onChange?: (field: keyof SocialMedia, value: string) => void;
}

export const SocialMediaLinks: React.FC<SocialMediaLinksProps> = ({
  socialMedia = { instagram: '', linkedIn: '', github: '' }, // Default socialMedia fields
  isEditing,
  onChange,
}) => {
  const socialMediaFields = [
    { key: 'instagram' as const, label: 'Instagram' },
    { key: 'linkedIn' as const, label: 'LinkedIn' },
    { key: 'github' as const, label: 'GitHub' },
  ];

  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold mb-3">Social Media</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {socialMediaFields.map(({ key, label }) => (
          <SocialMediaField
            key={key}
            label={label}
            value={socialMedia[key] || ''}
            isEditing={isEditing}
            onChange={(value) => onChange?.(key, value)}
          />
        ))}
      </div>
    </div>
  );
};