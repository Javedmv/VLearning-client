import React from 'react';

interface ProfileImageProps {
  avatar: string;
  firstName: string;
  lastName: string;
}

export const ProfileImage: React.FC<ProfileImageProps> = ({
  avatar,
  firstName,
  lastName,
}) => {
  return (
    <>
      <div className="relative">
        <img
          src={avatar}
          alt={`${firstName} ${lastName}`}
          className="w-32 h-32 rounded-full object-cover border-4 border-white shadow-lg ring-2 ring-fuchsia-900 ring-offset-2"
        />
      </div>
      <h2 className="mt-4 text-2xl font-bold text-gray-900">
        {firstName} {lastName}
      </h2>
    </>
  );
};