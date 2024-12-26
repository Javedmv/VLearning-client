import React, { useEffect, useState } from 'react';
import { User } from '../../types/Users';
import { ProfileImage } from '../../components/user/ProfileImage';
import { ProfileField } from '../../components/user/ProfileField';
import { SocialMediaLinks } from '../../components/user/SocialMediaLinks';
import { format, isAfter, isBefore, subYears } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import Navbar from '../../components/home/Navbar';
import { config } from '../../common/configurations';
import { commonRequest, URL } from '../../common/api';
import { qualifications } from '../user/UserForm';
import { capitalizeFirstLetter } from '../../common/functions';
import ConfirmationModal from '../../components/common/ConfirmationModal';
import UpdatePasswordModal from '../../components/common/UpdatePasswordModal';

interface ValidationErrors {
  firstName?: string;
  lastName?: string;
  phoneNumber?: string;
  additionalEmail?: string;
  dob?: string;
  gender?: string;
  qualification?: string;
  profession?: string;
}

const ProfilePage: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.user);
  const [isEditing, setIsEditing] = useState(false);
  const [editedUser, setEditedUser] = useState<User>(user);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Constants for validation
  const MIN_AGE = 16;
  const MAX_AGE = 100;
  const MIN_DATE = format(subYears(new Date(), MAX_AGE), 'yyyy-MM-dd');
  const MAX_DATE = format(subYears(new Date(), MIN_AGE), 'yyyy-MM-dd');

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const result = await commonRequest("GET", `${URL}/auth/profile/${user._id!}`, null, config);
        setEditedUser({
          ...result.data,
          contact: {
            ...result.data.contact,
            socialMedia: result.data.contact?.socialMedia || {
              linkedin: '',
              twitter: '',
              github: '',
            }
          }
        });
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      }
    };
    fetchUser();
  }, [user]);

  // Validation functions
  const validateName = (name: string): string | undefined => {
    if (!name) return "This field is required";
    if (name.trim().length < 2) return "Must be at least 2 characters";
    if (name.trim().length > 50) return "Must not exceed 50 characters";
    if (!/^[a-zA-Z\s-']+$/.test(name.trim())) {
      return "Only letters, spaces, hyphens, and apostrophes allowed";
    }
    return undefined;
  };

  const validatePhone = (phone: string): string | undefined => {
    if (!phone) return "Phone number is required";
    const cleanPhone = phone.replace(/[\s-]/g, '');
    if (!/^\+?\d{10,15}$/.test(cleanPhone)) {
      return "Must be 10-15 digits, can include spaces and hyphens";
    }
    return undefined;
  };

  const validateEmail = (email: string): string | undefined => {
    if (!email) return undefined; // Additional email is optional
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return "Invalid email format";
    }
    return undefined;
  };

  const validateDateOfBirth = (dob: string): string | undefined => {
    if (!dob) return "Date of birth is required";
    const dobDate = new Date(dob);
    if (isAfter(dobDate, new Date(MAX_DATE))) {
      return `Must be at least ${MIN_AGE} years old`;
    }
    if (isBefore(dobDate, new Date(MIN_DATE))) {
      return `Must be less than ${MAX_AGE} years old`;
    }
    return undefined;
  };

  const validateQualification = (qualification: string): string | undefined => {
    if (!qualification) return "Qualification is required";
    if (!qualifications.includes(qualification)) {
      return "Please select a valid qualification";
    }
    return undefined;
  };

  const validateGender = (gender: string): string | undefined => {
    if (!gender) return "Gender is required";
    if (!['male', 'female', 'others'].includes(gender.toLowerCase())) {
      return "Please select a valid gender";
    }
    return undefined;
  };

  const validateProfession = (profession: string): string | undefined => {
    if (!profession) return "Profession is required";
    if (profession.trim().length < 3) return "Must be at least 2 characters";
    if (profession.trim().length > 100) return "Must not exceed 100 characters";
    return undefined;
  };

  // Form-level validation
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {
      firstName: validateName(editedUser.firstName),
      lastName: validateName(editedUser.lastName),
      phoneNumber: validatePhone(editedUser.phoneNumber),
      additionalEmail: validateEmail(editedUser.contact?.additionalEmail || ''),
      dob: validateDateOfBirth(editedUser.profile?.dob || ''),
      gender: validateGender(editedUser.profile?.gender || ''),
      qualification: validateQualification(editedUser.qualification || '')
    };

    if (editedUser.role === 'instructor') {
      newErrors.profession = validateProfession(editedUser.profession || '');
    }

    setErrors(newErrors);
    return !Object.values(newErrors).some(error => error !== undefined);
  };

  const handleSave = async () => {
    if (!validateForm()) {
      alert("Please fix all validation errors before saving.");
      return;
    }

    try {
      await commonRequest("POST", `${URL}/auth/profile/${user._id!}`, editedUser, config);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
      alert("Failed to update profile. Please try again.");
    }
  };

  return (
    <>
      <Navbar User={user} />
      <div className="max-w-6xl mx-auto p-6">
        <div className="bg-pink-200 rounded-lg shadow-xl p-8 border border-fuchsia-900">
          <div className="flex flex-col items-center mb-6 p-4 border-b border-gray-200">
            <button 
              type="button" 
              className="absolute self-end mb-2 hover:text-fuchsia-900"
              onClick={() => setIsPasswordModalOpen(true)}
            >
              Update Password
            </button>
            <UpdatePasswordModal 
              isOpen={isPasswordModalOpen} 
              onClose={() => setIsPasswordModalOpen(false)} 
            />
            <ProfileImage
              avatar={editedUser?.profile?.avatar}
              firstName={capitalizeFirstLetter(editedUser?.firstName)}
              lastName={capitalizeFirstLetter(editedUser?.lastName)}
            />
          </div>

          <span className="block h-[0.10rem] w-full bg-gray-800 my-4 mb-4"></span>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Basic Information</h3>
              <ProfileField
                label="Email"
                value={editedUser?.email}
                isEditing={isEditing}
                disabled={true}
              />
              <ProfileField
                label="Username"
                value={editedUser?.username}
                isEditing={isEditing}
                disabled={true}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Contact Information</h3>
              <ProfileField
                label="First Name"
                value={editedUser?.firstName}
                isEditing={isEditing}
                onChange={(value) => {
                  setEditedUser({ ...editedUser, firstName: value });
                  setErrors({ ...errors, firstName: validateName(value) });
                }}
                error={errors.firstName}
                required
              />
              <ProfileField
                label="Last Name"
                value={editedUser?.lastName}
                isEditing={isEditing}
                onChange={(value) => {
                  setEditedUser({ ...editedUser, lastName: value });
                  setErrors({ ...errors, lastName: validateName(value) });
                }}
                error={errors.lastName}
                required
              />
              <ProfileField
                label="Phone Number"
                value={editedUser?.phoneNumber}
                isEditing={isEditing}
                onChange={(value) => {
                  setEditedUser({ ...editedUser, phoneNumber: value });
                  setErrors({ ...errors, phoneNumber: validatePhone(value) });
                }}
                error={errors.phoneNumber}
                required
              />
              <ProfileField
                label="Additional Email"
                value={editedUser?.contact?.additionalEmail}
                isEditing={isEditing}
                onChange={(value) => {
                  setEditedUser(prev => ({
                    ...prev,
                    contact: { ...prev.contact, additionalEmail: value }
                  }));
                  setErrors({ ...errors, additionalEmail: validateEmail(value) });
                }}
                error={errors.additionalEmail}
              />
            </div>

            <div>
              <h3 className="text-lg font-semibold mb-3 text-gray-800">Profile Information</h3>
              <ProfileField
                label="Date of Birth"
                value={editedUser?.profile?.dob}
                isEditing={isEditing}
                type="date"
                min={MIN_DATE}
                max={MAX_DATE}
                onChange={(value) => {
                  setEditedUser(prev => ({
                    ...prev,
                    profile: { ...prev.profile, dob: value }
                  }));
                  setErrors({ ...errors, dob: validateDateOfBirth(value) });
                }}
                error={errors.dob}
                required
              />
              <ProfileField
                label="Gender"
                value={editedUser?.profile?.gender}
                isEditing={isEditing}
                type="dropdown"
                options={['male', 'female', 'others']}
                onChange={(value) => {
                  setEditedUser(prev => ({
                    ...prev,
                    profile: { ...prev.profile, gender: value }
                  }));
                  setErrors({ ...errors, gender: validateGender(value) });
                }}
                error={errors.gender}
                required
              />
              <ProfileField
                label="Qualification"
                value={editedUser?.qualification}
                isEditing={isEditing}
                type="dropdown"
                options={qualifications}
                onChange={(value) => {
                  setEditedUser({ ...editedUser, qualification: value });
                  setErrors({ ...errors, qualification: validateQualification(value) });
                }}
                error={errors.qualification}
                required
              />
              {editedUser?.role === 'instructor' && (
                <ProfileField
                  label="Profession"
                  value={editedUser?.profession}
                  isEditing={isEditing}
                  onChange={(value) => {
                    setEditedUser({ ...editedUser, profession: value });
                    setErrors({ ...errors, profession: validateProfession(value) });
                  }}
                  error={errors.profession}
                  required
                />
              )}
            </div>
          </div>

          <span className="block h-[0.12rem] w-full bg-gray-800 my-4"></span>

          <div className="mt-6">
            <SocialMediaLinks
              socialMedia={editedUser?.contact?.socialMedia}
              isEditing={isEditing}
              onChange={(field, value) => {
                setEditedUser(prev => ({
                  ...prev,
                  contact: {
                    ...prev.contact,
                    socialMedia: {
                      ...prev.contact.socialMedia,
                      [field]: value
                    }
                  }
                }));
              }}
            />
          </div>

          <div className="flex justify-end mt-6">
            {isEditing ? (
              <ConfirmationModal
                triggerText="Save Changes"
                title="Confirm Save"
                description="Are you sure you want to save these changes?"
                onConfirm={handleSave}
              />
            ) : (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-2 bg-fuchsia-700 text-white rounded-md hover:bg-fuchsia-900 transition-colors focus:ring-2 focus:ring-fuchsia-700 focus:ring-offset-2"
              >
                Edit Profile
              </button>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default ProfilePage;