// LearningPoints.tsx
import React from 'react';
import { FieldArray, Field } from 'formik';
import { Plus, Trash2 } from 'lucide-react';

interface LearningPointsProps {
  values: string[];
  name: string;
  onChange: (newLearningPoints: string[]) => void;
}

const LearningPoints: React.FC<LearningPointsProps> = ({ values, name, onChange }) => {
  return (
    <FieldArray name={name}>
      {({ push, remove }) => (
        <div className="space-y-2">
          <label className="block text-gray-700 font-medium mb-2">
            What Will Students Learn?
          </label>
          {values.length === 0 && (
            <button
              type="button"
              onClick={() => push('')}
              className="flex items-center text-fuchsia-600 hover:text-fuchsia-700"
            >
              <Plus className="w-5 h-5 mr-1" />
              Add First Learning Point
            </button>
          )}
          {values.map((_, index) => (
            <div key={index} className="flex items-center gap-2">
              <Field
                name={`${name}.${index}`}
                className="flex-1 p-2 border rounded-md focus:ring-2 focus:ring-fuchsia-500"
                placeholder={`Learning point ${index + 1}`}
              />
              <button
                type="button"
                onClick={() => {
                  if (values.length > 1) {
                    remove(index);
                  } else {
                    push('');
                    remove(index);
                  }
                }}
                className="text-red-500 hover:text-red-700"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}
          {values.length > 0 && (
            <button
              type="button"
              onClick={() => push('')}
              className="flex items-center text-fuchsia-600 hover:text-fuchsia-700"
            >
              <Plus className="w-5 h-5 mr-1" />
              Add Learning Point
            </button>
          )}
        </div>
      )}
    </FieldArray>
  );
};

export default LearningPoints;
