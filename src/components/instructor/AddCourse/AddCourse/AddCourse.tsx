import React, { useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { AddCourseSchema } from './validation';
import ThumbnailUpload from './ThumbnailUpload';
import BasicDetailsForm from './BasicDetailsForm';
import LearningPoints from './LearningPoints';
import { BasicDetails } from '../../../../types/Courses';

interface AddCourseProps {
  onSubmit: (values: BasicDetails) => void; // Accept BasicDetails here
  courseData: BasicDetails; // Pass only BasicDetails to populate fields
  onNext: () => void;
}

const AddCourse: React.FC<AddCourseProps> = ({ onSubmit, onNext, courseData }) => {
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);

  const handleThumbnailChange = (file: File, setFieldValue: (field: string, value: any) => void) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
    setFieldValue('thumbnail', file);
  };

  const initialValues = {
    title: courseData.title || '',
    description: courseData.description || '',
    category: courseData.category || '',
    thumbnail: courseData.thumbnail || null,
    language: courseData.language || '',
    whatWillLearn: courseData.whatWillLearn || [],
  };

  return (
    <div className="max-w-4xl mx-auto bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Course Details</h2>

      <Formik
        initialValues={initialValues}
        validationSchema={AddCourseSchema}
        onSubmit={(values, { setSubmitting }) => {
          const cleanedValues = {
            ...values,
            whatWillLearn: values.whatWillLearn.filter(point => point.trim() !== ''),
          };

          onSubmit(cleanedValues);
          setSubmitting(false);
          onNext();
        }}
      >
        {({ values, errors, touched, setFieldValue, isSubmitting }) => (
          <Form className="space-y-6">
            <ThumbnailUpload
              thumbnailPreview={thumbnailPreview}
              onThumbnailChange={(file) => handleThumbnailChange(file, setFieldValue)}
              onThumbnailRemove={() => {
                setThumbnailPreview(null);
                setFieldValue('thumbnail', null);
              }}
            />

            <BasicDetailsForm />

            <LearningPoints
              values={values.whatWillLearn}
              name="whatWillLearn"
              onChange={(newLearningPoints: string[]) => setFieldValue('whatWillLearn', newLearningPoints)}
            />

            {/* Error Messages */}
            <div className="space-y-2">
              {Object.keys(errors).map((key) =>
                touched[key as keyof typeof touched] ? (
                  <div key={key} className="text-red-500 text-sm">
                    <ErrorMessage name={key} />
                  </div>
                ) : null
              )}
            </div>

            <div className="flex justify-end pt-6">
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2 bg-fuchsia-600 text-white rounded-md hover:bg-fuchsia-700 disabled:opacity-50"
              >
                {isSubmitting ? 'Saving...' : 'Next'}
              </button>
            </div>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddCourse;
