import React from 'react';
import { Check } from 'lucide-react';

interface ProgressBarProps {
  currentStep: number;
  steps: string[];
}

const ProgressBar: React.FC<ProgressBarProps> = ({ currentStep, steps }) => {
  return (
    <div className="w-full py-4 px-6 mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, index) => (
          <React.Fragment key={step}>
            <div className="flex flex-col items-center">
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  index < currentStep
                    ? 'bg-fuchsia-600 text-white'
                    : index === currentStep
                    ? 'bg-fuchsia-500 text-white'
                    : 'bg-gray-200 text-gray-500'
                }`}
              >
                {index < currentStep ? (
                  <Check className="w-6 h-6" />
                ) : (
                  <span>{index + 1}</span>
                )}
              </div>
              <span className={`mt-2 text-sm ${
                index <= currentStep ? 'text-fuchsia-600 font-medium' : 'text-gray-500'
              }`}>
                {step}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div
                className={`flex-1 h-1 mx-4 ${
                  index < currentStep ? 'bg-fuchsia-600' : 'bg-gray-200'
                }`}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default ProgressBar;