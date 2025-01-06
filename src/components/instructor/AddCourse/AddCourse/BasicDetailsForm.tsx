// BasicDetailsForm.tsx
import React from 'react';
import { Field } from 'formik';
import ISO6391 from 'iso-639-1';

const languages = ISO6391.getAllNames();
const categories = [
  'Programming',
  'Design',
  'Business',
  'Marketing',
  'Music',
  'Photography',
  'Personal Development',
  'Health & Fitness',
  'Language Learning',
  'Other'
];

const BasicDetailsForm: React.FC = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
          Course Title
        </label>
        <Field
          type="text"
          id="title"
          name="title"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-500"
          placeholder="Enter course title"
        />
      </div>

      <div>
        <label htmlFor="language" className="block text-gray-700 font-medium mb-2">
          Language
        </label>
        <Field
          as="select"
          id="language"
          name="language"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-500"
        >
          <option value="">Select language</option>
          {languages.map((language) => (
            <option key={language} value={ISO6391.getCode(language)}>
              {language}
            </option>
          ))}
        </Field>
      </div>

      <div className="md:col-span-2">
        <label htmlFor="description" className="block text-gray-700 font-medium mb-2">
          Description
        </label>
        <Field
          as="textarea"
          id="description"
          name="description"
          rows={4}
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-500"
          placeholder="Describe your course (minimum 100 characters)"
        />
      </div>

      <div>
        <label htmlFor="category" className="block text-gray-700 font-medium mb-2">
          Category
        </label>
        <Field
          as="select"
          id="category"
          name="category"
          className="w-full p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-500"
        >
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </Field>
      </div>
    </div>
  );
};

export default BasicDetailsForm;
