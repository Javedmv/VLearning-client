import React, { useRef, useState } from 'react';
import { Formik, Form, Field, FieldArray, ErrorMessage, FormikHelpers } from 'formik';
import * as Yup from 'yup';
import ISO6391 from 'iso-639-1';

// Validation schema remains the same
const CourseUploadSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required').min(100, 'Profile description must be at least 100 characters'),
  categoryRef: Yup.string().required('Category is required'),
  thumbnail: Yup.mixed().required('Thumbnail is required'),
  language: Yup.string().required('Language is required'),
  whatWillLearn: Yup.array().of(Yup.string().required('Learning point is required')).required('At least one learning point is required'),
  pricing: Yup.object().shape({
    type: Yup.string().required('Pricing type is required'),
    amount: Yup.number().when('type', {
      is: 'paid',
      then: (schema) => schema.required('Price is required').positive('Price must be positive'),
      otherwise: (schema) => schema.notRequired(),
    })
  }),
});

interface AddCourse {
  title: string;
  description: string;
  categoryRef: string;
  thumbnail: File | null;
  language: string;
  whatWillLearn: string[];
  pricing: {
    amount: number | null;
    type: 'free' | 'paid';
  };
}

const AddCoursePage: React.FC = () => {
  const initialValues: AddCourse = {
    title: '',
    description: '',
    categoryRef: '',
    thumbnail: null,
    language: 'en',
    whatWillLearn: [''],
    pricing: {
      amount: 0,
      type: 'free',
    },
  };

  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleThumbnailChange = (file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      setThumbnailPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (values: AddCourse, { setSubmitting }: FormikHelpers<AddCourse>) => {
    console.log("Form values before submission:", values);
    setSubmitting(false);
  };

  const languages = ISO6391.getAllNames();

  return (
    <div className="max-w-6xl mx-auto p-6 bg-pink-300 min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Add New Course</h1>
      <Formik
        initialValues={initialValues}
        validationSchema={CourseUploadSchema}
        onSubmit={handleSubmit}
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form className="bg-white shadow-md rounded-lg p-6">
            <div className="mb-4">
              <label htmlFor="thumbnail" className="block text-gray-700 font-medium mb-2">Course Thumbnail</label>
              <input
                type="file"
                id="thumbnail"
                name="thumbnail"
                accept="image/*"
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
                ref={fileInputRef}
                onChange={(e) => {
                  const files = e.currentTarget.files;
                  if (files && files[0]) {
                    const file = files[0];
                    setFieldValue('thumbnail', file);
                    handleThumbnailChange(file);
                  }
                }}
              />
              {thumbnailPreview && (
                <div className="mt-4">
                  <img src={thumbnailPreview} alt="Thumbnail Preview" className="w-full max-w-xs h-auto rounded-lg" />
                  <button
                    type="button"
                    className="mt-2 text-sm text-red-500 hover:text-red-700"
                    onClick={() => {
                      setFieldValue('thumbnail', null);
                      setThumbnailPreview(null);
                      if (fileInputRef.current) {
                        fileInputRef.current.value = '';
                      }
                    }}
                  >
                    Remove Thumbnail
                  </button>
                </div>
              )}
              <ErrorMessage name="thumbnail" component="div" className="text-red-500 text-sm mt-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="title" className="block text-gray-700 font-medium mb-2">Course Title</label>
                <Field type="text" id="title" name="title" className="block w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring focus:ring-opacity-50 focus:ring-indigo-300" />
                <ErrorMessage name="title" component="div" className="text-red-500 text-sm mt-2" />
              </div>
              
              <div>
                <label htmlFor="language" className="block text-gray-700 font-medium mb-2">Language</label>
                <Field as="select" id="language" name="language" className="block w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring focus:ring-opacity-50 focus:ring-indigo-300">
                  <option value="" label="Select language" />
                  {languages.map((language, index) => (
                    <option key={index} value={ISO6391.getCode(language)}>{language}</option>
                  ))}
                </Field>
                <ErrorMessage name="language" component="div" className="text-red-500 text-sm mt-2" />
              </div>
            </div>

            <div className="mb-4">
              <label htmlFor="description" className="block text-gray-700 font-medium mb-2">Description</label>
              <Field as="textarea" id="description" name="description" rows={4} className="block w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring focus:ring-opacity-50 focus:ring-indigo-300" />
              <ErrorMessage name="description" component="div" className="text-red-500 text-sm mt-2" />
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label htmlFor="categoryRef" className="block text-gray-700 font-medium mb-2">Category</label>
                <Field as="select" id="categoryRef" name="categoryRef" className="block w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring focus:ring-opacity-50 focus:ring-indigo-300">
                  <option value="" label="Select category" />
                  <option value="1">Category 1</option>
                  <option value="2">Category 2</option>
                </Field>
                <ErrorMessage name="categoryRef" component="div" className="text-red-500 text-sm mt-2" />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2">Pricing</label>
                <div className="flex items-center gap-4">
                  <div className="flex items-center">
                    <Field type="radio" id="free" name="pricing.type" value="free" className="mr-2" />
                    <label htmlFor="free" className="text-gray-700">Free</label>
                  </div>
                  <div className="flex items-center">
                    <Field type="radio" id="paid" name="pricing.type" value="paid" className="mr-2" />
                    <label htmlFor="paid" className="text-gray-700">Paid</label>
                  </div>
                </div>
                {values.pricing.type === 'paid' && (
                  <div className="mt-2">
                    <Field type="number" name="pricing.amount" placeholder="Enter price" className="block w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring focus:ring-opacity-50 focus:ring-indigo-300" />
                  </div>
                )}
                <ErrorMessage name="pricing.type" component="div" className="text-red-500 text-sm mt-2" />
                <ErrorMessage name="pricing.amount" component="div" className="text-red-500 text-sm mt-2" />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">What Will Students Learn?</label>
              <FieldArray name="whatWillLearn">
                {({ remove, push }) => (
                  <div>
                    {values.whatWillLearn.map((_, index) => (
                      <div key={index} className="flex items-center mb-2">
                        <Field name={`whatWillLearn.${index}`} placeholder={`Learning point ${index + 1}`} className="block w-full p-2 text-sm border border-gray-300 rounded-lg focus:ring focus:ring-opacity-50 focus:ring-indigo-300" />
                        <button type="button" onClick={() => remove(index)} className="ml-2 text-red-500 hover:text-red-700">Remove</button>
                      </div>
                    ))}
                    <ErrorMessage name="whatWillLearn" component="div" className="text-red-500 text-sm mt-2" />
                    <button type="button" onClick={() => push('')} className="mt-2 text-fuchsia-800 hover:text-fuchsia-950">Add Learning Point</button>
                  </div>
                )}
              </FieldArray>
            </div>

            <button type="submit" disabled={isSubmitting} className="w-full py-2 px-4 bg-fuchsia-800 text-white rounded-lg hover:bg-fuchsia-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50">
              {isSubmitting ? 'Saving...' : 'Add Course'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default AddCoursePage;