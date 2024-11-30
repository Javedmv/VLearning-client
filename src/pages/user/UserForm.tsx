import React from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { Upload, X, FileText, Github, Linkedin, Instagram } from 'lucide-react';
import * as Yup from "yup"
// import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../redux/store';
import {GraduationCap} from "lucide-react"
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { commonRequest, URL } from '../../common/api';
import { configMultiPart } from '../../common/configurations';
import trimValuesToFormData from '../../common/trimValues';
// import { updateFormData } from '../../redux/actions/user/userAction';
import { useSelector } from 'react-redux';

export interface FormValues {
    username: string;
    firstName: string;
    lastName: string;
    email: string;
    phoneNumber: string;
    role: 'student' | 'instructor';
    profile: {
      avatar: string;
      dob: string;
      gender: 'male' | 'female' | 'other';
    };
    contact: {
      additionalEmail: string;
      socialMedia: {
        instagram: string;
        linkedIn: string;
        github: string;
      };
    };
    profession: string;
    profileDescription?: string;
    cv?: string;
}

export const validationSchema = Yup.object().shape({
    username: Yup.string().required('Username is required'),
    firstName: Yup.string().required('First name is required'),
    lastName: Yup.string().required('Last name is required'),
    email: Yup.string().email('Invalid email').required('Email is required'),
    phoneNumber: Yup.string().required('Phone Number is required').matches(/^\d{10}$/, 'Phone Number must be exactly 10 digits').min(10, 'Phone Number must have exactly 10 digits').max(10, 'Phone Number must have exactly 10 digits'),
    role: Yup.string().oneOf(['student', 'instructor', 'admin']).required('Role is required'),
    profile: Yup.object().shape({
      avatar: Yup.string(),
      dob: Yup.date().nullable().required('Date of birth is required'),
      gender: Yup.string().oneOf(['male', 'female', 'other']),
    }),
    profession: Yup.string().when('role', {
      is: (role: string) => role === 'instructor',
      then: () => Yup.string().required('Profession is required'),
    }),
    profileDescription: Yup.string().when('role', {
      is: (role: string) => role === 'instructor',
      then: () => Yup.string()
        .min(100, 'Profile description must be at least 100 characters')
        .required('Profile description is required'),
    }),
    cv: Yup.string().when('role', {
      is: (role: string) => role === 'instructor',
      then: () => Yup.string().required('CV is required for instructor applications'),
    }),
    additionalEmail: Yup.string()
    .email('Invalid email')
    .notOneOf([Yup.ref('email')],'Additional email cannot be the same as the primary email')
  });

const UserForm: React.FC = () => {
  const {user } = useSelector((state:RootState) => state.user);
  // const dispatch = useDispatch<AppDispatch>()

  const initialValues: FormValues = {
    username: user.username,
    firstName: '',
    lastName: '',
    email: user.email,
    phoneNumber: '',
    role: user.role,
    profile: {
      avatar: '',
      dob: '',
      gender: 'male',
    },
    contact: {
      additionalEmail: '',
      socialMedia: {
        instagram: '',
        linkedIn: '',
        github: '',
      },
    },
    profession: '',
    profileDescription: '',
    cv: '',
  };

  const handleSubmit = async (values: FormValues) => {
    try {
      const userCredentials = trimValuesToFormData(values)
      userCredentials.append("isNewUser", "false")
      
      await commonRequest("POST",`${URL}/auth/user-form`,userCredentials, configMultiPart).then((res) => {
        console.log(res,"res of axios")
      }).catch((err) => {
        console.log(err,"err of axios")
      })

      
      // await dispatch(updateFormData(formData))
      // .then((res) => console.log(res,"res in AXIOS"))
      // .catch((err) => {
      //   console.log(err, 'REACHED THE AXIOS ERROR')
      // })
      // const res = 
      // console.log(res,"result of userform res")
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-fuchsia-200 to-fuchsia-950 py-12 px-4 sm:px-6 lg:px-8">
      {/* logo */}
      <div className="flex items-center spaces-x-2 mb-2">
        <GraduationCap className="w-10 h-10 text-fuchsia-950" />
        <span className="text-4xl font-bold text-fuchsia-950">
          VLearning<span className="text-pink-600">.</span>
        </span>
      </div>

      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 ">
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={handleSubmit}
        >
          {({ values, setFieldValue }) => (
            <Form className="space-y-8">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-gray-900">
                  {values.role === 'instructor' ? 'Instructor Profile' : 'Student Profile'}
                </h2>
                <p className="mt-2 text-sm text-gray-600">
                  Please complete your profile information below
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <Field
                  name="role"
                  as="select"
                  className="mt-1 block w-full rounded-md p-2 border border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
                  disabled
                >
                  <option value="student">Student</option>
                  <option value="instructor">Instructor</option>
                  <option value="admin">Admin</option>
                </Field>
              </div>

              {/* Basic Info Section */}
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Username</label>
                    <Field
                      name="username"
                      className="mt-1 block w-full rounded-md p-2 border border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
                      type="text"
                      disabled
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <Field
                      name="email"
                      className="mt-1 block w-full rounded-md p-2 border border-gray-300 bg-gray-100 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
                      type="email"
                      disabled
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">First Name</label>
                    <Field
                      name="firstName"
                      className="mt-1 block w-full rounded-md border p-2 border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
                      type="text"
                    />
                    <ErrorMessage name="firstName" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Last Name</label>
                    <Field
                      name="lastName"
                      className="mt-1 block w-full rounded-md p-2 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
                      type="text"
                    />
                    <ErrorMessage name="lastName" component="div" className="mt-1 text-sm text-red-600" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                  <Field
                    name="phoneNumber"
                    className="mt-1 block w-full rounded-md p-2 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
                    type="tel"
                  />
                  <ErrorMessage name="phoneNumber" component="div" className="mt-1 text-sm text-red-600" />
                </div>
              </div>

              {/* Profile Section */}
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-gray-900">Profile Information</h3>
                
                {/* Image Upload */}
                <div className="space-y-4">
                  <label className="block text-sm font-medium text-gray-700">Profile Picture</label>
                  <div className="mt-1 flex justify-center">
                    {!values.profile.avatar ? (
                      <div className="w-40 h-40 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors">
                        <label className="cursor-pointer text-center">
                          <Upload className="mx-auto h-12 w-12 text-gray-400" />
                          <span className="mt-2 block text-sm font-medium text-black">
                            Upload Photo
                          </span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) {
                                const reader = new FileReader();
                                reader.onloadend = () => {
                                  setFieldValue('profile.avatar', reader.result);
                                };
                                reader.readAsDataURL(file);
                              }
                            }}
                          />
                        </label>
                      </div>
                    ) : (
                      <div className="relative">
                        <img
                          src={values.profile.avatar}
                          alt="Profile"
                          className="w-40 h-40 rounded-full object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => setFieldValue('profile.avatar', '')}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 rounded-full text-white hover:bg-red-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="dob" className="block text-sm font-medium text-gray-700">
                    Date of Birth
                  </label>
                  <DatePicker
                    selected={values.profile.dob ? new Date(values.profile.dob) : null}
                    onChange={(date) => setFieldValue("profile.dob", date?.toISOString() || "")}
                    dateFormat="dd/MM/yyyy"
                    showYearDropdown
                    showMonthDropdown
                    dropdownMode="select"
                    placeholderText="Select your date of birth"
                    className="mt-1 block w-full rounded-md p-2 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
                  />
                  <ErrorMessage name="profile.dob" component="div" className="text-sm text-red-600 mt-1" />
                </div>


                  <div>
                    <label className="block text-sm font-medium text-gray-700">Gender</label>
                    <Field
                      name="profile.gender"
                      as="select"
                      className="mt-1 block w-full rounded-md p-2 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </Field>
                  </div>
                </div>
              </div>

              {/* Social Media Section */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">Social Media Links</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Additional Email</label>
                    <Field
                      name="contact.additionalEmail"
                      type="email"
                      className="mt-1 block w-full rounded-md p-2 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Github className="w-5 h-5 text-gray-500" />
                    <Field
                      name="contact.socialMedia.github"
                      placeholder="GitHub Profile URL"
                      className="flex-1 rounded-md p-2 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Linkedin className="w-5 h-5 text-gray-500" />
                    <Field
                      name="contact.socialMedia.linkedIn"
                      placeholder="LinkedIn Profile URL"
                      className="flex-1 rounded-md p-2 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Instagram className="w-5 h-5 text-gray-500" />
                    <Field
                      name="contact.socialMedia.instagram"
                      placeholder="Instagram Profile URL"
                      className="flex-1 rounded-md p-2 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
                    />
                  </div>
                </div>
              </div>

              {/* Instructor-specific Section */}
              {values.role === 'instructor' && (
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Profession</label>
                    <Field
                      name="profession"
                      className="mt-1 block w-full rounded-md p-2 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
                      type="text"
                    />
                    <ErrorMessage name="profession" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Profile Description</label>
                    <Field
                      name="profileDescription"
                      as="textarea"
                      rows={4}
                      className="mt-1 block w-full rounded-md p-2 border border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-md"
                    />
                    <ErrorMessage name="profileDescription" component="div" className="mt-1 text-sm text-red-600" />
                  </div>

                  {/* CV Upload */}
                  <div className="space-y-4">
                    <label className="block text-sm font-medium text-gray-700">Upload CV/Resume</label>
                    {!values.cv ? (
                      <div 
                        onClick={() => document.getElementById('cv-upload')?.click()}
                        className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 p-2 border border-gray-300 border-dashed rounded-lg cursor-pointer hover:border-indigo-500 transition-colors duration-200"
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
                                    const reader = new FileReader();
                                    reader.onloadend = () => {
                                      setFieldValue('cv', reader.result);
                                    };
                                    reader.readAsDataURL(file);
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
                          <p className="text-sm font-medium text-gray-900">CV Uploaded</p>
                        </div>
                        <button
                          type="button"
                          onClick={() => setFieldValue('cv', '')}
                          className="ml-4 bg-red-100 p-1 rounded-full text-red-600 hover:bg-red-200"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-fuchsia-800 hover:bg-fuchsia-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-fuchsia-950 transition-colors duration-200"
                >
                  Complete Profile
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default UserForm;

