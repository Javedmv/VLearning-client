import React from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import FormField from '../common/Form/FormField';
import FileUpload from '../common/Form/FileUpload';
import { TOBE } from '../../common/constants';

const validationSchema = Yup.object({
  profession: Yup.string().required('Profession is required'),
  profileDescription: Yup.string()
    .required('Profile description is required')
    .min(50, 'Profile description must be at least 50 characters'),
  cv: Yup.mixed().required('CV is required')
});

interface ProfileFormProps {
  onSubmit: (values: TOBE) => void;
  onCancel: () => void;
}

const ProfileFormInstructor: React.FC<ProfileFormProps> = ({ onSubmit, onCancel }) => {
  return (
    <Formik
      initialValues={{
        profession: '',
        profileDescription: '',
        cv: null
      }}
      validationSchema={validationSchema}
      onSubmit={onSubmit}
    >
      {({ setFieldValue, values }) => (
        <Form className="space-y-6">
          <FormField
            label="Profession"
            name="profession"
          />
          <ErrorMessage name="profession" component="div" className="text-red-600 text-sm" />

          <FormField
            label="Profile Description"
            name="profileDescription"
            as="textarea"
            rows={4}
          />
          <ErrorMessage name="profileDescription" component="div" className="text-red-600 text-sm" />

          <FileUpload
            value={values.cv}
            onChange={(file) => setFieldValue('cv', file)}
          />
          <ErrorMessage name="cv" component="div" className="text-red-600 text-sm" />

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 border border-transparent rounded-md hover:bg-indigo-700"
            >
              Apply
            </button>
          </div>
        </Form>
      )}
    </Formik>
  );
};

export default ProfileFormInstructor;